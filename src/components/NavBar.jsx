import { Box, Heading } from "@chakra-ui/react";
// import PropTypes from "prop-types";
import Dropdown from "./Dropdown";
import { useContext } from "react";
import AppContext from "../providers/AppContext";
import { NavLink } from "react-router-dom";

const NavBar = () => {
  const { userData, setContext } = useContext(AppContext);

  return (
    <>
      <Box>
        <Heading>C</Heading>
      </Box>
      <Box>
        {/* <Heading>Welcome to Connectify</Heading> */}
        <NavLink to="/chats">CHATS </NavLink>
        <NavLink to="/calls">CALLS </NavLink>
        <NavLink to="/teams">TEAMS</NavLink>
      </Box>
      {userData && (
        <Dropdown
          username={userData.handle}
          avatarUrl={userData.avatarUrl}
          setContext={setContext}
        />
      )}
    </>
  );
};

NavBar.propTypes = {};

export default NavBar;
