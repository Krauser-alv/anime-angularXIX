import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environments';
import { NeonLoaderComponent } from '../../../../shared/components/neon-loader/neon-loader.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';

interface CalendarAnime {
  id: number;
  name: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
  overview: string;
}

interface EpisodeInfo {
  air_date: string;
  episode_number: number;
  season_number: number;
  name: string;
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
  next_episode?: EpisodeInfo;
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, DatePipe, NeonLoaderComponent, StarRatingComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  animes = signal<TransformedAnime[]>([]);
  loading = signal(true);
  weekRange = signal('');
  animesByDate = signal<Map<string, TransformedAnime[]>>(new Map());
  expandedDays = signal<Set<string>>(new Set());
  allExpanded = signal(false);
  Array = Array; // Exponer Array para usar en el template
  parseFloat = parseFloat; // Exponer parseFloat para usar en el template
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  navigateToAnime(animeId: string) {
    this.router.navigate(['/anime', animeId]);
  }

  toggleDay(date: string) {
    const expanded = new Set(this.expandedDays());
    if (expanded.has(date)) {
      expanded.delete(date);
    } else {
      expanded.add(date);
    }
    this.expandedDays.set(expanded);
    this.updateAllExpandedState();
  }

  isDayExpanded(date: string): boolean {
    return this.expandedDays().has(date);
  }

  toggleAllDays() {
    const dates = Array.from(this.animesByDate().keys());
    if (this.allExpanded()) {
      // Contraer todos
      this.expandedDays.set(new Set());
      this.allExpanded.set(false);
    } else {
      // Expandir todos
      this.expandedDays.set(new Set(dates));
      this.allExpanded.set(true);
    }
  }

  private updateAllExpandedState() {
    const totalDays = this.animesByDate().size;
    const expandedCount = this.expandedDays().size;
    this.allExpanded.set(totalDays > 0 && expandedCount === totalDays);
  }

  ngOnInit() {
    this.loadWeeklyAnimes();
  }

  private groupAnimesByDate(animes: TransformedAnime[]) {
    const grouped = new Map<string, TransformedAnime[]>();
    
    animes.forEach(anime => {
      const date = anime.next_episode?.air_date || anime.first_air_date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(anime);
    });

    // Ordenar por fecha
    const sortedMap = new Map([...grouped.entries()].sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    }));

    this.animesByDate.set(sortedMap);
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
      next: async (response) => {
        // Obtener información de episodios para cada anime
        const animesWithEpisodes = await Promise.all(
          response.results.map(async (anime) => {
            try {
              // Obtener detalles del anime incluyendo próximo episodio
              const detailUrl = `https://api.themoviedb.org/3/tv/${anime.id}?api_key=${apiKey}&language=es-MX`;
              const details: any = await this.http.get(detailUrl).toPromise();
              
              let nextEpisode: EpisodeInfo | undefined;
              
              // Si hay un próximo episodio programado
              if (details.next_episode_to_air) {
                nextEpisode = {
                  air_date: details.next_episode_to_air.air_date,
                  episode_number: details.next_episode_to_air.episode_number,
                  season_number: details.next_episode_to_air.season_number,
                  name: details.next_episode_to_air.name
                };
              }

              return {
                _id: anime.id.toString(),
                title: anime.name,
                name: anime.name,
                images: {
                  poster: anime.poster_path ? `https://image.tmdb.org/t/p/w500${anime.poster_path}` : ''
                },
                rating: anime.vote_average.toString(),
                vote_count: '0',
                release_date: nextEpisode?.air_date || anime.first_air_date,
                first_air_date: anime.first_air_date,
                overview: anime.overview,
                next_episode: nextEpisode
              };
            } catch (error) {
              console.error(`Error fetching details for anime ${anime.id}:`, error);
              return {
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
              };
            }
          })
        );

        this.animes.set(animesWithEpisodes);
        this.groupAnimesByDate(animesWithEpisodes);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading weekly animes:', error);
        this.loading.set(false);
      }
    });
  }
}
