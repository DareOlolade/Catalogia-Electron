import {useState, useEffect} from "react"

const BookCard = ({book, onDelete})=>{
    const [coverSrc, setCoverSrc] = useState(null) 

    useEffect(()=>{
        let cancelled = false
        if(book.coverImagePath){
            window.api.readCover(book.coverImagePath).then(src => {
                if(!cancelled) setCoverSrc(src)
            })
        }
        return () => {cancelled = true}
    }, [book.coverImagePath])
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

        {coverSrc ? <img src = {coverSrc} />: (<div>no image found</div>)}
        <div onClick = {handleCardClick}>
            <h1>{book.title}</h1>
            <p>{book.author || 'Unknown Author'} — <em>{book.readStatus}</em></p>
        </div>

        <button onClick = {handleDeleteClick}>Delete</button>
        </div>
    )
}

export default BookCard