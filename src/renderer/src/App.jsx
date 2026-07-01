import { useState, useEffect } from 'react'
import BookCard from './components/BookCard'
import AddBookModal from './components/AddBookModal'
import SideBar from './components/SideBar'
import SettingsView from './components/SettingsView'
import './assets/sidebar.css'
import { Icons } from './assets/icons'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [isBulkAdding, setIsBulkAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingBook, setPendingBook] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [categories, setCategories] = useState([])
  const [currentView, setCurrentView] = useState('library')
  const loadBooks = async () => {
    try {
      setLoading(true)
      const data = await window.api.getAllBooks()
      const dbCategories = await window.api.getCategories()
      setBooks(data)
      setCategories(dbCategories)
    } catch (error) {
      console.error('Failed to load catalog', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    loadBooks()
  }, [])
  const buildPayloadFromFile = async (file) => {
    const metadata = await window.api.extractMetadata(file.filePath)
    const { filePath, title } = file
    const { title: metadataTitle, author, pageCount, subject } = metadata

    const verifiedCategory =
      subject && typeof subject === 'string' ? subject.trim() : 'Uncategorized'
    const bookPayLoad = {
      title: metadataTitle || title,
      author: author || '',
      filePath: filePath,
      category: verifiedCategory,
      pageCount: pageCount
    }
    return bookPayLoad
  }
  const importBooks = async (filesArray) => {
    try {
      if (!filesArray || filesArray.length === 0) return
      setIsBulkAdding(true)
      const newlyAddedBooks = []

      for (const file of filesArray) {
        const bookPayLoad = await buildPayloadFromFile(file)
        const savedBook = await window.api.addBook(bookPayLoad)

        if (savedBook && savedBook.id) {
          const coverPath = await window.api.renderCover({
            filePath: savedBook.filePath,
            pageNumber: savedBook.coverPageNumber || 1,
            bookId: savedBook.id
          })

          if (coverPath) {
            const updated = await window.api.updateBook(savedBook.id, { coverImagePath: coverPath })
            newlyAddedBooks.push(updated)
          } else {
            newlyAddedBooks.push(savedBook)
          }
        }
      }

      if (newlyAddedBooks.length > 0) {
        setBooks((prevBooks) => [...prevBooks, ...newlyAddedBooks])
      }
    } catch (error) {
      console.error('Error add Folder', error)
    } finally {
      setIsBulkAdding(false)
    }
  }
  const handleAddBookClick = async () => {
    const results = await window.api.pickPdf()
    if (!results || results.length === 0) return
    if (results.length === 1) {
      const targetFile = results[0]
      const bookPayLoad = await buildPayloadFromFile(targetFile)
      setPendingBook(bookPayLoad)
      setIsModalOpen(true)
    } else {
      await importBooks(results)
    }
  }

  const handleSaveModal = async (completedBook) => {
    try {
      let finalBookForm = { ...completedBook, id: pendingBook?.id }
      if (finalBookForm.id) {
        const updatedBook = await window.api.updateBook(finalBookForm.id, finalBookForm)
        setBooks((prevBooks) =>
          prevBooks.map((book) => (book.id === updatedBook.id ? updatedBook : book))
        )
      } else if (finalBookForm.filePath) {
        const savedBook = await window.api.addBook(finalBookForm)
        const coverPath = await window.api.renderCover({
          filePath: savedBook.filePath,
          pageNumber: savedBook.coverPageNumber || 1,
          bookId: savedBook.id
        })

        if (coverPath) {
          const updated = await window.api.updateBook(savedBook.id, { coverImagePath: coverPath })
          setBooks((prevBooks) => [...prevBooks, updated])
        } else {
          setBooks((prevBooks) => [...prevBooks, savedBook])
        }
      }
    } catch (error) {
      console.error('Error Saving Book', error)
    } finally {
      setIsModalOpen(false)
      setPendingBook(null)
    }
  }

  const handleCancelModal = () => {
    setIsModalOpen(false)
    setPendingBook(null)
  }

  const handleDeleteBook = async (id) => {
    try {
      const deletedBook = await window.api.deleteBook(id)
      if (deletedBook) {
        setBooks((prev) => prev.filter((b) => b.id != id))
      }
    } catch (error) {
      console.error('Failed to delete catalog item', error)
    }
  }

  const handleAddFolder = async () => {
    const result = await window.api.pickFolder()
    if (result) {
      const pdfs = await window.api.scanPdfs(result)
      if (pdfs && pdfs.length > 0) {
        await importBooks(pdfs)
      }
    }
  }

  const handleEdit = (bookToEdit) => {
    setPendingBook(bookToEdit)
    setIsModalOpen(true)
  }

  const filteredBooks = books.filter((book) => {
    const bookMatch = selectedCategory === 'All' || book.category === selectedCategory
    const titleMatch = book.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const authorMatch = book.author?.toLowerCase().includes(searchQuery.toLowerCase())
    return bookMatch && (titleMatch || authorMatch)
  })
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const isLibraryEmpty = books.length === 0
  const isFilterEmpty = filteredBooks.length === 0
  const hasActiveSearch = searchQuery.trim().length > 0
  const hasActiveCategory = selectedCategory != 'All'
  return (
    <div className="app">
      {/* Nav-Bar */}
      <div className="app-navbar synced-titlebar">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar} title="Toggle sidebar">
          {Icons.sidebar}
        </button>

        <h1 className="navbar-logo" onClick={() => setCurrentView('library')}>
          Catalogia
        </h1>
        <div className="navbar-controls">
          <input
            type="search"
            placeholder="search"
            value={searchQuery}
            disabled={isBulkAdding}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="add-book-btn"
            onClick={handleAddBookClick}
            disabled={isBulkAdding || loading}
          >
            {Icons.addBook}
            {isBulkAdding ? 'Processing...' : 'Add Book(s)'}
          </button>
          <button
            className="add-book-btn"
            onClick={handleAddFolder}
            disabled={isBulkAdding || loading}
          >
            {Icons.folder}
            {isBulkAdding ? 'Importing Folder..' : 'Add Folder'}
          </button>
        </div>

        <div className="window-controls">
          {/* Minimize Button */}
          <button className="win-btn" onClick={() => window.api.minimizeWindow()} title="Minimize">
            {Icons.minimize}
          </button>

          {/* Maximize / Restore Button */}
          <button className="win-btn" onClick={() => window.api.maximizeWindow()} title="Maximize">
            {Icons.maximize}
          </button>

          {/* Close Button */}
          <button
            className="win-btn close-btn"
            onClick={() => window.api.closeWindow()}
            title="Close"
          >
            {Icons.close}
          </button>
        </div>
      </div>

      <div className="app-body">
        {/*  SIDEBAR */}
        {isSidebarOpen && (
          <SideBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectedCategory={setSelectedCategory}
            onOpenSettingsView={() => setCurrentView('settings')}
            onOpenLibraryView={() => setCurrentView('library')}
          />
        )}

        {/* MAIN BOOK GRID */}
        <div className="main-content-view">
          {loading && (
            <div className="state-message">
              <span className="state-spinner" />
              <span>Loading library...</span>
            </div>
          )}
          {/* main body */}
          {currentView === 'library' ? (
            isLibraryEmpty ? (
              <div className="state-message">
                {Icons.emptyLibrary}
                <strong>Your library is empty</strong>
                <span>Add books or import a folder to get started</span>
              </div>
            ) : isFilterEmpty && hasActiveSearch ? (
              <div className="state-message">
                {Icons.noResults}
                <strong>No results found</strong>
                <span>Nothing matches &ldquo;{searchQuery}&rdquo;</span>
              </div>
            ) : isFilterEmpty && hasActiveCategory ? (
              <div className="state-message">
                {Icons.noResults}
                <strong>No books in this category</strong>
                <span>Try selecting a different category</span>
              </div>
            ) : (
              <div className="book-grid">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onDelete={handleDeleteBook}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )
          ) : (
            <SettingsView
              onClose={() => setCurrentView('library')}
              selectedCategory={selectedCategory}
              onSelectedCategory={setSelectedCategory}
              categories={categories}
              onCategories={setCategories}
              onRefreshCatalog={loadBooks}
            />
          )}

          {/* modal */}
          {isModalOpen && (
            <AddBookModal
              categories={categories}
              initialBook={pendingBook}
              onSave={handleSaveModal}
              onCancel={handleCancelModal}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
