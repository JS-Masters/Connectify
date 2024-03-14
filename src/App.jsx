import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import "./App.css";
import AppContext from "./providers/AppContext";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { auth, db } from "./config/firebase-config";
import { changeUserCurrentStatusInDb, getUserData } from "./services/user.services";
import Chats from "./pages/Chats";
import Calls from "./pages/Calls";
import ChatMessages from "./components/ChatMessages";
import Authenticated from "./hoc/Authenticated";
import Teams from "./pages/Teams";
import LandingPage from "./pages/LandingPage";
import { addUserToCall } from "./services/dyte.services";
import SingleCallRoom from "./components/SingleCallRoom";
import { changeIncomingCallStatus, endCall, listenForIncomingCalls, listenForRejectedCalls, setUserHasRejectedCall } from "./services/call.services";
import { Button, useToast } from "@chakra-ui/react";
import { v4 } from "uuid";
import { ATENDED_STATUS, WAITING_STATUS, statuses } from "./common/constants";
import { ref, remove } from "firebase/database";
import Calendar from "./pages/Calendar/Calendar";
import { logoutUser } from "./services/auth.service";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="welcome" element={<LandingPage />} />
      <Route path="sign-in" element={<SignIn />} />
      <Route path="sign-up" element={<SignUp />} />
      <Route index element={<Authenticated><Home /></Authenticated>} />
      <Route path="chats" element={<Authenticated><Chats /></Authenticated>} />
      <Route path="chats/:chatId" element={<Authenticated><Chats /></Authenticated>} />
      <Route path="calls" element={<Authenticated><Calls /></Authenticated>} />
      <Route path="calls/:id" element={<Authenticated><Calls /></Authenticated>} />
      <Route path="teams" element={<Authenticated><Teams /></Authenticated>} />
      <Route path="teams/:teamId" element={<Authenticated><Teams /></Authenticated>} />
      <Route path="teams/:teamId/channels/:channelId" element={<Authenticated><Teams /></Authenticated>} />
      <Route path="calendar" element={<Authenticated><Calendar /></Authenticated>} />
    </Route>
  )
);

const App = () => {
  const [context, setContext] = useState({
    user: null,
    userData: null,
    notifications: [],
  });

  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [incomingToken, setIncomingToken] = useState('');
  const [incomingCall, setIncomingCall] = useState([]);
  const [joinedCallDyteId, setJoinedCallDyteId] = useState('');
  const toast = useToast();

  const showToast = (desc, status) => {
    toast({
      title: "Rejected Call",
      description: desc,
      duration: 5000,
      isClosable: true,
      status: status,
      position: "top",
    });
  };

  useEffect(() => {
    if (user) {
      getUserData(user.uid)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const oldUserData =  snapshot.val()[Object.keys(snapshot.val())[0]];
            changeUserCurrentStatusInDb(oldUserData.handle, oldUserData.lastStatus);
          }
        })
        .then(() => getUserData(user.uid))
        .then((snapshot) => {
          if (snapshot.exists()) {
            const currentUserData =
              snapshot.val()[Object.keys(snapshot.val())[0]];

            setContext((prevContext) => ({
              ...prevContext,
              user,
              userData: currentUserData,
            }));
            setUserData(currentUserData);
          }
        })
        .catch((error) => console.log(error.message));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const unsubscribe = listenForIncomingCalls((snapshot) => {
        if (snapshot.exists()) {
          const incomingCalls = snapshot.val();
          const callsWaiting = Object.values(incomingCalls).filter((call) => call.status === WAITING_STATUS);
          if (callsWaiting.length) {
            callsWaiting.map((call) => {
              setIncomingCall([{ callId: call.id, dyteRoomId: call.dyteRoomId, caller: call.caller }]);
            })
          } else {
            setIncomingCall([]);
          }
          // логиката тук е само ако има 1 обект с обаждане в incomingCalls във Firebase
        } else {
          setIncomingCall([]);
        };
      }, user.uid);

      return () => unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (userData) {    
      const unsubscribe = listenForRejectedCalls((snapshot) => {
        if (snapshot.exists()) {
          const userDocument = snapshot.val();
          if ('hasRejectedCall' in userDocument) {
            showToast('Your call was rejected. You may leave the call room', 'info');
            remove(ref(db, `users/${userData.handle}/hasRejectedCall`));
          };
        };
      }, userData.handle);

      return () => unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleTabClose);

    return () => window.removeEventListener('beforeunload', handleTabClose);
  }, [userData]);

  const handleTabClose = async () => {
    try {
      await logoutUser(); 
      await changeUserCurrentStatusInDb(userData.handle, statuses.offline);
      setContext({ user: null, userData: null });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const setNotifications = (notifications) => {
    setContext((prevContext) => ({
      ...prevContext,
      notifications,
    }));
  };

  const joinCall = (dyteRoomId, callId) => {
    addUserToCall((data) => setIncomingToken(data), userData, dyteRoomId);
    changeIncomingCallStatus(callId, user.uid, ATENDED_STATUS);
    setJoinedCallDyteId(dyteRoomId);
  };

  const rejectCall = async (callId, callerHandle) => {
    try {
      await remove(ref(db, `incomingCalls/${userData.uid}/${callId}`));
      await setUserHasRejectedCall(callerHandle);
      setIncomingCall([]);
    } catch (error) {
      console.log(error.message);
    };
  };

  const leaveCall = async () => {
    try {
      await endCall(userData.handle, joinedCallDyteId);
    } catch (error) {
      console.log(error.message);
    };
    setIncomingToken('');
    setJoinedCallDyteId('');
  };

  return (
    <>
      <AppContext.Provider value={{ ...context, setContext, setNotifications }}>
        <RouterProvider router={router} />
      </AppContext.Provider>
      {Boolean(incomingCall.length) && incomingCall.map((call) => { // ако има статус за in a meeting този мап също не е необходим !??
        return <div key={v4()}>
          <h3>{call.caller} is Calling</h3>
          <Button onClick={() => joinCall(call.dyteRoomId, call.callId)}>ANSWER</Button>
          <Button onClick={() => rejectCall(call.callId, call.caller)}>REJCET</Button>
        </div>
      })}
      {incomingToken &&
        <div style={{ height: '50vh', width: 'auto' }} >
          <SingleCallRoom token={incomingToken} leaveCall={leaveCall} />
        </div >}
    </>
  );
};
export default App;
