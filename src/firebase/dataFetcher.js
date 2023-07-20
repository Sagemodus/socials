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