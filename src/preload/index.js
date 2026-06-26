import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getAllBooks: () => ipcRenderer.invoke("catalog:get-all"),
  addBook: (book) => ipcRenderer.invoke("catalog:add", book),
  deleteBook: (bookId) => ipcRenderer.invoke("catalog:delete", bookId),
  updateBook: (bookId, updatedFields) => ipcRenderer.invoke("catalog:update", {bookId, updatedFields}),
  pickPdf: () =>  ipcRenderer.invoke("dialog:pickPdf")
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
