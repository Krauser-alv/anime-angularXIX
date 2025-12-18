import { Component, inject, signal, OnInit } from '@angular/core';
import { AnimesService } from '../../../../core/services/animes.service';
import { AnimeSlider } from '../../../../core/models/anime-slider';
import { Episode } from '../../../../core/models/episode';
import { AnimeCarouselComponent } from '../../../../shared/components/anime-carousel/anime-carousel.component';
import { EpisodeCarouselComponent } from '../../../../shared/components/episode-carousel/episode-carousel.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [AnimeCarouselComponent, EpisodeCarouselComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  readonly SLIDER_LIMIT = 15;

  private animeService = inject(AnimesService);
  animeList = signal<Array<AnimeSlider>>([]);
  topAnimeList = signal<Array<AnimeSlider>>([]);
  episodeList = signal<Array<Episode>>([]);

  // Loading states individuales para cada carrusel
  isLoadingRecommendations = signal(false);
  isLoadingTops = signal(false);
  isLoadingDropped = signal(false);

  // Iconos para los carruseles
  recommendationIcon = `<svg class="w-[35px] h-[35px] dark:textSecondary" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Zm0 0-4 4m5 0H4m1 0 4-4m1 4 4-4m-4 7v6l4-3-4-3Z" />
  </svg>`;

  topIcon = `<svg class="w-[35px] h-[35px] dark:textSecondary" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>`;

  droppedIcon = `<svg class="w-[35px] h-[35px] dark:textSecondary" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"/>
  </svg>`;

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    await Promise.all([
      this.getSliderAnimes('animes'),
      this.getTopAnimes('animes', 'today'),
      this.getDroppedAnimes()
    ]);
  }

  private async getSliderAnimes(type: string) {
    try {
      this.isLoadingRecommendations.set(true);
      const response = await this.animeService.getSliderAnimes(type, this.SLIDER_LIMIT) as any;
      const animes = response.data?.posts || [];
      this.animeList.set(animes);
    } catch (error) {
      console.error('Error slider animes:', error);
      this.animeList.set([]);
    } finally {
      this.isLoadingRecommendations.set(false);
    }
  }

  private async getTopAnimes(type: string, range: string) {
    try {
      this.isLoadingTops.set(true);
      const response = await this.animeService.getTopsAnimes(type, range, this.SLIDER_LIMIT) as any;
      const topAnimes = response.data || [];
      this.topAnimeList.set(topAnimes);
    } catch (error) {
      console.error('Error loading top animes:', error);
      this.topAnimeList.set([]);
    } finally {
      this.isLoadingTops.set(false);
    }
  }

  private async getDroppedAnimes() {
    try {
      this.isLoadingDropped.set(true);
      const response = await this.animeService.getDroppedAnimes(this.SLIDER_LIMIT) as any;
      const episodes = response.data || [];
      this.episodeList.set(episodes);
    } catch (error) {
      console.error('Error loading episodes:', error);
      this.episodeList.set([]);
    } finally {
      this.isLoadingDropped.set(false);
    }
  }

}
