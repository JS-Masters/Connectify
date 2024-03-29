import { get, limitToFirst, onValue, push, query, ref, set, getDatabase, remove, update } from "@firebase/database"
import { db } from "../config/firebase-config"
import { getUserAvatarByHandle, getUsersByChatId, updateUserByHandle } from "./user.services";
import { DATABASE_ERROR_MSG, DELETE_MESSAGE, DELETE_REPLY, SYSTEM_AVATAR } from "../common/constants";


const updateUsersChats = async (chatMembers, newChatId) => {
  try {
    const chatPromises = Object.keys(chatMembers).map(async (member) => {
      const memberChats = await getChatsByUserHandle(member);
      return { member, chats: memberChats };
    });

    const allChats = await Promise.all(chatPromises);
    const updatePromises = allChats.map(async ({ member, chats }) => {
      await updateUserByHandle(member, 'chats', { ...chats, [newChatId]: { participants: chatMembers } });
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.log(error.message);
  }
};

export const createNewChat = async (loggedInUsername, chatMembers, createdAsChannel = false) => {
  try {
    let allParticipants = { [loggedInUsername]: true };
    chatMembers.map((member) => {
      allParticipants = { ...allParticipants, [member]: true };
    });
    const chatRef = await push(ref(db, 'chats'), {});
    const newChatId = chatRef.key;

    await set(ref(db, `chats/${newChatId}`), {
      id: newChatId,
      createdBy: loggedInUsername,
      createdOn: new Date().toLocaleDateString(),
      participants: allParticipants,
      messages: {},
    });
    if(!createdAsChannel) {
      await updateUsersChats(allParticipants, newChatId);
      const notificationPromises = chatMembers.map(async (member) => {
        if (member !== loggedInUsername) {
          await sendNotification(member, 'New chat!', 'You have been added to a new chat.', newChatId, 'chats');
        }
      });
      await Promise.all(notificationPromises);
    }
    return newChatId;
  } catch (error) {
    console.log(error.message);
  }
};

export const getChatsByUserHandle = async (userHandle) => {
  try {
    const chatsSnapshot = await get(ref(db, `users/${userHandle}/chats`));
    if (!chatsSnapshot.exists()) {
      return null;
    }
    return chatsSnapshot.val();

  } catch (error) {
    console.log(error.message);
  }
};

export const listenForNewChats = (listenFn, userHandle) => {
  const q = query(
    ref(db, `users/${userHandle}/chats`),
    limitToFirst(50)
  )
  return onValue(q, listenFn);
};


export const getChatMessagesById = (listenFn, chatId) => {
  const q = query(
    ref(db, `chats/${chatId}/messages`),
    limitToFirst(50)
  )
  return onValue(q, listenFn);
};


export const addMessageToChat = async (chatId, message, author, picURL, authorUrl, repliedMessageContent = '', messageAuthor = '', messageAuthorAvatar = '') => {
  try {
    const msgRef = await push(ref(db, `chats/${chatId}/messages`), {});
    const newMessageId = msgRef.key;

    await set(ref(db, `chats/${chatId}/messages/${newMessageId}`), {
      id: newMessageId,
      author: author,
      content: message,
      img: picURL,
      createdOn: new Date().toLocaleString(),
      authorUrl,
      repliedMessageContent,
      messageAuthor,
      messageAuthorAvatar
    });

    const chatSnapshot = await get(ref(db, `chats/${chatId}`));
    const chatData = chatSnapshot.val();
    const notificationPromises = Object.keys(chatData.participants).map(async (participant) => {
      if (participant !== author) {
        await sendNotification(participant, 'New message!', `You have new message from ${author}.`, chatId, 'chats');
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

export const sendNotification = async (userHandle, title, body, eventId, type, teamId = '') => {
  try {
    const notificationRef = await push(ref(db, `notifications/${userHandle}`), {});
    const notificationId = notificationRef.key;

    await set(ref(db, `notifications/${userHandle}/${notificationId}`), {
      id: notificationId,
      title,
      body,
      createdOn: new Date().toLocaleString(),
      eventId,
      type,
      teamId
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteNotification = async (userHandle, notificationId) => {
  try {
    await remove(ref(db, `notifications/${userHandle}/${notificationId}`));
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteNotificationsForOpenChat = async (notificationsToDelete, userHandle) => {
  try {
    const deletePromises = notificationsToDelete.map(async (n) => await deleteNotification(userHandle, n.id));
    await Promise.all(deletePromises);
  } catch (error) {
    console.log(error.message);
  }
};

export const listenForNotificationsByUserHandle = (listenFn, userHandle) => {
  const q = query(
    ref(db, `notifications/${userHandle}`),
    limitToFirst(50)
  )
  return onValue(q, listenFn);
};

export const getReactionsByMessage = (chatId, messageId, listenFn) => {
  const q = query(ref(db, `chats/${chatId}/messages/${messageId}/reactions`));
  return onValue(q, listenFn);
}

export const addReactionToMessage = async (chatId, messageId, reaction, userHandle) => {
  const messageRef = ref(db, `chats/${chatId}/messages/${messageId}/reactions/${userHandle}`);
  await set(messageRef, reaction);
};

export const removeReactionFromMessage = async (chatId, messageId, userHandle) => {
  const messageRef = ref(db, `chats/${chatId}/messages/${messageId}/reactions/${userHandle}`);
  await remove(messageRef);
};

export const addReactionToReply = async (chatId, messageId, replyId, reaction, userHandle) => {
  const replyRef = ref(db, `chats/${chatId}/messages/${messageId}/replies/${replyId}/reactions/${userHandle}`);
  await set(replyRef, reaction);
};

export const removeReactionFromReply = async (chatId, messageId, replyId, userHandle) => {
  const replyRef = ref(db, `chats/${chatId}/messages/${messageId}/replies/${replyId}/reactions/${userHandle}`);
  await remove(replyRef);
};

export const getReactionsByReply = (chatId, messageId, replyId, listenFn) => {
  const q = query(ref(db, `chats/${chatId}/messages/${messageId}/replies/${replyId}/reactions`));
  return onValue(q, listenFn);
};

export const replyToMessage = async (chatId, messageId, replyContent, messageContent, userHandle, messageAuthor, messageAuthorAvatar) => {
  const replyRef = await push(ref(db, `chats/${chatId}/messages/${messageId}/replies`), {});
  const replyId = replyRef.key;
  const avatarUrl = await getUserAvatarByHandle(userHandle);
  await set(ref(db, `chats/${chatId}/messages/${messageId}/replies/${replyId}`), {
    id: replyId,
    author: userHandle,
    content: replyContent,
    createdOn: new Date().toLocaleString(),
    reactions: {},
    avatarUrl
  });
  await addMessageToChat(chatId, replyContent, userHandle, '', avatarUrl, messageContent, messageAuthor, messageAuthorAvatar)
};

export const getRepliesByMessage = (chatId, messageId, listenFn) => {
  const q = query(ref(db, `chats/${chatId}/messages/${messageId}/replies`));
  return onValue(q, listenFn);
};

export const editReplyInChat = async (chatId, messageId, replyId, newContent) => {
  const db = getDatabase();
  try {
    const replyRef = ref(db, `chats/${chatId}/messages/${messageId}/replies/${replyId}`);
    const snapshot = await get(replyRef);
    if (snapshot.exists()) {
      await set(replyRef, {
        ...snapshot.val(),
        content: newContent,
        editedOn: new Date().toLocaleString(),
      });
    } else {
      console.log('No such reply!');
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteReplyFromChat = async (chatId, messageId, replyId, deletedBy, avatarUrl) => {
  try {
    await set(ref(db, `chats/${chatId}/messages/${messageId}/replies/${replyId}`), {
      deleteMessage: DELETE_REPLY,
      deletedOn: new Date().toLocaleDateString(),
      deletedBy,
      avatarUrl
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const leaveChat = async (chatId, userHandle) => {
  try {
    const chatRef = ref(db, `chats/${chatId}`);
    const chatSnapshot = await get(chatRef);
    if (!chatSnapshot.exists()) {
      throw new Error(DATABASE_ERROR_MSG);
    }
    const chatData = chatSnapshot.val();

    if (chatData) {
      const newParticipants = { ...chatData.participants };
      delete newParticipants[userHandle];
      if (Object.keys(newParticipants).length === 0) {
        await remove(ref(db, `chats/${chatId}`));
        await remove(ref(db, `users/${userHandle}/chats/${chatId}`));
      } else {
        await update(ref(db, `chats/${chatId}`), {
          participants: newParticipants,
        });

        await remove(ref(db, `users/${userHandle}/chats/${chatId}`));

        const removeParticipantFromMembersPromises = Object.keys(newParticipants).map(async (p) => await remove(ref(db, `users/${p}/chats/${chatId}/participants/${userHandle}`)));
        await Promise.all(removeParticipantFromMembersPromises);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchChatData = async (chatIds, logedInUserHandle) => {
  const userHandlesPromises = chatIds.map(async (chatId) => {
    const response = await getUsersByChatId(chatId);
    return Object.keys(response)
  });

  const allUsersHandles = (await Promise.all(userHandlesPromises)).flat();
  const asSet = new Set(allUsersHandles);
  const usersHandles = [...asSet].filter((handle) => handle !== logedInUserHandle);

  return usersHandles;
};

export const handleLeaveChat = async (chatID, userHandle) => {
  try {
    await leaveChat(chatID, userHandle);
    const leaveMessage = {
      content: `${userHandle} has left the chat.`,
      author: 'System',
      createdOn: new Date().toLocaleString(),
    };

    const chatSnapshot = await get(ref(db, `chats/${chatID}`));
    if (!chatSnapshot.exists()) {
      return;
    }
    await addMessageToChat(chatID, leaveMessage.content, leaveMessage.author, null, SYSTEM_AVATAR);
  } catch (error) {
    console.log(error.message);
  }
};
