import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Card, CardBody, CardFooter, CardHeader, HStack, Heading, Text, Textarea } from '@chakra-ui/react';
import Reactions from './Reactions';
import { REACTIONS } from '../common/constants';
import { getRepliesByMessage } from '../services/chat.services';
import { v4 } from 'uuid';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

const ChatMessageBox = ({ message, onEdit, onDelete, onReply, currentUserHandle, chatId, reactions }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isHovered, setIsHovered] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState([]);


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
                <Text>{message.content}</Text>
                {/* ТУК ЗАКОМЕНТИРАХ, не помня защо :) */}
                {/* {currentUserHandle !== message.author && !isHovered && reactions && reactions[currentUserHandle] && (
                <span>{REACTIONS[reactions[currentUserHandle]]} 1</span>)} */}
                {currentUserHandle !== message.author && isHovered && (
                  <Box>
                    <Reactions chatId={chatId} messageId={message.id} userHandle={currentUserHandle} />
                  </Box>
                )}
                {/*ТОВА го добавих за да се рендерират промените при всички юзъри */}
                {'reactions' in message && Object.values(message.reactions).map((reaction) => <span key={v4()} >{REACTIONS[reaction]}</span>)}

                {isReplying && (
                  <Box>
                    <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} /> <br />
                    <Button onClick={handleSaveReplyClick}>Add Reply</Button>
                    <Button onClick={handleCancelReplyClick}>Cancel Reply</Button>
                  </Box>
                )}
              </CardBody>

              <CardFooter>
                {currentUserHandle === message.author && (
                  <HStack spacing={2}>
                    <Button leftIcon={<EditIcon />} onClick={handleEditClick}>Edit</Button>
                    <Button leftIcon={<DeleteIcon />} onClick={handleDeleteClick}>Delete</Button>
                  </HStack>
                )}
                {currentUserHandle !== message.author && !isReplying && (
                  <Button onClick={handleReplyClick}>Reply</Button>
                )}
              </CardFooter>

              {replies.map((reply) => (
                <ChatMessageBox
                  key={reply.id}
                  message={reply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReply={onReply}
                  currentUserHandle={currentUserHandle}
                  chatId={chatId}
                  reactions={reactions}
                />
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
  currentUserHandle: PropTypes.string.isRequired,
  chatId: PropTypes.string.isRequired,
  reactions: PropTypes.object
};


export default ChatMessageBox;