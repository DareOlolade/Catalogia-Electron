import { useState } from 'react'

const AddBookModal = ({ initialBook, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: initialBook?.title || '',
    author: initialBook?.author || '',
    genre: initialBook?.genre || '',
    category: initialBook?.category || '',
    readStatus: initialBook?.readStatus || 'NotRead',
    coverPageNumber: initialBook?.coverPageNumber || 1,
    filePath: initialBook?.filePath || '',
    pageCount: initialBook?.pageCount 
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'coverPageNumber' ? parseInt(value, 10) || 1 : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-backdrop">
      {' '}
      <div className="modal">
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Title:
            <input type="text" value={form.title} name="title" onChange={handleChange} />
          </label>
          <label>
            Author:
            <input type="text" value={form.author} name="author" onChange={handleChange} />
          </label>
          <label>
            Genre:
            <input type="text" value={form.genre} name="genre" onChange={handleChange} />
          </label>
          <label>
            Category:
            <input type="text" value={form.category} name="category" onChange={handleChange} />
          </label>
          <label>
            Read Status
            <select name="readStatus" value={form.readStatus} onChange={handleChange}>
              <option value="NotRead">Not Read</option>
              <option value="Reading">Reading</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
          <label>
            Cover Page Number:
            <input
              type="number"
              min="1"
              max={form.pageCount}
              value={form.coverPageNumber}
              name="coverPageNumber"
              onChange={handleChange}
            />
          </label>

          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddBookModal
