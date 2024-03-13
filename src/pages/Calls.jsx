import { Button, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { checkUsersIfBannedLoggedUser, getAllUsers, isLoggedUserBanned } from "../services/user.services";
import { addIncomingCallToDb, createCall, endCall } from "../services/call.services";
import { useContext } from "react";
import AppContext from "../providers/AppContext";
import { addUserToCall, createDyteCall, deleteDyteMeeting } from "../services/dyte.services";
import SingleCallRoom from "../components/SingleCallRoom";
import { v4 } from "uuid";


const Calls = () => {

  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);
  const [token, setToken] = useState('');
  const [userToCall, setUserToCall] = useState('');
  const [joinedCallDyteId, setJoinedCallDyteId] = useState('');

  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users)));
  }, []);


  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value.length) {
      const filteredUsers = users.filter((u) => u.toLowerCase().startsWith(event.target.value) && u !== userData.handle);
    checkUsersIfBannedLoggedUser(filteredUsers, userData.handle)
    .then(setUsersBySearchTerm)
    } else {
      setUsersBySearchTerm([]);
    };
  
  };

  const startCall = async (userToCallHandle) => {
    try {
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
    } catch (error) {
      console.log(error.message);
    };
  };

  const leaveCall = async () => {
    // delete the call from incomingCalls of the other user => this will trigger the useEffect, so that he won't see the attend/reject buttons any more
    try {
      await endCall(userToCall, joinedCallDyteId)
    } catch (error) {
      console.log(error.message);
    };
    setToken('');
    setUserToCall('');
    setJoinedCallDyteId('');
  };

  return (
    <>
      <Input value={searchTerm} onChange={handleInputChange} />
      {Boolean(usersBySearchTerm.length) && usersBySearchTerm.map((user) => <Button key={v4()} onClick={() => startCall(user)}>CALL {user}</Button>)}
      {token &&
        <div style={{ height: '50vh', width: 'auto' }} >
          <SingleCallRoom token={token} leaveCall={leaveCall} />
        </div>}
     
    </>
  );
};

export default Calls;