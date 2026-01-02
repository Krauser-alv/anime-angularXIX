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

  navigateToAnime(): void {
    const slug = this.episode().slug;
    if (slug) {
      // Abrir en nueva pestaña
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/anime', slug])
      );
      window.open(url, '_blank');
    }
  }
}
