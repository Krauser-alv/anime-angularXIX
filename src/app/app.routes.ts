import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', loadComponent: () => import('./features/anime/pages/home/home.component').then(m => m.HomeComponent)},
    {path: 'directory', loadComponent: () => import('./features/anime/pages/directory/directory.component').then(m => m.DirectoryComponent)},
    {path: 'anime/:id', loadComponent: () => import('./features/anime/pages/anime-detail/anime-detail.component').then(m => m.AnimeDetailComponent)},
    {path: 'anime/:animeId/episode/:episodeId', loadComponent: () => import('./features/anime/pages/episode-watch/episode-watch.component').then(m => m.EpisodeWatchComponent)},
    {path: 'episode/:episodeSlug', loadComponent: () => import('./features/anime/pages/episode-watch/episode-watch.component').then(m => m.EpisodeWatchComponent)},
    {path: '404', loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)},
    {path: '**', redirectTo: '404'}
];