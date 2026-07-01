import { useState, useEffect, useRef } from 'react'

const BookCard = ({ book, onDelete, onEdit }) => {
  const [coverSrc, setCoverSrc] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef()

  useEffect(() => {
    if (!showMenu) return

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

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

  const toggleMenu = (e) => {
    e.stopPropagation()
    setShowMenu((prev) => !prev)
  }

  const handleDeleteClick = async (e) => {
    e.stopPropagation()
    setShowMenu(false)
    const confirmed = window.confirm(`Are you sure you want to delete ${book.title}`)
    if (confirmed) {
      onDelete(book.id)
    }
  }
  const handleEditClick = (e) => {
    e.stopPropagation()
    onEdit(book)
  }
  return (
    <div className={`book-card ${showMenu ? 'book-card--menu-open' : ''}`} onClick={handleCardClick}>
      <div className="book-cover-container">
        {coverSrc ? (
          <img className="book-card-image" src={coverSrc} alt={book.title} />
        ) : (
          <div className="no-cover-fallback">No cover Available</div>
        )}
      </div>

      <div className="book-card-menu-wrapper" ref={menuRef}>
        <button onClick={toggleMenu} className="book-card-kebab-btn">
          &#8942;
        </button>
        {showMenu && (
          <div className="book-card-dropdown">
            <button onClick={handleEditClick} className="dropdown-item edit-btn">
              Edit
            </button>
            <button onClick={handleDeleteClick} className="dropdown-item delete-btn">
              Delete
            </button>
          </div>
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
    </div>
  )
}

export default BookCard
