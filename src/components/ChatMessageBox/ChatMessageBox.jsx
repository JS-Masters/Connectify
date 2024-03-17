import { useState, useContext } from 'react';
// import PropTypes from 'prop-types';
import { Avatar, Box, Button, Card, HStack, Heading, Spacer, Text, Textarea, } from '@chakra-ui/react';
import Reactions from '../Reactions';
import { deleteMessageFromChat, editMessageInChat, getRepliesByMessage, removeReactionFromMessage, replyToMessage } from '../../services/chat.services';
import { v4 } from 'uuid';
// import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import AppContext from '../../providers/AppContext';
import FilePreview from '../FIlePreview';
// import ReplyMessage from "./ReplyMessage";
import { useParams } from 'react-router-dom';
import "./ChatMessageBox.css"

const ChatMessageBox = ({ message, sameAuthor }) => {

  const { userData } = useContext(AppContext);
  const { chatId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isHovered, setIsHovered] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  // const [repliesToMessage, setRepliesToMessage] = useState([]);



  // useEffect(() => {
  //   const unsubscribe = getRepliesByMessage(chatId, message.id, (snapshot) => {
  //     const repliesData = snapshot.val();
  //     if (repliesData) {
  //       const repliesArray = Object.values(repliesData);
  //       setRepliesToMessage(repliesArray);
  //     } else {
  //       setRepliesToMessage([]);
  //     }
  //   }); return () => unsubscribe();
  // }, [chatId, message.id]);



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
    // setReplyContent(`@${message.author} `);
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
          <Text>
            {message.deleteMessage} by {message.deletedBy} on {message.deletedOn}
          </Text>
        ) : (
          <>
            {!sameAuthor && (
              <>
                <Box style={{ border: '1px solid black' }}>
                  <HStack style={{ gap: '8px' }}>
                    <Avatar src={message.authorUrl} style={{ marginLeft: '10px' }} />
                    <Heading as='h3' size='sm'>{message.author}</Heading>
                    <Text fontSize='10px'>{message.createdOn}</Text>
                    <Spacer />
                    {userData.handle === message.author && isHovered && (
                      <>
                        <Button onClick={handleEditButtonClick} style={{ height: 'fit-content', width: 'fit-content' }}><img src="../../edit.png" style={{ width: '40px', height: '40px', padding: '4px' }}></img></Button>
                        <Button onClick={handleDeleteButtonClick} style={{ height: 'fit-content', width: 'fit-content', marginRight: '15px' }}><img src="../../delete.png" style={{ width: '40px', height: '40px' }}></img></Button>
                      </>
                    )}
                  </HStack>
                </Box>
              </>
            )}

            {isEditing ? (
              <Box>
                <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} /> <br />
                <Button onClick={handleSaveEditClick}>Save</Button>
                <Button onClick={handleCancelEditClick}>Cancel</Button>
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
                          <Text>{message.messageAuthor}</Text>
                        </HStack>

                        <span style={{display:'block'}}>{message.repliedMessageContent}</span>
                        <span style={{display:'block'}}><img style={{ width: '20px', height: '20px', display: 'inline' }} src='../../public/down-arrow.png' />{message.content}</span>
                      </>
                    ) : (
                      <>
                        <span style={{display:'block'}}> {message.content}</span>
                      </>
                    )}
                    <span style={{display:'block', fontSize: '10px'}}>{message.createdOn}</span>
                    {message.editedOn && <span style={{ fontSize: '10px' }}> (edited) {message.editedOn}</span>}
                  </Text>
                  {userData.handle !== message.author && !isReplying && isHovered && (
                    <HStack pos='absolute' top='0' right='0'>
                      <Reactions messageId={message.id} />
                      <Button onClick={handleReplyButtonClick} style={{ height: 'fit-content', width: 'fit-content', marginRight: '15px' }}><img src="../../reply.png" style={{ width: '40px', height: '40px' }}></img></Button>
                    </HStack>
                  )}
                  {userData.handle === message.author && sameAuthor && isHovered && (
                    <HStack pos='absolute' top='0' right='0' spacing='7px' >
                      <Button onClick={handleEditButtonClick} style={{ height: 'fit-content', width: 'fit-content' }}><img src="../../edit.png" style={{ width: '25px', height: '25px', padding: '4px', float: 'right' }}></img></Button>
                      <Button onClick={handleDeleteButtonClick} style={{ height: 'fit-content', width: 'fit-content', marginRight: '15px' }}><img src="../../delete.png" style={{ width: '25px', height: '25px', float: 'right' }}></img></Button>
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
                    <>
                      <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} width='97%' /> <br />
                      <Button onClick={handleSaveReplyClick}>Add Reply</Button>
                      <Button onClick={handleCancelReplyClick}>Cancel Reply</Button>
                    </>
                  )}
                </Box>

                {/* {repliesToMessage.map((reply) => (
                  <div key={v4()}>
                    <ReplyMessage
                      reply={reply}
                      message={message} />
                    {userData.handle !== reply.author && isHovered && (
                      <Reactions
                        messageId={message.id}
                        replyID={reply.id}
                      />
                    )}
                  </div>
                ))} */}
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