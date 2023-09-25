
// farben.js


// Definieren der Farben basierend auf den Benutzerprofilen
export function iconColor(farbe) {
  switch (farbe) {
    case '-4':
      return 'dodgerblue'; // Konservatismus
    case '-3':
      return 'cornflowerblue'; // Liberalismus
    case '-2':
      return 'deepskyblue'; // Sozialdemokratie
    case '-1':
      return 'green'; // Grüne/Ökologische Bewegung
    case '1':
      return 'green'; // Libertäre
    case '2':
      return 'goldenrod'; // Nationalisten
    case '3':
      return 'orange'; // Sozialisten/Kommunisten
    case '4':
      return 'green'; // Populisten
    default:
      return 'gray'; // Standardfarbe für unbekannte Parteien
  }
}