import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Divider } from '@chakra-ui/react';
import Reactions from './Reactions';
import { REACTIONS } from '../common/constants';
import { getRepliesByMessage} from '../services/chat.services';

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
    });   return () => unsubscribe();
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
    <div onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave}>
      {'deleteMessage' in message ? (
        <p>
          {message.deleteMessage} by {message.deletedBy} on {message.deletedOn}
        </p>
      ) : (
        <>
          <p>Author: {message.author}</p>
          <p>Created on: {message.createdOn}</p>
          {message.editedOn && <p>Edited on: {message.editedOn}</p>}
          {isEditing ? (
            <div>
              <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
              <button onClick={handleSaveClick}>Save</button>
              <button onClick={handleCancelClick}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>{message.content}</p>
              {/* ТУК ЗАКОМЕНТИРАХ, не помня защо :) */}
              {/* {currentUserHandle !== message.author && !isHovered && reactions && reactions[currentUserHandle] && (
                <span>{REACTIONS[reactions[currentUserHandle]]} 1</span>
              )} */}
              {currentUserHandle !== message.author && isHovered && (
                <div>
                  <Reactions chatId={chatId} messageId={message.id} userHandle={currentUserHandle} />
                </div>
              )}
               {/*ТОВА го добавих за да се рендерират промените при всички юзъри */}
              {'reactions' in message && Object.values(message.reactions).map((reaction) => <span>{REACTIONS[reaction]}</span>)}
              {currentUserHandle === message.author && (
                <div>
                  <button onClick={handleEditClick}>Edit</button>
                  <button onClick={handleDeleteClick}>Delete</button>
                </div>
              )}
              {currentUserHandle !== message.author && !isReplying && (
                <button onClick={handleReplyClick}>Reply</button>
              )}
              {isReplying && (
                <div>
                  <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
                  <button onClick={handleSaveReplyClick}>Add Reply</button>
                  <button onClick={handleCancelReplyClick}>Cancel Reply</button>
                </div>
              )}
              
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
            </div>
          )}
          <Divider />
        </>
      )}
    </div>
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