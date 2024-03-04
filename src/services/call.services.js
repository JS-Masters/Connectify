import { limitToFirst, onValue, orderByChild, push, query, ref, set, update } from "firebase/database"
import { db } from "../config/firebase-config"
import { getUserByHandle } from "./user.services";

export const listenForIncomingCalls = (listenFn, loggedUserUid) => {
  const q = query(
    ref(db, `incomingCalls/${loggedUserUid}`),
    orderByChild('createdOn'),
    limitToFirst(50)
  )
  return onValue(q, listenFn);
};

export const addIncomingCallToDb = async (userToCallHandle, caller, newCallDyteId) => {
  try {
    const userSnapshot = await getUserByHandle(userToCallHandle);
    if (!userSnapshot.exists()) {
      throw new Error('There was a problem getting data from database')
    };
    const userVal = userSnapshot.val();
    const userId = userVal.uid;

    const callRef = await push(ref(db, `incomingCalls/${userId}`), {});
    const callId = callRef.key;
    
    await set(ref(db, `incomingCalls/${userId}/${callId}`), {
      id: callId,
      dyteRoomId: newCallDyteId,
      caller: caller,
      createdOn: new Date().toLocaleString(),
      status: 'waiting'
    });

    return newCallDyteId;

  } catch (error) {
    console.log(error.message);
  };
};

export const changeIncomingCallStatus = async (callId, uid) => {
  try{
    const callRef = ref(db, `incomingCalls/${uid}/${callId}`);
    await update(callRef, { status: 'attended' });
  } catch(error) {
    console.log(error.message);
  };
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



