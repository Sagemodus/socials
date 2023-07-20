// dataFetcher.js
import firebase from 'firebase/app';
import 'firebase/database';
import firebaseConfig from '../path/to/firebaseConfig.js';

// Initialisierung der Firebase-App
firebase.initializeApp(firebaseConfig);

export function fetchDataFromDatabase() {
  const database = firebase.database();
  const topicsRef = database.ref('topics');

  return topicsRef.once('value')
    .then(snapshot => {
      const data = snapshot.val();
      return Object.values(data);
    })
    .catch(error => {
      console.error('Fehler beim Abrufen der Daten:', error);
      throw error;
    });
}
