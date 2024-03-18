import { Avatar, AvatarBadge, Button, Input, List, ListItem, Tag, useToast } from "@chakra-ui/react"
import { useContext, useEffect, useState } from "react";
import Popup from 'reactjs-popup';
import AppContext from "../../providers/AppContext";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { getAllUsers } from "../../services/user.services";
import { v4 } from "uuid";
import { createTeam } from "../../services/team.services";
import { addChannelToTeam } from "../../services/channel.servicies";
import { useNavigate } from "react-router-dom";
import { sendNotification } from "../../services/chat.services";
import "./CreateTeamPopUp.css";
import UserStatusIcon from "../UserStatusIconChats";

const CreateTeamPopUp = () => {

  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [foundUsers, setFoundUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchField, setSearchField] = useState('');
  const [channelFromInput, setChannelFromInput] = useState('');
  const [channels, setChannels] = useState([]);
  const [teamName, setTeamName] = useState('');
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
      const usersFiltered = users.filter(
        (u) =>
          u.handle.toLowerCase().startsWith(searchField.toLowerCase()) &&
          u.handle !== userData.handle
      );
      setFoundUsers(usersFiltered);
    }
  }, [searchField, users]);

  const updateTeamNameInputField = (event) => {
    setTeamName(event.target.value);
  };

  const updateChannelInputField = (event) => {
    setChannelFromInput(event.target.value);
  };


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
    setTeamName('');
    setSearchField('');
    setSelectedUsers([]);
  };

  const handleCreateTeamClick = async (close) => {
    if (!teamName) {
      showToast('Choose a name for your team', 'info');
      return;
    };
    if (teamName.length < 3 || teamName.length > 20) {
      showToast('Team name should be between 3 and 20 characters', 'info');
      return;
    };
    if (!selectedUsers.length) {
      showToast('Choose people to connect with in your team', 'info');
      return;
    };
    if (!channels.length) {
      showToast('Create at least one channel', 'info');
      return;
    };
    try {
      const newTeamId = await createTeam(teamName, userData.handle, selectedUsers);

      await Promise.all(channels.map(async (channelTitle) => {
        await addChannelToTeam(newTeamId, channelTitle, userData.handle);
      }));

      await Promise.all(selectedUsers.map(async (user) => {
        await sendNotification(user, 'New team!', 'You have been added to a new team.', newTeamId, 'teams');
      }))

      handlePopUpClose(close);
      navigate(`/teams/${newTeamId}`);
    } catch (error) {
      showToast('Error occured while creating a post', 'error');
    }
  };

  return (
    <Popup trigger=
      {<Button id="new-team-button" style={{ width: '150px', height: '74px', border: '1px solid green', backgroundColor: 'transparent', color: 'green', marginTop: '40px', marginRight: '30px' }}>New Team</Button>}
      modal nested
      closeOnDocumentClick={false}
      closeOnEscape={false}
    >
      {
        close => (
          <div className='modal' style={{ width: '500px', height: '700px', backgroundColor: '#6b6767' }}>
            <Button id="close-create-team-button" size='sm' style={{ float: "right", margin: "10px", backgroundColor: 'transparent' }} onClick=
              {() => handlePopUpClose(close)}>
              X
            </Button>
            <div className='content' style={{ padding: "0 35px" }}>
              <Input
                id="team-name-input"
                type="text"
                value={teamName}
                onChange={updateTeamNameInputField}
                placeholder="Team name..."
              />
              <br />
              <br />
              <Input
                id="create-team-input"
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
                            style={{ width: "15px", marginLeft: "9px", color: "black", fontSize:'10px' }}
                      />
                    </Tag>
                  ))
                  : <p style={{ display: 'inline-block', marginTop: '10px', marginLeft: '125px', marginBottom: '10px', color: '#611f26', fontWeight:'bold' }}>No users selected yet!</p>}
              </div>
              <List id="create-team-users-list"
                overflow="hidden"
                overflowY="auto"
                style={{ border: '2px solid black', borderRadius: '10px', height: '275px', padding: '2px', }}
              >
                {foundUsers.length &&
                  foundUsers.map((user) => (
                    <ListItem
                    className="create-form-user"
                      key={v4()}
                      style={{ cursor: "pointer", border:'1px solid transparent', borderRadius:'5px', padding:'5px' }}
                      onClick={() => updateSelectedUsers(user.handle)}
                    >
                      <Avatar size='md' src={user.avatarUrl}>
                        <AvatarBadge bg="teal.500" >{<UserStatusIcon userHandle={user.handle} iconSize={'10px'} />}</AvatarBadge>
                      </Avatar>
                      <span className="user-handle-span" style={{ margin: '10px', fontSize: '20px' }}>{user.handle}</span>
                    </ListItem>
                  ))}
              </List>
              <br />
              <Input
              id="team-channels-input"
                type="text"
                value={channelFromInput}
                onChange={updateChannelInputField}
                placeholder="Create a channel..."
                style={{ width: "275px" }}
              />
               <AddIcon onClick={() => addChannelToSelected()} style={{ padding: '3px', marginLeft: '10px', marginBottom:'px', color: 'rgb(38, 70, 9)', border: '2px solid rgb(38, 70, 9)', borderRadius: '5px', width: '36px', height: '36px', cursor:'pointer' }} />
              {/* <Button onClick={() => addChannelToSelected()}>+</Button> */}
              <br />
              {channels.length ? (channels.map((channel) =>
                <Tag
                  key={v4()}
                  style={{
                    cursor: "pointer",
                    backgroundColor: "darkgray",
                    color: "black",
                    margin: "2px",
                  }}
                >
                  {channel}{" "}
                  <CloseIcon
                    onClick={() => removeChannelFromSelected(channel)}
                    
                    style={{ width: "15px", marginLeft: "16px", color: "black", fontSize:'10px' }}
                  />
                </Tag>
              )
              ) : (' ')}
              <br />
              <Button id="create-team-button" onClick={() => handleCreateTeamClick(close)} style={{ position: 'absolute', bottom: '0', marginBottom: '35px', marginLeft: '80px' }}>CONNECT</Button>
            </div>
          </div>
        )
      }
    </Popup>
  );
};
export default CreateTeamPopUp;
