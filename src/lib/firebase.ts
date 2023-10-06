// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { get } from 'http';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'notion-ai-42bbc.firebaseapp.com',
  projectId: 'notion-ai-42bbc',
  storageBucket: 'notion-ai-42bbc.appspot.com',
  messagingSenderId: '22564462065',
  appId: '1:22564462065:web:9dcb482b9f61e276977850',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);


// Function to upload to firebase
export async function uploadToFirebase(image_url:string, name: string) {
  try {
    const response = await fetch(image_url); //fetch the image
    const buffer = await response.arrayBuffer(); //convert to buffer
    const file_name = name.replace(' ', '') + Date.now +'.jpeg' //create a file name
    const storageRef = ref(storage, file_name); //create a reference to the file
    // upload the image to firebase
    await uploadBytes(storageRef, buffer, {
      contentType: 'image/jpeg',
    }); //buffer contains image

    // create a download url for firebase
    const firebase_url = await getDownloadURL(storageRef);
    // return the url
    return firebase_url;

  } catch (error) {
    console.log(error);
        
  }
}