import { Routes } from '@angular/router';
import { AdminPage } from './pages/admin/admin';
import { CataloguePage } from './pages/catalogue/catalogue';
import { CvPage } from './pages/cv/cv';
import { HomePage } from './pages/home/home';
import { ParutionsPage } from './pages/parutions/parutions';
import { PressePage } from './pages/presse/presse';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    title: 'Laurent Bury, traducteur',
    data: {
      description:
        'Bienvenue sur le site de Laurent Bury, traducteur littéraire depuis plus de trente ans. Traductions, dernières parutions, CV et contact.',
    },
  },
  {
    path: 'traduction',
    component: CataloguePage,
    title: 'Traductions | Laurent Bury',
    data: {
      description:
        'Les traductions de Laurent Bury, classées par genre, auteur, maison d’édition ou date.',
    },
  },
  {
    path: 'dernieres-parutions',
    component: ParutionsPage,
    title: 'Dernières parutions | Laurent Bury',
    data: {
      description: 'Les derniers titres traduits par Laurent Bury, parus ou à paraître.',
    },
  },
  {
    path: 'travaux-presse',
    component: PressePage,
    title: 'Travaux de presse | Laurent Bury',
    data: {
      description:
        'Critiques, dossiers de presse et traductions de Laurent Bury pour l’opéra, la presse et le disque.',
    },
  },
  {
    path: 'cv-contact',
    component: CvPage,
    title: 'CV / Contact | Laurent Bury',
    data: {
      description: 'Parcours, publications et moyens de contacter Laurent Bury, traducteur.',
    },
  },
  {
    path: 'admin',
    component: AdminPage,
    title: 'Administration | Laurent Bury',
    data: { description: 'Gestion de la liste des traductions.' },
  },
  { path: '**', redirectTo: '' },
];
