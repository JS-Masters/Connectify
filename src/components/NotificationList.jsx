import { useContext, useEffect, useState } from 'react';
import { deleteNotification, deleteNotificationsForOpenChat, getNotificationsByUserHandle } from '../services/chat.services';
import { Link, useParams } from 'react-router-dom';
import AppContext from '../providers/AppContext';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const { userData } = useContext(AppContext);
  const { chatId } = useParams();

  useEffect(() => {
    if (userData) {
      const unsubscribe = getNotificationsByUserHandle((snapshot) => {
        const notificationsData = snapshot.exists() ? snapshot.val() : {};
        const notificationsUpdated = Object.values(notificationsData);

        if (notificationsUpdated.length > 0) {

          if (chatId) {
            const notificationsFiltered = notificationsUpdated.filter((n) => n.chatId !== chatId);
            const notificationsForDelete = notificationsUpdated.filter((n) => n.chatId === chatId);
            deleteNotificationsForOpenChat(notificationsForDelete, userData.handle)
              .then(() => setNotifications(notificationsFiltered));
          } else {
            setNotifications(notificationsUpdated);
          }
        };

      }, userData.handle);
      return () => unsubscribe();
    }
  }, [userData, chatId]);

  const handleDelete = (notificationId) => {
    deleteNotification(userData.handle, notificationId).then(() => {
      setNotifications((prevNotifications) => prevNotifications.filter((n) => n.id !== notificationId));
    });
  };

  return (

    <div>
      {notifications.length > 0 ? <h2 style={{ color: 'red' }}>{notifications.length} Notifications</h2> : <h2 style={{ color: 'green' }}>0 notifications</h2>}
      <ul>
        {notifications.length > 0 && (notifications.sort((a, b) => a.createdOn - b.createdOn).map((notification) => (
          <li key={notification.id}>
            <h3>{notification.title}</h3>
            {notification.type === 'chats' && <Link onClick={() => handleDelete(notification.id)} to={`/chats/${notification.eventId}`}> <p>{notification.body}</p></Link>}
            {notification.type === 'teams' && <Link onClick={() => handleDelete(notification.id)} to={`/teams/${notification.eventId}`}> <p>{notification.body}</p></Link>} 
            {notification.type === 'channels' && <Link onClick={() => handleDelete(notification.id)} to={`/teams/${notification.teamId}/channels/${notification.eventId}`}> <p>{notification.body}</p></Link>} 
            <p>{notification.createdOn}</p>
            <button style={{ border: '1px solid black' }} onClick={() => handleDelete(notification.id)}>X </button>
          </li>
        )))}
      </ul>
    </div>
  );
};

export default NotificationList;

// NotificationList.propTypes = {
//   userHandle: PropTypes.string.isRequired,
// };

