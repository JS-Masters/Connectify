import { get, limitToFirst, onValue, orderByChild, push, query, ref, remove, set, update } from "firebase/database"
import { db } from "../config/firebase-config"
import { getUserByHandle } from "./user.services";
import { DATABASE_ERROR_MSG, WAITING_STATUS } from "../common/constants";

export const listenForIncomingCalls = (listenFn, loggedUserUid) => {
  const q = query(
    ref(db, `incomingCalls/${loggedUserUid}`),
    orderByChild('createdOn'),
    limitToFirst(50)
  )
  return onValue(q, listenFn);
};

export const listenForRejectedCalls = (listenFn, loggedUserHandle) => {
  const q = query(
    ref(db, `users/${loggedUserHandle}`),
    limitToFirst(50)
  )
  return onValue(q, listenFn);
};




export const addIncomingCallToDb = async (userToCallHandle, caller, newCallDyteId) => {
  try {
    const userSnapshot = await getUserByHandle(userToCallHandle);
    if (!userSnapshot.exists()) {
      throw new Error(DATABASE_ERROR_MSG)
    }
    const userVal = userSnapshot.val();
    const userId = userVal.uid;

    const callRef = await push(ref(db, `incomingCalls/${userId}`), {});
    const callId = callRef.key;

    await set(ref(db, `incomingCalls/${userId}/${callId}`), {
      id: callId,
      dyteRoomId: newCallDyteId,
      caller: caller,
      createdOn: new Date().toLocaleString(),
      status: WAITING_STATUS
    });

    return newCallDyteId;

  } catch (error) {
    console.log(error.message);
  }
};

export const changeIncomingCallStatus = async (callId, uid, status) => {
  try {
    const callRef = ref(db, `incomingCalls/${uid}/${callId}`);
    await update(callRef, { status: status });
  } catch (error) {
    console.log(error.message);
  }
};


export const createCall = async (madeCall, recievedCall) => {
  try {
    const callRef = await push(ref(db, 'calls'), {});
    const newCallId = callRef.key;

    await set(ref(db, `calls/${newCallId}`), {
      id: newCallId,
      madeCall: madeCall,
      recievedCall: recievedCall,
      createdOn: new Date().toLocaleString(),
    });

    return newCallId;
  } catch (error) {
    console.log(error.message);
  }
};

export const endCall = async (userToCall, dyteRoomId) => {
  try {
    const userSnapshot = await getUserByHandle(userToCall);
    if(!userSnapshot.exists()){
      throw new Error(DATABASE_ERROR_MSG)
    }
    const user = userSnapshot.val()
    const incomingCalls = await getIncomingCallsByUid(user.uid);
    if (incomingCalls) {
      const callId = Object.values(incomingCalls).filter((call) => call.dyteRoomId === dyteRoomId)[0].id;
      await remove(ref(db, `incomingCalls/${user.uid}/${callId}`));
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const getIncomingCallsByUid = async (uid) => {
  try {
    const incomingCallsSnapshot = await get(ref(db, `incomingCalls/${uid}`));
    // if(!incomingCallsSnapshot.exists()) {
    //   throw new Error(DATABASE_ERROR_MSG);
    // };
    if (incomingCallsSnapshot) {
      return incomingCallsSnapshot.val();
    } else {
      return null;
    } 
  } catch (error) {
    console.log(error.message);
  }
};

export const setUserHasRejectedCall = async (userHandle) => {
  try {
    const userRef = ref(db, `users/${userHandle}`);
    await update(userRef, { hasRejectedCall: true });
  } catch (error) {
    console.log(error.message);
  }
};





