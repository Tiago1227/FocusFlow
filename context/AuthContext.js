// context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged // Importe onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // <--- Mude para currentUser
  const [loading, setLoading] = useState(true);

  // Função para registrar novo usuário
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Função para fazer login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Função para fazer logout
  const logout = () => {
    return signOut(auth);
  };

  // Observa o estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => { // 'user' aqui é o objeto retornado pelo Firebase
      setCurrentUser(user); // <--- ATUALIZA o estado currentUser
      setLoading(false);
    });

    return unsubscribe; // Limpa o listener ao desmontar o componente
  }, []);

  const value = {
    currentUser, // <--- EXPORTE currentUser
    loading,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Renderiza children apenas depois que o estado de autenticação é verificado */}
    </AuthContext.Provider>
  );
};