import { useState, useEffect } from 'react'
import BookCard from './components/BookCard'
import AddBookModal from './components/AddBookModal'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
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

  const handleAddBookClick = async () => {
    const result = await window.api.pickPdf()
    if (result) {
      const bookMetadata = await window.api.extractMetadata(result.filePath)
      const { filePath, title } = result
      const { title: metadataTitle, author, pageCount, subject } = bookMetadata
      const bookPayLoad = {
        title: metadataTitle || title,
        author: author || '',
        filePath: filePath,
        genre: subject || "",
        pageCount: pageCount
      }
      setPendingBook(bookPayLoad)
      setIsModalOpen(true)
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

  const filteredBooks = books.filter((book) => {
    const titleMatch = book.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const authorMatch = book.author?.toLowerCase().includes(searchQuery.toLowerCase())
    return titleMatch || authorMatch
  })
  const isSearchEmpty = books.length > 0 && filteredBooks.length == 0
  return (
    <div className="app">
      {/* Nav-Bar */}
      <div className="app-navbar">
        <h1>Catalogia</h1>
        <input
          type="search"
          placeholder="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="add-book-btn" onClick={handleAddBookClick}>
          Add Book
        </button>
      </div>

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
