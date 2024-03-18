import { Button, Input, List, Tag, useToast } from "@chakra-ui/react"
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
    getAllUsers().then((users) => setUsers(Object.keys(users)));
  }, []);

  useEffect(() => {
    if (users.length) {
      const usersFiltered = users.filter(
        (u) =>
          u.toLowerCase().includes(searchField.toLowerCase()) &&
          u !== userData.handle
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
    if (teamName.length < 3 || teamName.length > 40) {
      showToast('Team name should be between 3 and 40 characters', 'info');
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

      await Promise.all(selectedUsers.map(async(user) => {
        await sendNotification(user,'New team!', 'You have been added to a new team.', newTeamId, 'teams');
      }))
      
      handlePopUpClose(close);
      navigate(`/teams/${newTeamId}`);
    } catch (error) {
      showToast('Error occured while creating a post', 'error');
    }
  };

  return (
    <Popup trigger=
      {<Button id="new-team-button" style={{ width: '150px', height: '74px', border:'1px solid green', backgroundColor: 'transparent', color:'green', marginTop:'40px', marginRight:'30px' }}>New Team</Button>}
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
                {foundUsers.length &&
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
              <Input
                type="text"
                value={teamName}
                onChange={updateTeamNameInputField}
                placeholder="Team name..."
              />
              <br />
              <Input
                type="text"
                value={channelFromInput}
                onChange={updateChannelInputField}
                placeholder="Create a channel..."
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
              ) : (' ')}
              <br />
              <Button onClick={() => handleCreateTeamClick(close)}>Create Team</Button>
            </div>
          </div>
        )
      }
    </Popup>
  );
};
export default CreateTeamPopUp;
