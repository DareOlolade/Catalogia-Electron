
const BookCard = ({book, onDelete})=>{
    const handleCardClick = async() => {
        if(!book.filePath){
            console.warn("can't open book")
            return
        }  
        await window.api.openBook(book.filePath)
    }

    const handleDeleteClick = async(e) => {
        e.stopPropagation()
        const confirmed = window.confirm(`Are you sure you want to delete ${book.title}`)
        if(confirmed){
            onDelete(book.id)
        }
    }
    return(
        <div>
        <div onClick = {handleCardClick}>
            <h1>{book.title}</h1>
            <p>{book.author || 'Unknown Author'} — <em>{book.readStatus}</em></p>
        </div>

        <button onClick = {handleDeleteClick}>Delete</button>
        </div>
    )
}

export default BookCard