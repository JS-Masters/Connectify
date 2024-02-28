import { get, limitToFirst, onValue, orderByChild, push, query, ref, set, getDatabase, remove } from "@firebase/database"
import { db } from "../config/firebase-config"
// import { useToast } from "@chakra-ui/toast";
import { getUserByHandle, updateUserByHandle } from "./user.services";
import { DELETE_MESSAGE } from "../common/constants";


// const toast = useToast();
// const showToast = (desc, status) => {
//     toast({
//       title: "Registration",
//       description: desc,
//       duration: 5000,
//       isClosable: true,
//       status: status,
//       position: "top",
//     });
//   };

// ГОТОВА
const updateUsersChats = async (chatMembers, newChatId) => {
  for (const member of chatMembers) {
    const memberChats = await getChatsByUserHandle(member);
    await updateUserByHandle(member, 'chats', { ...memberChats, [newChatId]: chatMembers });
  };
};

// ГОТОВА
const doesChatAlreadyExists = (loggedInChats, newChatMembers) => {
  for (const chatId in loggedInChats) {
    const chatParticipants = loggedInChats[chatId];
    const hasMatchingParticipants = newChatMembers.every(member => chatParticipants.includes(member));
    if (hasMatchingParticipants) {
      return chatId;
    }
  }
  return null;
}


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
      } else {
        const response = await push(ref(db, `chats`), {
          createdBy: loggedInUsername,
          createdOn: new Date().toLocaleDateString(),
          participants: allParticipants,
          messages: {}
        });

        await updateUsersChats([...chatMembers, loggedInUsername], response.key);
        return response.key;
      }
    } else {
      const response = await push(ref(db, `chats`), {
        createdBy: loggedInUsername,
        createdOn: new Date().toLocaleDateString(),
        participants: allParticipants,
        messages: {}
      });

      await updateUsersChats([...chatMembers, loggedInUsername], response.key);
      return response.key;
    };
  } catch (error) {
    alert(error.message);
  }
};


// ГОТОВА
export const getChatsByUserHandle = async (userHandle) => {
  try {
    const chatsSnapshot = await get(ref(db, `users/${userHandle}/chats`));
    if (!chatsSnapshot.exists()) {
      return null;
    }
    return chatsSnapshot.val();

  } catch (error) {
    alert(error.message);
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
    })
    // await remove(ref(db, `chats/${chatId}/messages/${messageId}`));
  } catch (error) {
    console.log(error.message);
  }
}