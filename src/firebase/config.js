// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🚨 IMPORTANTE: Substitua estas configurações pelas suas chaves reais do Firebase
const firebaseConfig = {


  apiKey: "AIzaSyAM487UestZZHuCvNfpmI2QFcQyt03u2D4",


  authDomain: "agrotrace-59774.firebaseapp.com",


  projectId: "agrotrace-59774",


  storageBucket: "agrotrace-59774.firebasestorage.app",


  messagingSenderId: "277999240461",


  appId: "1:277999240461:web:fa502a4f2710735a189c44",


  measurementId: "G-LS3RMJ7Q37"


};


// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
