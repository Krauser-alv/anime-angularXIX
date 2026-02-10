import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.css']
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() totalVotes: number = 0;
  @Input() interactive: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showRatingText: boolean = true;
  @Output() ratingChange = new EventEmitter<number>();

  hoveredRating = signal(0);

  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get sizeClass(): string {
    const sizes = {
      small: 'w-3.5 h-3.5',
      medium: 'w-6 h-6',
      large: 'w-8 h-8'
    };
    return sizes[this.size];
  }

  onStarClick(star: number): void {
    if (this.interactive) {
      this.ratingChange.emit(star);
    }
  }

  onStarHover(star: number): void {
    if (this.interactive) {
      this.hoveredRating.set(star);
    }
  }

  onMouseLeave(): void {
    this.hoveredRating.set(0);
  }

  getStarFill(star: number): number {
    const currentRating = this.hoveredRating() || this.rating;
    if (star <= Math.floor(currentRating)) {
      return 100;
    } else if (star === Math.ceil(currentRating) && currentRating % 1 !== 0) {
      return (currentRating % 1) * 100;
    }
    return 0;
  }
}
