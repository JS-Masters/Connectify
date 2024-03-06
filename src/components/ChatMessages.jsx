import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { addMessageToChat, editMessageInChat, getChatMessagesById, deleteMessageFromChat, replyToMessage } from "../services/chat.services";
import ChatMessageBox from "./ChatMessageBox";
import { Input } from "@chakra-ui/input";
import { Form } from "react-router-dom";
import AppContext from "../providers/AppContext";
import { v4 } from "uuid";

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
    };
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
      <Form onSubmit={sendMessage}>
        <Input placeholder="type here..." name="newMessage" />
      </Form>
    </>
  );
};

export default ChatMessages;