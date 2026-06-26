import {useState, useEffect} from "react"
import BookCard from "./components/BookCard"

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
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
    loadBooks()
  }, [])

  const handleAddBook = async() => {
    const result = await window.api.pickPdf()
    if(result){
      const {filePath, title} = result
      bookPayload = {title: title, author:"", filePath: filePath}
    }
  }


  return (
    <div>
      <button>Add Book</button>
     {books.map(book => (
       <BookCard key= {book.id} book = {book}/>
     ))}
    </div>
  )
}

export default App
