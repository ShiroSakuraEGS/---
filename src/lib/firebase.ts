import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use the explicit database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connectivity check as per instructions
async function testConnection() {
  try {
    // Attempting to read a non-existent doc just to test connection
    await getDocFromServer(doc(db, '_internal', 'test'));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase is offline. Please check your network or configuration.");
    } else {
      // Normal permission denied or not found is fine, it means we reached the server
      console.log("Firebase connection test complete.");
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}
