import { Avatar, AvatarBadge, Button, Input, List, ListIcon, ListItem, Tag, useToast } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import Popup from "reactjs-popup";
import AppContext from "../../providers/AppContext";
import { useNavigate } from "react-router-dom";
import { checkUsersIfBannedLoggedUser, getAllUsers } from "../../services/user.services";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { v4 } from "uuid";
import { createNewChat } from "../../services/chat.services";
import "./CreateChatPopUp.css";
import UserStatusIcon from "../UserStatusIconChats";

const CreateChatPopUp = () => {

  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [foundUsers, setFoundUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchField, setSearchField] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const showToast = (desc, status) => {
    toast({
      title: "Create team",
      description: desc,
      duration: 5000,
      isClosable: true,
      status: status,
      position: "top",
    });
  };

  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.values(users)));
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const usersFiltered = users.filter((u) => u.handle.toLowerCase().startsWith(searchField.toLowerCase()) && u.handle !== userData.handle);
      checkUsersIfBannedLoggedUser(usersFiltered, userData.handle)
        .then(setFoundUsers)
    }
  }, [searchField, users]);


  const updateSelectedUsers = (userHandle) => {
    if (selectedUsers.includes(userHandle)) {
      const selectedUsersUpdated = selectedUsers.filter(
        (u) => u !== userHandle
      );
      setSelectedUsers(selectedUsersUpdated);
    } else {
      setSelectedUsers([...selectedUsers, userHandle]);
    }
  };

  const handlePopUpClose = (close) => {
    close();
    setSearchField('');
    setSelectedUsers([]);
  };

  const handleCreateChatClick = async (close) => {
    if (!selectedUsers.length) {
      showToast('Choose someone to connect with', 'info');
      return;
    }
    try {
      const newChatId = await createNewChat(userData.handle, selectedUsers);
      handlePopUpClose(close);
      navigate(`/chats/${newChatId}`);
    } catch (error) {
      showToast('Error occured while creating a post', 'error');
    }
  };

  return (
    <Popup trigger=
      {<Button id="new-chat-button" m='20px'>NEW CHAT</Button>}
      modal nested
      closeOnDocumentClick={false}
      closeOnEscape={false}>
      {
        close => (
          <div className='modal' style={{ width: '500px', height: '500px', backgroundColor: '#6b6767' }}>
            <Button id="close-create-chat-button" size='sm' style={{ float: "right", margin: "10px", backgroundColor: 'transparent' }} onClick=
              {() => handlePopUpClose(close)}>
              X
            </Button>
            <div className='content' style={{ padding: "0 35px" }}>

              <Input
                id="create-chat-input"
                type="search"
                value={searchField}
                onChange={(event) => setSearchField(event.target.value)}
                placeholder="Connect with..."
              />
              <div className="selected-content" style={{ color: "black" }}>
                {selectedUsers.join(" ").length
                  ? selectedUsers.map((user) => (
                    <Tag
                      key={v4()}
                      onClick={() => updateSelectedUsers(user)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: "darkgray",
                        color: "black",
                        margin: "2px",
                      }}
                    >
                      {user}{" "}
                      <CloseIcon
                        style={{ width: "15px", marginLeft: "3px", color: "black" }}
                      />
                    </Tag>
                  ))
                  : <p style={{ display: 'inline-block', marginTop: '10px', marginLeft: '125px', marginBottom: '10px', color: '#611f26', fontWeight: 'bold' }}>No users selected yet!</p>}
              </div>
              <List
                id="create-chat-users-list"
                overflow="hidden"
                overflowY="auto"
                style={{ border: '2px solid black', borderRadius: '10px', height: '275px', padding: '2px', }}>
                {Boolean(foundUsers.length) &&
                  foundUsers.map((user) => (
                    <ListItem
                      className="create-form-user"
                      key={v4()}
                      style={{ cursor: "pointer", border: '1px solid transparent', borderRadius: '5px', padding: '2px' }}
                      onClick={() => updateSelectedUsers(user.handle)}
                    >
                      <Avatar size='md' src={user.avatarUrl}>
                        <AvatarBadge bg="teal.500" >{<UserStatusIcon userHandle={user.handle} iconSize={'10px'} />}</AvatarBadge>
                      </Avatar>
                      <span className="user-handle-span" style={{ margin: '10px', fontSize: '20px' }}>{user.handle}</span>
                      {/* <AddIcon style={{ padding: '3px', marginLeft: '5px', color: 'rgb(38, 70, 9)', border: '1px solid rgb(38, 70, 9)', borderRadius: '5px', width:'30px', height:'30px' }} /> */}
                    </ListItem>
                  ))}
              </List>
              <br />
              <Button id="create-chat-button" onClick={() => handleCreateChatClick(close)} style={{ position: 'absolute', bottom: '0', marginBottom: '25px', marginLeft: '80px' }}>CONNECT</Button>
            </div>
          </div>
        )
      }
    </Popup>
  );

};

export default CreateChatPopUp;