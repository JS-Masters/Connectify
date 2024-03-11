// import PropTypes from 'prop-types'
import CreateChatPopUp from './CreateChatPopUp';
import { useContext, useEffect, useState } from 'react';
import AppContext from '../providers/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchChatData, getChatsByUserHandle } from '../services/chat.services';
import { Avatar, AvatarBadge, Box, Heading } from '@chakra-ui/react';
import { v4 } from 'uuid';
import { addAvatarAndStatus } from '../services/user.services';
import UserStatusIconChats from './UserStatusIconChats';

const ChatList = () => {

  const { userData } = useContext(AppContext);
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [myChats, setMyChats] = useState(null);
  const [users, setUsers] = useState([]); // Array<object{handle: string, avatarUrl: string, currentStatus: string}>

  useEffect(() => {
    getChatsByUserHandle(userData.handle).then((chats) => {
      if (chats) {
        setMyChats(chats);
      }
    });
  }, [chatId]);

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

  return (
    <>
      {<CreateChatPopUp />}
      {myChats ? (
        Object.keys(myChats).map((chatId) => {
          const chatParticipantsHandles = Object.keys(myChats[chatId].participants).filter((participant) => participant !== userData.handle);
          const chatMembers = users.filter((u) => chatParticipantsHandles.includes(u.handle));
          return (
            <Box border='1px solid gray' size='md' cursor='pointer' key={v4()} onClick={() => navigate(`/chats/${chatId}`)}>
              {chatMembers.map((member) =>
                <span key={v4()}>
                  <Avatar size='sm' style={{ cursor: "pointer" }} src={member.avatarUrl}>
                    <AvatarBadge w="1em" bg="teal.500">
                      {<UserStatusIconChats memberHandle={member.handle} />}
                    </AvatarBadge>
                  </Avatar>
                  <Heading display='inline' as='h3' size='sm'>{member.handle}</Heading>
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