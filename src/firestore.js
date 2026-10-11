import { getFirestore } from "firebase/firestore";
import app from "./firebase";

// Initialize Cloud Firestore
const db = getFirestore(app);

export { db };
export default db;