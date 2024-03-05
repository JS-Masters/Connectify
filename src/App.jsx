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
import { auth } from "./config/firebase-config";
import { getUserData } from "./services/user.services";
import Chats from "./pages/Chats";
import Calls from "./pages/Calls";
import ChatMessages from "./components/ChatMessages";
import Authenticated from "./hoc/Authenticated";
import Teams from "./pages/Teams";
import LandingPage from "./pages/LandingPage";
import { addUserToCall } from "./services/dyte.services";
import SingleCallRoom from "./components/SingleCallRoom";
import { changeIncomingCallStatus, endCall, listenForIncomingCalls } from "./services/call.services";
import { Button } from "@chakra-ui/react";
import { v4 } from "uuid";
import { ATENDED_STATUS, WAITING_STATUS } from "./common/constants";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="welcome" element={<LandingPage />} />
      <Route path="sign-in" element={<SignIn />} />
      <Route path="sign-up" element={<SignUp />} />
      <Route index element={<Authenticated><Home /></Authenticated>} />
      <Route path="chats" element={<Authenticated><Chats /></Authenticated>} />
      <Route path="calls" element={<Authenticated><Calls /></Authenticated>} />
      <Route path="calls/:id" element={<Authenticated><Calls /></Authenticated>} />
      <Route path="chats/:id" element={<Authenticated><ChatMessages /></Authenticated>} />
      <Route path="teams" element={<Authenticated><Teams /></Authenticated>} />
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
  // const [loadingCall, setLoadingCall] = useState(false);

  useEffect(() => {
    if (user) {
      getUserData(user.uid).then((snapshot) => {
        if (snapshot.exists()) {
          setContext((prevContext) => ({
            ...prevContext,
            user,
            userData: snapshot.val()[Object.keys(snapshot.val())[0]],
          }));
          setUserData(snapshot.val()[Object.keys(snapshot.val())[0]]);
        }
      });
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
              setIncomingCall([...incomingCall, { callId: call.id, dyteRoomId: call.dyteRoomId, caller: call.caller }]);
            })
          } else {
            setIncomingCall([]); // това виж дали да е тук или като else на if (snapshot.exists()) ??!?!?!
          }
          // логиката тук е само ако има 1 обект с обаждане в incomingCalls във Firebase
        } else {
          setIncomingCall([]);
        };
      }, user.uid);

      return () => unsubscribe();
    };
  }, [user]);

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

  const rejectCall = (callId) => {
    // changeIncomingCallStatus(callId, user.uid, DECLINED_STATUS);
    // който звъни да получава банер/нотификация + виж дали има смисъл от горния ред или да се трие направо???

  }

  const leaveCall = async () => {
    // delete the call from incomingCalls
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
      {Boolean(incomingCall.length) && incomingCall.map((call) => {
        return <div key={v4()}>
          <Button onClick={() => joinCall(call.dyteRoomId, call.callId)}>{call.caller} is Calling</Button>

        </div>
      })}
      {incomingToken && joinedCallDyteId &&
        <div style={{ height: '50vh', width: 'auto' }} >
          <SingleCallRoom token={incomingToken} leaveCall={leaveCall} />
        </div >}
    </>
  );
};
export default App;
