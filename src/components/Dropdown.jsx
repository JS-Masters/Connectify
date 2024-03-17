import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/auth.service";
import {
  Avatar,
  AvatarBadge,
  Box,
  HStack,
  List,
  ListItem,
  Text,
  useToast,
} from "@chakra-ui/react";
import UploadForm from "./UploadForm";
import {
  changeUserCurrentStatusInDb,
  changeUserLastStatusInDb,
  listenForStatusChange,
} from "../services/user.services";
import AppContext from "../providers/AppContext";
import { statuses } from "../common/constants";
import BlockedUsersPopUp from "../pages/BlockedUsersPopUp";
import UserStatusIcon from "./UserStatusIconChats";
import useOnclickOutside from "react-cool-onclickoutside";

const Dropdown = ({ username = null, avatarUrl = null }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { userData, setContext } = useContext(AppContext);
  const navigate = useNavigate();
  const toast = useToast();

  const ref = useOnclickOutside(() => setShowDropdown(false));

  const [userIsInMeeting, setUserIsInMeeting] = useState(false);

  const showToast = () => {
    toast({
      title: "Sign out",
      description: "You have been signed out.",
      duration: 5000,
      isClosable: true,
      status: "success",
      position: "top",
    });
  };

  useEffect(() => {
    if (userData) {
      const unsubscribe = listenForStatusChange((snapshot) => {
        const userStatus = snapshot.exists()
          ? snapshot.val().currentStatus
          : userData.currentStatus;
        userStatus === statuses.inMeeting
          ? setUserIsInMeeting(true)
          : setUserIsInMeeting(false);
      }, userData.handle);
      return () => unsubscribe();
    }
  }, []);

  const signOut = async () => {
    await logoutUser();
    await changeUserCurrentStatusInDb(userData.handle, statuses.offline);
    setContext({ user: null, userData: null });
    showToast();
    navigate("/");
  };

  const renderStatusMenu = () => {
    return (
      <>
        <ListItem
          cursor="pointer"
          m="10px"
          border="1px solid gray"
          borderRadius="10px"
          p="5px"
          onClick={() => {
            changeUserCurrentStatusInDb(userData.handle, statuses.online);
            changeUserLastStatusInDb(userData.handle, statuses.online);
            setContext((prevContext) => ({
              ...prevContext,
              userData: { ...userData, currentStatus: statuses.online },
            }));
            setShowDropdown(false);
          }}
        >
          <Box
            display="inline-block"
            w="12px"
            h="12px"
            borderRadius="50%"
            bg="green"
          />{" "}
          Online
        </ListItem>
        <ListItem
          cursor="pointer"
          m="10px"
          border="1px solid gray"
          borderRadius="10px"
          p="5px"
          onClick={() => {
            changeUserCurrentStatusInDb(userData.handle, statuses.doNotDisturb);
            changeUserLastStatusInDb(userData.handle, statuses.doNotDisturb);
            setContext((prevContext) => ({
              ...prevContext,
              userData: { ...userData, currentStatus: statuses.doNotDisturb },
            }));
            setShowDropdown(false);
          }}
        >
          <Box
            display="inline-block"
            w="12px"
            h="12px"
            borderRadius="50%"
            bg="red"
          />{" "}
          DND
        </ListItem>
      </>
    );
  };

  return (
    <HStack pos="relative" m="0 20px">
      <Text color="white" cursor='default'>
        {username}
      </Text>

      <Avatar
        cursor="pointer"
        onClick={() => setShowDropdown(!showDropdown)}
        name={username}
        src={avatarUrl}
      >
        <AvatarBadge w="1em" bg="teal.500">
          {<UserStatusIcon userHandle={username} iconSize={"12px"} />}
        </AvatarBadge>
      </Avatar>

      <List
        ref={ref}
        zIndex="5"
        color="white"
        fontSize="md"
        width="150px"
        pos="absolute"
        display={showDropdown ? "block" : "none"}
        flexDirection="column"
        alignItems="center"
        top="75px"
      >
        {!userIsInMeeting && renderStatusMenu()}
        <BlockedUsersPopUp />
        <UploadForm />
        <ListItem
          cursor="pointer"
          border="1px solid gray"
          borderRadius="10px"
          m="8px"
          fontSize="sm"
          p="5px"
          textAlign="center"
          onClick={() => {
            signOut();
            setShowDropdown(false);
          }}
        >
          Sign out
        </ListItem>
      </List>
    </HStack>
  );
};

Dropdown.propTypes = {
  username: PropTypes.string,
  avatarUrl: PropTypes.string,
};

export default Dropdown;
