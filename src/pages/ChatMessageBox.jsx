

const ChatMessageBox = ({message}) => {
return(
    <div>
        <p>Author: {message.author}</p>
        <p>Created on: {message.createdOn}</p>
        <p>Content: {message.content}</p>
    </div>
)



}

export default ChatMessageBox;