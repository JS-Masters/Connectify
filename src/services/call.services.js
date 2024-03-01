import { limitToFirst, onValue, orderByChild, push, query, ref, set } from "firebase/database"
import { db } from "../config/firebase-config"
import { updateUserByHandle } from "./user.services";

// const addCallToUserThatCalled = async (userHandle, newCallId) => {
//   await updateUserByHandle(userHandle, 'calls', {
//     [newCallId]: {
//       outgoing: true,
//       createdOn: new Date().toLocaleString()
//     }
//   });
// };
export const getIncomingCalls = (listenFn, userHandle) => {
  const q = query(
    ref(db, `users/${userHandle}/incomingCalls`),
    orderByChild('createdOn'),
    limitToFirst(50)
  )
  return onValue(q, listenFn);

};

export const addCallToUserThatRecieve = async (userHandle, caller, newCallDyteId) => {
  await updateUserByHandle(userHandle, 'incomingCalls', {
    [newCallDyteId]: {
      incoming: true,
      caller: caller,
      createdOn: new Date().toLocaleString()
    }
  });
  return newCallDyteId;
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

    // await addCallToUserThatCalled(madeCall, newCallId);
    // await addCallToUserThatRecieved(recievedCall, newCallId);

    return newCallId;
  } catch (error) {
    console.log(error.message);
  }
};



