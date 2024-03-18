import { Avatar, AvatarBadge, Box, Button, Heading, Input, Text, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { changeUserCurrentStatusInDb, checkUsersIfBannedLoggedUser, getAllUsers, getUserLastStatusByHandle, getUserStatusByHandle } from "../services/user.services";
import { addIncomingCallToDb, createCall, endCall } from "../services/call.services";
import { useContext } from "react";
import AppContext from "../providers/AppContext";
import { addUserToCall, createDyteCall } from "../services/dyte.services";
import SingleCallRoom from "../components/SingleCallRoom";
import { v4 } from "uuid";
import UserStatusIcon from "../components/UserStatusIconChats";
import { statuses } from "../common/constants";

const Calls = () => {

  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);
  const [token, setToken] = useState('');
  const [userToCall, setUserToCall] = useState('');
  const [joinedCallDyteId, setJoinedCallDyteId] = useState('');
  const toast = useToast();

  const showToast = (title, desc, status) => {
    toast({
      title: title,
      description: desc,
      duration: 3000,
      isClosable: true,
      status: status,
      position: "top"
    });
  };

  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users).map(user => ({ ...users[user] }))));
  }, []);


  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value.length) {
      const filteredUsers = users.filter((u) => u.handle.toLowerCase().startsWith(event.target.value) && u.handle !== userData.handle);
      checkUsersIfBannedLoggedUser(filteredUsers, userData.handle)
        .then(setUsersBySearchTerm)
    } else {
      setUsersBySearchTerm([]);
    };
  };

  const startCall = async (userToCallHandle) => {
    try {
      const userToCallCurrentStatus = await getUserStatusByHandle(userToCallHandle);

      if (userToCallCurrentStatus === statuses.offline) {
        showToast('User is Offline!', `${userToCallHandle} is currently offline. Please try again later`, "info");
      } else if (userToCallCurrentStatus === statuses.inMeeting) {
        showToast('User is Busy!', `${userToCallHandle} is currently In a meeting. Please try again later`, "info");
      } else {
        await createCall(userData.handle, userToCallHandle)
          .then((newCallId) => createDyteCall(newCallId))
          .then((roomID) => addIncomingCallToDb(userToCallHandle, userData.handle, roomID))
          .then((roomID) => addUserToCall((data) => setToken(data), userData, roomID))
          .then((roomID) => {
            setSearchTerm('');
            setUsersBySearchTerm([]);
            setUserToCall(userToCallHandle);
            setJoinedCallDyteId(roomID);
          });
      }
    } catch (error) {
      console.log(error.message);
    };
  };

  const leaveCall = () => {

    endCall(userToCall, joinedCallDyteId)
      .then(() => getUserLastStatusByHandle(userData.handle))
      .then((previousStatus) => {
        changeUserCurrentStatusInDb(userData.handle, previousStatus)
      })
      .then(() => {
        setToken('');
        setUserToCall('');
        setJoinedCallDyteId('');
      })
      .catch((error) => console.log(error.message))
  };

  return (
    <>
      <Input value={searchTerm} onChange={handleInputChange} />
      <Box border='1px solid gray' size='md' key={v4()} >
        {Boolean(usersBySearchTerm.length) && usersBySearchTerm.map((user) =>
          <div key={v4()} style={{ marginBottom: '25px' }}>
            <Avatar size='sm' src={user.avatarUrl}>
              <AvatarBadge  bg="teal.500">{<UserStatusIcon userHandle={user.handle} iconSize={'5px'} />}</AvatarBadge>
            </Avatar>
            <Heading display='inline' as='h3' size='sm'>{user.handle}</Heading>
            <Button style={{ float: 'right', color: 'blue' }} onClick={() => startCall(user.handle)}>CALL {user.handle}</Button>
          </div>
        )}
      </Box>
      {token && <div style={{ height: '50vh', width: 'auto' }}><SingleCallRoom token={token} leaveCall={leaveCall} /></div>}
    </>
  );
};

export default Calls;