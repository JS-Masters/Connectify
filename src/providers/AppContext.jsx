import { createContext } from 'react';

const AppContext = createContext({
  user: null,
  userData: null,
  notifications: [],

  
  setContext() {
    // real implementation comes from App.jsx
  },
  setNotifications() {
     // real implementation comes from App.jsx
  },
});

export default AppContext;