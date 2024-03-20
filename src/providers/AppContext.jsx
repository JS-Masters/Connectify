import { createContext } from 'react';

const AppContext = createContext({
  user: null,
  userData: null,
  notifications: [],
  setContext() {

  },
  setNotifications() {

  },
});

export default AppContext;