import { get, limitToFirst, onValue, orderByChild, push, query, ref, set, getDatabase, remove } from "@firebase/database"
import { db } from "../config/firebase-config"
import { updateUserByHandle } from "./user.services";
import { DELETE_MESSAGE } from "../common/constants";


const updateUsersChats = async (chatMembers, newChatId) => { 

    const chatPromises = Object.keys(chatMembers).map(async (member) => {
    const memberChats = await getChatsByUserHandle(member);
    return { member, chats: memberChats };
  });

  const allChats = await Promise.all(chatPromises);

  const updatePromises = allChats.map(async ({ member, chats }) => {
    await updateUserByHandle(member, 'chats', { ...chats, [newChatId]: {participants : chatMembers} });
  });
   
  await Promise.all(updatePromises);
};


const doesChatAlreadyExists = (loggedInUserChats, newChatMembers) => {
  for (const chatId in loggedInUserChats) {
    const chatParticipants = Object.keys(loggedInUserChats[chatId].participants);
    const hasMatchingParticipants = newChatMembers.every(member => chatParticipants.includes(member));
    if (hasMatchingParticipants) {
      return chatId;
    };
  };
  return null;
};

export const createNewChat = async (loggedInUsername, chatMembers) => {
  try {
    const loggedInUserChats = await getChatsByUserHandle(loggedInUsername);
    let allParticipants = { [loggedInUsername]: true };
    chatMembers.map((member) => {
      allParticipants = { ...allParticipants, [member]: true };
    });

    if (loggedInUserChats) {
      const existingChatId = doesChatAlreadyExists(loggedInUserChats, chatMembers);
      if (existingChatId) {
        return existingChatId;
      }
    }

    const chatRef = await push(ref(db, 'chats'), {});
    const newChatId = chatRef.key; 

    await set(ref(db, `chats/${newChatId}`), {
      id: newChatId,
      createdBy: loggedInUsername,
      createdOn: new Date().toLocaleDateString(),
      participants: allParticipants,
      messages: {},
    });

    await updateUsersChats(allParticipants, newChatId);
    const notificationPromises = chatMembers.map(async (member) => {
      if (member !== loggedInUsername) {
        await sendNotification(member, 'New chat!', 'You have been added to a new chat.');
      }
    });

    await Promise.all(notificationPromises);

    return newChatId;
  } catch (error) {
    console.log(error.message);
  }
};


export const getChatsByUserHandle = async (userHandle) => {
  try {
    const chatsSnapshot = await get(ref(db, `users/${userHandle}/chats`));
    console.log(chatsSnapshot.val());
    if (!chatsSnapshot.exists()) {
      return null;
    }
    return chatsSnapshot.val();

  } catch (error) {
    console.log(error.message);
  }
}


export const getChatMessagesById = (listenFn, chatId) => {
  const q = query(
    ref(db, `chats/${chatId}/messages`),
    orderByChild('createdOn'),
    limitToFirst(50)
  )
  return onValue(q, listenFn);

}

export const addMessageToChat = async (chatId, message, author) => {
  try {
    const msgRef = await push(ref(db, `chats/${chatId}/messages`), {});
    const newMessageId = msgRef.key;

    await set(ref(db, `chats/${chatId}/messages/${newMessageId}`), {
      id: newMessageId,
      author: author,
      content: message,
      createdOn: new Date().toLocaleString(),
    });

    const chatSnapshot = await get(ref(db, `chats/${chatId}`));
    const chatData = chatSnapshot.val();

    const notificationPromises = Object.keys(chatData.participants).map(async (participant) => {
      if (participant !== author) {
        await sendNotification(participant, 'New message!', `You have new message from ${author}.`);
      }
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.log(error.message);
  }
};

export const editMessageInChat = async (chatId, messageId, newContent) => {
  const db = getDatabase();
  try {
    const messageRef = ref(db, `chats/${chatId}/messages/${messageId}`);
    const snapshot = await get(messageRef);
    if (snapshot.exists()) {
      await set(messageRef, {
        ...snapshot.val(),
        content: newContent,
        editedOn: new Date().toLocaleString(),
      });
    } else {
      console.log('No such message!');
    }
  } catch (error) {
    console.log(error.message);
  }
};


export const deleteMessageFromChat = async (chatId, messageId, deletedBy) => {
  try {
    await set(ref(db, `chats/${chatId}/messages/${messageId}`), {
      deleteMessage: DELETE_MESSAGE,
      deletedOn: new Date().toLocaleDateString(),
      deletedBy
    });
  } catch (error) {
    console.log(error.message);
  }
};

// export const listenToLoggedUserChats = (listenFn, userHandle, chatId) => {
//   const q = query(
//     ref(db, `${userHandle}/chats/${chatId}/messages`),
//     orderByChild('createdOn'),
//     limitToFirst(50)
//   )
//   return onValue(q, listenFn);

// }

export const sendNotification = async (userHandle, title, body) => {
  try {
    const notificationRef = await push(ref(db, `notifications/${userHandle}`), {});
    const notificationId = notificationRef.key;

    await set(ref(db, `notifications/${userHandle}/${notificationId}`), {
      id: notificationId,
      title,
      body,
      createdOn: new Date().toLocaleString(),
      read: false,
    });
  } catch (error) {
    console.log(error.message);
  }
}

export const markNotificationAsRead = async (userHandle, notificationId) => {
  try {
    await set(ref(db, `notifications/${userHandle}/${notificationId}/read`), true);
  } catch (error) {
    console.log(error.message);
  }
}


export const deleteNotification = async (userHandle, notificationId) => {
  try {
    await remove(ref(db, `notifications/${userHandle}/${notificationId}`));
  } catch (error) {
    console.log(error.message);
  }
}

export const getNotificationsByUserHandle = async (userHandle) => {
  try {
    const notificationsSnapshot = await get(ref(db, `notifications/${userHandle}`));
    return notificationsSnapshot.val() || [];
  } catch (error) {
    console.log(error.message);
  }
}
