import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCK-utXooyG2IsyGztCuJAk9Ba6M0uuWms",
  authDomain: "my-app-cdb56.firebaseapp.com",
  projectId: "my-app-cdb56",
  storageBucket: "my-app-cdb56.appspot.com",
  messagingSenderId: "233745029826",
  appId: "1:233745029826:web:0247488a74d19f18a0b95b",
  measurementId: "G-GZ4SKEF61S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
