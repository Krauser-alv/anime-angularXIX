import { Component, input, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environments';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-poster-card',
  imports: [
    DatePipe,
    StarRatingComponent
  ],
  templateUrl: './poster-card.component.html',
  styleUrl: './poster-card.component.css'
})

export class PosterCardComponent {
  model = input.required<any>();
  posterUrl!: string;
  imageError = signal(false);
  private router = inject(Router);

  private readonly apiUrl = environment.apiUrl + 'wp-content/uploads';

  imageApiUrl(uuid: string): string {
    return this.apiUrl + uuid;
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  navigateToDetail(): void {
    const slug = this.model().slug;
    if (slug) {
      // Abrir en nueva pestaña
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/anime', slug])
      );
      window.open(url, '_blank');
    }
  }

  get normalizedRating(): number {
    const rating = parseFloat(this.model().rating || '0');
    return rating / 2; // Convertir de escala 0-10 a 0-5
  }

  get voteCount(): number {
    return parseInt(this.model().vote_count || '0');
  }
}