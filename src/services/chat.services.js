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



export const addDirectChat = async (chatName, myUsername, chatMember) => {

  try {
    const myDms = await getDirectChatByHandle(myUsername);
    const memberDms = await getDirectChatByHandle(chatMember);
    if (myDms) {
      const myDmsMembers = Object.keys(myDms);
      if (myDmsMembers.includes(chatMember)) {
        const dmId = myDms[chatMember];

        return dmId;
      }
    } else {
      const response = await push(ref(db, `direct-chats`), {});
      await set(ref(db, `direct-chats/${response.key}`),
        {
          chatName,
          id: response.key,
          createdBy: myUsername,
          createdOn: new Date(),
          participants: {
            [myUsername]: true,
            [chatMember]: true
          },
          messages: {}
        });

      await updateUserByHandle(myUsername, 'direct-chats', { ...myDms, [chatMember]: response.key });
      await updateUserByHandle(chatMember, 'direct-chats', { ...memberDms, [myUsername]: response.key });

      return response.key;
    }

  } catch (error) {
    alert(error.message);
  }
};



export const getDirectChatByHandle = async (userHandle) => {
  try {
    const dmsSnapshot = await get(ref(db, `users/${userHandle}/direct-chats`));
    if (!dmsSnapshot.exists()) {
      return;
    }
    return dmsSnapshot.val();

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

  // try {
  //   const dmChatSnapshot = get(ref(db, `direct-messages/${dmsId}`));
  //   if (!dmChatSnapshot.exists()) {
  //     throw new Error('This chat does not exist!');
  //   }

  //   const dmChat = dmChatSnapshot.val();
  //   return dmChat.messages;


  // } catch (error) {
  //   console.log(error.message);
  // }

}

export const addMessageToDirectChat = async (directChatId, message, author) => {
  try {
    const messageRef = await push(ref(db, `direct-chats/${directChatId}/messages`), {});
    await set(ref(db, `direct-chats/${directChatId}/messages/${messageRef.key}`), {
      id: messageRef.key,
      author: author,
      content: message,
      createdOn: new Date()
    })

  } catch (error) {
    console.log(error.message);
  }
}