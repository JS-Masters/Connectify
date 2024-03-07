import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { editMessageInChat, getChatMessagesById, deleteMessageFromChat, replyToMessage } from "../services/chat.services";
import ChatMessageBox from "./ChatMessageBox";
import ChatInput from "./ChatInput";
import AppContext from "../providers/AppContext";
import { v4 } from "uuid";
import { Box } from "@chakra-ui/react";


const ChatMessages = () => {
  const [messages, setMessages] = useState([]);
  const { chatId } = useParams();
  const { userData } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = getChatMessagesById((snapshot) => {
      const msgData = snapshot.exists() ? snapshot.val() : {};
      setMessages(Object.values(msgData));
    }, chatId);

    return () => unsubscribe();
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

  return (
    <>
      {messages &&
        <Box overflowY='scroll' whiteSpace='nowrap' h='93%'>
          {
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
        </Box>
      }

      <ChatInput />
    </>
  );
};

export default ChatMessages;