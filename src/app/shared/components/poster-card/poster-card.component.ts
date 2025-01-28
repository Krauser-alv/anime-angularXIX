import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-poster-card',
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './poster-card.component.html',
  styleUrl: './poster-card.component.css'
})
export class PosterCardComponent {
  @Input() model!: any;
  @Input() isMovie!: boolean;
  posterUrl!: string;
  private readonly apiUrl = environment.apiUrl + 'wp-content/uploads';

  imageapiUrl(uuid: string): string {
    return this.apiUrl + uuid;
  }
}