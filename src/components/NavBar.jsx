import { Box, Flex, Heading } from "@chakra-ui/react";
import PropTypes from "prop-types";
import Dropdown from "./Dropdown";
import { useContext } from "react";
import AppContext from "../providers/AppContext";
import { NavLink } from "react-router-dom";

const NavBar = () => {
  const { userData, setContext } = useContext(AppContext);

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-around"
      wrap="wrap"
      padding="1.5rem"
      bg="brand.500"
      color="white"
    >
      <Box>
        <Heading>C</Heading>
      </Box>
      <Box>
        {/* <Heading>Welcome to Connectify</Heading> */}
        <NavLink to="/chats">CHATS </NavLink>
        <NavLink to="/calls">CALLS</NavLink>
      </Box>
      {userData && (
        <Dropdown
          username={userData.handle}
          avatarUrl={userData.avatarUrl}
          setContext={setContext}
        />
      )}
    </Flex>
  );
};

NavBar.propTypes = {};

export default NavBar;
