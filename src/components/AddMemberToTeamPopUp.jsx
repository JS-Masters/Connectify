import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { Avatar, AvatarBadge, Button, Heading, Input, List, Tag } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import Popup from "reactjs-popup";
import AppContext from "../providers/AppContext";
import { getAllUsers } from "../services/user.services";
import { v4 } from "uuid";
import UserStatusIcon from "./UserStatusIconChats";


const AddMemberToTeamPopUp = () => {

  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);

  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users).map(user => ({ ...users[user] }))));
  }, []);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value.length) {
      const filteredUsers = users.filter((u) => u.handle.toLowerCase().startsWith(event.target.value) && u.handle !== userData.handle);
      setUsersBySearchTerm(filteredUsers);
    } else {
      setUsersBySearchTerm([]);
    };
  };

  const handlePopUpClose = (close) => {
    close();
    setSearchTerm('');
    setUsersBySearchTerm([]);
  };

  const handleAddMemberClick = () => {

  };

  return (
    <Popup trigger=
      {<Button style={{ marginTop: '10px', width: '80%', height: '45px', backgroundColor: 'green' }}>ADD Member</Button>}
      modal nested>
      {
        close => (
          <div className='modal'>
            <Button style={{ float: "right", margin: "15px" }} onClick={() => handlePopUpClose(close)}>X</Button>
            <div style={{ width: '500px', height: '500px', border: '2px solid black', padding: "30px" }} className='content'>
              {/* <span className="formatted-selection">{formattedSelection()}</span> */}
              <Heading>Add new members to the Team</Heading>
              <Input value={searchTerm} onChange={handleInputChange} />
              <div className="selected-content" style={{ color: "black" }}>

                {Boolean(usersBySearchTerm.length) && usersBySearchTerm.map((user) =>
                  <div key={v4()} style={{ marginBottom: '25px' }}>
                    <Avatar size='sm' src={user.avatarUrl}>
                      <AvatarBadge w="1em" bg="teal.500">{<UserStatusIcon userHandle={user.handle} iconSize={'5px'} />}</AvatarBadge>
                    </Avatar>
                    <Heading display='inline' as='h3' size='sm'>{user.handle}</Heading>
                    <Button style={{ float: 'right', color: 'blue' }} onClick={handleAddMemberClick}>ADD Member</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    </Popup>
  )
};

export default AddMemberToTeamPopUp;