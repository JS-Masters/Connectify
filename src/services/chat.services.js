import { get, limitToFirst, onValue, orderByChild, push, query, ref, set, getDatabase, remove } from "@firebase/database"
import { db } from "../config/firebase-config"
import { updateUserByHandle } from "./user.services";
import { DELETE_MESSAGE } from "../common/constants";


const updateUsersChats = async (chatMembers, newChatId) => {

  const chatPromises = chatMembers.map(async (member) => {
    const memberChats = await getChatsByUserHandle(member);
    return { member, chats: memberChats };
  });

  const allChats = await Promise.all(chatPromises);

  const updatePromises = allChats.map(async ({ member, chats }) => {
    await updateUserByHandle(member, 'chats', { ...chats, [newChatId]: chatMembers });
  });
  
  await Promise.all(updatePromises);
};


const doesChatAlreadyExists = (loggedInChats, newChatMembers) => {
  for (const chatId in loggedInChats) {
    const chatParticipants = loggedInChats[chatId];
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
      allParticipants = { ...allParticipants, [member]: true }
    });

    if (loggedInUserChats) {
      const existingChatId = doesChatAlreadyExists(loggedInUserChats, chatMembers);
      if (existingChatId) {
        return existingChatId;
      };
    };
    const chatRef = await push(ref(db, 'chats'), {});
    await set(ref(db, `chats/${chatRef.key}`), {
      id: chatRef.key,
      createdBy: loggedInUsername,
      createdOn: new Date().toLocaleDateString(),
      participants: allParticipants,
      messages: {}
    });

    await updateUsersChats([...chatMembers, loggedInUsername], chatRef.key);
    return chatRef.key;
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
    await set(ref(db, `chats/${chatId}/messages/${msgRef.key}`), {
      id: msgRef.key,
      author: author,
      content: message,
      createdOn: new Date().toLocaleString()
    })


  } catch (error) {
    console.log(error.message);
  }
}

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
}