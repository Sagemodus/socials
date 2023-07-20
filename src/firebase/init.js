import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDLeI2IiloFAkjAxOHjlYCkpCd9sE8Zynk",
  authDomain: "social-97a77.firebaseapp.com",
  projectId: "social-97a77",
  storageBucket: "social-97a77.appspot.com",
  messagingSenderId: "139606952850",
  appId: "1:139606952850:web:13ba0dd4eaf14770abcf4b"
};

initializeApp(firebaseConfig)

  const db = getFirestore()
  export default db