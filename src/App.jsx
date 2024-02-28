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
import Loading from "./hoc/Loading";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="sign-in" element={<SignIn />} />
      <Route path="sign-up" element={<SignUp />} />
      <Route path="chats" element={<Loading><Chats /></Loading>} />
      <Route path="calls" element={<Calls />} />
      <Route path="chats/:id" element={<ChatMessages />} />
    </Route>
  )
);

const App = () => {
  const [context, setContext] = useState({
    user: null,
    userData: null,
  });

  const [user] = useAuthState(auth);
  useEffect(() => {
    if (user) {
      getUserData(user.uid).then((snapshot) => {
        if (snapshot.exists()) {
          setContext({
            user,
            userData: snapshot.val()[Object.keys(snapshot.val())[0]],
          });
        }
      });
    }
  }, [user]);

  return (
    <>
      <AppContext.Provider value={{ ...context, setContext }}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    </>
  );
};

export default App;
