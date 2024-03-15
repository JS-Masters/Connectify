import { Avatar, AvatarBadge, Box, Heading, Image, useDisclosure, Text } from "@chakra-ui/react";
// import PropTypes from "prop-types";
import Dropdown from "../Dropdown";
import { useContext, useState, useEffect } from "react";
import AppContext from "../../providers/AppContext";
import { NavLink, Outlet, useParams } from "react-router-dom";
import NotificationList from "../NotificationList";
import "./NavBar.css";
import NotificationsModal from "../NotificationsModal";
import { deleteNotification, deleteNotificationsForOpenChat, listenForNotificationsByUserHandle } from "../../services/chat.services";

const NavBar = () => {

  const { userData } = useContext(AppContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notifications, setNotifications] = useState([]);
  const { chatId, channelId } = useParams();

  useEffect(() => {
    if (userData) {
      const unsubscribe = listenForNotificationsByUserHandle((snapshot) => {
        const notificationsData = snapshot.exists() ? snapshot.val() : {};
        const userNotifications = Object.values(notificationsData);

        if (userNotifications.length > 0) {
          if (chatId) {
            const notificationsFiltered = userNotifications.filter((n) => n.eventId !== chatId);
            deleteNotificationsForOpenChat(userNotifications.filter((n) => n.eventId === chatId), userData.handle)
              .then(() => setNotifications(notificationsFiltered));
          } else if (channelId) {
            const notificationsFiltered = userNotifications.filter((n) => n.eventId !== channelId);
            deleteNotificationsForOpenChat(userNotifications.filter((n) => n.eventId === channelId), userData.handle)
              .then(() => setNotifications(notificationsFiltered));
          } else {
            setNotifications(userNotifications);
          }
        };
      }, userData.handle);
      return () => unsubscribe();
    }
  }, [userData, chatId]);

  const handleDelete = (notificationId) => {
    deleteNotification(userData.handle, notificationId).then(() => {
      setNotifications((prevNotifications) => prevNotifications.filter((n) => n.id !== notificationId));
    });
  };

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
            <Text>{notifications.length}</Text>
          </AvatarBadge>
        </Avatar>
        <NotificationList notifications={notifications} handleDelete={handleDelete} isOpen={isOpen} onClose={onClose} />
        {/* <NotificationsModal onOpen={onOpen}/> */}

        {userData && (
          <Dropdown username={userData.handle} avatarUrl={userData.avatarUrl} />
        )}

      </div>

      

      {/* <Outlet /> */}
    </>
  );
};

NavBar.propTypes = {};

export default NavBar;
