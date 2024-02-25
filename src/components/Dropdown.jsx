import PropTypes from "prop-types";
import { useState } from "react";
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
} from "@chakra-ui/react";

const Dropdown = ({
  username = null,
  avatarUrl = null,
  setContext = () => {},
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const signOut = async () => {
    await logoutUser();
    setContext({ user: null, userData: null });
    navigate("/");
  };

  return (
    <Box pos="relative">
      <HStack>
        <Text style={{ cursor: "pointer" }} onClick={toggleMenu}>
          {username}
        </Text>
        <Avatar
          style={{ cursor: "pointer" }}
          onClick={toggleMenu}
          name={username}
          src={avatarUrl}
        >
          <AvatarBadge w="1.3em" bg="teal.500">
            <Text fontSize="xs" color="white">
              3
            </Text>
          </AvatarBadge>
        </Avatar>
      </HStack>
      {showMenu && (
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
          <ListItem cursor="pointer">Profile</ListItem>
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
  setContext: PropTypes.func.isRequired,
};

export default Dropdown;
