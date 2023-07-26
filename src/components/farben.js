
// farben.js

// Definieren der Farben basierend auf den Benutzerprofilen
// Definieren der Farben basierend auf den Benutzerprofilen
export const iconColor = (party) => {
    switch (party) {
      case '-4':
        return 'dodgerblue'; // Konservatismus
      case '-3':
        return 'cornflowerblue'; // Liberalismus
      case '-2':
        return 'deepskyblue'; // Sozialdemokratie
      case '-1':
        return 'skyblue'; // Grüne/Ökologische Bewegung
      case '1':
        return 'gold'; // Libertäre
      case '2':
        return 'goldenrod'; // Nationalisten
      case '3':
        return 'orange'; // Sozialisten/Kommunisten
      case '4':
        return 'red'; // Populisten
      default:
        return 'gray'; // Standardfarbe für unbekannte Parteien
    }
  };
  