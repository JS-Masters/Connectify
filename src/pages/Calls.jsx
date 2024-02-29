import { Button, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getAllUsers } from "../services/user.services";

const Calls = () => {

  const [users, setUsers] = useState([]);
  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);


  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users)));
  }, []);

  const handleInputChange = (event) => {
    const filteredUsers = users.filter((u) => u.toLowerCase().includes(event.target.value));
    setUsersBySearchTerm(filteredUsers);
  };


  const startCall = () => {


  };

  return (
    <>
      <Input onChange={handleInputChange} />
      {usersBySearchTerm && usersBySearchTerm.map((user) => <Button onClick={startCall}>CALL {user}</Button>)}
    </>
  );

};

export default Calls;