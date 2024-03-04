import { limitToFirst, onValue, orderByChild, push, query, ref, set, update } from "firebase/database"
import { db } from "../config/firebase-config"
import { getUserByHandle, updateUserByHandle } from "./user.services";

// const addCallToUserThatCalled = async (userHandle, newCallId) => {
//   await updateUserByHandle(userHandle, 'calls', {
//     [newCallId]: {
//       outgoing: true,
//       createdOn: new Date().toLocaleString()
//     }
//   });
// };
export const listenForIncomingCalls = (listenFn, loggedUserUid) => {
  const q = query(
    ref(db, `incomingCalls/${loggedUserUid}`),
    orderByChild('createdOn'),
    limitToFirst(50)
  )
  return onValue(q, listenFn);

};

export const addIncomingCallToDb = async (userToCallHandle, caller, newCallDyteId) => {
  // const incomingCallRef = await push(ref(db, `incomingCalls/${userHandle}`), {});
  // const incomingCallId = incomingCallRef.key;
  try {
    const userSnapshot = await getUserByHandle(userToCallHandle);
    if (!userSnapshot.exists()) {
      throw new Error('There was a problem getting data from database')
    }
    const userVal = userSnapshot.val();
    const userId = userVal.uid;
    // console.log(userId);

    const callRef = await push(ref(db, `incomingCalls/${userId}`), {});
    const callId = callRef.key;
    
    // Use set to create or update the document (node)
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

export const getIncomingCallsByUid = async (uid) => {
  try {
    const incomingCallsSnapshot = await get(ref(db, `incomingCalls/${uid}`));
    if (!incomingCallsSnapshot.exists()) {
      throw new Error('User does not have incoming calls');
    };
    const incomingCallsVal = incomingCallsSnapshot.val();
    return Object.values(incomingCallsVal);
  } catch (error) {
    console.log(error.message);
  };
};


export const changeIncomingCallStatus = async (callId, uid) => {
  // const currentCallRoom = await getIncomingCallsByUid(uid).filter((call) => call.callId === callId);
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



