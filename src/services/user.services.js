import { get, set, ref, query, equalTo, orderByChild, update, limitToFirst, onValue } from 'firebase/database';
import { db } from '../config/firebase-config';
import { DATABASE_ERROR_MSG, DEFAULT_AVATAR_URL, NO_USERS_MESSAGE } from '../common/constants';

export const getUserByHandle = (handle) => {

  return get(ref(db, `users/${handle}`));
};

export const updateUserByHandle = (handle, prop, value) => {

  return set(ref(db, `users/${handle}/${prop}`), value);
};

export const createUserHandle = (handle, uid, email, currentStatus, lastStatus) => {


  return set(ref(db, `users/${handle}`), { handle, uid, email, createdOn: new Date(), currentStatus, lastStatus, avatarUrl: DEFAULT_AVATAR_URL })
};

export const getUserData = (uid) => {

  return get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
};

export const getAllUsers = async () => {
  try {
    const snapshot = await get(ref(db, 'users'));
    return snapshot.val();
  } catch (error) {
    console.log(error.message);
  }
  return null;
};

export const getUsersObjectsByHandles = async (usersHandles) => {
  try {
    const usersObjectsPromises = usersHandles.map(async (u) => {
      const userRef = await getUserByHandle(u);
      if (!userRef.exists()) {
        throw new Error(DATABASE_ERROR_MSG);
      }
      const user = userRef.val();
      return user;
    })
    const usersObjects = await Promise.all(usersObjectsPromises);
    return usersObjects;

  } catch(error) {
    console.log(error.message);
  }
};

export const changeUserCurrentStatusInDb = async (handle, status) => {
 await update(ref(db, `users/${handle}`),
    {
      currentStatus: status
    });
};

export const changeUserLastStatusInDb = (handle, status) => {
  update(ref(db, `users/${handle}`),
    {
      lastStatus: status
    });
};

export const getUserStatusByHandle = async (handle) => {
  try {
    if (handle !== NO_USERS_MESSAGE) {
      const snapshot = await get(ref(db, `users/${handle}/currentStatus`));

      if (!snapshot.exists()) {
        throw new Error(DATABASE_ERROR_MSG);
      }
      return snapshot.val();
    } else {
      return '';
    }
  } catch (error) {
    console.log(error.message)
  }
};

export const getUserLastStatusByHandle = async (handle) => {
  try {
      const snapshot = await get(ref(db, `users/${handle}/lastStatus`));
      if (!snapshot.exists()) {
        throw new Error(DATABASE_ERROR_MSG);
      }
      return snapshot.val();
  
  } catch (error) {
    console.log(error.message)
  }
};

export const listenForStatusChange =  (listenFn, loggedUserHandle) => {
  const q = query(
    ref(db, `users/${loggedUserHandle}`),
    // orderByChild('createdOn'),
    limitToFirst(50)
  )
  return onValue(q, listenFn);
};

export const getUserAvatarByHandle = async (handle) => {
  try {
    const snapshot = await get(ref(db, `users/${handle}/avatarUrl`));
    if (!snapshot.exists()) {
      throw new Error(DATABASE_ERROR_MSG);
    }
    return snapshot.val();

  } catch (error) {
    console.log(error.message)
  }
};

export const getUsersAvatarsByHandles = async (usersHandles) => {
  try {
    const membersAvatarsPromises = usersHandles.map(async (memberHandle) => {
      const memberAvatar = await getUserAvatarByHandle(memberHandle);
      return { handle: memberHandle, avatarUrl: memberAvatar };
    });
    const membersWithAvatars = await Promise.all(membersAvatarsPromises);
    return membersWithAvatars;

  } catch (error) {
    console.log(error.message)
  }
};


export const getUsersByChatId = async (chatId) => {
  try {
    const snapshot = await get(ref(db, `chats/${chatId}/participants`));
    if (!snapshot.exists()) {
      throw new Error(DATABASE_ERROR_MSG);
    }
    return snapshot.val();

  } catch (error) {
    console.log(error.message)
  }
};


export const addAvatarAndStatus = async (usersHandles) => {

  const usersUpdatedPromises = usersHandles.map(async (handle) => {
    if (handle !== NO_USERS_MESSAGE) {
      const avatarUrl = await getUserAvatarByHandle(handle);
      const currentStatus = await getUserStatusByHandle(handle);
      return {
        handle,
        avatarUrl,
        currentStatus,
      }
    } else {
      return {
        handle: NO_USERS_MESSAGE,
        avatarUrl: NO_USERS_AVATAR,
        currentStatus: statuses.offline
      }
    }
  });
  const usersUpdated = await Promise.all(usersUpdatedPromises);
  return usersUpdated;
};

export const updateUsersStatuses = async (users) => {

  const statusesUpdatesPromises = users.map(async (user) => {
    const userStatus = await getUserStatusByHandle(user.handle);

    if (userStatus !== user.currentStatus) {
      return { ...user, currentStatus: userStatus };
    }
    return user;
  });

  const usersWithUpdatedStatuses = await Promise.all(statusesUpdatesPromises);

  return usersWithUpdatedStatuses;
};

export const getBlockedUsers = async (userHandle) => {
  try {
    const bannedUsersSnapshot = await get(ref(db, `users/${userHandle}/blockedUsers`));
    if (bannedUsersSnapshot.exists()) {
      const blockedUsers = bannedUsersSnapshot.val();
      return Object.keys(blockedUsers);
    }
    return [];

  } catch (error) {
    console.log(error.message);
  }

};

export const blockUser = async (userHandle, userToBan) => {
  try {
    let prevBannedUsers = {};
    const prevBannedUsersSnapshot = await get(ref(db, `users/${userHandle}/blockedUsers`));
    if (prevBannedUsersSnapshot.exists()) {
      prevBannedUsers = prevBannedUsersSnapshot.val();
    }
    await set(ref(db, `users/${userHandle}/blockedUsers`), {
      ...prevBannedUsers,
      [userToBan]: true
    });

    let prevBannedByUsers = {};
    const userToBanSnapshot = await get(ref(db, `users/${userToBan}/blockedBy`));
    if (userToBanSnapshot.exists()) {
      prevBannedByUsers = userToBanSnapshot.val();
    }
    await set(ref(db, `users/${userToBan}/blockedBy`), {
      ...prevBannedByUsers,
      [userHandle]: true
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const unblockUser = async (userHandle, userToUnban) => {
  try {
    const prevBannedUsersSnapshot = await get(ref(db, `users/${userHandle}/blockedUsers`));
    if (!prevBannedUsersSnapshot.exists()) {
      throw new Error(DATABASE_ERROR_MSG);
    }
    const prevBannedUsers = prevBannedUsersSnapshot.val();
    const updatedBannedUsers = { ...prevBannedUsers };
    delete updatedBannedUsers[userToUnban];
    await set(ref(db, `users/${userHandle}/blockedUsers`), {
      ...updatedBannedUsers
    });

    const userToUnbanSnapshot = await get(ref(db, `users/${userToUnban}/blockedBy`));
    if (!userToUnbanSnapshot.exists()) {
      throw new Error(DATABASE_ERROR_MSG);
    }
    const userToUnbanBannedByProp = userToUnbanSnapshot.val();
    const bannedByUpdated = { ...userToUnbanBannedByProp };
    delete bannedByUpdated[userHandle];
    await set(ref(db, `users/${userToUnban}/blockedBy`), {
      ...bannedByUpdated,
    });
  } catch (error) {
    console.log(error.message);
  }

};

export const isLoggedUserBlocked = async (loggedUser, userHandleToCheck) => {

  try {
    const loggedUserBannedBySnapshot = await get(ref(db, `users/${loggedUser}/blockedBy`));
    // if (loggedUserBannedBySnapshot) {
      const loggedUserBannedBy = loggedUserBannedBySnapshot.val();
      if(loggedUserBannedBy && Object.keys(loggedUserBannedBy).includes(userHandleToCheck.handle)) {
        return null;
      }
      return userHandleToCheck;
    // }
  } catch (error) {
    console.log(error.message);
  }
};

export const checkUsersIfBannedLoggedUser = async (usersToCheck, loggedUser) => {
  try {
    const checkBanPromises =  usersToCheck.map(async (userToCheckIfBanned) => await isLoggedUserBlocked(loggedUser, userToCheckIfBanned));
    const checkedUsersBySearchTerm = await Promise.all(checkBanPromises);
    const checkedUsers = checkedUsersBySearchTerm.filter(Boolean);
    return checkedUsers;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchAllUsers = async () => {
  try {
    const snapshot = await get(ref(db, 'users'));
    return snapshot.val();
  } catch (error) {
    console.log(error.message);
  }
  return null; 
};