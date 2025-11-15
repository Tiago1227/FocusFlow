import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged, // O "ouvinte" de estado do Firebase
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig'; // Nosso arquivo de configuração

// 1. Criamos o Contexto
const AuthContext = createContext();

// 2. Criamos o "Provedor" do Contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Salva o objeto do usuário, não mais um boolean
  const [loading, setLoading] = useState(true); // Para o app saber se está checando a auth

  // Este efeito roda UMA VEZ quando o app abre
  // O onAuthStateChanged fica "ouvindo" o Firebase em tempo real
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // Define o usuário (ou null se deslogado)
      setLoading(false); // Terminou de carregar
    });

    // Limpa o "ouvinte" ao fechar o app
    return unsubscribe;
  }, []);

  // Função de Login
  const login = (email, password) => {
    // Retorna a promessa para a tela de login poder tratar erros
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Função de Cadastro
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Função de Logout
  const logout = () => {
    return signOut(auth);
  };

  // O valor que o contexto vai "prover" para o app
  const value = {
    user, // O objeto do usuário (ou null)
    isAuthenticated: !!user, // Converte 'user' para um boolean (true se logado, false se null)
    loading, // Para a tela App.js saber se pode renderizar
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Criamos o "Hook" customizado para facilitar o uso
export const useAuth = () => {
  return useContext(AuthContext);
};