import fs from 'fs'
import { app } from 'electron'
import path from 'path'
import crypto from 'crypto'

export default class CatalogService {
  constructor() {
    this._baseFolder = app.getPath('userData')
    this._catalogFilePath = path.join(this._baseFolder, 'catalogia.json')

    if (!fs.existsSync(this._baseFolder)) {
      fs.mkdirSync(this._baseFolder, { recursive: true })
    }
    this._books = this.loadCatalog()
  }

  saveCatalog(books) {
    const json = JSON.stringify(books, null, 4)
    fs.writeFileSync(this._catalogFilePath, json, 'utf8')
  }

  loadCatalog() {
    if (!fs.existsSync(this._catalogFilePath)) {
      return []
    }

    try {
      const jsonText = fs.readFileSync(this._catalogFilePath, 'utf8')
      const loadedBooks = JSON.parse(jsonText)

      return loadedBooks || []
    } catch (error) {
      console.error('Error parsing file', error)
      return []
    }
  }

  getAllBooks() {
    return [...this._books]
  }

  addBook(book) {
    const bookToSave = {
      ...book,
      id: book.id || crypto.randomUUID(),
      readStatus: book.readStatus || 'NotRead',
      coverPageNumber: book.coverPageNumber || 1,
      coverImagePath: book.coverImagePath || ''
    }
    this._books = [...this._books, bookToSave]
    this.saveCatalog(this._books)
    return bookToSave
  }

  deleteBook(bookId) {
    const deletedBook = this._books.find((book) => book.id === bookId)
    if (deletedBook) {
      if (deletedBook.coverImagePath) {
        try {
          if (fs.existsSync(deletedBook.coverImagePath)) {
            fs.unlinkSync(deletedBook.coverImagePath)
            console.log(`Succesfully deleted book from ${deletedBook.coverImagePath}`)
          }
        } catch (fileError) {
          console.error(`Failed to delete physical file at: ${deletedBook.coverImagePath}`)
        }

      }
      this._books = this._books.filter((book) => book.id !== bookId)
      this.saveCatalog(this._books)
      return deletedBook
    }
    return null
  }
  updateBook(bookId, updatedFields) {
    let updatedBook = null

    this._books = this._books.map((book) => {
      if (book.id === bookId) {
        updatedBook = { ...book, ...updatedFields }
        return updatedBook
      }
      return book
    })
    this.saveCatalog(this._books)
    return updatedBook
  }
}
