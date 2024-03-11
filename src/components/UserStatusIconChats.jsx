import { Box } from "@chakra-ui/react";
import { statuses } from "../common/constants";
import { useEffect, useState } from 'react';
import { getUserStatusByHandle } from '../services/user.services';

const UserStatusIconChats = ({ memberHandle }) => {

  const [userStatus, setUserStatus] = useState('');

useEffect(() => {
  getUserStatusByHandle(memberHandle)
  .then(setUserStatus)
},[])

  useEffect(() => {
    const interval = setInterval(() => {
      if (userStatus && memberHandle) {
        getUserStatusByHandle(memberHandle)
          .then((memberStatus) => {
            if (memberStatus !== userStatus) {
              setUserStatus(memberStatus);
            }
          })
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userStatus]);

  return (
    <>
      {userStatus === statuses.online &&
        <Box
          w='5px'
          h='5px'
          borderRadius="50%"
          bg="green"
        />}
      {userStatus === statuses.inMeeting && 
        <Box
        w='5px'
        h='5px'
        borderRadius="50%"
        bg="orange"
        />}
      {userStatus === statuses.doNotDisturb && 
        <Box
        w='5px'
        h='5px'
        borderRadius="50%"
        bg="red"
        />}
      {userStatus === statuses.offline &&
        <Box
          w='5px'
          h='5px'
          borderRadius="50%"
          border="3px solid gray"
        />}
    </>
  )
};

export default UserStatusIconChats;