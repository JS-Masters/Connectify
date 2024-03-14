import { useContext, useEffect, useState } from 'react';
import { deleteNotification, deleteNotificationsForOpenChat, listenForNotificationsByUserHandle } from '../services/chat.services';
import { Link, useParams } from 'react-router-dom';
import AppContext from '../providers/AppContext';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const { userData } = useContext(AppContext);
  const { chatId, channelId } = useParams();

  useEffect(() => {
    if (userData) {
      const unsubscribe = listenForNotificationsByUserHandle((snapshot) => {
        const notificationsData = snapshot.exists() ? snapshot.val() : {};
        const userNotifications = Object.values(notificationsData);

        if (userNotifications.length > 0) {
          if (chatId) {
            const notificationsFiltered = userNotifications.filter((n) => n.eventId !== chatId);
            deleteNotificationsForOpenChat(userNotifications.filter((n) => n.eventId === chatId), userData.handle)
              .then(() => setNotifications(notificationsFiltered));
          } else if(channelId){
            const notificationsFiltered = userNotifications.filter((n) => n.eventId !== channelId);
            deleteNotificationsForOpenChat(userNotifications.filter((n) => n.eventId === channelId), userData.handle)
              .then(() => setNotifications(notificationsFiltered)); 
          }else {
            setNotifications(userNotifications);
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

