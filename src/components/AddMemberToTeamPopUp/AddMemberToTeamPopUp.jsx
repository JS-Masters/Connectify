import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Heading,
  Input,
  List,
  ListItem,
  Tag,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import Popup from "reactjs-popup";
import AppContext from "../../providers/AppContext";
import { getAllUsers } from "../../services/user.services";
import { v4 } from "uuid";
import UserStatusIcon from "../UserStatusIconChats";
import { addNewMemberToTeam, getTeamNameByTeamId } from "../../services/team.services";
import { useParams } from "react-router-dom";
import { sendNotification } from "../../services/chat.services";
import "./AddMemberToTeamPopUp.css";

const AddMemberToTeamPopUp = () => {
  const { userData } = useContext(AppContext);
  const { teamId } = useParams();
  const [users, setUsers] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    getAllUsers().then((users) =>
      setUsers(Object.keys(users).map((user) => ({ ...users[user] })))
    );
  }, []);

  useEffect(() => {
    if (teamId) {
      getTeamNameByTeamId(teamId)
        .then((team) => setTeamName(team.teamName));
    }
  }, [teamId])

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value.length) {
      const filteredUsers = users.filter(
        (u) =>
          u.handle.toLowerCase().startsWith(event.target.value) &&
          u.handle !== userData.handle
      );
      setUsersBySearchTerm(filteredUsers);
    } else {
      setUsersBySearchTerm([]);
    }
  };

  const handlePopUpClose = (close) => {
    close();
    setSearchTerm("");
    setUsersBySearchTerm([]);
  };

  const handleAddMemberClick = (newMemberHandle, close) => {
    addNewMemberToTeam(teamId, newMemberHandle)
      .then(() => handlePopUpClose(close))
      .then(() =>
        sendNotification(
          newMemberHandle,
          "New team!",
          "You have been added to a new team.",
          teamId,
          "teams"
        )
      );
  };

  const isUserAlreadyInTheTeam = (userHandleToCheck) => {
    const userToCheck = users
      .filter((u) => u.handle === userHandleToCheck)
      .find(Boolean);
    if (
      "teams" in userToCheck &&
      Object.keys(userToCheck.teams).includes(teamId)
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
      {users && (
        <Popup
          trigger={
            <Button id="team-add-member-button" mr="10px" float='right' size="xs">
              ADD Member
            </Button>
          }
          modal
          nested
          closeOnDocumentClick={false}
          closeOnEscape={false}
        >
          {(close) => (
            <div className="modal"
              style={{ width: '500px', height: '500px', backgroundImage: "url('/pop-up-background2.jpg')" }}
            >
              <Button
                id="close-add-member-popup"
                size='sm' style={{ float: "right", margin: "10px", backgroundColor: 'transparent' }}
                onClick={() => handlePopUpClose(close)}
              >
                X
              </Button>
              <div
                style={{ padding: "0 35px" }}
                className="content"
              >
                <Box id="add-member-title">
                  <Heading id="add-member-heading">{teamName}</Heading>
                  <Heading id="add-member-subheading">add new members</Heading>
                </Box>
                <Input
                  id="add-members-search"
                  value={searchTerm}
                  onChange={handleInputChange} />
                <div className="selected-content" style={{ color: "black" }}>
                  <List
                    id="add-member-form"
                    overflow="hidden"
                    overflowY="auto"
                    style={{ border: '2px solid black', borderRadius: '10px', height: '275px', padding: '2px', marginTop: '20px' }}>
                    {Boolean(usersBySearchTerm.length) &&
                      usersBySearchTerm.map((user) => (
                        <ListItem

                          // className="create-form-user"
                          key={v4()}
                          style={{ cursor: "default", border: '1px solid transparent', borderRadius: '5px', padding: '2px', margin: '7px', marginTop: '14px' }}
                        >
                          <Avatar size="sm" src={user.avatarUrl}>
                            <AvatarBadge bg="teal.500">
                              {
                                <UserStatusIcon
                                  userHandle={user.handle}
                                  iconSize={"10px"}
                                />
                              }
                            </AvatarBadge>
                          </Avatar>
                          <span className="user-handle-span" style={{ margin: '10px', fontSize: '20px' }}>{user.handle}</span>
                          {/* <Box textAlign='right'> */}
                          {isUserAlreadyInTheTeam(user.handle) ? (
                            <h3
                            id="team-member-text"
                              style={{
                                display: "inline",
                                float: "right"
                              }}
                            >
                              Member
                            </h3>
                          ) : (
                            <Button
                              id="popup-add-member-button"
                              float='right'
                              mr='10px'
                              onClick={() =>
                                handleAddMemberClick(user.handle, close)
                              }
                            >
                              ADD
                            </Button>
                          )}
                          {/* </Box>                          */}
                        </ListItem>
                      ))}
                  </List>
                </div>
              </div>
            </div>
          )}
        </Popup>
      )}
    </>
  );
};

export default AddMemberToTeamPopUp;
