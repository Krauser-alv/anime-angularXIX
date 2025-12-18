import { Component, input, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-poster-card',
  imports: [
    DatePipe
  ],
  templateUrl: './poster-card.component.html',
  styleUrl: './poster-card.component.css'
})

export class PosterCardComponent {
  model = input.required<any>();
  posterUrl!: string;
  imageError = signal(false);

  private readonly apiUrl = environment.apiUrl + 'wp-content/uploads';

  imageApiUrl(uuid: string): string {
    return this.apiUrl + uuid;
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  // Sistema de estrellas basado en rating (0-10 -> 0-5 estrellas)
  stars = computed(() => {
    const rating = parseFloat(this.model().rating || '0');
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
}