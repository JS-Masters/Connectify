import { get, getDatabase, limitToFirst, onValue, orderByChild, push, query, ref, set } from "firebase/database";
import { db } from "../config/firebase-config";
import { getTeamMembers } from "./team.services";
import { DATABASE_ERROR_MSG, DELETE_MESSAGE } from "../common/constants";
import { sendNotification } from "./chat.services";

export const addChannelToTeam = async (teamId, channelTitle, createdBy) => {
  try {
    const teamMembers = await getTeamMembers(teamId);
    const channelRef = await push(ref(db, `teams/${teamId}/channels`), {});
    await set(ref(db, `teams/${teamId}/channels/${channelRef.key}`), {
      id: channelRef.key,
      title: channelTitle,
      createdOn: new Date().toLocaleDateString(),
      createdBy,
      // participants: teamMembers,
      messages: {}
    })
    return channelRef.key;
    
  } catch (error) {
    console.log(error.message);
  }
};

export const listenForNewTeamChannels = (listenFn, teamId) => {
  const q = query(
    ref(db, `teams/${teamId}/channels`),
    limitToFirst(50)
  )
  return onValue(q, listenFn);

};

// export const getTeamChannels = async (teamId) => {
//   try {
//     const teamChannelsSnapshot = await get(ref(db, `teams/${teamId}/channels`));
//     if (!teamChannelsSnapshot.exists()) {
//       throw new Error(DATABASE_ERROR_MSG);
//     }  
//     const teamChannels = Object.values(teamChannelsSnapshot.val());

//     return teamChannels;
//   } catch (error) {
//     console.log(error.message);
//   }
// };

export const getChannelMessagesById = (listenFn, teamId, channelId) => {
  const q = query(
    ref(db, `teams/${teamId}/channels/${channelId}/messages`),
    orderByChild('createdOn'),
    limitToFirst(50)
  )
  return onValue(q, listenFn);
};

export const addMessageToChannel = async (teamId, channelId, message, author) => {

  try {
    const msgRef = await push(ref(db, `teams/${teamId}/channels/${channelId}/messages`), {});
    const newMessageId = msgRef.key;

    await set(ref(db, `teams/${teamId}/channels/${channelId}/messages/${newMessageId}`), {
      id: newMessageId,
      author: author,
      content: message,
      createdOn: new Date().toLocaleString(),
    });

    const teamMembers = await getTeamMembers(teamId);
    const notificationPromises = Object.keys(teamMembers).map(async (member) => {
      if (member !== author) {
        await sendNotification(member, 'New team message!', `You have new message from ${author} in your channel.`, channelId, 'channels', teamId);
      }
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    
    console.log(error.message);
    // can throw Error in catch + после го catch-ваме в компонента и може да покажем Баннер ако искаме да покажем някоя грешка на потребителя
  }
};

export const editMessageInChannel = async (teamId, channelId, messageId, newContent) => {
  const db = getDatabase();
  try {
    const messageRef = ref(db, `teams/${teamId}/channels/${channelId}/messages/${messageId}`);
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

export const deleteMessageFromChannel = async (teamId, channelId, messageId, deletedBy) => {
  try {
    await set(ref(db, `teams/${teamId}/channels/${channelId}/messages/${messageId}`), {
      deleteMessage: DELETE_MESSAGE,
      deletedOn: new Date().toLocaleDateString(),
      deletedBy
    });
  } catch (error) {
    console.log(error.message);
  }
};