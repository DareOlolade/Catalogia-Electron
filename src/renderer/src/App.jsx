import { useState, useEffect } from 'react'
import BookCard from './components/BookCard'
import AddBookModal from './components/AddBookModal'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [isBulkAdding, setIsBulkAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingBook, setPendingBook] = useState(null)

  const loadBooks = async () => {
    try {
      setLoading(true)
      const data = await window.api.getAllBooks()
      setBooks(data)
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
    const bookPayLoad = {
      title: metadataTitle || title,
      author: author || '',
      filePath: filePath,
      genre: subject || '',
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
      let finalBookForm = { ...completedBook }

      if (finalBookForm.filePath) {
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

  const filteredBooks = books.filter((book) => {
    const titleMatch = book.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const authorMatch = book.author?.toLowerCase().includes(searchQuery.toLowerCase())
    return titleMatch || authorMatch
  })
  const isSearchEmpty = books.length > 0 && filteredBooks.length == 0
  return (
    <div className="app">
      {/* Nav-Bar */}
      <div className="app-navbar synced-titlebar">
        <h1 className="navbar-logo">Catalogia</h1>
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
            {isBulkAdding ? 'Processing...' : 'Add Book(s)'}
          </button>
          <button
            className="add-book-btn"
            onClick={handleAddFolder}
            disabled={isBulkAdding || loading}
          >
            {isBulkAdding ? 'Importing Folder..' : 'Add Folder'}
          </button>
        </div>

        <div className="window-controls">
          {/* Minimize Button */}
          <button className="win-btn" onClick={() => window.api.minimizeWindow()} title="Minimize">
            <svg width="10" height="1" viewBox="0 0 10 1" fill="none" xmlns="http://w3.org">
              <rect width="10" height="1" fill="currentColor" />
            </svg>
          </button>

          {/* Maximize / Restore Button */}
          <button className="win-btn" onClick={() => window.api.maximizeWindow()} title="Maximize">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://w3.org">
              <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>

          {/* Close Button */}
          <button
            className="win-btn close-btn"
            onClick={() => window.api.closeWindow()}
            title="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://w3.org">
              <path
                d="M1 1L9 9M9 1L1 9"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {loading && <div>Loading library collection...</div>}
      {/* main body */}
      {isSearchEmpty ? (
        <div>
          <p>No books match '{searchQuery}'</p>
        </div>
      ) : (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onDelete={handleDeleteBook} />
          ))}
        </div>
      )}

      {/* modal */}
      {isModalOpen && (
        <AddBookModal
          initialBook={pendingBook}
          onSave={handleSaveModal}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  )
}

export default App
