import { useState } from 'react'
import '../assets/SettingsView.css'

export default function SettingsView({
  onClose,
  categories = [],
  onCategories,
  onRefreshCatalog,
  selectedCategory,
  onSelectedCategory
}) {
  const [newCategory, setNewCategory] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Handle Add Category
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newCategory.trim() || isProcessing) return

    try {
      setIsProcessing(true)
      const updatedCategories = await window.api.addCategory(newCategory.trim())

      onCategories(updatedCategories)
      setNewCategory('')
    } catch (error) {
      console.error('Failed to add category:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle Delete Category
  const handleDelete = async (categoryToDelete) => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      const updatedCategories = await window.api.deleteCategory(categoryToDelete)
      onCategories(updatedCategories)
      if (categoryToDelete === selectedCategory) {
        onSelectedCategory('All')
      }
      if (typeof onRefreshCatalog === 'function') {
        onRefreshCatalog()
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M1.75 3.5h10.5M5.25 3.5V2.333a.583.583 0 0 1 .583-.583h2.334a.583.583 0 0 1 .583.583V3.5M11.083 3.5l-.583 7.583a.583.583 0 0 1-.583.584H4.083a.583.583 0 0 1-.583-.584L2.917 3.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  return (
    <div className="settings-view" onClick={(e) => e.stopPropagation()}>
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage Your Library</p>
      </div>

      <div className="settings-section">
        <p className="settings-section-title">Categories</p>
        {/* Add Category Form */}
        <form onSubmit={handleAdd} className="add-category-form">
          <input
            type="text"
            placeholder="New category name..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={isProcessing}
            maxLength={50}
          />
          <button type="submit" disabled={isProcessing || !newCategory.trim()}>
            Add
          </button>
        </form>

        {/* Categories List View */}
        <ul className="categories-list">
          {categories.map((category) => (
            <li key={category} className="category-item">
              <span>{category}</span>
              <button
                className="category-delete-btn"
                onClick={() => handleDelete(category)}
                disabled={isProcessing}
                title={`Delete ${category}`}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
          {categories.length === 0 && <p className="empty-message">No custom categories found.</p>}
        </ul>
      </div>
    </div>
  )
}
