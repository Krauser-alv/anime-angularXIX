import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Episode } from '../../../core/models/episode';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-episode-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './episode-card.component.html',
  styleUrls: ['./episode-card.component.css']
})
export class EpisodeCardComponent {
  episode = input.required<Episode>();
  imageError = signal(false);
  
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

  // Sistema de estrellas basado en vote_average (0-10 -> 0-5 estrellas)
  stars = computed(() => {
    const rating = parseFloat(this.episode().vote_average || '0');
    // Convertir de escala 0-10 a 0-5
    const normalizedRating = rating / 2;
    
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return {
      full: Array(fullStars).fill(0),
      half: hasHalfStar ? [0] : [],
      empty: Array(emptyStars).fill(0),
      rating: normalizedRating.toFixed(1)
    };
  });

  onImageError(): void {
    this.imageError.set(true);
  }
}
