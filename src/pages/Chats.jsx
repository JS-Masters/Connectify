import { Button } from "@chakra-ui/button";
import { SmallAddIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/input";
import { useToast } from "@chakra-ui/toast";

import { useContext, useEffect, useState } from "react";
import { Form, useNavigate } from "react-router-dom";
import AppContext from "../providers/AppContext";
import { push, ref, set } from "@firebase/database";
import { db } from "../config/firebase-config";
import { getAllUsers } from "../services/user.services";
import { addDirectChat } from "../services/chat.services";


const Chats = () => {

  const { userData } = useContext(AppContext);
  const toast = useToast();
  const navigate = useNavigate();
  const [myChats, setMyChats] = useState(null);
  const [chatMember, setChatMember] = useState(null);
  const [users, setUsers] = useState([]);



  useEffect(() => {

  }, [])

  const showToast = (desc, status) => {
    toast({
      title: "Create New Chat",
      description: desc,
      duration: 5000,
      isClosable: true,
      status: status,
      position: "top"
    });
  };

  const showSearchUsers = () => {
    getAllUsers().then((snapshot) => {
      if (snapshot.exists()) {
        setUsers(Object.keys(snapshot.val()));
      }
    })

  }

  const createChat = async (event) => {
    event.preventDefault();
    const chatName = event.target.elements.chatName.value;

    if (chatName.length < 4 || chatName.length > 20) {
      return showToast('Chat name must be between 4 and 20 symbols!', 'error');
    }

   await addDirectChat(chatName, userData.handle, chatMember).then((dmId) => navigate(`/dms/${dmId}`));

  }



  return (
    <>

      <Form onSubmit={createChat}>
        <Input placeholder="Chat name" name="chatName"></Input>
        <SmallAddIcon cursor="pointer" onClick={showSearchUsers}></SmallAddIcon>
        {users && users.map((user) => <li onClick={() => setChatMember(user)}>{user}</li>)}
        <Button type="submit">Create Chat</Button>
      </Form>
    </>

  )
}

export default Chats;