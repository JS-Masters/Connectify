import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Card, HStack, Heading, Image, Spacer, Text, Textarea, } from '@chakra-ui/react';
import Reactions from '../Reactions';
import { deleteMessageFromChat, editMessageInChat, getRepliesByMessage, removeReactionFromMessage, replyToMessage } from '../../services/chat.services';
import { v4 } from 'uuid';
// import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import AppContext from '../../providers/AppContext';
import FilePreview from '../FIlePreview';
// import ReplyMessage from "./ReplyMessage";
import { useParams } from 'react-router-dom';
import "./ChatMessageBox.css"
import { TICK } from '../../common/constants';

const ChatMessageBox = ({ message, sameAuthor }) => {

  const { userData } = useContext(AppContext);
  const { chatId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const [isHovered, setIsHovered] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleEditButtonClick = () => {
    setIsEditing(true);
  };

  const handleSaveEditClick = () => {
    editMessageInChat(chatId, message.id, editedContent)
      .then(() => setIsEditing(false))
  };

  const handleCancelEditClick = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleDeleteButtonClick = () => {
    deleteMessageFromChat(chatId, message.id, userData.handle);
  };

  const handleHoverEnter = () => {
    setIsHovered(true);
  };

  const handleHoverLeave = () => {
    setIsHovered(false);
  };

  const handleReplyButtonClick = () => {
    setIsReplying(true);
  };

  const handleSaveReplyClick = () => {
    replyToMessage(chatId, message.id, replyContent, message.content, userData.handle, message.author, message.authorUrl)
      .then(() => {
        setIsReplying(false);
        setReplyContent('');
      })
  };


  const handleCancelReplyClick = () => {
    if (isReplying) {
      setIsReplying(false);
      setReplyContent('');
    } else {
      setEditedContent(message.content);
      setIsEditing(false);
    }
  };

  const countMessageReactions = (reactions = []) => {
    const reactionCount = reactions.reduce((acc, reaction) => {
      if (acc[reaction]) {
        acc[reaction]++;
      } else {
        acc[reaction] = 1;
      }
      return acc;
    }, {});
    return Object.entries(reactionCount);
  };

  return (
    <>
      <Box id='chat-message-box' onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave} mt={sameAuthor ? '0px' : '5px'}  >
        {'deleteMessage' in message ? (
          <Text style={{ color: '#a7555e' }}>
            <Text style={{ color: '#a7555e', fontWeight: 'bold', display: 'inline' }}>{message.deleteMessage} </Text>
            by <Text className='deleted-by'>{message.deletedBy} </Text>
            on {message.deletedOn}
          </Text>
        ) : (
          <>
            {!sameAuthor && (
              <>
                <Box style={{ border: '1px solid black' }}>
                  <HStack style={{ gap: '8px', height: '55px' }}>
                    <Avatar src={message.authorUrl} style={{ marginLeft: '10px' }} />
                    <Heading className='user-handle-chat-box' as='h3' size='sm'>{message.author}</Heading>
                    {/* <Text fontSize='10px'>{message.createdOn}</Text> */}
                    <Spacer />
                    {userData.handle === message.author && isHovered && (
                      <>
                        {/* <Image onClick={handleEditButtonClick} style={{ height: 'fit-content', width: 'fit-content' }}><img src="../../edit.png" style={{ width: '40px', height: '40px', padding: '4px' }}></img></Image> */}
                        <Image id='edit-message-img' onClick={handleEditButtonClick} style={{ width: '52px', height: '52px', padding: '4px' }} src="../../edit.png" />
                        <Image id='delete-message-img' onClick={handleDeleteButtonClick} style={{ width: '42px', height: '42px', padding: '4px', marginRight: '10px' }} src="../../delete.png" />
                      </>
                    )}
                  </HStack>
                </Box>
              </>
            )}

            {isEditing ? (
              <Box>
                <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} style={{ marginTop: '30px' }} /> <br />
                <Button onClick={handleSaveEditClick}
                  cursor="pointer"
                  pos="absolute"
                  right="45px"
                  top="0px"
                  colorScheme="transperent"
                  color="green"
                  size="xs"
                  marginTop='58px'
                  padding='0px'
                  fontSize='25px'

                >{TICK}</Button>
                <Button onClick={handleCancelEditClick}
                  cursor="pointer"
                  pos="absolute"
                  right="0px"
                  top="0px"
                  colorScheme="transperent"
                  color="red"
                  size="sm"
                  fontSize='22px'
                  marginTop='56px'
                >X</Button>
              </Box>
            ) : (
              <>
                <Box padding='0' pos='relative' display='flex' flexDirection='column' >
                  <Text
                    width='80%'
                    height='auto'
                    style={{
                      whiteSpace: 'pre-wrap',
                      display: 'inline-block'
                    }}
                  >
                    {('repliedMessageContent' in message && message.repliedMessageContent.length > 0) ? (
                      <>
                        <HStack>
                          <Avatar src={message.messageAuthorAvatar} style={{ marginLeft: '10px', width: '25px', height: '25px' }} />
                          <Text id='user-handle-chat-box-reply' className='user-handle-chat-box'>{message.messageAuthor}</Text>
                        </HStack>

                        <span style={{ display: 'block' }}>{message.repliedMessageContent}</span>
                        <span style={{ display: 'block' }}><img style={{ width: '20px', height: '20px', display: 'inline' }} src='../../public/down-arrow.png' />{message.content}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ display: 'block', marginTop:'15px', marginBottom:'17px', fontSize:'18px' }}> {message.content}</span>
                      </>
                    )}
                    <span style={{ display: 'block', fontSize: '10px' }}>{message.createdOn}</span>
                    {message.editedOn && <Text style={{ fontSize: '10px', color: 'bisque' }}> (edited) {message.editedOn}</Text>}
                  </Text>
                  {userData.handle !== message.author && !isReplying && isHovered && (
                    <HStack pos='absolute' top='0' right='0'>
                      <Reactions messageId={message.id} />
                      <Image id='delete-message-img' onClick={handleReplyButtonClick} style={{ width: '42px', height: '42px', padding: '4px', marginRight: '10px' }} src="../../reply.png" />
                      {/* <Button onClick={handleReplyButtonClick} style={{ height: 'fit-content', width: 'fit-content', marginRight: '15px' }}><img src="../../reply.png" style={{ width: '40px', height: '40px' }}></img></Button> */}
                    </HStack>
                  )}
                  {userData.handle === message.author && sameAuthor && isHovered && (
                    <HStack pos='absolute' top='0' right='0' spacing='7px' >
                      <Image id='edit-message-img' onClick={handleEditButtonClick} style={{ width: '45px', height: '45px', padding: '4px', marginBottom: '7px' }} src="../../edit.png" />
                      <Image id='delete-message-img' onClick={handleDeleteButtonClick} style={{ width: '37px', height: '37px', padding: '4px', marginRight: '10px', marginBottom: '7px' }} src="../../delete.png" />
                    </HStack>
                  )}
                  {message.img && <FilePreview fileUrl={message.img} />}
                  {'reactions' in message && countMessageReactions(Object.values(message.reactions)).map((entry) => (
                    message.reactions[userData.handle] === entry[0] ? (
                      < span style={{ border: '1px solid blue', cursor: 'pointer', borderRadius: '5px', width: 'fit-content' }} key={v4()} onClick={() => removeReactionFromMessage(chatId, message.id, userData.handle)} > {entry[0]} {entry[1]}</span>
                    ) : (
                      < span style={{ width: 'fit-content' }} key={v4()} > {entry[0]} {entry[1]}</span>
                    )
                  ))}

                  {isReplying && (
                     <Box>
                     <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} style={{ marginTop: '30px' }} /> <br />
                     <Button onClick={handleSaveReplyClick}
                       cursor="pointer"
                       pos="absolute"
                       right="45px"
                       top="0px"
                       colorScheme="transperent"
                       color="green"
                       size="xs"
                       marginTop='38px'
                       padding='0px'
                       fontSize='25px'
     
                     >{TICK}</Button>
                     <Button onClick={handleCancelReplyClick}
                       cursor="pointer"
                       pos="absolute"
                       right="0px"
                       top="0px"
                       colorScheme="transperent"
                       color="red"
                       size="sm"
                       fontSize='22px'
                       marginTop='35px'
                     >X</Button>
                   </Box>
                  )}
                </Box>
              </>
            )}
          </>
        )}
      </Box >
    </>

  );
};

// ChatMessageBox.propTypes = {
//   message: PropTypes.object.isRequired,
//   sameAuthor: PropTypes.bool.isRequired,
// };

export default ChatMessageBox;