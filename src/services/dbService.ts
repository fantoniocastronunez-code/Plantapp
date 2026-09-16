import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Plant, PlantLog } from '../types';

const PLANTS_COL = 'plants';
const LOGS_COL = 'logs';

export const addPlant = async (plant: Omit<Plant, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, PLANTS_COL), plant);
  return docRef.id;
};

export const getPlants = async (): Promise<Plant[]> => {
  const q = query(collection(db, PLANTS_COL), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plant));
};

export const getPlant = async (id: string): Promise<Plant | null> => {
  const docRef = doc(db, PLANTS_COL, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Plant;
  }
  return null;
};

export const updatePlant = async (id: string, data: Partial<Plant>): Promise<void> => {
  const docRef = doc(db, PLANTS_COL, id);
  await updateDoc(docRef, data);
};

export const deletePlant = async (id: string): Promise<void> => {
  const docRef = doc(db, PLANTS_COL, id);
  await deleteDoc(docRef);
};

export const addLog = async (log: Omit<PlantLog, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, LOGS_COL), log);
  return docRef.id;
};

export const getLogs = async (plantId: string): Promise<PlantLog[]> => {
  const q = query(collection(db, LOGS_COL), where('plantId', '==', plantId), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlantLog));
};
