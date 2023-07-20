export const fetchDataFromDatabase = async () => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    // Generate fake data
    const fakeData = [];
    const numberOfTopics = Math.floor(Math.random() * 10) + 1; // random number between 1 and 10
  
    for (let i = 0; i < numberOfTopics; i++) {
      fakeData.push({
        id: i,
        image: `https://fakeimg.pl/250x100/?text=Topic${i}&font=lobster`,
        title: `Fake Topic ${i}`,
        text: `This is a description for fake topic ${i}.`,
        likes: {
          '-4': 1,
          '-3': 1,
          '-2': 15,
          '-1': 15,
          '1': 15,
          '2': 15,
          '3': 15,
          '4': 15,
        }
      });
    }
  
    return fakeData;
  }

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
