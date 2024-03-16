import { Avatar, AvatarBadge, Box, Heading, Image, useDisclosure, Text, Modal, ModalContent, Spacer, HStack } from "@chakra-ui/react";
// import PropTypes from "prop-types";
import Dropdown from "../Dropdown";
import { useContext, useState, useEffect } from "react";
import AppContext from "../../providers/AppContext";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import NotificationList from "../NotificationList";
import "./NavBar.css";
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
      <Box id="nav-buttons-div"  >
        <Image id="logo-img" src="../../LOGO.png"></Image>
        <Spacer />
        <HStack spacing='80px'>
          <NavLink to="/chats"><img src="../../chats.png"></img></NavLink>
          <NavLink to="/calls"><img src="../../calls.png"></img></NavLink>
          <NavLink to="/teams"><img src="../../teams.png"></img></NavLink>
          <NavLink to="/calendar"><img src="../../calendar.png"></img></NavLink>
        </HStack>

        <Spacer />

        <Avatar onClick={onOpen} src="../../bell.png" cursor='pointer'>
          <AvatarBadge w="1em" border='none' >
            <Text>{notifications.length}</Text>
          </AvatarBadge>
          <Modal isOpen={isOpen} onClose={onClose} >
            {/* <ModalOverlay /> */}
            <ModalContent w='fit-content' bg='gray' marginTop='90px'>
              <Box id="notifications-box">
                <ul>
                  {notifications.length > 0 && (notifications.sort((a, b) => a.createdOn - b.createdOn).map((notification) => (
                    <li id="single-notification" key={notification.id}>
                      <span>{notification.title}</span>
                      <button style={{ border: '1px solid black' }} onClick={() => {
                        handleDelete(notification.id)
                      }}>X</button>
                      {notification.type === 'chats' &&
                        <Link to={`/chats/${notification.eventId}`}
                          onClick={() => {
                            handleDelete(notification.id);
                            onClose();
                          }}> <p>{notification.body}</p>
                        </Link>}
                      {notification.type === 'teams' && <Link to={`/teams/${notification.eventId}`} onClick={() => {
                        handleDelete(notification.id);
                        onClose();
                      }}><p>{notification.body}</p>
                      </Link>}
                      {notification.type === 'channels' && <Link to={`/teams/${notification.teamId}/channels/${notification.eventId}`} onClick={() => {
                        handleDelete(notification.id);
                        onClose();
                      }}><p>{notification.body}</p>
                      </Link>}
                      <p>{notification.createdOn}</p>
                    </li>
                  )))}
                </ul>
              </Box>
            </ModalContent>
          </Modal>
        </Avatar>

        {userData && (
          <Dropdown username={userData.handle} avatarUrl={userData.avatarUrl} />
        )}

      </Box>


    </>
  );
};

NavBar.propTypes = {};

export default NavBar;
