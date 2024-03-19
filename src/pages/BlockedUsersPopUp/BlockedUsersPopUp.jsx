import { useContext, useEffect, useState } from "react";
import AppContext from "../../providers/AppContext";
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Input,
  List,
  ListItem,
} from "@chakra-ui/react";
import {
  blockUser,
  getAllUsers,
  getBlockedUsers,
  getUsersObjectsByHandles,
  unblockUser,
} from "../../services/user.services";
import Popup from "reactjs-popup";
import { v4 } from "uuid";
import "./BlockedUsersPopUp.css";
import UserStatusIcon from "../../components/UserStatusIconChats";

const BlockedUsersPopUp = () => {
  const { userData } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);
  const [banUnbanClick, setBanUnbanClick] = useState(false);
  const [blockedUsersObjects, setBlockedUsersObjects] = useState(null);

  useEffect(() => {
    if (userData) {
      getBlockedUsers(userData.handle)
        .then((blockedUsersHandles) => {
          setBlockedUsers(blockedUsersHandles);
          return blockedUsersHandles;
        })
        .then((blockedUsersHandles) =>
          getUsersObjectsByHandles(blockedUsersHandles)
        )
        .then(setBlockedUsersObjects)
        .catch((error) => console.log(error.message));
    }
  }, [banUnbanClick]);

  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users)));
  }, []);

  const handleInputChange = (event) => {
    if (event.target.value.length) {
      const filteredUsers = users.filter(
        (u) =>
          u.toLowerCase().startsWith(event.target.value) &&
          !blockedUsers.includes(u)
      );
      getUsersObjectsByHandles(filteredUsers).then(setUsersBySearchTerm);
    } else {
      setUsersBySearchTerm([]);
    }
    setSearchTerm(event.target.value);
  };

  const handlePopUpClose = (close) => {
    close();
    setUsersBySearchTerm([]);
    setSearchTerm("");
  };

  const handleBanUserClick = (userToBan) => {
    blockUser(userData.handle, userToBan).then(() => {
      setSearchTerm("");
      setUsersBySearchTerm([]);
      setBanUnbanClick(!banUnbanClick);
    });
  };

  const handleUnbanUserClick = (userToUnban) => {
    unblockUser(userData.handle, userToUnban).then(() =>
      setBanUnbanClick(!banUnbanClick)
    );
  };

  return (
    <>
      {blockedUsersObjects && (
        <Popup
          trigger={
            <ListItem
              className="dropdown-item"
              cursor="pointer"
              border="1px solid gray"
              borderRadius="5px"
              p="5px"
              fontSize="sm"
              m="8px"
              textAlign="center"
            >
              Blocked Users
            </ListItem>
          }
          modal
          nested
          closeOnDocumentClick={false}
          closeOnEscape={false}
        >
          {(close) => (
            <div
              className="modal"
              style={{
                width: "500px",
                height: "500px",
                backgroundImage: "url('/pop-up-background2.jpg')",
              }}
            >
              <Button
                id="close-blocked-users-button"
                size="sm"
                style={{
                  float: "right",
                  margin: "10px",
                  backgroundColor: "transparent",
                }}
                onClick={() => handlePopUpClose(close)}
              >
                X
              </Button>
              <div style={{ padding: "0 35px" }} className="content">
                <Input
                  id="search-blocked-users"
                  value={searchTerm}
                  onChange={handleInputChange}
                />
                <List
                  className="blocked-users-list"
                  overflow="hidden"
                  overflowY="auto"
                  style={{
                    border: "2px solid black",
                    borderRadius: "10px",
                    height: "180px",
                    padding: "2px",
                    marginTop: "20px",
                  }}
                >
                  {Boolean(usersBySearchTerm.length) &&
                    usersBySearchTerm.map((user) => (
                      <ListItem
                        className="single-blocked-user"
                        key={v4()}
                        style={{
                          cursor: "default",
                          border: "1px solid transparent",
                          borderRadius: "5px",
                          padding: "2px",
                          margin: "4px",
                        }}
                      >
                        <Avatar size="sm" src={user.avatarUrl}>
                          <AvatarBadge bg="teal.500">
                            {
                              <UserStatusIcon
                                userHandle={user.handle}
                                iconSize={"8px"}
                              />
                            }
                          </AvatarBadge>
                        </Avatar>
                        <span
                          className="user-handle-span"
                          style={{ margin: "10px", fontSize: "20px" }}
                        >
                          {user.handle}
                        </span>
                        <Button
                          id="block-button"
                          size="sm"
                          style={{
                            float: "right",
                            color: "#B00B1D",
                            background: "transparent",
                            border: "1px solid #B00B1D",
                            marginRight: "10px",
                          }}
                          onClick={() => handleBanUserClick(user.handle)}
                        >
                          BLOCK
                        </Button>
                      </ListItem>
                    ))}
                </List>
                <List
                  className="blocked-users-list"
                  h="180px"
                  p="0"
                  overflow="hidden"
                  overflowY="auto"
                >
                  {Boolean(blockedUsersObjects.length) ? (
                    blockedUsersObjects.map((user) => (
                      <ListItem
                        className="single-blocked-user"
                        key={v4()}
                        style={{
                          cursor: "pointer",
                          border: "1px solid transparent",
                          borderRadius: "5px",
                          padding: "2px",
                          margin: "4px",
                        }}
                      >
                        <Avatar size="md" src={user.avatarUrl}>
                          <AvatarBadge bg="teal.500">
                            {
                              <UserStatusIcon
                                userHandle={user.handle}
                                iconSize={"10px"}
                              />
                            }
                          </AvatarBadge>
                        </Avatar>
                        <span
                          className="user-handle-span"
                          style={{ margin: "10px", fontSize: "20px" }}
                        >
                          {user.handle}
                        </span>
                        <Button
                          id="unblock-button"
                          style={{ float: "right", color: "blue" }}
                          onClick={() => handleUnbanUserClick(user.handle)}
                        >
                          UNBLOCK
                        </Button>
                      </ListItem>
                    ))
                  ) : (
                    <Box
                      textAlign="center"
                      marginTop="10px"
                      color="rgb(0, 128, 0)"
                      fontWeight="bold"
                    >
                      <h1>You don&apos;t have blocked users</h1>
                    </Box>
                  )}
                </List>
              </div>
            </div>
          )}
        </Popup>
      )}
    </>
  );
};

export default BlockedUsersPopUp;
