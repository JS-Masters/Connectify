import { limitToFirst, onValue, orderByChild, push, query, ref, set } from "firebase/database"
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
export const getIncomingCalls = (listenFn, loggedUserUid) => {
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

    await set(ref(db, `incomingCalls/${userId}`), {
      dyteRoomId: newCallDyteId,
      caller: caller,
      createdOn: new Date().toLocaleString()
    });
    return newCallDyteId;
  } catch (error) {
    console.log(error.message);
  }

  // await updateUserByHandle(userHandle, 'incomingCalls', {
  //   [newCallDyteId]: {
  //     // incoming: true,
  //     caller: caller,
  //     createdOn: new Date().toLocaleString()
  //   }
  // });
  // return newCallDyteId;
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



