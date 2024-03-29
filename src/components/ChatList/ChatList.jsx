import CreateChatPopUp from "../CreateChatPopUp/CreateChatPopUp";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../providers/AppContext";
import { useNavigate } from "react-router-dom";
import {
  fetchChatData,
  handleLeaveChat,
  listenForNewChats,
} from "../../services/chat.services";
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  HStack,
  Heading,
} from "@chakra-ui/react";
import { v4 } from "uuid";
import { addAvatarAndStatus } from "../../services/user.services";
import UserStatusIcon from "../UserStatusIconChats";
import {
  NO_USERS_AVATAR,
  NO_USERS_MESSAGE,
  statuses,
} from "../../common/constants";
import "./ChatList.css";

const ChatList = () => {
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [myChats, setMyChats] = useState(null);
  const [users, setUsers] = useState([]);
  const [leaveChatTrigger, setLeaveChatTrigger] = useState(false);

  useEffect(() => {
    if (userData) {
      const unsubscribe = listenForNewChats((snapshot) => {
        const chatsData = snapshot.exists() ? snapshot.val() : null;
        if (chatsData) {
          setMyChats(chatsData);
        } else {
          setMyChats(null);
        }
      }, userData.handle);
      return () => unsubscribe();
    }
  }, [leaveChatTrigger]);

  useEffect(() => {
    if (myChats) {
      const chatIds = Object.keys(myChats);
      fetchChatData(chatIds, userData.handle)
        .then((usersHandles) => {
          addAvatarAndStatus(usersHandles).then(setUsers);
        })
        .catch((err) => console.log(err.message));
    }
  }, [myChats]);

  const handleLeaveChatClick = (chatID, userHandle) => {
    handleLeaveChat(chatID, userHandle).then(() =>
      setLeaveChatTrigger(!leaveChatTrigger)
    );
  };

  return (
    <Box
      className="chat-list-box"
      h="85vh"
      w="32vh"
      overflow="hidden"
      overflowY="auto"
    >
      <CreateChatPopUp />
      {myChats ? (
        Object.keys(myChats).map((chatID) => {
          const chatParticipantsHandles = Object.keys(
            myChats[chatID].participants
          ).filter((participant) => participant !== userData.handle);
          const chatMembers =
            chatParticipantsHandles.length === 0
              ? [
                {
                  handle: NO_USERS_MESSAGE,
                  avatarUrl: NO_USERS_AVATAR,
                  currentStatus: statuses.offline,
                },
              ]
              : users.filter((u) => chatParticipantsHandles.includes(u.handle));

          return (
            <Box
              className="single-chat-box"
              border="1px solid gray"
              borderRadius="10px"
              margin="8px"
              padding="9px"
              size="md"
              cursor="pointer"
              position="relative"
              key={v4()}
              onClick={() => navigate(`/chats/${chatID}`)}
            >
              {chatMembers.map((member) =>
                chatMembers.length <= 1 ? (
                  <HStack
                    key={v4()}
                    style={{
                      marginRight: "10px",
                      justifyContent: "left",
                      overflowT: "scroll",
                    }}
                  >
                    <Avatar
                      size="md"
                      style={{ cursor: "pointer", marginRight: "10px" }}
                      src={member.avatarUrl}
                    >
                      <AvatarBadge bg="teal.500">
                        {
                          <UserStatusIcon
                            userHandle={member.handle}
                            iconSize={"13px"}
                          />
                        }
                      </AvatarBadge>
                    </Avatar>
                    <Heading
                      id="chat-member-handle"
                      display="inline"
                      as="h3"
                      size="sm"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {member.handle}
                    </Heading>
                  </HStack>
                ) : (
                  <Avatar
                    key={v4()}
                    size="md"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    src={member.avatarUrl}
                  >
                    <AvatarBadge bg="teal.500">
                      {
                        <UserStatusIcon
                          userHandle={member.handle}
                          iconSize={"13px"}
                        />
                      }
                    </AvatarBadge>
                  </Avatar>
                )
              )}
              <Button
                id="leave-chat-button"
                cursor="pointer"
                pos="absolute"
                right="0px"
                top="0px"
                colorScheme="transperent"
                color="#611f26"
                size="xs"
                onClick={() => handleLeaveChatClick(chatID, userData.handle)}
              >
                X
              </Button>
            </Box>
          );
        })
      ) : (
        <Box textAlign="center" color="#FFBD0A" marginTop="40px">
          <Heading fontSize="2em">You dont have any chats...</Heading>
        </Box>
      )}
    </Box>
  );
};

export default ChatList;
