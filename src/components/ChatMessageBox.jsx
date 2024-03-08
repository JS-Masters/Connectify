import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Card, CardBody, CardFooter, CardHeader, HStack, Heading, Text, Textarea } from '@chakra-ui/react';
import Reactions from './Reactions';
import { REACTIONS } from '../common/constants';
import { getRepliesByMessage } from '../services/chat.services';
import { v4 } from 'uuid';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

const ChatMessageBox = ({ message, onEdit, onDelete, onReply, onEditReply, onDeleteReply, currentUserHandle, chatId, userHandle, isReply, showReactions, reply }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isHovered, setIsHovered] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [repliesToMessage, setReplies] = useState([]);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [editedReplyContent, setEditedReplyContent] = useState('');

  useEffect(() => {
    const unsubscribe = getRepliesByMessage(chatId, message.id, (snapshot) => {
      const repliesData = snapshot.val();
      if (repliesData) {
        const repliesArray = Object.values(repliesData);
        setReplies(repliesArray);
      } else {
        setReplies([]);
      }
    }); return () => unsubscribe();
  }, [chatId, message.id]);


  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onEdit(message.id, editedContent);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    onDelete(message.id);
  };

  const handleHoverEnter = () => {
    setIsHovered(true);
  };

  const handleHoverLeave = () => {
    setIsHovered(false);
  };

  const handleReplyClick = () => {
    setIsReplying(true);
    setReplyContent(`@${message.author} `);
  };

  const handleSaveReplyClick = () => {
    onReply(message.id, replyContent);
    setIsReplying(false);
    setReplyContent('');
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

  const handleEditReplyClick = (reply) => {
    console.log('Clicked Reply:', reply.id);
    setIsEditingReply(true);
    setEditedReplyContent(reply.content);
  };
  const handleSaveReplyEditClick = (reply) => {
    console.log('Editing reply:', reply.id);
    onEditReply(message.id, reply.id, editedReplyContent);
    setIsEditingReply(false);
    setEditedReplyContent('');
  };
  const handleCancelReplyEditClick = () => {
    setIsEditingReply(false);
    setEditedReplyContent('');
  };

  const handleDeleteReplyClick = (reply) => {
    onDeleteReply(message.id, reply.id);
  }

  
  return (
    
    <Card onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave} borderTop="8px" borderColor="purple.400" bg="white" >
    
      {'deleteMessage' in message ? (
        <Text>
          {message.deleteMessage} by {message.deletedBy} on {message.deletedOn}
        </Text>
      ) : (
        <>
          <CardHeader>
            <HStack>
              <Avatar src='https://images.assetsdelivery.com/compings_v2/triken/triken1608/triken160800029.jpg' />
              <Heading as='h3' size='sm'>{message.author}</Heading>
              <Text>{message.createdOn}</Text>
            </HStack>
          </CardHeader>
          {message.editedOn && <p>Edited on: {message.editedOn}</p>}
          {isEditing ? (
            <Box>
              <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} /> <br />
              <Button onClick={handleSaveClick}>Save</Button>
              <Button onClick={handleCancelClick}>Cancel</Button>
            </Box>
          ) : (
            <>
              <CardBody>
                {/* Message content */}
                <Text>{message.content}</Text>

                {!isReply && currentUserHandle !== message.author && isHovered &&  (
                  <Box>
                    <Reactions chatId={chatId} messageId={message.id} userHandle={currentUserHandle} isReply={false} />
                  </Box>
                )}

                {'reactions' in message && Object.values(message.reactions).map((reaction) => (
                  <span key={v4()}>{REACTIONS[reaction]}</span>
                ))}
              </CardBody>

              {isReplying && !isReply && (
                <CardBody>
                  <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
                  <Button onClick={handleSaveReplyClick}>Add Reply</Button>
                  <Button onClick={handleCancelReplyClick}>Cancel Reply</Button>
                </CardBody>
              )}

              <CardFooter>
                {currentUserHandle === message.author && !isReply && (
                  <HStack spacing={2}>
                    <Button leftIcon={<EditIcon />} onClick={handleEditClick}>Edit</Button>
                    <Button leftIcon={<DeleteIcon />} onClick={handleDeleteClick}>Delete</Button>
                  </HStack>
                )}
                {currentUserHandle !== message.author && !isReplying && !isReply && (
                  <Button onClick={handleReplyClick}>Reply</Button>
                )}
                
              </CardFooter>

              {repliesToMessage.map((reply) => (
  <div key={reply.id}>
    <ChatMessageBox
      chatId={chatId}
      message={reply}
      userHandle={userHandle}
      isReply={true}
      onEditReply={onEditReply}
      onDeleteReply={onDeleteReply}
      reply={reply}
    />
{currentUserHandle === reply.author && (
  <>
   <button onClick={() => handleEditReplyClick(reply)}>Edit</button>
    <button onClick={() => handleDeleteReplyClick(reply)}>Delete</button>
    {isEditingReply && (
      <Box>
        <Textarea value={editedReplyContent} onChange={(e) => setEditedReplyContent(e.target.value)} />
        <Button onClick={() => handleSaveReplyEditClick(reply)}>Save</Button>
        <Button onClick={handleCancelReplyEditClick}>Cancel</Button>
      </Box>
    )}
  </>
)}
    {!isReply && currentUserHandle !== reply.author && isHovered && (
      <Reactions
        chatId={chatId}
        messageId={message.id}
        userHandle={userHandle}
        replyID={reply.id}
      />
    )}
  </div>
))}
            </>
          )}
        </>
      )}


    </Card>
  );
};

ChatMessageBox.propTypes = {
  message: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onReply: PropTypes.func.isRequired,
  onEditReply: PropTypes.func.isRequired,
  onDeleteReply: PropTypes.func.isRequired,
  currentUserHandle: PropTypes.string.isRequired,
  chatId: PropTypes.string.isRequired,
  reactions: PropTypes.object,
  replies: PropTypes.array.isRequired,
  repliesId: PropTypes.array.isRequired,
  isReply: PropTypes.bool,
  userHandle: PropTypes.string.isRequired,
  showReactions: PropTypes.bool.isRequired,
  reply: PropTypes.object,

};


export default ChatMessageBox;