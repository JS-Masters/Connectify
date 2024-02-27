import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { addMessageToDirectChat, getDirectChatMessagesById } from "../services/chat.services";
import ChatMessageBox from "./ChatMessageBox";
import { Input } from "@chakra-ui/input";
import { Form } from "react-router-dom";
import AppContext from "../providers/AppContext";
import { v4 } from "uuid";

const DirectMessages = () => {

  const [dms, setDms] = useState(null);
  const { directChatId } = useParams();
  const { userData } = useContext(AppContext);

  useEffect(() => {
   getDirectChatMessagesById((snapshot) => {
      const msgData = snapshot.exists() ? snapshot.val() : {};
      setDms(Object.values(msgData));
    }, directChatId);


    return () => getDirectChatMessagesById((snapshot) => {
      const msgData = snapshot.exists() ? snapshot.val() : {};
      setDms(Object.values(msgData));
    }, directChatId);
  }, []);

  const sendMessage = async (event) => {
    const message = event.target.elements.newMessage.value;
    await addMessageToDirectChat(directChatId, message, userData.handle)
  }


  return (
    <>
      {dms && dms.map((message) => <ChatMessageBox key={v4()} message={message} />)}

      <Form onSubmit={sendMessage}>
        <Input placeholder="type here..." name="newMessage" />

      </Form>

    </>
  )


}

export default DirectMessages;