import { Button, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getAllUsers } from "../services/user.services";
import { addCallToUserThatRecieve, createCall, getIncomingCalls } from "../services/call.services";
import { useContext } from "react";
import AppContext from "../providers/AppContext";
import { addUserToCall, createDyteCall } from "../services/dyte.services";
import SingleCallRoom from "../components/SingleCallRoom";


const Calls = () => {

  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);
  const [token, setToken] = useState('');

  const [incomingCall, setIncomingCall] = useState([]);
  const [incomingToken, setIncomingToken] = useState('');

  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users)));
  }, []);

  useEffect(() => {
    const unsubscribe = getIncomingCalls((snapshot) => {
      if (snapshot.exists()) {
        const incomingCall = snapshot.val();
        const dyteRoomId = Object.keys(incomingCall)[0];
        const caller = incomingCall[dyteRoomId].caller;

        setIncomingCall([dyteRoomId, caller]);
      };

    }, userData.handle);

    return () => unsubscribe();
  }, []);




  const handleInputChange = (event) => {
    const filteredUsers = users.filter((u) => u.toLowerCase().includes(event.target.value));
    setUsersBySearchTerm(filteredUsers);
  };


  const startCall = async (userToCall) => {
    await createCall(userData.handle, userToCall)
      .then((newCallId) => createDyteCall(newCallId)) // roomID ???
      .then((roomID) => addCallToUserThatRecieve(userToCall, userData.handle, roomID))
      .then((roomID) => addUserToCall((data) => setToken(data), userData, roomID))

  };

  return (
    <>
      <Input onChange={handleInputChange} />
      {usersBySearchTerm && usersBySearchTerm.map((user) => <Button onClick={() => startCall(user)}>CALL {user}</Button>)}
      {token &&
        <div style={{ height: '50vh', width: 'auto' }} >
          <SingleCallRoom token={token} />
        </div>}
      {incomingCall.length && <Button onClick={() => addUserToCall((data) => setIncomingToken(data), userData, incomingCall[0])}>{incomingCall[1]} is Calling</Button>}
      {incomingToken &&
        <div style={{ height: '50vh', width: 'auto' }} >
          <SingleCallRoom token={incomingToken} callId={incomingCall[0]}/>
        </div >}
    </>
  );

};

export default Calls;