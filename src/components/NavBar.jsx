import { Box, Heading } from "@chakra-ui/react";
// import PropTypes from "prop-types";
import Dropdown from "./Dropdown";
import { useContext, useState, useEffect } from "react";
import AppContext from "../providers/AppContext";
import { NavLink } from "react-router-dom";
import NotificationList from "./NotificationList";

const NavBar = () => {
  const { userData } = useContext(AppContext);

  return (
    <>
      <Box>
        <Heading>C</Heading>
      </Box>
      <Box>
        {/* <Heading>Welcome to Connectify</Heading> */}
        <NavLink to="/chats">CHATS </NavLink>
        <NavLink to="/calls">CALLS </NavLink>
        <NavLink to="/teams">TEAMS </NavLink>
        <NavLink to="/calendar">CALENDAR </NavLink>
        <NotificationList />
      </Box>
      {userData && (
        <Dropdown username={userData.handle} avatarUrl={userData.avatarUrl} />
      )}
    </>
  );
};

NavBar.propTypes = {};

export default NavBar;
