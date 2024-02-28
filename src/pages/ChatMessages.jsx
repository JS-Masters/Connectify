import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { addMessageToChat, editMessageInChat, getChatMessagesById } from "../services/chat.services";
import ChatMessageBox from "./ChatMessageBox";
import { Input } from "@chakra-ui/input";
import { Form } from "react-router-dom";
import AppContext from "../providers/AppContext";
import { v4 } from "uuid";

const ChatMessages = () => {
  const [messages, setMessages] = useState([]);
  const { id } = useParams();
  const { userData } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = getChatMessagesById((snapshot) => {
      const msgData = snapshot.exists() ? snapshot.val() : {};
      setMessages(Object.values(msgData));
    }, id);

    return () => unsubscribe();
  }, [id]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = event.target.elements.newMessage.value;
    await addMessageToChat(id, message, userData.handle);
    event.target.elements.newMessage.value = "";
  };

  const handleEditMessage = async (messageId, newContent) => {
    await editMessageInChat(id, messageId, newContent);
  };

  return (
    <>
      {messages &&
        messages.map((message) => (
          <ChatMessageBox
          key={v4()}
          message={message}
          onEdit={handleEditMessage}
          currentUserHandle={userData.handle}
        />
        ))}

      <Form onSubmit={sendMessage}>
        <Input placeholder="type here..." name="newMessage" />
      </Form>
    </>
  );
};

export default ChatMessages;