import { Button, Input, List, Tag, useToast } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import Popup from "reactjs-popup";
import AppContext from "../providers/AppContext";
import { useNavigate } from "react-router-dom";
import { checkUsersIfBannedLoggedUser, getAllUsers } from "../services/user.services";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { v4 } from "uuid";
import { createNewChat } from "../services/chat.services";


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
    getAllUsers().then((users) => setUsers(Object.keys(users)));
  }, []);

  useEffect(() => {
    if (users.length) {
      const usersFiltered = users.filter((u) => u.toLowerCase().startsWith(searchField.toLowerCase()) && u !== userData.handle);
      checkUsersIfBannedLoggedUser(usersFiltered, userData.handle)
      .then(setFoundUsers)
    }
  }, [searchField, users]);

  const formattedSelection = () => selectedUsers.length > 0 ? selectedUsers.join(", ") : "";

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
      {<Button style={{ marginTop: '10px' , width: '80%', height: '45px', backgroundColor: 'green' }}>New chat</Button>}
      modal nested>
      {
        close => (
          <div className='modal'>
            <Button style={{ float: "right", margin: "15px" }} onClick=
              {() => handlePopUpClose(close)}>
              X
            </Button>
            <div style={{ width: '500px', height: '500px', border: '2px solid black', padding: "30px" }} className='content'>
              <span className="formatted-selection">{formattedSelection()}</span>

              <Input
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
                  : "No users selected yet!"}
              </div>
              <List>
                {searchField && Boolean(foundUsers.length) &&
                  foundUsers.map((user) => (
                    <Button
                      rightIcon={<AddIcon />}
                      key={v4()}
                      style={{ cursor: "pointer", color: "black" }}
                      onClick={() => updateSelectedUsers(user)}
                    >
                      {user}
                    </Button>
                  ))}
              </List>
              <br />
              <Button onClick={() => handleCreateChatClick(close)}>Create Chat</Button>
            </div>
          </div>
        )
      }
    </Popup>
  );

};

export default CreateChatPopUp;