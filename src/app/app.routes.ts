import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', loadComponent: () => import('./features/anime/pages/home/home.component').then(m => m.HomeComponent)},
    {path: 'anime/:id', loadComponent: () => import('./features/anime/pages/anime-detail/anime-detail.component').then(m => m.AnimeDetailComponent)},
    {path: '404', loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)},
    {path: '**', redirectTo: '404'}
];