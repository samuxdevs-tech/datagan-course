import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAUAPg2ASuqoPIj1stTfEJJr_h1hBnY6aU",
  authDomain: "datagan-course.firebaseapp.com",
  databaseURL: "https://datagan-course-default-rtdb.firebaseio.com",
  projectId: "datagan-course",
  storageBucket: "datagan-course.firebasestorage.app",
  messagingSenderId: "367635095384",
  appId: "1:367635095384:web:fe8894d8b16f076275cf2d"
};

// Initialize Firebase (prevent multiple initializations in Next.js dev mode)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;
