import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Card, CardBody, CardFooter, CardHeader, HStack, Heading, Image, Spacer, Text, Textarea } from '@chakra-ui/react';
import Reactions from './Reactions';
import { getRepliesByMessage } from '../services/chat.services';
import { v4 } from 'uuid';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import AppContext from '../providers/AppContext';
import FilePreview from './FIlePreview';
import ReplyMessage from "./ReplyMessage";
import { useParams } from 'react-router-dom';


const ChatMessageBox = ({ message, onEdit, onDelete, onReply, onEditReply, onDeleteReply }) => {

  const { userData } = useContext(AppContext);
  const { chatId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isHovered, setIsHovered] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [repliesToMessage, setReplies] = useState([]);



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
          <Box style={{ border: '1px solid black' }}>

            <HStack style={{gap:'8px'}}>
              <Avatar src={message.authorUrl}  style={{marginLeft:'10px'}}/>
              <Heading as='h3' size='sm'>{message.author}</Heading>
              <Spacer/>
              <Text>{message.createdOn}</Text>
              {userData.handle === message.author && (
                <>
                  <Button onClick={handleEditClick} style={{ height: 'fit-content', width: 'fit-content' }}><img src="../../edit.png" style={{ width: '40px', height: '40px', padding: '4px' }}></img></Button>
                  <Button onClick={handleDeleteClick} style={{ height: 'fit-content', width: 'fit-content', marginRight:'15px' }}><img src="../../delete.png" style={{ width: '40px', height: '40px' }}></img></Button>
                </>
              )}
            </HStack>

            {message.editedOn && <p>Edited on: {message.editedOn}</p>}

            {userData.handle !== message.author && !isReplying && (
              <Button onClick={handleReplyClick}>Reply</Button>
            )}
          </Box>

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
                {message.img && <FilePreview fileUrl={message.img} />}

                {userData.handle !== message.author && (
                  <Box>
                    <Reactions messageId={message.id} />
                  </Box>
                )}

                {'reactions' in message && Object.values(message.reactions).map((reaction) => (
                  <span key={v4()}>{reaction}</span>
                ))}

                {isReplying && (
                  <>
                    <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
                    <Button onClick={handleSaveReplyClick}>Add Reply</Button>
                    <Button onClick={handleCancelReplyClick}>Cancel Reply</Button>
                  </>
                )}
              </CardBody>





              {repliesToMessage.map((reply) => (
                <div key={reply.id}>
                  <ReplyMessage
                    reply={reply}
                    onEditReply={onEditReply}
                    onDeleteReply={onDeleteReply}
                    message={message} />

                  {userData.handle !== reply.author && isHovered && (
                    <Reactions
                      messageId={message.id}
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



export default ChatMessageBox;