// FocusFlow/config/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Importações corretas para Auth com persistência
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// COLE SUAS CREDENCIAIS DO FIREBASE AQUI
const firebaseConfig = {
  apiKey: "AIzaSyAn_-OC8AZO4mX8dCEJxZMqIIb5bkJAQKk",
  authDomain: "focus-flow-461cc.firebaseapp.com",
  projectId: "focus-flow-461cc",
  storageBucket: "focus-flow-461cc.firebasestorage.app",
  messagingSenderId: "288127408964",
  appId: "1:288127408964:web:ae4e6577ea48a0f3df5511",
  measurementId: "G-6QL43P4KXC"
};

// Inicializa o Firebase App
const app = initializeApp(firebaseConfig);

// Inicializa Auth com persistência no AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Inicializa o Firestore
const db = getFirestore(app);

export { auth, db };