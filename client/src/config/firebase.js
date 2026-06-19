import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const defaultFirebaseConfig = {
  apiKey: "AIzaSyD0ejbMwlR2QCA5v-gUxCt90FAUpj79BAE",
  authDomain: "routeraksha-07.firebaseapp.com",
  projectId: "routeraksha-07",
  storageBucket: "routeraksha-07.firebasestorage.app",
  messagingSenderId: "922637247548",
  appId: "1:922637247548:web:2cac70dd524577d2674f39",
  measurementId: "G-05K7PGTBH3",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultFirebaseConfig.measurementId,
};

const requiredFirebaseConfigKeys = ["apiKey", "authDomain", "projectId", "appId"];

function hasFirebaseConfig() {
  return requiredFirebaseConfigKeys.every((key) => Boolean(firebaseConfig[key]));
}

const app = hasFirebaseConfig() ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export { auth, googleProvider, hasFirebaseConfig };
