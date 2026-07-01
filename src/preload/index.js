import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getAllBooks: () => ipcRenderer.invoke('catalog:get-all'),
  addBook: (book) => ipcRenderer.invoke('catalog:add', book),
  deleteBook: (bookId) => ipcRenderer.invoke('catalog:delete', bookId),
  updateBook: (bookId, updatedFields) =>
    ipcRenderer.invoke('catalog:update', { bookId, updatedFields }),
  getCategories: () => ipcRenderer.invoke("catalog:get-categories"),
  addCategory: (category) => ipcRenderer.invoke("catalog:add-category", category),
  deleteCategory: (category) => ipcRenderer.invoke("catalog:delete-category", category),
  pickPdf: () => ipcRenderer.invoke('dialog:pickPdf'),
  pickFolder: () => ipcRenderer.invoke('dialog:pickFolder'),
  scanPdfs: (folderPath) => ipcRenderer.invoke('folder:scan-pdfs', folderPath),
  openBook: (filePath) => ipcRenderer.invoke('book:openFile', filePath),
  renderCover: (payload) => ipcRenderer.invoke('pdf:render-cover', payload),
  readCover: (coverImagePath) => ipcRenderer.invoke('cover:read', coverImagePath),
  extractMetadata: (filePath) => ipcRenderer.invoke('pdf:extract-metadata', filePath),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
