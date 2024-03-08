import { storage } from "../config/firebase-config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";



export const uploadMessagePhoto = async (listenFn, file, filePath) => {
    const fileRef = ref(storage, filePath);

    return uploadBytes(fileRef, file)
        .then(() => getDownloadURL(fileRef))
        .then((photoURL) => listenFn(photoURL))
        .catch(e => console.error('Error uploading file:', e.message));
}