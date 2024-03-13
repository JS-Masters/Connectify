// import PropTypes from 'prop-types'
import CreateChatPopUp from './CreateChatPopUp';
import { useContext, useEffect, useState } from 'react';
import AppContext from '../providers/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchChatData, handleLeaveChat, listenForNewChats } from '../services/chat.services';
import { Avatar, AvatarBadge, Box, Button, Heading } from '@chakra-ui/react';
import { v4 } from 'uuid';
import { addAvatarAndStatus } from '../services/user.services';
import UserStatusIconChats from './UserStatusIconChats';
import { NO_USERS_AVATAR, NO_USERS_MESSAGE, statuses } from '../common/constants';

const ChatList = () => {

  const { userData } = useContext(AppContext);
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [myChats, setMyChats] = useState(null);
  const [users, setUsers] = useState([]); // Array<object{handle: string, avatarUrl: string, currentStatus: string}>
  const [leaveChatTrigger, setLeaveChatTrigger] = useState(false);

  useEffect(() => {
    if (userData) {
      const unsubscribe = listenForNewChats((snapshot) => {
        const chatsData = snapshot.exists() ? snapshot.val() : null;
        if (chatsData) {
          setMyChats(chatsData);
        } else {
          setMyChats(null)
        }

      }, userData.handle);
      return () => unsubscribe();
    }

  }, [chatId, leaveChatTrigger]);

  useEffect(() => {
    if (myChats) {
      const chatIds = Object.keys(myChats);
      fetchChatData(chatIds, userData.handle)
        .then((usersHandles) => {

          addAvatarAndStatus(usersHandles)
            .then(setUsers)
        })
        .catch((err) => console.log(err.message));
    }
  }, [myChats]);

  const handleLeaveChatClick = (chatID, userHandle) => {
    handleLeaveChat(chatID, userHandle)
    .then(() => setLeaveChatTrigger(!leaveChatTrigger));
  };

  return (
    <>
      {<CreateChatPopUp />}
      {myChats ? (
        Object.keys(myChats).map((chatID) => {
          const chatParticipantsHandles = Object.keys(myChats[chatID].participants).filter((participant) => participant !== userData.handle);
          let chatMembers = []
          {
            chatParticipantsHandles.length === 0 ? chatMembers = [{ handle: NO_USERS_MESSAGE, avatarUrl: NO_USERS_AVATAR, currentStatus: statuses.offline }]
            : chatMembers = users.filter((u) => chatParticipantsHandles.includes(u.handle))
          }
          return (
            <Box border='1px solid gray' size='md' cursor='pointer' key={v4()} onClick={() => navigate(`/chats/${chatID}`)}>
              {chatMembers.map((member) =>
                <span key={v4()}>
                  <Avatar size='sm' style={{ cursor: "pointer" }} src={member.avatarUrl}>
                    <AvatarBadge w="1em" bg="teal.500">
                      {<UserStatusIconChats userHandle={member.handle} iconSize={'5px'}/>}
                    </AvatarBadge>
                  </Avatar>
                  <Heading display='inline' as='h3' size='sm'>{member.handle}</Heading>
                  <Button colorScheme="red" onClick={() => handleLeaveChatClick(chatID, userData.handle)}>X</Button>
                </span>
              )}
            </Box>
          );
        })
      ) : (
        <Heading fontSize='2em'>You dont have any chats yet...</Heading>
      )}
    </>
  )
}

ChatList.propTypes = {}

export default ChatList