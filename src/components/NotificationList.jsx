import { useContext, useEffect, useState } from 'react';
import { deleteNotification, deleteNotificationsForOpenChat, listenForNotificationsByUserHandle } from '../services/chat.services';
import { Link, useParams } from 'react-router-dom';
import AppContext from '../providers/AppContext';
import { Box, Modal, ModalContent } from '@chakra-ui/react';

const NotificationList = ({ notifications, handleDelete, isOpen, onClose }) => {




  return (

    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        {/* <ModalOverlay /> */}
        <ModalContent w='fit-content' bg='transparent'>
          <Box>
            {/* {notifications.length > 0 ? <h2 style={{ color: 'red' }}>{notifications.length} Notifications</h2> : <h2 style={{ color: 'green' }}>0 notifications</h2>} */}
            <ul>
              {notifications.length > 0 && (notifications.sort((a, b) => a.createdOn - b.createdOn).map((notification) => (
                <li key={notification.id}>
                  <h3>{notification.title}</h3>
                  {notification.type === 'chats' &&
                    <Link to={`/chats/${notification.eventId}`}
                      onClick={() => {
                        handleDelete(notification.id);
                        onClose();
                      }}> <p>{notification.body}</p>
                    </Link>}
                  {notification.type === 'teams' && <Link to={`/teams/${notification.eventId}`} onClick={() => {
                    handleDelete(notification.id);
                    onClose();
                  }}><p>{notification.body}</p>
                  </Link>}
                  {notification.type === 'channels' && <Link to={`/teams/${notification.teamId}/channels/${notification.eventId}`} onClick={() => {
                    handleDelete(notification.id);
                    onClose();
                  }}><p>{notification.body}</p>
                  </Link>}
                  <p>{notification.createdOn}</p>
                  <button style={{ border: '1px solid black' }} onClick={() => {
                    handleDelete(notification.id)
                  }}>X</button>
                </li>
              )))}
            </ul>
          </Box>
        </ModalContent>
      </Modal>



    </>
  );
};

export default NotificationList;

// NotificationList.propTypes = {
//   userHandle: PropTypes.string.isRequired,
// };

