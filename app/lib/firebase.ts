import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || 'AIzaSyAOkTH9SsVS5I-2mZ3bqgG5AfwaGbUz0LY',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        || 'shaimaa-portfolio.firebaseapp.com',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         || 'shaimaa-portfolio',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     || 'shaimaa-portfolio.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID|| '84481013515',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             || '1:84481013515:web:ae10a010d663753430940e',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);