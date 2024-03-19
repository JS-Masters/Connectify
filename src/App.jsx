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
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp";
import { auth, db } from "./config/firebase-config";
import {
  changeUserCurrentStatusInDb,
  getUserData,
  getUserLastStatusByHandle,
} from "./services/user.services";
import Chats from "./pages/Chats";
import Calls from "./pages/Calls/Calls";
import ChatMessages from "./components/ChatMessages/ChatMessages";
import Authenticated from "./hoc/Authenticated";
import Teams from "./pages/Teams/Teams";
import LandingPage from "./pages/LandingPage/LandingPage";
import { addUserToCall } from "./services/dyte.services";
import SingleCallRoom from "./components/SingleCallRoom";
import {
  changeIncomingCallStatus,
  endCall,
  listenForIncomingCalls,
  listenForRejectedCalls,
  setUserHasRejectedCall,
} from "./services/call.services";
import { Box, Button, Flex, HStack, useToast } from "@chakra-ui/react";
import { v4 } from "uuid";
import { ATENDED_STATUS, WAITING_STATUS, statuses } from "./common/constants";
import { ref, remove } from "firebase/database";
import Calendar from "./pages/Calendar/Calendar";
import { logoutUser } from "./services/auth.service";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="sign-in" element={<SignIn />} />
      <Route path="sign-up" element={<SignUp />} />
      <Route
        path="chats"
        element={
          <Authenticated>
            <Chats />
          </Authenticated>
        }
      />
      <Route
        path="chats/:chatId"
        element={
          <Authenticated>
            <Chats />
          </Authenticated>
        }
      />
      <Route
        path="calls"
        element={
          <Authenticated>
            <Calls />
          </Authenticated>
        }
      />
      {/* <Route path="calls/:id" element={<Authenticated><Calls /></Authenticated>} /> */}
      <Route
        path="teams"
        element={
          <Authenticated>
            <Teams />
          </Authenticated>
        }
      />
      <Route
        path="teams/:teamId"
        element={
          <Authenticated>
            <Teams />
          </Authenticated>
        }
      />
      <Route
        path="teams/:teamId/channels/:chatId"
        element={
          <Authenticated>
            <Teams />
          </Authenticated>
        }
      />
      <Route
        path="calendar"
        element={
          <Authenticated>
            <Calendar />
          </Authenticated>
        }
      />
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
  const [incomingToken, setIncomingToken] = useState("");
  const [incomingCall, setIncomingCall] = useState([]);
  const [joinedCallDyteId, setJoinedCallDyteId] = useState("");
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
            const oldUserData = snapshot.val()[Object.keys(snapshot.val())[0]];
            changeUserCurrentStatusInDb(
              oldUserData.handle,
              oldUserData.lastStatus
            );
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
          const callsWaiting = Object.values(incomingCalls).filter(
            (call) => call.status === WAITING_STATUS
          );
          if (callsWaiting.length > 0) {
            callsWaiting.map((call) => {
              setIncomingCall([
                {
                  callId: call.id,
                  dyteRoomId: call.dyteRoomId,
                  caller: call.caller,
                },
              ]);
            });
          } else {
            setIncomingCall([]);
          }
          // логиката тук е само ако има 1 обект с обаждане в incomingCalls във Firebase
        } else {
          setIncomingCall([]);
        }
      }, user.uid);

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (userData) {
      const unsubscribe = listenForRejectedCalls((snapshot) => {
        if (snapshot.exists()) {
          const userDocument = snapshot.val();
          if ("hasRejectedCall" in userDocument) {
            showToast(
              "Your call was rejected. You may leave the call room",
              "info"
            );
            remove(ref(db, `users/${userData.handle}/hasRejectedCall`));
          }
        }
      }, userData.handle);

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    window.addEventListener("beforeunload", handleTabClose);

    return () => window.removeEventListener("beforeunload", handleTabClose);
  }, []);

  const handleTabClose = async () => {
    try {
      await logoutUser();
      await changeUserCurrentStatusInDb(userData.handle, statuses.offline);
      // setContext({ user: null, userData: null });
    } catch (error) {
      console.error("Error updating user status:", error);
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
    }
  };

  const leaveCall = () => {
    endCall(userData, joinedCallDyteId)
      .then(() => getUserLastStatusByHandle(userData.handle))
      .then((previousStatus) => {
        changeUserCurrentStatusInDb(userData.handle, previousStatus);
      })
      .then(() => {
        setIncomingToken("");
        setJoinedCallDyteId("");
      })
      .catch((error) => console.log(error.message));
  };

  return (
    <Box position="relative">
      <AppContext.Provider value={{ ...context, setContext, setNotifications }}>
        <RouterProvider router={router} />
      </AppContext.Provider>
      {Boolean(incomingCall.length) && (
        <Box id="incoming-call-box">
          {incomingCall.map((call) => (
            <Box key={v4()}>
              <h3 style={{ fontSize: '25px', marginBottom:'13px' }}>{call.caller} is calling...</h3>
              <HStack justifyContent='space-around'>
                <img className="incoming-call-buttons" src="/answer-call.png" onClick={() => joinCall(call.dyteRoomId, call.callId)} />
                <img className="incoming-call-buttons" src="/reject-call.png" onClick={() => rejectCall(call.callId, call.caller)}  />
              </HStack>
            </Box>
          ))}
        </Box>
      )}





      {incomingToken && (
        <div style={{
          height: "50vh",
          width: "74%",
          marginLeft: '13%',
          marginTop: '5%',
          position: "absolute",
          zIndex: "20",
          top: '0'
        }}>
          <SingleCallRoom token={incomingToken} leaveCall={leaveCall} />
        </div>
      )}
    </Box>
  );
};
export default App;
