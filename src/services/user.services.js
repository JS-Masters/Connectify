import { get, set, ref, query, equalTo, orderByChild, update } from 'firebase/database';
import { db } from '../config/firebase-config';
import { DATABASE_ERROR_MSG, DEFAULT_AVATAR_URL } from '../common/constants';

export const getUserByHandle = (handle) => {

  return get(ref(db, `users/${handle}`));
};

export const updateUserByHandle = (handle, prop, value) => {

  return set(ref(db, `users/${handle}/${prop}`), value);
};

export const createUserHandle = (handle, uid, firstName, lastName, email, currentStatus, lastStatus) => {


  return set(ref(db, `users/${handle}`), { handle, uid, firstName, lastName, email, createdOn: new Date(), currentStatus, lastStatus, avatarUrl: DEFAULT_AVATAR_URL })
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

// export const getUsersBySearchTerm = async (searchTerm) => {
//   try {
//     const allUsersSnapshot = await getAllUsers();
//     const allUsers = allUsersSnapshot.val();
//     const usersFilteredBySearchTerm = Object.keys(allUsers).filter((handle) => handle.toLowerCase().includes(searchTerm.toLowerCase()));
//     console.log(usersFilteredBySearchTerm);
//     return usersFilteredBySearchTerm;

//   } catch (error) {
//     console.log(error.message);
//   }

// }

export const changeUserCurrentStatusInDb = (handle, status) => {
  update(ref(db, `users/${handle}`),
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
    const snapshot = await get(ref(db, `users/${handle}/currentStatus`));

    if (!snapshot.exists()) {
      throw new Error(DATABASE_ERROR_MSG);
    }

    return snapshot.val();
  } catch (error) {
    console.log(error.message)
  }

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

}

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
    const avatarUrl = await getUserAvatarByHandle(handle);
    const currentStatus = await getUserStatusByHandle(handle);

    return {
      handle,
      avatarUrl,
      currentStatus,
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