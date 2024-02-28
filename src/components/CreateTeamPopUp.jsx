import { Button, Input, List, Tag, useToast } from "@chakra-ui/react"
import { useContext, useEffect, useState } from "react";
import Popup from 'reactjs-popup';
import AppContext from "../providers/AppContext";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { getAllUsers } from "../services/user.services";
import { v4 } from "uuid";

const CreateTeamPopUp = () => {

  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [foundUsers, setFoundUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState("");
  const [channelFromInput, setChannelFromInput] = useState('');
  const [channels, setChannels] = useState([]);

  const toast = useToast();

  const showToast = (desc, status) => {
    toast({
      title: "Add channel",
      description: desc,
      duration: 5000,
      isClosable: true,
      status: status,
      position: "top",
    });
  };

  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users)));
    // getChatsByUserHandle(userData.handle).then((chats) => {
    //   if (chats) {
    //     setMyChats(chats);
    //   }
    // });
  }, []);

  useEffect(() => {
    if (users.length) {
      const usersFiltered = users.filter(
        (u) =>
          u.toLowerCase().includes(search.toLowerCase()) &&
          u !== userData.handle
      );
      setFoundUsers(usersFiltered);
    }
  }, [search, users]);

  const updateSearchField = (event) => {
    setSearchField(event.target.value);
    setSearch(event.target.value);
  };

  const updateChannelInputField = (event) => {
    setChannelFromInput(event.target.value);
  }

  const formattedSelection = () => selectedUsers.length > 0 ? selectedUsers.join(", ") : "";


  const updateSelectedUsersPreferences = (userHandle) => {
    if (selectedUsers.includes(userHandle)) {
      const selectedUsersUpdated = selectedUsers.filter(
        (u) => u !== userHandle
      );
      setSelectedUsers(selectedUsersUpdated);
    } else {
      setSelectedUsers([...selectedUsers, userHandle]);
    }
  };

  const addChannelToSelected = () => {
    if (!channelFromInput) {
      showToast('You must enter a channel name first', 'warning');
    } else {
      setChannels((prevChannels) => [...prevChannels, channelFromInput]);
      setChannelFromInput('');
    }
  };

  const removeChannelFromSelected = (channelToRemove) => {
    const channelsUpdated = [...channels].filter((channel) => channel !== channelToRemove);
    setChannels(channelsUpdated);
  };

  const handlePopUpClose = (close) => {
     close();
    setChannels([]);
    setChannelFromInput('');
    setSelectedUsers([]);
  };

  const handleCreateTeamClick = () => {


  }

  return (
    <Popup trigger=
      {<Button style={{ width: '45px', height: '45px', backgroundColor: 'green' }}>+</Button>}
      modal nested>
      {
        close => (
          <div className='modal'>
            <Button style={{float: "right", margin:"15px"}} onClick=
                {() => handlePopUpClose(close)}>
                X
              </Button>
            <div style={{ width: '500px', height: '500px', border: '2px solid black', padding: "30px"}} className='content'>
              <span className="formatted-selection">{formattedSelection()}</span>
              
              <Input
                type="search"
                value={searchField}
                onChange={updateSearchField}
                placeholder="Connect with..."
              />
              <div className="selected-content" style={{ color: "black" }}>
                {selectedUsers.join(" ").length
                  ? selectedUsers.map((user) => (
                    <Tag
                      key={v4()}
                      onClick={() => updateSelectedUsersPreferences(user)}
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
                {foundUsers.length &&
                  foundUsers.map((user) => (
                    <Button
                      rightIcon={<AddIcon />}
                      key={v4()}
                      style={{ cursor: "pointer", color: "black" }}
                      onClick={() => updateSelectedUsersPreferences(user)}
                    >
                      {user}
                    </Button>
                  ))}
              </List>
              <Input
                type="text"
                value={channelFromInput}
                onChange={updateChannelInputField}
                placeholder="Creacte a channel..."
                style={{ width: "275px" }}
              /><Button onClick={() => addChannelToSelected()}>+</Button>
              <br />
              {channels.length ? (channels.map((channel) => {
                return (
                  <div key={v4()}>
                    {`${channel}`}
                    <Button onClick={() => removeChannelFromSelected(channel)}>X</Button>
                  </div>
                )
              })
            ):(' ')}
              <br />
              <Button onClick={handleCreateTeamClick}>Create Team</Button>
            </div>
           

          </div>
        )
      }
    </Popup>
  );
};
export default CreateTeamPopUp;
