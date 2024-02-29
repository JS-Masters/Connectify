import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { markNotificationAsRead, deleteNotification, getNotificationsByUserHandle } from '../services/chat.services';

const NotificationList = ({ userHandle }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotificationsByUserHandle(userHandle).then((notifications) => {
      console.log(notifications);
      setNotifications(notifications);
    });
  }, [userHandle]);

  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(userHandle, notificationId).then(() => {
      setNotifications((prevNotifications) => {
        const newNotifications = { ...prevNotifications };
        newNotifications[notificationId].read = true;
        return newNotifications;
      });
    });
  };

  const handleDelete = (notificationId) => {
    deleteNotification(userHandle, notificationId).then(() => {
      setNotifications((prevNotifications) => {
        const newNotifications = { ...prevNotifications };
        delete newNotifications[notificationId];
        return newNotifications;
      });
    });
  };

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications ? Object.keys(notifications).map((notificationId) => (
          <li key={notificationId}>
            <h3>{notifications[notificationId].title}</h3>
            <p>{notifications[notificationId].body}</p>
            <p>{notifications[notificationId].createdOn}</p>
            <button
              onClick={() => handleMarkAsRead(notificationId)}
              disabled={notifications[notificationId].read}
            >
              Mark as Read
            </button>
            <button onClick={() => handleDelete(notificationId)}>Delete</button>
          </li>
        )) : 'Loading...'}
      </ul>
    </div>
  );
};

NotificationList.propTypes = {
  userHandle: PropTypes.string.isRequired,
};

export default NotificationList;