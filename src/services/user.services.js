import { get, set, ref, query, equalTo, orderByChild } from 'firebase/database';
import { db } from '../config/firebase-config';

export const getUserByHandle = (handle) => {

  return get(ref(db, `users/${handle}`));
};

export const updateUserByHandle = (handle, prop, value) => {

  return set(ref(db, `users/${handle}/${prop}`), value);
};

export const createUserHandle = (handle, uid, firstName, lastName, email) => {

  return set(ref(db, `users/${handle}`), { handle, uid, firstName, lastName, email, createdOn: new Date() })
};

export const getUserData = (uid) => {

  return get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
};

export const getAllUsers = async () => {
  try {
    const snapshot = await get(ref(db, 'users'));
    if(!snapshot.exists()) {
      throw new Error ('No users in database!');
    }
    return snapshot.val();
  } catch (error) {
    console.log(error.message);
  }
  return null;
};

export const getUsersBySearchTerm = async (searchTerm) => {
  try {
    const allUsersSnapshot = await getAllUsers();
    const allUsers = allUsersSnapshot.val();
    const usersFilteredBySearchTerm = Object.keys(allUsers).filter((handle) => handle.toLowerCase().includes(searchTerm.toLowerCase()));
console.log(usersFilteredBySearchTerm);
    return usersFilteredBySearchTerm;

  } catch (error) {
    console.log(error.message);
  }


}

