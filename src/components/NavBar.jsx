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
} from "@chakra-ui/react";
// import PropTypes from "prop-types";
import Dropdown from "./Dropdown";
import { useContext, useState, useEffect } from "react";
import AppContext from "../providers/AppContext";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  deleteNotification,
  deleteNotificationsForOpenChat,
  listenForNotificationsByUserHandle,
} from "../services/chat.services";

import useOnclickOutside from "react-cool-onclickoutside";

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

  const handleDelete = (notificationId) => {
    deleteNotification(userData.handle, notificationId).then(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n.id !== notificationId)
      );
      setShowNotifications(true);
    });
  };

  return (
    <>
      <Flex alignItems="center" bg='gray'>
        <Image src="/LOGO.png" w="200px" cursor="pointer" />
        <Spacer />
        <HStack spacing="10%">
          <NavLink to="/chats" style={{ minWidth: "100px" }}>
            <Image src="/chats.png" />
          </NavLink>
          <NavLink to="/calls" style={{ minWidth: "100px" }}>
            <Image src="/calls.png" />
          </NavLink>
          <NavLink to="/teams" style={{ minWidth: "100px" }}>
            <Image src="/teams.png" />
          </NavLink>
          <NavLink to="/calendar" style={{ minWidth: "100px" }}>
            <Image src="/calendar.png" />
          </NavLink>
        </HStack>

        <Spacer />

        <Avatar
          onClick={() => setShowNotifications(!showNotifications)}
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
            color="white"
            position="absolute"
            top="50px"
            left="auto"
            overflow="scroll"
            height="250px"
            width="300px"
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
                    key={notification.id}
                    fontSize="sm"
                  >
                    <Button
                      cursor="pointer"
                      pos="absolute"
                      right="0px"
                      top="0px"
                      colorScheme="red"
                      size="xs"
                      onClick={() => {
                        handleDelete(notification.id);
                      }}
                    >
                      X
                    </Button>
                    {notification.type === "chats" && (
                      <Link
                        to={`/chats/${notification.eventId}`}
                        onClick={() => {
                          handleDelete(notification.id);
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
                          handleDelete(notification.id);
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
                          handleDelete(notification.id);
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
    </>
  );
};

NavBar.propTypes = {};

export default NavBar;
