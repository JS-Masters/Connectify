import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { addMessageToChat, editMessageInChat, getChatMessagesById, deleteMessageFromChat } from "../services/chat.services";
import ChatMessageBox from "./ChatMessageBox";
import { Input } from "@chakra-ui/input";
import { Form } from "react-router-dom";
import AppContext from "../providers/AppContext";
import { v4 } from "uuid";
import { DELETE_MESSAGE } from "../common/constants";
import { useToast } from "@chakra-ui/react";
import { UnlockIcon } from "@chakra-ui/icons";

const ChatMessages = () => {
  const [messages, setMessages] = useState([]);
  const { id } = useParams();
  const { userData } = useContext(AppContext);
  const toast = useToast();
  // const [error, setError] = useState('');

  // const showToast = (desc) => {
  //   toast({
  //     title: "Unexpected error: ",
  //     description: desc,
  //     duration: 5000,
  //     isClosable: true,
  //     status: "error",
  //     position: "top",
  //     icon: <UnlockIcon />,
  //   });
  // };

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
    try {
     
      // throw new Error ('FATAL ERROR :)')
      await editMessageInChat(id, messageId, newContent);
    } catch(error) {
      // showToast(error);
      // setError(error.message);
    }
    
  };

  const handleDeleteMessage = async (messageId) => {
    await deleteMessageFromChat(id, messageId, userData.handle);
  }; 

  // if(error) {
  //   return; 
  // };

  return (
    <>
    {/* {console.log('RETURN')} */}
      {messages &&
        messages.map((message) => (
          <ChatMessageBox 
            key={v4()}
            message={message}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
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