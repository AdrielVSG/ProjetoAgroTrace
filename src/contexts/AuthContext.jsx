import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para criar usuário
  const signup = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Atualizar perfil do usuário
      await updateProfile(user, {
        displayName: userData.name
      });

      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: userData.name,
        email: user.email,
        type: userData.type, // 'consumer' ou 'producer'
        location: userData.location || '',
        createdAt: new Date().toISOString(),
        preferences: {
          language: 'pt-BR',
          notifications: true,
          darkMode: false
        }
      });

      toast.success('Conta criada com sucesso!');
      return user;
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast.error('Erro ao criar conta: ' + error.message);
      throw error;
    }
  };

  // Função para fazer login
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login realizado com sucesso!');
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Erro ao fazer login: ' + error.message);
      throw error;
    }
  };

  // Função para fazer logout
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout: ' + error.message);
    }
  };

  // Função para obter dados do usuário do Firestore
  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  };

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Buscar dados adicionais do usuário no Firestore
        const userData = await getUserData(user.uid);
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userData
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    getUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
