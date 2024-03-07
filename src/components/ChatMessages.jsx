import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { editMessageInChat, getChatMessagesById, deleteMessageFromChat, replyToMessage, editReplyInChat, deleteReplyFromChat, leaveChat } from "../services/chat.services";
import ChatMessageBox from "./ChatMessageBox";
import ChatInput from "./ChatInput";
import AppContext from "../providers/AppContext";
import { v4 } from "uuid";
import { Box } from "@chakra-ui/react";

const ChatMessages = () => {
  const [messages, setMessages] = useState([]);
  const { chatId } = useParams();
  const { userData } = useContext(AppContext);
  const [leftChat, setLeftChat] = useState(false);
  const [isCurrentUserLeft, setIsCurrentUserLeft] = useState(false);


  useEffect(() => {
    const unsubscribe = getChatMessagesById((snapshot) => {
      const msgData = snapshot.exists() ? snapshot.val() : {};
      const newMessages = Object.values(msgData);
  
      if (!isCurrentUserLeft) {
        setMessages(newMessages);
      }
    }, chatId);
  
    return () => {
      unsubscribe();
      setLeftChat(true);
    };
  }, [chatId, isCurrentUserLeft]);


  const sendMessage = async (event) => {
    event.preventDefault();
    const message = event.target.elements.newMessage.value;
    await addMessageToChat(chatId, message, userData.handle);
    event.target.elements.newMessage.value = "";
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {

      // throw new Error ('FATAL ERROR :)')
      await editMessageInChat(chatId, messageId, newContent);
    } catch (error) {
      // showToast(error);
      // setError(error.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    await deleteMessageFromChat(chatId, messageId, userData.handle);
  };

  // if(error) {
  //   return; 
  // };

  const handleReplyToMessage = async (messageId, replyContent) => {
    await replyToMessage(chatId, messageId, replyContent, userData.handle);
  };

  const handleEditReply = async (messageId, replyId, newContent) => {
    await editReplyInChat(chatId, messageId, replyId, newContent
    );
  };

const handleDeleteReply = async (messageId, replyId) => {
  await deleteReplyFromChat(chatId, messageId, replyId, userData.handle);
}

const handleLeaveChat = async () => {
  const success = await leaveChat(chatId, userData.handle);

  if (success) {
    const leaveMessage = {
      content: `${userData.handle} has left the chat.`,
      author: 'System',
      createdOn: new Date().toLocaleString(),
    };

    await addMessageToChat(chatId, leaveMessage.content, leaveMessage.author);
    setIsCurrentUserLeft(true);
  } else {
    console.log('Failed to leave the chat.');
  }
};


  return (
    <>
      {messages &&
        messages.map((message) => (
          <ChatMessageBox
            key={v4()}
            message={message}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            onReply={handleReplyToMessage}
            currentUserHandle={userData.handle}
            chatId={chatId}
            reactions={message.reactions}
          />
        ))}
      <Form onSubmit={sendMessage} style={{ position: 'absolute', bottom: 30, width: '70%', backgroundColor: '#242424', color:'white' }}>
        <Input placeholder="type here..." name="newMessage" />
      </Form>
    </Box>
  );
};

export default ChatMessages;