import { get, limitToFirst, onValue, orderByChild, push, query, ref, set } from "@firebase/database"
import { db } from "../config/firebase-config"
// import { useToast } from "@chakra-ui/toast";
import { getUserByHandle, updateUserByHandle } from "./user.services";


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


export const getDirectChatMessagesById = async (listenFn, dmsId) => {
  const q = query(
    ref(db, `/direct-chats/${dmsId}/messages`),
    orderByChild('createdOn'),
    limitToFirst(50)
  )
  return onValue(q, listenFn);

}

export const addMessageToDirectChat = async (directChatId, message, author) => {
  try {
    const messageRef = await push(ref(db, `direct-chats/${directChatId}/messages`), {});
    await set(ref(db, `direct-chats/${directChatId}/messages/${messageRef.key}`), {
      id: messageRef.key,
      author: author,
      content: message,
      createdOn: new Date().toLocaleDateString()
    })

  } catch (error) {
    console.log(error.message);
  }
}