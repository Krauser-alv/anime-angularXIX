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
        this.episodes.set(response.data);
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      this.isLoadingEpisodes.set(false);
    }
  }

  getEpisodesBySeason(season: number): Episode[] {
    return this.episodes().filter(ep => ep.season_number === season);
  }

  get availableSeasons(): number[] {
    const seasons = new Set(this.episodes().map(ep => ep.season_number));
    return Array.from(seasons).sort((a, b) => a - b);
  }

  selectSeason(season: number): void {
    this.selectedSeason.set(season);
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
}
