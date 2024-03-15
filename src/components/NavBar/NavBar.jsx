import { Avatar, AvatarBadge, Box, Heading, Image, useDisclosure } from "@chakra-ui/react";
// import PropTypes from "prop-types";
import Dropdown from "../Dropdown";
import { useContext, useState, useEffect } from "react";
import AppContext from "../../providers/AppContext";
import { NavLink, Outlet } from "react-router-dom";
import NotificationList from "../NotificationList";
import "./NavBar.css";
import NotificationsModal from "../NotificationsModal";

const NavBar = () => {
  const { userData } = useContext(AppContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>

      <div id="nav-buttons-div">
        <Image id="logo-img" src="../../public/LOGO.png"></Image>
        <NavLink to="/chats"><img src="../../public/chats.png"></img></NavLink>
        <NavLink to="/calls"><img src="../../public/calls.png"></img></NavLink>
        <NavLink to="/teams"><img src="../../public/teams.png"></img></NavLink>
        <NavLink to="/calendar"><img src="../../public/calendar.png"></img></NavLink>
        
        <Avatar onClick={onOpen} src="../../public/bell.png" >
          <AvatarBadge>

          </AvatarBadge>
        </Avatar>
        {/* <NotificationsModal onOpen={onOpen}/> */}

        {userData && (
          <Dropdown username={userData.handle} avatarUrl={userData.avatarUrl} />
        )}

      </div>

      <NotificationList isOpen={isOpen} onClose={onClose} />

      {/* <Outlet /> */}
    </>
  );
};

NavBar.propTypes = {};

export default NavBar;
