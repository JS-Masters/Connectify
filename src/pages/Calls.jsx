import { Button, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getAllUsers } from "../services/user.services";
import { addIncomingCallToDb, createCall } from "../services/call.services";
import { useContext } from "react";
import AppContext from "../providers/AppContext";
import { addUserToCall, createDyteCall } from "../services/dyte.services";
import SingleCallRoom from "../components/SingleCallRoom";
import { v4 } from "uuid";


const Calls = () => {

  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users)));
  }, []);


  const handleInputChange = (event) => {
    if (event.target.value.length) {
      const filteredUsers = users.filter((u) => u.toLowerCase().includes(event.target.value)); // startsWith(event.target.value) ???
      setUsersBySearchTerm(filteredUsers);
    } else {
      setUsersBySearchTerm([]);
    };
    setSearchTerm(event.target.value);
  };

  const startCall = async (userToCallHandle) => {
    await createCall(userData.handle, userToCallHandle)
      .then((newCallId) => createDyteCall(newCallId))
      .then((roomID) => addIncomingCallToDb(userToCallHandle, userData.handle, roomID))
      .then((roomID) => addUserToCall((data) => setToken(data), userData, roomID))
      .then(() => {
        setSearchTerm('');
        setUsersBySearchTerm([]);
      });
  };

  return (
    <>
      <Input value={searchTerm} onChange={handleInputChange} />
      {Boolean(usersBySearchTerm.length) && usersBySearchTerm.map((user) => <Button key={v4()} onClick={() => startCall(user)}>CALL {user}</Button>)}
      {token &&
        <div style={{ height: '50vh', width: 'auto' }} >
          <SingleCallRoom token={token} setToken={setToken} />
        </div>}
    </>
  );
};

export default Calls;