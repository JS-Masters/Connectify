import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { editMessageInChat, getChatMessagesById, deleteMessageFromChat, replyToMessage, editReplyInChat, deleteReplyFromChat, leaveChat, addMessageToChat } from "../services/chat.services";
import ChatMessageBox from "./ChatMessageBox";
import ChatInput from "./ChatInput";
import AppContext from "../providers/AppContext";
import { Box, Button } from "@chakra-ui/react";
import { SYSTEM_AVATAR } from "../common/constants";

const ChatMessages = () => {
  const [messages, setMessages] = useState([]);
  const { chatId } = useParams();
  const { userData } = useContext(AppContext);


  useEffect(() => {

    const unsubscribe = getChatMessagesById((snapshot) => {
      const msgData = snapshot.exists() ? snapshot.val() : {};
      const newMessages = Object.values(msgData);
        setMessages(newMessages);

    }, chatId);
    return () =>  unsubscribe();

  }, [chatId]);


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

  return (
    <Box overflowY='scroll' whiteSpace='nowrap' h='93%'>
      {messages && (
        messages.map((message) => (
          <ChatMessageBox
            key={message.id}
            message={message}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            onReply={handleReplyToMessage}
            onEditReply={handleEditReply}
            onDeleteReply={handleDeleteReply}
            currentUserHandle={userData.handle}
            chatId={chatId}
            reactions={message.reactions}
          />
        ))
      )}
      <ChatInput />
    </Box>
  );

};

export default ChatMessages;