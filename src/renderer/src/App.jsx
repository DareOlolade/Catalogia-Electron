import {useState, useEffect} from "react"
import BookCard from "./components/BookCard"
import AddBookModal from "./components/AddBookModal"

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingBook, setPendingBook] = useState(null)

  const loadBooks = async() => {
    try{
      setLoading(true)
      const data = await window.api.getAllBooks()
      setBooks(data)
    }catch(error){
      console.error("Failed to load catalog", error)
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=>{
    loadBooks()
  }, [])

  const handleAddBookClick = async() => {
    const result = await window.api.pickPdf()
    if(result){
      const {filePath, title} = result
      const bookPayLoad = {title: title, author:"", filePath: filePath}
      setPendingBook(bookPayLoad)
      setIsModalOpen(true)
    }
  }

  const handleSaveModal = async(completedBook)=>{
   try{
    let finalBookForm = {...completedBook}

    if(finalBookForm.filePath){
      const savedBook = await window.api.addBook(finalBookForm)
      const coverPath = await window.api.renderCover({
        filePath: savedBook.filePath,
        pageNumber: savedBook.coverPageNumber || 1,
        bookId: savedBook.id
      })

      if(coverPath){
        const updated = await window.api.updateBook(savedBook.id, {coverImagePath: coverPath})
        setBooks((prevBooks) => [...prevBooks, updated])
      } else{
        setBooks((prevBooks) => [...prevBooks, savedBook])
      }
    }
   }catch(error){
    console.error("Error Saving Book", error)
   }finally{
    setIsModalOpen(false)
    setPendingBook(null)
   }
  }

  const handleCancelModal = () =>{
    setIsModalOpen(false)
    setPendingBook(null)
  }

  const handleDeleteBook = async(id) => {
    try{
    const deletedBook = await window.api.deleteBook(id)
    if(deletedBook){
      setBooks((prev)=> prev.filter(b => b.id != id))
    }}catch(error){
      console.error("Failed to delete catalog item", error)
    }
  }

  return (
    <>
      <div>
        <button onClick = {handleAddBookClick}>Add Book</button>
      {books.map(book => (
        <BookCard key= {book.id} book = {book} onDelete= {handleDeleteBook}/>
      ))}
      {isModalOpen && (<AddBookModal initialBook = {pendingBook} onSave = {handleSaveModal} onCancel = {handleCancelModal}/>)}
      </div>

    </>
  )
}

export default App
