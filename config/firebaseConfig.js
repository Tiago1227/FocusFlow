import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAn_-OC8AZO4mX8dCEJxZMqIIb5bkJAQKk",
  authDomain: "focus-flow-461cc.firebaseapp.com",
  projectId: "focus-flow-461cc",
  storageBucket: "focus-flow-461cc.firebasestorage.app",
  messagingSenderId: "288127408964",
  appId: "1:288127408964:web:ae4e6577ea48a0f3df5511",
  measurementId: "G-6QL43P4KXC"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { auth, db };