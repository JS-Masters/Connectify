import { Button } from "@chakra-ui/button";
import { SmallAddIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/input";
import { useToast } from "@chakra-ui/toast";
import { Checkbox, CheckboxGroup } from '@chakra-ui/react'
import { useContext, useEffect, useState } from "react";
import { Form, useNavigate, useSearchParams } from "react-router-dom";
import AppContext from "../providers/AppContext";
import { push, ref, set } from "@firebase/database";
import { db } from "../config/firebase-config";
import { getAllUsers, getUsersBySearchTerm } from "../services/user.services";
import { createNewChat, getChatsByUserHandle } from "../services/chat.services";
import SelectedUsersBar from "../components/SelectedUsersBar/SelectedUsersBar";
import { v4 } from "uuid";



const Chats = () => {

  const { userData } = useContext(AppContext);
  const toast = useToast();
  const navigate = useNavigate();
  const [myChats, setMyChats] = useState(null);

  const [users, setUsers] = useState([]);

  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';

  const setSearch = (value) => {
    setSearchParams({ search: value });
  };

  // ГОТОВО
  useEffect(() => {
    getAllUsers()
      .then((users) => setUsers(Object.keys(users)))

    getChatsByUserHandle(userData.handle)
      .then((chats) => {
        if (chats) {
          setMyChats(chats);
        }
      });
  }, []);

  // ГОТОВО
  useEffect(() => {
    if (users.length) {
      const usersFiltered = users.filter((u) => (u.toLowerCase().includes(search.toLowerCase()) && u !== userData.handle));
      setUsersBySearchTerm(usersFiltered);
    }
  }, [search, users]);

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

  // // ГОТОВА
  // const showSearchUsers = () => {
  //   getAllUsers().then((snapshot) => {
  //     if (snapshot.exists()) {
  //       setUsers(Object.keys(snapshot.val()));
  //     }
  //   })
  // };

  // ГОТОВА
  const updateSelectedUsersPreferences = (userHandle) => {

    if (selectedUsers.includes(userHandle)) {
      const selectedUsersUpdated = selectedUsers.filter((u) => u !== userHandle);
      setSelectedUsers(selectedUsersUpdated);
    } else {
      setSelectedUsers([...selectedUsers, userHandle]);
    }
  };

  // ГОТОВА
  const handleCreateChatClick = async (event) => {
    event.preventDefault();
    if (selectedUsers.length) {
      // const selectedChatMembers = selectedUsers
      //   .filter((user) => Object.values(user)
      //     .some((value) => value === true)
      //     .map((obj) => Object.keys(obj))
      //     .flat());

      await createNewChat(userData.handle, selectedUsers).then((chatId) => navigate(`/chats/${chatId}`));
    } else {
      showToast('You have to choose at least one person to start a chat!', 'warning');
    };
  };

  return (
    <>
<SelectedUsersBar allUsers={users} selectedUsers={selectedUsers} setSearch={setSearch} updateSelectedUsersPreferences={updateSelectedUsersPreferences}/>
      {/* <Form onSubmit={handleCreateChatClick}>
        <input placeholder="Connect with..." value={search} onChange={e => setSearch(e.target.value)} type="text" name="search" id="search" /> */}
        {/* <input
          placeholder="Connect with..."
          name="searchUsers"
          value={search}
          onChange={() => setSearch(event.target.value)}
        ></input> */}
        {/* <Button type="submit">Create Chat</Button> */}
      {/* </Form> */}
      <div>
        {myChats ? (myChats.map((chat) => {
          <button onClick={() => navigate(`/chats/${Object.keys(chat)[0]}`)}>{Object.values(chat)[0].join(', ')}</button>
        })) : (<h1>You don't have any chats yet...</h1>)}
      </div>
      {usersBySearchTerm && (
        <div>
          {/* {usersBySearchTerm.slice(0, 5).map((user) => {
            return (
              <li key={v4()}>
                {user}{" "}
                <Checkbox
                  colorScheme="green"
                  size="lg"
                  onChange={() => updateSelectedUsersPreferences(user)}
                ></Checkbox>
              </li>
            );
          })} */}
        </div>
      )}
    </>
  );

};

export default Chats;