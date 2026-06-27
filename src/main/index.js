import { app, shell, BrowserWindow, ipcMain, dialog, } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import CatalogService from "./catalogService.js"
import path from "path"
import fs from "fs"
import {pdf} from "pdf-to-img"


function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}



function registerCatalogIpcHandlers(){
  const catalogService = new CatalogService()

  ipcMain.handle("catalog:get-all", async()=>{
    return catalogService.getAllBooks()
  })

  ipcMain.handle("catalog:add", (event, book) => {
    return catalogService.addBook(book)
  })

  ipcMain.handle("catalog:delete", (event, bookId)=>{
    return catalogService.deleteBook(bookId)
  })

  ipcMain.handle("catalog:update", (event, {bookId, updatedFields}) => {
    return catalogService.updateBook(bookId, updatedFields)
  })

  ipcMain.handle("dialog:pickPdf", async()=>{
    const result = await dialog.showOpenDialog({
      title: "Select a Book PDF",
      buttonLabel: "Add to Catalog",
      properties: ["openFile"],
      filters: [{
        name: "PDF Documents", extensions: ["pdf"]
      }]
    })

    if(result.canceled || result.filePaths.length === 0){
      return null
    }

    const chosenPath = result.filePaths[0]
    const title = path.basename(result.filePaths[0], ".pdf")
    return{
      filePath: chosenPath,
      title: title
    }
  })


  ipcMain.handle("book:openFile", async(event, filePath)=>{
    try{
      const errormsg = await shell.openPath(filePath)
      if (errormsg){
        console.error(`Failed to Open PDF at ${filePath}. Systen Error ${errormsg}`)
      }
      return errormsg || null
    }catch (error){
      console.error("Critical error in book:openFile:", error)
      return error.message
    }
  })

  ipcMain.handle("pdf:render-cover", async(event, {filePath, pageNumber, bookId})=>{
    try{
        const targetPage = pageNumber || 1
        const baseFolder = app.getPath("userData")
        const coversFolder = path.join(baseFolder, "covers")

        if(!fs.existsSync(coversFolder)){
          fs.mkdirSync(coversFolder, {recursive: true})
        }

        const outputFilePath = path.join(coversFolder, `${bookId}.png`)
        const document = await pdf(filePath, {scale: 2})
        let success = false
        let currentPage = 0

        for await(const imageBuffer of document){
          currentPage++
          if (currentPage === targetPage){
            fs.writeFileSync(outputFilePath, imageBuffer)
            success = true
            break
          }
        }
        return success ? outputFilePath : null
    }catch(error){
      console.error("Failed to parse and extract pdf thumnail stream", error)
      return null
}})

ipcMain.handle("cover:read", async(event, coverImagePath)=>{
  try{
    if(!coverImagePath || !fs.existsSync(coverImagePath)){
      return null
    }
    const buffer = fs.readFileSync(coverImagePath)
    const base64 = buffer.toString("base64")
    return `data:image/png;base64,${base64}`
  }catch(error){
      console.error("Failed to read cover image", error)
      return null
  }
})

}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  registerCatalogIpcHandlers()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
