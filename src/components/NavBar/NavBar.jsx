import {
  Avatar,
  AvatarBadge,
  Image,
  Text,
  Spacer,
  HStack,
  Flex,
  List,
  ListItem,
  Button,
  Box,
} from "@chakra-ui/react";
// import PropTypes from "prop-types";
import Dropdown from "../Dropdown";
import { useContext, useState, useEffect } from "react";
import AppContext from "../../providers/AppContext";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  deleteNotification,
  deleteNotificationsForOpenChat,
  listenForNotificationsByUserHandle,
} from "../../services/chat.services";

import useOnclickOutside from "react-cool-onclickoutside";
import "./NavBar.css"
const NavBar = () => {
  const { userData } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const { chatId, channelId } = useParams();
  const [showNotifications, setShowNotifications] = useState(false);

  const ref = useOnclickOutside(() => setShowNotifications(false));

  useEffect(() => {
    if (userData) {
      const unsubscribe = listenForNotificationsByUserHandle((snapshot) => {
        const notificationsData = snapshot.exists() ? snapshot.val() : {};
        const userNotifications = Object.values(notificationsData);

        if (userNotifications.length > 0) {
          if (chatId) {
            const notificationsFiltered = userNotifications.filter(
              (n) => n.eventId !== chatId
            );
            deleteNotificationsForOpenChat(
              userNotifications.filter((n) => n.eventId === chatId),
              userData.handle
            ).then(() => setNotifications(notificationsFiltered));
          } else if (channelId) {
            const notificationsFiltered = userNotifications.filter(
              (n) => n.eventId !== channelId
            );
            deleteNotificationsForOpenChat(
              userNotifications.filter((n) => n.eventId === channelId),
              userData.handle
            ).then(() => setNotifications(notificationsFiltered));
          } else {
            setNotifications(userNotifications);
          }
        }
      }, userData.handle);
      return () => unsubscribe();
    }
  }, [userData, chatId]);

  const handleDeleteNotification = (notificationId) => {

    deleteNotification(userData.handle, notificationId).then(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n.id !== notificationId)
      );
      setShowNotifications(true);
    });
  };

  return (
    <>
      <Box w='100vw' bg='#2b2b2b'>
        <Flex alignItems="center" maxW='1500px' m='auto'>
          <Image id="logo" src="/LOGO3.png" w="200px" cursor="pointer" margin='15px' />
          {/* <Spacer /> */}
          <HStack spacing="12%" marginRight='23%' marginLeft='19%'>
            <NavLink to="/chats" style={{ minWidth: "100px" }}>
              <Image src="/chats-y.png" />
            </NavLink>
            <NavLink to="/calls" style={{ minWidth: "100px" }}>
              <Image src="/calls-y.png" />
            </NavLink>
            <NavLink to="/teams" style={{ minWidth: "100px" }}>
              <Image src="/teams-y.png" />
            </NavLink>
            <NavLink to="/calendar" style={{ minWidth: "100px" }}>
              <Image src="/calendar-y.png" />
            </NavLink>
          </HStack>
          {/* <Spacer /> */}
          <Avatar
            onClick={() => Boolean(notifications.length) && setShowNotifications(!showNotifications)}
            src="/bell.png"
            cursor="pointer"
            pos="relative"
          >
            <AvatarBadge w="16px" border="none">
              <Text>{notifications.length}</Text>
            </AvatarBadge>
            <List
              ref={ref}
              display={showNotifications ? "block" : "none"}
              id="notifications-list"
              color="white"
              position="absolute"
              zIndex='5'
              top="50px"
              left="auto"
              overflow="hidden"
              overflowY="auto"
              height="300px"
              width="300px"
              border="1px solid gray"
              borderRadius="10px"
            >
              {notifications.length > 0 &&
                notifications
                  .sort((a, b) => a.createdOn - b.createdOn)
                  .map((notification) => (
                    <ListItem
                      pos="relative"
                      border="1px solid gray"
                      borderRadius="10px"
                      m="10px"
                      ml='-3'
                      key={notification.id}
                      fontSize="sm"
                    >
                      <Button
                        cursor="pointer"
                        pos="absolute"
                        right="0px"
                        top="0px"
                        colorScheme="transperent"
                        color="red"
                        size="xs"
                        onClick={() => {
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        X
                      </Button>
                      {notification.type === "chats" && (
                        <Link
                          to={`/chats/${notification.eventId}`}
                          onClick={() => {
                            handleDeleteNotification(notification.id);
                            setShowNotifications(false);
                          }}
                        >
                          {" "}
                          <Text as="span">{notification.title}</Text>
                          <Text>{notification.body}</Text>
                        </Link>
                      )}
                      {notification.type === "teams" && (
                        <Link
                          to={`/teams/${notification.eventId}`}
                          onClick={() => {
                            handleDeleteNotification(notification.id);
                            setShowNotifications(false);
                          }}
                        >
                          <p>{notification.body}</p>
                        </Link>
                      )}
                      {notification.type === "channels" && (
                        <Link
                          to={`/teams/${notification.teamId}/channels/${notification.eventId}`}
                          onClick={() => {
                            handleDeleteNotification(notification.id);
                            setShowNotifications(false);
                          }}
                        >
                          <Text>{notification.body}</Text>
                        </Link>
                      )}
                      <Text>{notification.createdOn}</Text>
                    </ListItem>
                  ))}
            </List>
          </Avatar>
          {userData && (
            <Dropdown username={userData.handle} avatarUrl={userData.avatarUrl} />
          )}
        </Flex>
      </Box>

    </>
  );
};

NavBar.propTypes = {};

export default NavBar;
