import '../assets/sidebar.css'
const SideBar = ({ categories, selectedCategory, onSelectedCategory, onOpenSettingsView, onOpenLibraryView}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav>
          <button
            className={`menu-item ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => {
              onSelectedCategory('All')
               onOpenLibraryView()
            }}
          >
            <span className="menu-label">All Books</span>
          </button>

          {categories.map((category) => (
            <button
              key={category}
              className={`menu-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => {
                onSelectedCategory(category)
                onOpenLibraryView()
              }}
            >
              <span className="menu-label">{category}</span>
            </button>
          ))}
        </nav>
        <div
          onClick={() => {
            onOpenSettingsView()
          }}
          className="sidebar-footer"
        >
          <button className="menu-item">
            <span className="menu-icon">⚙️</span>
            <span className="menu-label">Settings</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default SideBar
