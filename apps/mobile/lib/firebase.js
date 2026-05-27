import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRRrxn7frClwP74O8aMvA-tFR1i7rQNuI",
  authDomain: "jarly-747ff.firebaseapp.com",
  projectId: "jarly-747ff",
  storageBucket: "jarly-747ff.firebasestorage.app",
  messagingSenderId: "826117122705",
  appId: "1:826117122705:ios:65007f6431e395f60aad30",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
