import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', loadComponent: () => import('./features/anime/pages/home/home.component').then(m => m.HomeComponent)},
];