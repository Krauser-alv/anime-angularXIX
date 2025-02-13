import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', loadComponent: () => import('./features/anime/pages/home/home.component').then(m => m.HomeComponent)},
    {path: '404', loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)},
    {path: '**', redirectTo: '404'}
];