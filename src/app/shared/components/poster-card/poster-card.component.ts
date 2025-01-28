import { Component, Input } from '@angular/core';
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
  @Input() model!: any;
  posterUrl!: string;

  private readonly apiUrl = environment.apiUrl + 'wp-content/uploads';

  imageApiUrl(uuid: string): string {
    return this.apiUrl + uuid;
  }
}