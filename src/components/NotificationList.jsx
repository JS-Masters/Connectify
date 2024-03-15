import { useContext, useEffect, useState } from 'react';
import { deleteNotification, deleteNotificationsForOpenChat, listenForNotificationsByUserHandle } from '../services/chat.services';
import { Link, useParams } from 'react-router-dom';
import AppContext from '../providers/AppContext';
import { Box, Modal, ModalContent } from '@chakra-ui/react';

const NotificationList = ({ notifications, handleDelete, isOpen, onClose }) => {




  return (

    <>
      



    </>
  );
};

export default NotificationList;

// NotificationList.propTypes = {
//   userHandle: PropTypes.string.isRequired,
// };

