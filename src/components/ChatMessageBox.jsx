import { useState } from 'react';
import PropTypes from 'prop-types';
import { Divider } from '@chakra-ui/react';

const ChatMessageBox = ({ message, onEdit, onDelete, currentUserHandle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

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

  return (
    <div>
      {'deleteMessage' in message ? (
        <p>{message.deleteMessage} by {message.deletedBy} on {message.deletedOn}</p>
      ) : (
        <>
          <p>Author: {message.author}</p>
          <p>Created on: {message.createdOn}</p>
          {message.editedOn && <p>Edited on: {message.editedOn}</p>}
          {isEditing ? (
            <div>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
              <button onClick={handleSaveClick}>Save</button>
              <button onClick={handleCancelClick}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>{message.content}</p>
              {currentUserHandle === message.author && (
                <div>
                  <button onClick={handleEditClick}>Edit</button>
                  <button onClick={handleDeleteClick}>Delete</button>
                </div>
              )}
            </div>
          )}
        <Divider/>
        </>
      )}
    </div>
  );
};

ChatMessageBox.propTypes = {
  message: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  currentUserHandle: PropTypes.string.isRequired,
};

export default ChatMessageBox;