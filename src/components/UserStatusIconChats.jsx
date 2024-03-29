import PropTypes from "prop-types";
import { Box } from "@chakra-ui/react";
import { statuses } from "../common/constants";
import { useEffect, useState } from "react";
import { getUserStatusByHandle } from "../services/user.services";

const UserStatusIcon = ({
  userHandle,
  iconSize,
  toggleStatusMenu = () => {},
}) => {
  const [userStatus, setUserStatus] = useState("");

  useEffect(() => {
    getUserStatusByHandle(userHandle).then(setUserStatus);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userStatus && userHandle) {
        getUserStatusByHandle(userHandle).then((memberStatus) => {
          if (memberStatus !== userStatus) {
            setUserStatus(memberStatus);
          }
        });
      }
    }, 800);
    return () => clearInterval(interval);
  }, [userStatus]);

  return (
    <>
      {userStatus === statuses.online && (
        <Box
          onClick={toggleStatusMenu}
          w={iconSize}
          h={iconSize}
          borderRadius="50%"
          bg="green"
        />
      )}
      {userStatus === statuses.inMeeting && (
        <Box
          onClick={toggleStatusMenu}
          w={iconSize}
          h={iconSize}
          borderRadius="50%"
          bg="orange"
        />
      )}
      {userStatus === statuses.doNotDisturb && (
        <Box
          onClick={toggleStatusMenu}
          w={iconSize}
          h={iconSize}
          borderRadius="50%"
          bg="red"
        />
      )}
      {userStatus === statuses.offline && (
        <Box
          onClick={toggleStatusMenu}
          w={iconSize}
          h={iconSize}
          borderRadius="50%"
          bg="gray"
        />
      )}
    </>
  );
};

UserStatusIcon.propTypes = {
  userHandle: PropTypes.string.isRequired,
  iconSize: PropTypes.string.isRequired,
  toggleStatusMenu: PropTypes.func,
};

export default UserStatusIcon;
