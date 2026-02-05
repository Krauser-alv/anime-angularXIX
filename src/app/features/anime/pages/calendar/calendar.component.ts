import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environments';
import { PosterCardComponent } from '../../../../shared/components/poster-card/poster-card.component';
import { NeonLoaderComponent } from '../../../../shared/components/neon-loader/neon-loader.component';

interface CalendarAnime {
  id: number;
  name: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
  overview: string;
}

interface TransformedAnime {
  _id: string;
  title: string;
  name: string;
  images: {
    poster: string;
  };
  rating: string;
  vote_count: string;
  release_date: string;
  first_air_date: string;
  overview: string;
  runtime?: string;
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, PosterCardComponent, NeonLoaderComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  animes = signal<TransformedAnime[]>([]);
  loading = signal(true);
  weekRange = signal('');
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadWeeklyAnimes();
  }

  private getWeekRange(): { start: string; end: string } {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    this.weekRange.set(`${this.formatDisplayDate(monday)} - ${this.formatDisplayDate(sunday)}`);

    return {
      start: formatDate(monday),
      end: formatDate(sunday)
    };
  }

  private formatDisplayDate(date: Date): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  loadWeeklyAnimes() {
    this.loading.set(true);
    const { start, end } = this.getWeekRange();
    
    const apiKey = 'da40aaeca884d8c9a9a4c088917c474c';
    const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=es-MX&sort_by=popularity.desc&with_genres=16&air_date.gte=${start}&air_date.lte=${end}&with_origin_country=JP`;

    this.http.get<{ results: CalendarAnime[] }>(url).subscribe({
      next: (response) => {
        // Transformar los datos de TMDB al formato esperado por PosterCard
        const transformedAnimes = response.results.map(anime => ({
          _id: anime.id.toString(),
          title: anime.name,
          name: anime.name,
          images: {
            poster: anime.poster_path ? `https://image.tmdb.org/t/p/w500${anime.poster_path}` : ''
          },
          rating: anime.vote_average.toString(),
          vote_count: '0',
          release_date: anime.first_air_date,
          first_air_date: anime.first_air_date,
          overview: anime.overview
        }));
        this.animes.set(transformedAnimes);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading weekly animes:', error);
        this.loading.set(false);
      }
    });
  }
}
