import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase-config';

export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const changeEmail = () => {

  const auth = getAuth();
  const user = auth.currentUser;

  user.updateEmail("newemail@example.com")
    .then(() => {
      // Email updated!
    })
    .catch((error) => {
      // An error occurred
    });
}