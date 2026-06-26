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
    const savedBook = await window.api.addBook(completedBook)
    setBooks((prevBooks) => [...prevBooks, savedBook])
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

  return (
    <>
      <div>
        <button onClick = {handleAddBookClick}>Add Book</button>
      {books.map(book => (
        <BookCard key= {book.id} book = {book}/>
      ))}
      {isModalOpen && (<AddBookModal initialBook = {pendingBook} onSave = {handleSaveModal} onCancel = {handleCancelModal}/>)}
      </div>

    </>
  )
}

export default App
