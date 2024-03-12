import PropTypes from "prop-types";
import { useContext, useState } from "react";
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
} from "../services/user.services";
import AppContext from "../providers/AppContext";
import { statuses } from "../common/constants";

const Dropdown = ({ username = null, avatarUrl = null }) => {
  
  const [showMenu, setShowMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { userData, setContext } = useContext(AppContext);
  const navigate = useNavigate();
  const toast = useToast();

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

  const toggleMenu = () => {
    setShowStatusMenu(false);
    setShowMenu(!showMenu);
  };
  const toggleStatusMenu = () => {
    setShowMenu(false);
    setShowStatusMenu(!showStatusMenu);
  };

  const signOut = async () => {
    await logoutUser();
    changeUserCurrentStatusInDb(userData.handle, statuses.offline);
    setContext({ user: null, userData: null });
    showToast();
    navigate("/");
  };

  const renderStatusMenu = () => {
    return (
      <List
        position="absolute"
        color="purple.400"
        p="5px 0"
        fontSize="large"
        width="120px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        top="70px"
      >
        <ListItem
          cursor="pointer"
          onClick={() => {
            changeUserCurrentStatusInDb(userData.handle, statuses.online);
            changeUserLastStatusInDb(userData.handle, statuses.online);
            setContext((prevContext) => ({
              ...prevContext,
              userData: { ...userData, currentStatus: statuses.online },
            }));
            setShowStatusMenu(false);
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
          onClick={() => {
            changeUserCurrentStatusInDb(userData.handle, statuses.doNotDisturb);
            changeUserLastStatusInDb(userData.handle, statuses.doNotDisturb);
            setContext((prevContext) => ({
              ...prevContext,
              userData: { ...userData, currentStatus: statuses.doNotDisturb },
            }));
            setShowStatusMenu(false);
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
      </List>
    );
  };


  return (
    <Box pos="relative">
      <HStack>
        <Text style={{ cursor: "pointer" }} onClick={toggleMenu}>
          {username}
        </Text>
        <Avatar style={{ cursor: "pointer" }} name={username} src={avatarUrl}>
          <AvatarBadge w="1em" bg="teal.500">
            {userData.currentStatus === statuses.online &&
              <Box
                onClick={toggleStatusMenu}
                w='12px'
                h='12px'
                borderRadius="50%"
                bg="green"
              />}
            {userData.currentStatus === statuses.inMeeting &&
              <Box
                onClick={toggleStatusMenu}
                w='12px'
                h='12px'
                borderRadius="50%"
                bg="orange"
              />}
            {userData.currentStatus === statuses.doNotDisturb &&
              <Box
                onClick={toggleStatusMenu}
                w='12px'
                h='12px'
                borderRadius="50%"
                bg="red"
              />}
            {userData.currentStatus === statuses.offline &&
              <Box
                onClick={toggleStatusMenu}
                w='12px'
                h='12px'
                borderRadius="50%"
                border="3px solid gray"
              />}
          </AvatarBadge>
        </Avatar>
      </HStack>
      {showStatusMenu && renderStatusMenu()}
      {showMenu && (
        <List
          position="absolute"
          zIndex='5'
          color="purple.400"
          p="5px 0"
          fontSize="large"
          width="120px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          top="70px"
        >
          <ListItem cursor="pointer">Profile</ListItem>
          <UploadForm />
          <ListItem cursor="pointer" onClick={signOut}>
            Sign out
          </ListItem>
        </List>
      )}
    </Box>
  );
};

Dropdown.propTypes = {
  username: PropTypes.string,
  avatarUrl: PropTypes.string,
};

export default Dropdown;
