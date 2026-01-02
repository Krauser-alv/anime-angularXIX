import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AnimesService } from '../../../../core/services/animes.service';
import { AnimeSlider } from '../../../../core/models/anime-slider';
import { Episode } from '../../../../core/models/episode';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-anime-detail',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './anime-detail.component.html',
  styleUrls: ['./anime-detail.component.css']
})
export class AnimeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private animeService = inject(AnimesService);

  anime = signal<AnimeSlider | null>(null);
  episodes = signal<Episode[]>([]);
  isLoading = signal(true);
  isLoadingEpisodes = signal(true);
  currentRating = signal(0);
  totalVotes = signal(0);
  selectedSeason = signal(1);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadAnimeData(slug);
    }
  }

  async loadAnimeData(slug: string): Promise<void> {
    try {
      this.isLoading.set(true);
      const animeData: any = await this.animeService.getAnimeBySlug(slug);
      if (animeData && animeData.data) {
        this.anime.set(animeData.data);
        
        const postId = this.anime()?._id.toString() || '';
        if (postId) {
          await this.loadEpisodes(postId);
          await this.loadRating(postId);
        }
      }
    } catch (error) {
      console.error('Error loading anime data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadEpisodes(postId: string): Promise<void> {
    try {
      this.isLoadingEpisodes.set(true);
      const response: any = await this.animeService.getEpisodes(postId);
      if (response && response.data) {
        this.episodes.set(response.data);
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      this.isLoadingEpisodes.set(false);
    }
  }

  async loadRating(postId: string): Promise<void> {
    try {
      const response: any = await this.animeService.getStarRating(postId, '0');
      if (response && response.data) {
        this.currentRating.set(response.data.average_rating || 0);
        this.totalVotes.set(response.data.total_votes || 0);
      }
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  }

  async onRatingChange(rating: number): Promise<void> {
    const postId = this.anime()?._id.toString();
    if (postId) {
      try {
        await this.animeService.getStarRating(postId, rating.toString());
        await this.loadRating(postId);
      } catch (error) {
        console.error('Error updating rating:', error);
      }
    }
  }

  getEpisodesBySeason(season: number): Episode[] {
    return this.episodes().filter(ep => ep.season_number === season);
  }

  get availableSeasons(): number[] {
    const seasons = new Set(this.episodes().map(ep => ep.season_number));
    return Array.from(seasons).sort((a, b) => a - b);
  }

  selectSeason(season: number): void {
    this.selectedSeason.set(season);
  }

  parseFloat(value: string): number {
    return parseFloat(value) || 0;
  }

  parseInt(value: string): number {
    return parseInt(value) || 0;
  }
}
