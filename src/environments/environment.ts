/**
 * Firebase est optionnel tant que ces champs sont vides :
 * le site affiche le catalogue embarqué, et l’admin enregistre
 * les modifications dans le navigateur.
 *
 * Pour publier les ouvrages en ligne :
 * 1. Créer un projet sur https://console.firebase.google.com
 * 2. Authentication → Sign-in method → activer E-mail/Mot de passe, puis créer un utilisateur
 * 3. Firestore Database → créer une base en mode production
 * 4. Coller la config Web de l’application ci-dessous
 * 5. Déployer les règles : `npx firebase-tools deploy --only firestore:rules`
 * 6. Se connecter à /admin et cliquer sur « Importer les ouvrages »
 *
 * `localAdminPassword` n’est utilisé que lorsque Firebase n’est pas configuré.
 */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const environment = {
  production: false,
  localAdminPassword: 'atelier',
  firebase: {
    apiKey: "AIzaSyB4Kz6Opzinrca-wCeEOAdyr5eYNoNZ3Ho",
    authDomain: "laurentburytraducteur.firebaseapp.com",
    projectId: "laurentburytraducteur",
    storageBucket: "laurentburytraducteur.firebasestorage.app",
    messagingSenderId: "708512609012",
    appId: "1:708512609012:web:9010da5d4f86c61328a4a1",
    measurementId: "G-VCKZ5GBKRV"
  } satisfies FirebaseWebConfig,
};

export function isFirebaseConfigured(): boolean {
  const { apiKey, projectId } = environment.firebase;
  return Boolean(apiKey && projectId);
}
