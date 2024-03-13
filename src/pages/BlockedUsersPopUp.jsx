import { useContext, useEffect, useState } from "react";
import AppContext from "../providers/AppContext";
import { Button, Input, ListItem, Text } from "@chakra-ui/react";
import { banUser, getAllUsers, getBannedUsers, unbanUser } from "../services/user.services";
import Popup from "reactjs-popup";
import { v4 } from "uuid";

const BlockedUsersPopUp = () => {

  const { userData } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [bannedUsers, setBannedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);
  const [banUnbanClick, setBanUnbanClick] = useState(false);

  useEffect(() => {
    if (userData) {
      getBannedUsers(userData.handle)
        .then(setBannedUsers)
    }
  }, [banUnbanClick]);


  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users)));
  }, []);


  const handleInputChange = (event) => {
    if (event.target.value.length) {
      const filteredUsers = users.filter((u) => u.toLowerCase().startsWith(event.target.value) && !bannedUsers.includes(u));
      setUsersBySearchTerm(filteredUsers);
    } else {
      setUsersBySearchTerm([]);
    };
    setSearchTerm(event.target.value);
  };


  const handlePopUpClose = (close) => {
    close();
    setUsersBySearchTerm([]);
  };


  const handleBanUserClick = (userToBan) => {
    banUser(userData.handle, userToBan)
      .then(() => {
        setSearchTerm('');
        setUsersBySearchTerm([]);
        setBanUnbanClick(!banUnbanClick);
      });
  };

  const handleUnbanUserClick = (userToUnban) => {
    unbanUser(userData.handle, userToUnban)
      .then(() => setBanUnbanClick(!banUnbanClick));
  };

  return (
    <>
      <Popup trigger=
        {<ListItem cursor="pointer">Blocked Users</ListItem>}
        modal nested>
        {
          close => (
            <div className='modal'>
              <Button style={{ float: "right", margin: "15px" }} onClick=
                {() => handlePopUpClose(close)}>X</Button>
              <div style={{ width: '500px', height: '500px', border: '2px solid black', padding: "30px" }} className='content'>
                <Input value={searchTerm} onChange={handleInputChange} />
                {Boolean(bannedUsers.length) ? bannedUsers.map((user) => <Text key={v4()}>{user}<Button style={{ float: 'right', color: 'blue' }} onClick={() => handleUnbanUserClick(user)}>UNBLOCK</Button></Text>)
                : <h1>You don't have blocked users</h1>}
                {Boolean(usersBySearchTerm.length) && usersBySearchTerm.map((user) =>  <Text key={v4()}>{user}<Button style={{ float: 'right', color: 'red' }} onClick={() => handleBanUserClick(user)}>BLOCK</Button></Text>)}
              </div>
            </div>
          )
        }
      </Popup>
    </>
  )
};

export default BlockedUsersPopUp;