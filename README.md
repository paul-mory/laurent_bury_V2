# Laurent Bury, traducteur

Refonte du site de [Laurent Bury](https://www.laurentburytraducteur.com), traducteur littéraire depuis plus de trente ans. Le contenu d’origine est conservé : le catalogue, les parutions, le parcours et les travaux de presse. La lecture, elle, change. Près de 280 ouvrages tiennent dans une page que l’on parcourt comme une bibliographie, pas comme une grille de cartes.

Le site public présente le travail. Un espace d’administration permet de tenir la liste des livres à jour, sans toucher au code.

## Fonctionnalités

**Accueil.** Une page d’entrée éditoriale : le mot de bienvenue, le portrait, le volume du catalogue et une étagère des titres les plus récents.

**Catalogue.** Recherche en direct sur le titre, l’auteur, l’éditeur, le genre et la date. Quatre classements :

- par genre, avec un raccourci vers chaque section
- par auteur, filtré sur l’initiale du nom
- par maison d’édition
- par année, avec le même type de sélecteur

Un bouton ramène en haut de page après un long défilement.

**Dernières parutions.** Les titres des quatre dernières années, regroupés par année, du plus récent au plus ancien.

**Travaux de presse.** Collaborations, dossiers d’opéra, textes pour la scène et notices de disques.

**CV et contact.** Parcours, publications et moyens de joindre Laurent Bury.

**Administration.** Connexion, ajout, modification et suppression d’un livre, recherche, tri, et aperçu de la couverture dans son cadre. Sans Firebase, les changements restent dans le navigateur. Une fois le projet branché, le catalogue se publie dans Firestore.

## Technique

| | |
| --- | --- |
| Interface | Angular 21, composants autonomes, signaux |
| Données | Firestore pour le catalogue, fichier local en secours |
| Compte admin | Firebase Authentication |
| Hébergement | Firebase Hosting |
| Intégration | GitHub Actions : build puis déploiement à chaque push sur `main` |

Les règles Firestore ouvrent la lecture à tous et réservent l’écriture au compte administrateur. Les pages publiques gardent les adresses d’origine (`/traduction`, `/dernieres-parutions`, `/travaux-presse`, `/cv-contact`) pour ne pas casser les liens déjà en circulation.

## Lancer le projet

```bash
npm install
npm start
```

Le site s’ouvre sur [http://localhost:4200](http://localhost:4200). Le catalogue de départ est dans `public/data/livres.json`. L’administration est sur `/admin`.

Tant que `src/environments/environment.ts` n’a pas de configuration Firebase, l’admin utilise le mot de passe `localAdminPassword` et n’enregistre rien en ligne.

## Publier

1. Créer un projet Firebase, activer la connexion e-mail / mot de passe, créer l’utilisateur administrateur, puis une base Firestore.
2. Coller la configuration Web dans `src/environments/environment.ts`.
3. Déployer les règles, se connecter à `/admin` et importer les ouvrages.
4. Pour le déploiement automatique : créer un compte de service avec les rôles **Administrateur Firebase Hosting**, **Administrateur Firebase Rules** et **Consommateur Service Usage**, puis enregistrer sa clé JSON dans le secret GitHub `FIREBASE_SERVICE_ACCOUNT`.

Chaque push sur `main` construit l’application et la publie. Les redirections de `firebase.json` renvoient toutes les routes Angular vers `index.html`.
