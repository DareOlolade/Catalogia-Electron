import { useState, useEffect } from 'react'

const BookCard = ({ book, onDelete }) => {
  const [coverSrc, setCoverSrc] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (book.coverImagePath) {
      window.api.readCover(book.coverImagePath).then((src) => {
        if (!cancelled) setCoverSrc(src)
      })
    }
    return () => {
      cancelled = true
    }
  }, [book.coverImagePath])
  const handleCardClick = async () => {
    if (!book.filePath) {
      console.warn("can't open book")
      return
    }
    await window.api.openBook(book.filePath)
  }

  const handleDeleteClick = async (e) => {
    e.stopPropagation()
    const confirmed = window.confirm(`Are you sure you want to delete ${book.title}`)
    if (confirmed) {
      onDelete(book.id)
    }
  }
  return (
    <div className="book-card" onClick={handleCardClick}>
      <div className="book-card-container">
        {coverSrc ? (
          <img className="book-card-image" src={coverSrc} alt={book.title} />
        ) : (
          <div className="no-cover-fallback">No cover Available</div>
        )}
      </div>
      <div className="book-card-info">
        <h1 className="book-card-title">{book.title}</h1>
        <p className="book-card-author">{book.author || 'Unknown Author'}</p>

        <div className="book-card-metadata">
          {book.readStatus && <span className="status-badge">{book.readStatus}</span>}
          {book.pageCount > 0 && (
            <span>
              {book.readStatus && '•'} {book.pageCount} pages
            </span>
          )}
        </div>
      </div>

      <button onClick={handleDeleteClick} className="book-card-delete-btn">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  )
}

export default BookCard
