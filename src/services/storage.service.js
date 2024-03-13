import { storage } from "../config/firebase-config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";



export const uploadMessageFile = async (listenFn, file, filePath) => {
    const fileRef = ref(storage, filePath);

    return uploadBytes(fileRef, file)
        .then(() => getDownloadURL(fileRef))
        .then((fileUrl) => listenFn(fileUrl))
        .catch(e => console.error('Error uploading file:', e.message));
}


export const getFileNameAndExtension = (url) => {

    const urlParts = url.split('/');

    if (urlParts[2].includes('giphy.com')) {
        return [null, 'gif'];
    }

    const fileNameParts = urlParts[urlParts.length - 1].split('%2F');
    const fileName = fileNameParts[fileNameParts.length - 1].slice(0, fileNameParts[fileNameParts.length - 1].indexOf('?'));
    const fileExtension = fileName.slice(fileName.lastIndexOf('.') + 1);

    return [fileName, fileExtension];
};
