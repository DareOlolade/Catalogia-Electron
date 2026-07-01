import fs from 'fs'
import { app } from 'electron'
import path from 'path'
import crypto from 'crypto'

export default class CatalogService {
  constructor() {
    this._baseFolder = app.getPath('userData')

    this._catalogFilePath = path.join(this._baseFolder, 'catalogia.json')
    this._settingsFilePath = path.join(this._baseFolder, 'settings.json')
    this._categoriesFilePath = path.join(this._baseFolder, 'categories.json')

    if (!fs.existsSync(this._baseFolder)) {
      fs.mkdirSync(this._baseFolder, { recursive: true })
    }

    this._books = this.loadCatalog()
    this._categories = this.loadCategories()
    this._settings = this.loadSettings()
  }

  loadSettings() {
    const defaults = { grayscaleCovers: false }
    if (!fs.existsSync(this._settingsFilePath)) {
      this.saveSettings(defaults)
      return defaults
    }
    try {
      const jsonText = fs.readFileSync(this._settingsFilePath, 'utf-8')
      const settings = JSON.parse(jsonText)
      return { ...defaults, ...settings }
    } catch (error) {
      console.error('Error loading file', error)
      return defaults
    }
  }

  saveSettings(settings) {
    const json = JSON.stringify(settings, null, 4)
    fs.writeFileSync(this._settingsFilePath, json, 'utf-8')
  }
  loadCategories() {
    const defaultCategories = ['Fiction', 'Technical', 'Educational']
    if (!fs.existsSync(this._categoriesFilePath)) {
      this.saveCategories(defaultCategories)
      return defaultCategories
    }
    try {
      const jsonText = fs.readFileSync(this._categoriesFilePath, 'utf-8')
      const categories = JSON.parse(jsonText)
      return categories || defaultCategories
    } catch (error) {
      console.error('Error passing file', error)
      return defaultCategories
    }
  }

  getSettings() {
    return { ...this._settings }
  }

  updateSettings(newFields) {
    this._settings = { ...this._settings, ...newFields }
    this.saveSettings(this._settings)
    return this.getSettings()
  }

  saveCategories(categories) {
    const json = JSON.stringify(categories, null, 4)
    fs.writeFileSync(this._categoriesFilePath, json, 'utf-8')
  }

  addCategory(newCategory) {
    const trimmedCategory = newCategory.trim()

    if (!trimmedCategory) return this.getCategories()
    const alreadyExists = this._categories.some(
      (cat) => cat.toLowerCase() === trimmedCategory.toLowerCase()
    )
    if (!alreadyExists) {
      this._categories = [...this._categories, trimmedCategory]
      this.saveCategories(this._categories)
    }
    return this.getCategories()
  }

  deleteCategory(category) {
    if (category === 'uncategorized') return this.getCategories()
    if (category && this._categories.includes(category)) {
      this._categories = this._categories.filter((cat) => cat !== category)
      this.saveCategories(this._categories)
      this._books = this._books.map((book) => {
        if (book.category === category) {
          return { ...book, category: 'uncategorized' }
        }
        return book
      })
      this.saveCatalog(this._books)
    }

    return this.getCategories()
  }

  getCategories() {
    return this._categories
  }
  /* Catalog Book Methods */
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
          console.error(`Failed to delete physical file at: ${deletedBook.coverImagePath}`, fileError)
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
