import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
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
import UploadForm from "../UploadForm/UploadForm";
import {
  changeUserCurrentStatusInDb,
  changeUserLastStatusInDb,
  listenForStatusChange,
} from "../../services/user.services";
import AppContext from "../../providers/AppContext";
import { statuses } from "../../common/constants";
import BlockedUsersPopUp from "../../pages/BlockedUsersPopUp/BlockedUsersPopUp";
import UserStatusIcon from "../UserStatusIconChats";
import useOnclickOutside from "react-cool-onclickoutside";
import "./Dropdown.css";

const Dropdown = () => {
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
          className="dropdown-item"
          cursor="pointer"
          m="10px"
          border="1px solid gray"
          borderRadius="5px"
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
            marginLeft="10px"
            borderRadius="50%"
            bg="green"
          />{" "}
          Online
        </ListItem>
        <ListItem
          className="dropdown-item"
          //  textAlign='center'

          cursor="pointer"
          m="10px"
          border="1px solid gray"
          borderRadius="5px"
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
            marginLeft="10px"
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
      <Text id="logged-user-handle" color="bisque" cursor="default">
        {userData.handle}
      </Text>

      <Avatar
        cursor="pointer"
        onClick={() => setShowDropdown(!showDropdown)}
        name={userData.handle}
        src={userData.avatarUrl}
      >
        <AvatarBadge bg="teal.500">
          {<UserStatusIcon userHandle={userData.handle} iconSize={"15px"} />}
        </AvatarBadge>
      </Avatar>

      <List
        ref={ref}
        id="dropdown-menu"
        zIndex="5"
        position="absolute"
        color="white"
        fontSize="md"
        width="150px"
        pos="absolute"
        display={showDropdown ? "block" : "none"}
        flexDirection="column"
        alignItems="center"
        top="75px"
        border="1px solid gray"
        borderRadius="10px"
        paddingLeft="0"
      >
        {!userIsInMeeting && renderStatusMenu()}
        <BlockedUsersPopUp />
        <UploadForm />
        <ListItem
          className="dropdown-item"
          cursor="pointer"
          border="1px solid gray"
          borderRadius="5px"
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

export default Dropdown;
