import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal, computed } from '@angular/core';
import { AnimesService } from '../../../../core/services/animes.service';
import { AnimeSlider } from '../../../../core/models/anime-slider';
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
export class HomeComponent {
  private readonly SLIDER_LIMIT = 15;
  
  config: SwiperOptions = {
    grabCursor: true,
    centeredSlides: false,
    initialSlide: 0,
    slidesPerGroup: 1,
    speed: 800,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      clickable: true,
      dynamicBullets: true,
      dynamicMainBullets: 3,
      type: 'bullets',
    },
    breakpoints: {
      1440: {slidesPerView: 9, spaceBetween: 25},
      992: {slidesPerView: 6, spaceBetween: 25},
      768: {slidesPerView: 4, spaceBetween: 25}, 
      576: {slidesPerView: 2, spaceBetween: 25},
      320: {slidesPerView: 2, spaceBetween: 25},
    }
  };

  public isLoading = signal(false);
  private animeService = inject(AnimesService);
  animeList = signal<Array<AnimeSlider>>([]);
  activeSlideIndex = signal(0);
  
  displayedAnimeCount = computed(() => Math.min(this.animeList().length, this.SLIDER_LIMIT));
  
  // Computed property para los primeros animes según el límite configurado
  displayedAnimes = computed(() => this.animeList().slice(0, this.SLIDER_LIMIT));
  
  totalSlides = computed(() => this.displayedAnimeCount());
  
  slidesArray = computed(() => Array.from({ length: this.totalSlides() }, (_, i) => i));

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getSliderAnimes('animes');
    }, 0);
    
    setTimeout(() => {
      this.setupSwiperTracking();
    }, 1000);
  }
  
  private setupSwiperTracking(): void {
    const swiperElement = document.querySelector('swiper-container') as any;
    if (swiperElement && swiperElement.swiper) {
      const swiper = swiperElement.swiper;
      
      swiper.on('slideChange', () => {
        const activeIndex = swiper.activeIndex || 0;
        this.activeSlideIndex.set(activeIndex);
      });
      
      const initialIndex = swiper.activeIndex || 0;
      this.activeSlideIndex.set(initialIndex);
    } else {
      setTimeout(() => this.setupSwiperTracking(), 500);
    }
  }

  private async getSliderAnimes(type: string) {
    try {
      this.isLoading.set(true);
      const response = await this.animeService.getSliderAnimes(type, this.SLIDER_LIMIT) as { data: { posts: AnimeSlider[] } };
      this.animeList.set(response.data.posts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  isCardActive(index: number): boolean {
    return index === this.activeSlideIndex();
  }
  
  goToSlide(slideIndex: number): void {
    const swiperElement = document.querySelector('swiper-container') as any;
    if (swiperElement && swiperElement.swiper) {
      const swiper = swiperElement.swiper;
      const validIndex = Math.max(0, Math.min(slideIndex, this.displayedAnimeCount() - 1));
      
      // Pausar autoplay temporalmente para evitar conflictos
      if (swiper.autoplay) {
        swiper.autoplay.stop();
      }
      
      swiper.slideTo(validIndex);
      this.activeSlideIndex.set(validIndex);
      
      // Reanudar autoplay después de un breve delay
      setTimeout(() => {
        if (swiper.autoplay) {
          swiper.autoplay.start();
        }
      }, 1000);
    }
  }
  

}
