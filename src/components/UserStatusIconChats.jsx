import { Box } from "@chakra-ui/react";
import { statuses } from "../common/constants";
import { useEffect, useState } from 'react';
import { getUserStatusByHandle } from '../services/user.services';

const UserStatusIconChats = ({ userHandle, iconSize, toggleStatusMenu = () => {} }) => {

  const [userStatus, setUserStatus] = useState('');

  useEffect(() => {
    getUserStatusByHandle(userHandle)
      .then(setUserStatus)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('interval');
      if (userStatus && userHandle) {
        getUserStatusByHandle(userHandle)
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
          onClick={toggleStatusMenu}
          w={iconSize}
          h={iconSize}
          borderRadius="50%"
          bg="green"
        />}
      {userStatus === statuses.inMeeting &&
        <Box
          onClick={toggleStatusMenu}
          w={iconSize}
          h={iconSize}
          borderRadius="50%"
          bg="orange"
        />}
      {userStatus === statuses.doNotDisturb &&
        <Box
          onClick={toggleStatusMenu}
          w={iconSize}
          h={iconSize}
          borderRadius="50%"
          bg="red"
        />}
      {userStatus === statuses.offline &&
        <Box
          onClick={toggleStatusMenu}
          w={iconSize}
          h={iconSize}
          borderRadius="50%"
          border="3px solid gray"
        />}
    </>
  )
};

export default UserStatusIconChats;