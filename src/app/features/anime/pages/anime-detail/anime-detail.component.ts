import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimesService } from '../../../../core/services/animes.service';
import { AnimeSlider } from '../../../../core/models/anime-slider';
import { Episode } from '../../../../core/models/episode';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';
import { NeonLoaderComponent } from '../../../../shared/components/neon-loader/neon-loader.component';
import { environment } from '../../../../../environments/environments';

@Component({
  selector: 'app-anime-detail',
  standalone: true,
  imports: [CommonModule, StarRatingComponent, NeonLoaderComponent],
  templateUrl: './anime-detail.component.html',
  styleUrls: ['./anime-detail.component.css']
})
export class AnimeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private animeService = inject(AnimesService);

  private readonly apiUrl = environment.apiUrl + 'wp-content/uploads';
  private readonly tmdbImageUrl = 'https://image.tmdb.org/t/p/w500';

  anime = signal<AnimeSlider | null>(null);
  episodes = signal<Episode[]>([]);
  isLoading = signal(true);
  isLoadingEpisodes = signal(true);
  selectedSeason = signal(1);
  isGalleryExpanded = signal(false);
  expandedEpisodes = signal<Set<number>>(new Set());
  isOverviewExpanded = signal(false);
  watchedEpisodes = signal<Set<number>>(new Set());
  currentPage = signal(1);
  episodesPerPage = 10;
  Math = Math; // Para usar Math en el template

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Obtener el anime del state de navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || window.history.state;
    
    if (state && state['anime']) {
      this.anime.set(state['anime']);
      console.log('Anime recibido del state:', this.anime());
      
      // Cargar episodios con el ID
      if (id) {
        this.loadEpisodes(id);
      }
      this.isLoading.set(false);
    } else {
      // Si no hay state, intentar cargar por slug desde la URL
      const slug = this.route.snapshot.paramMap.get('id');
      if (slug) {
        this.loadAnimeBySlug(slug);
      }
    }
  }

  async loadAnimeBySlug(slug: string): Promise<void> {
    try {
      this.isLoading.set(true);
      // Usar el endpoint correcto para obtener anime por slug
      const response: any = await this.animeService.getAnimeBySlug(slug, 'animes');
      if (response && response.data) {
        this.anime.set(response.data);
        const postId = this.anime()?._id.toString();
        if (postId) {
          await this.loadEpisodes(postId);
        }
      }
    } catch (error) {
      console.error('Error loading anime by slug:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadEpisodes(postId: string): Promise<void> {
    try {
      this.isLoadingEpisodes.set(true);
      const response: any = await this.animeService.getEpisodes(postId);
      if (response && response.data) {
        // Ordenar episodios correctamente por temporada y número de episodio
        const sortedEpisodes = response.data.sort((a: Episode, b: Episode) => {
          // Primero ordenar por temporada
          if (a.season_number !== b.season_number) {
            return a.season_number - b.season_number;
          }
          // Luego por número de episodio dentro de la temporada
          return a.episode_number - b.episode_number;
        });
        
        this.episodes.set(sortedEpisodes);
        // Cargar episodios vistos desde el caché
        this.loadWatchedEpisodes(postId);
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      this.isLoadingEpisodes.set(false);
    }
  }

  loadWatchedEpisodes(animeId: string): void {
    const cacheKey = `watched_episodes_${animeId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const watchedIds = JSON.parse(cached);
        this.watchedEpisodes.set(new Set(watchedIds));
      } catch (error) {
        console.error('Error loading watched episodes from cache:', error);
      }
    }
  }

  saveWatchedEpisodes(animeId: string): void {
    const cacheKey = `watched_episodes_${animeId}`;
    const watchedArray = Array.from(this.watchedEpisodes());
    localStorage.setItem(cacheKey, JSON.stringify(watchedArray));
  }

  toggleWatchedEpisode(episodeId: number): void {
    const animeId = this.anime()?._id.toString();
    if (!animeId) return;

    const watched = this.watchedEpisodes();
    const newWatched = new Set(watched);
    
    if (newWatched.has(episodeId)) {
      newWatched.delete(episodeId);
    } else {
      newWatched.add(episodeId);
    }
    
    this.watchedEpisodes.set(newWatched);
    this.saveWatchedEpisodes(animeId);
  }

  isEpisodeWatched(episodeId: number): boolean {
    return this.watchedEpisodes().has(episodeId);
  }

  getEpisodesBySeason(season: number): Episode[] {
    const seasonEpisodes = this.episodes().filter(ep => ep.season_number === season);
    // Asegurar que estén ordenados por número de episodio dentro de la temporada
    return seasonEpisodes.sort((a, b) => a.episode_number - b.episode_number);
  }

  getPaginatedEpisodes(season: number): Episode[] {
    const seasonEpisodes = this.getEpisodesBySeason(season);
    const startIndex = (this.currentPage() - 1) * this.episodesPerPage;
    const endIndex = startIndex + this.episodesPerPage;
    return seasonEpisodes.slice(startIndex, endIndex);
  }

  getTotalPages(season: number): number {
    const seasonEpisodes = this.getEpisodesBySeason(season);
    return Math.ceil(seasonEpisodes.length / this.episodesPerPage);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  goToNextPage(): void {
    const totalPages = this.getTotalPages(this.selectedSeason());
    if (this.currentPage() < totalPages) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  getPageNumbers(season: number): number[] {
    const totalPages = this.getTotalPages(season);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  get availableSeasons(): number[] {
    const seasons = new Set(this.episodes().map(ep => ep.season_number));
    return Array.from(seasons).sort((a, b) => a - b);
  }

  selectSeason(season: number): void {
    this.selectedSeason.set(season);
    this.currentPage.set(1); // Resetear a la primera página al cambiar de temporada
  }

  parseFloat(value: string): number {
    return parseFloat(value) || 0;
  }

  parseInt(value: string): number {
    return parseInt(value) || 0;
  }

  imageApiUrl(path: string): string {
    if (!path) return '';
    // Limpiar las barras escapadas (\/) y asegurar que no haya doble barra
    const cleanPath = path.replace(/\\/g, '').replace(/^\/+/, '');
    return this.apiUrl + '/' + cleanPath;
  }

  episodeImageUrl(path: string): string {
    if (!path) return '';
    // Limpiar las barras escapadas y construir URL de TMDB
    const cleanPath = path.replace(/\\/g, '');
    return this.tmdbImageUrl + cleanPath;
  }

  get galleryImages(): string[] {
    const gallery = this.anime()?.gallery;
    if (!gallery) return [];
    // Dividir por saltos de línea y limpiar
    return gallery
      .split('\n')
      .map(path => path.trim())
      .filter(path => path.length > 0)
      .map(path => this.tmdbImageUrl + path);
  }

  get currentRating(): number {
    const rating = this.anime()?.rating;
    return rating ? parseFloat(rating) / 2 : 0; // Convertir de 0-10 a 0-5
  }

  get totalVotes(): number {
    const votes = this.anime()?.vote_count;
    return votes ? parseInt(votes) : 0;
  }

  toggleGallery(): void {
    this.isGalleryExpanded.set(!this.isGalleryExpanded());
  }

  toggleEpisodeOverview(episodeId: number): void {
    const expanded = this.expandedEpisodes();
    const newExpanded = new Set(expanded);
    
    if (newExpanded.has(episodeId)) {
      newExpanded.delete(episodeId);
    } else {
      newExpanded.add(episodeId);
    }
    
    this.expandedEpisodes.set(newExpanded);
  }

  isEpisodeExpanded(episodeId: number): boolean {
    return this.expandedEpisodes().has(episodeId);
  }

  toggleOverview(): void {
    this.isOverviewExpanded.set(!this.isOverviewExpanded());
  }

  navigateToEpisode(episode: Episode): void {
    const anime = this.anime();
    if (anime) {
      // Marcar episodio como visto al hacer clic
      this.toggleWatchedEpisode(episode._id);
      
      this.router.navigate(['/anime', anime._id, 'episode', episode._id], {
        state: { anime: anime, episode: episode }
      });
    }
  }

  formatLastUpdate(dateString: string): string {
    if (!dateString) return '';
    
    // Extraer solo la fecha (YYYY-MM-DD) sin la hora
    const datePart = dateString.split(' ')[0];
    
    try {
      const date = new Date(datePart);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return datePart; // Devolver la fecha original si hay error
    }
  }
}
