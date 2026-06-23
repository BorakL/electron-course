import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfQIzqRXpb4lPbkVP6ZYc99Wx_jFK2-MQ",
  authDomain: "logistika-d5518.firebaseapp.com",
  projectId: "logistika-d5518",
  storageBucket: "logistika-d5518.firebasestorage.app",
  messagingSenderId: "777930546629",
  appId: "1:777930546629:web:87f516eb8ae513373fffac"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);