import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { AnimesService } from '../../../../core/services/animes.service';
import { AnimeSlider } from '../../models/anime-slider';
import { PosterCardComponent } from '../../../../shared/components/poster-card/poster-card.component';
import { CommonModule } from '@angular/common';
import { SwiperDirective } from '../../../../shared/directives/swiper.directive';
import { SwiperOptions } from 'swiper/types';

@Component({
  selector: 'app-home',
  imports: [PosterCardComponent, CommonModule, SwiperDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent{
  config: SwiperOptions = {
    watchSlidesProgress: true,
    grabCursor: true,
    effect: 'coverflow', 
    centeredSlides: false,
    initialSlide: 2,
    coverflowEffect: {
      rotate: 12,
      stretch: 0,
      depth: 40,
      modifier: 1,
      slideShadows: false,
    },
    breakpoints: {
      1440: {slidesPerView:9, spaceBetween: 25, slidesOffsetBefore: 0, slidesOffsetAfter: 0},
      992: {slidesPerView: 6, spaceBetween: 25, slidesOffsetBefore: 0, slidesOffsetAfter: 0},
      768: {slidesPerView: 4, spaceBetween: 25, slidesOffsetBefore: 0, slidesOffsetAfter: 0}, 
      576: {slidesPerView: 2, spaceBetween: 25, slidesOffsetBefore: 0, slidesOffsetAfter: 0},
      320: {slidesPerView: 2, spaceBetween: 25, slidesOffsetBefore: 0, slidesOffsetAfter: 0},
    }
  };

  public isLoading = signal(false);
  private animeService = inject(AnimesService);
  animeList: Array<AnimeSlider> = [];
  selectedAnimeTab = 0;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getSliderAnimes('animes');
    }, 0);
  }

  private async getSliderAnimes(type: string) {
    try {
      this.isLoading.set(true);
      const response = await this.animeService.getSliderAnimes(type) as { data: { posts: AnimeSlider[] } };
      this.animeList = response.data.posts;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
}
