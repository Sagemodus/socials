/*import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  // ... your config here  apiKey: "AIzaSyDLeI2IiloFAkjAxOHjlYCkpCd9sE8Zynk",
  authDomain: "social-97a77.firebaseapp.com",
  projectId: "social-97a77",
  storageBucket: "social-97a77.appspot.com",
  messagingSenderId: "139606952850",
  appId: "1:139606952850:web:13ba0dd4eaf14770abcf4b"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const fetchDataFromDatabase = async () => {
  const topicsRef = ref(database, 'topics');

  return new Promise((resolve, reject) => {
    onValue(topicsRef, (snapshot) => {
      const data = snapshot.val();
      resolve(Object.values(data));
    }, (error) => {
      console.error('Error fetching data:', error);
      reject(error);
    });
  });
};
*/