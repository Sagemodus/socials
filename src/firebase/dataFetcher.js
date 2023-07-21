// Import necessary Firebase modules for accessing Firestore
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Export the fetchDataFromDatabase function
export const fetchDataFromDatabase = async () => {
  try {
    const firestore = getFirestore();
    const querySnapshot = await getDocs(collection(firestore, 'topics'));

    const topics = querySnapshot.docs.map((doc) => {
      // Assuming each document in the "topics" collection has fields like "image", "title", "text", and "likes"
      const data = doc.data();
      return {
        id: doc.id,
        image: data.image || '', // Provide default values if fields are missing
        title: data.title || '',
        text: data.text || '',
        likes: data.likes || {},
      };
    });

    return topics;
  } catch (error) {
    console.error('Error fetching topics:', error);
    return []; // Return an empty array in case of an error
  }
};
