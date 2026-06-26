
const BookCard = ({book})=>{
    const handleCardClick = async() => {
        if(!book.filePath){
            console.warn("can't open book")
            return
        }  
        await window.api.openBook(book.filePath)
    }
    return(
        <div onClick = {handleCardClick}>
            <h1>{book.title}</h1>
            <p>{book.author || 'Unknown Author'} — <em>{book.readStatus}</em></p>
        </div>
    )
}

export default BookCard