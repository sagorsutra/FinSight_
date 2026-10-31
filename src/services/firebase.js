// firebase.js — Firebase service initialization
// Replace the firebaseConfig values with your own from Firebase Console

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

// ─── YOUR FIREBASE CONFIG ─────────────────────────────────────────────────────
// Replace these values with your Firebase project config
const firebaseConfig = {
   apiKey: "AIzaSyAYzZWwrF11ee5Yd0zPSjWWmuHRyfe63ps",
  authDomain: "finsight-1a773.firebaseapp.com",
  projectId: "finsight-1a773",
  storageBucket: "finsight-1a773.firebasestorage.app",
  messagingSenderId: "665631822276",
  appId: "1:665631822276:web:e14a203ff58fbb60de9491",
  measurementId: "G-WLMYDZL96K"
};
// ─────────────────────────────────────────────────────────────────────────────

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
export const firebaseSignUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const firebaseSignIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const firebaseSignOut = () => signOut(auth);

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// ─── FIRESTORE HELPERS ────────────────────────────────────────────────────────
export const fsAdd = (collectionPath, data) =>
  addDoc(collection(db, collectionPath), { ...data, createdAt: serverTimestamp() });

export const fsSet = (docPath, data) =>
  setDoc(doc(db, docPath), { ...data, updatedAt: serverTimestamp() }, { merge: true });

export const fsGet = async (docPath) => {
  const snap = await getDoc(doc(db, docPath));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const fsGetCollection = async (collectionPath, ...constraints) => {
  const q = query(collection(db, collectionPath), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const fsUpdate = (docPath, data) =>
  updateDoc(doc(db, docPath), { ...data, updatedAt: serverTimestamp() });

export const fsDelete = (docPath) => deleteDoc(doc(db, docPath));

export const fsListen = (collectionPath, callback, ...constraints) => {
  const q = query(collection(db, collectionPath), ...constraints);
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
};

export { where, orderBy, serverTimestamp };

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
export const uploadFile = async (uri, path) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
};

export const deleteFile = (path) => deleteObject(ref(storage, path));

export default app;
