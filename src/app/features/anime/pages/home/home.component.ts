import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AnimesService } from '../../../../core/services/animes.service';
import { AnimeSlider } from '../../models/anime-slider';
import { PosterCardComponent } from '../../../../shared/components/poster-card/poster-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [PosterCardComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent {
  private animeService = inject(AnimesService);
  movieTabList = ['lasted anime', 'Anime upgraded'];
  animeList: Array<AnimeSlider> = [];
  selectedAnimeTab = 0;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getSliderAnimes('animes');
    }, 0);
  }

  private async getSliderAnimes(type: string) {
    try {
      const response = await this.animeService.getSliderAnimes(type) as { data: { posts: AnimeSlider[] } };
      this.animeList = response.data.posts;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  onChangeTab(tabIndex: number) {
    this.selectedAnimeTab = tabIndex;
    this.getSliderAnimes(this.movieTabList[tabIndex]);
  }
}
