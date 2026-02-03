import { Component, input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Episode } from '../../../core/models/episode';
import { environment } from '../../../../environments/environments';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-episode-card',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './episode-card.component.html',
  styleUrls: ['./episode-card.component.css']
})
export class EpisodeCardComponent {
  episode = input.required<Episode>();
  anime = input<any>(null); // Hacer opcional el anime
  imageError = signal(false);
  private router = inject(Router);
  
  private readonly tmdbImageBaseUrl = environment.tmdbImageBaseUrl;

  episodeImage = computed(() => {
    const ep = this.episode();
    if (ep.still_path) {
      return this.tmdbImageBaseUrl + ep.still_path;
    }
    return '';
  });

  episodeTypeLabel = computed(() => {
    const types: { [key: string]: string } = {
      'standard': 'Episodio',
      'finale': 'Final',
      'premiere': 'Estreno',
      'special': 'Especial'
    };
    return types[this.episode().episode_type] || 'Episodio';
  });

  episodeTypeClass = computed(() => {
    const classes: { [key: string]: string } = {
      'standard': 'bg-blue-500',
      'finale': 'bg-red-500',
      'premiere': 'bg-green-500',
      'special': 'bg-purple-500'
    };
    return classes[this.episode().episode_type] || 'bg-gray-500';
  });

  get normalizedRating(): number {
    const rating = parseFloat(this.episode().vote_average || '0');
    return rating / 2; // Convertir de escala 0-10 a 0-5
  }

  get voteCount(): number {
    return parseInt(this.episode().vote_count || '0');
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  navigateToEpisode(): void {
    const episode = this.episode();
    const anime = this.anime();
    
    if (episode) {
      // Si tenemos el anime completo, usar la ruta completa
      if (anime) {
        this.router.navigate(['/anime', anime._id, 'episode', episode._id], {
          state: { anime: anime, episode: episode }
        });
      } else {
        // Si no tenemos el anime, usar la ruta directa con slug del episodio
        if (episode.slug) {
          this.router.navigate(['/episode', episode.slug], {
            state: { episode: episode }
          });
        } else {
          // Fallback usando show_id si existe
          const animeId = episode.show_id || episode._id;
          this.router.navigate(['/anime', animeId, 'episode', episode._id], {
            state: { episode: episode }
          });
        }
      }
    }
  }
}
