import  { useState } from 'react';
import PropTypes from 'prop-types';

const ChatMessageBox = ({ message, onEdit, currentUserHandle }) => {
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

  return (
    <div>
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
          <p>Content: {message.content}</p>
          {currentUserHandle === message.author && <button onClick={handleEditClick}>Edit</button>}
        </div>
      )}
    </div>
  );
};

ChatMessageBox.propTypes = {
  message: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  currentUserHandle: PropTypes.string.isRequired,
};

export default ChatMessageBox;