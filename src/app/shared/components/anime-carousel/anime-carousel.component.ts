import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, CUSTOM_ELEMENTS_SCHEMA, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PosterCardComponent } from '../poster-card/poster-card.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SkeletonPosterCardComponent } from '../skeleton-poster-card/skeleton-poster-card.component';
import { SwiperDirective } from '../../directives/swiper.directive';
import { SwiperOptions } from 'swiper/types';
import { AnimeSlider } from '../../../core/models/anime-slider';

@Component({
  selector: 'app-anime-carousel',
  standalone: true,
  imports: [CommonModule, PosterCardComponent, EmptyStateComponent, SkeletonPosterCardComponent, SwiperDirective],
  templateUrl: './anime-carousel.component.html',
  styleUrls: ['./anime-carousel.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AnimeCarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() animeList: AnimeSlider[] = [];
  @Input() isLoading: boolean = false;
  @Input() emptyStateTitle: string = 'No hay contenido disponible';
  @Input() emptyStateMessage: string = 'No se encontró información en este momento. Intenta más tarde.';
  @Input() emptyStateIcon: 'anime' | 'top' | 'search' | 'error' = 'anime';
  @Input() sliderId: string = 'default';
  @Input() limit: number = 15;

  // Signal interno para manejar la lista de animes
  private animeListSignal = signal<AnimeSlider[]>([]);

  // Array for skeleton placeholders
  skeletonArray = Array.from({ length: this.limit }, (_, i) => i);

  constructor(private sanitizer: DomSanitizer) {}

  get safeIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.icon);
  }

  private readonly config: SwiperOptions = {
    grabCursor: true,
    centeredSlides: false,
    initialSlide: 0,
    slidesPerGroup: 1,
    speed: 800,
    autoplay: {
      delay: 5000,
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

  activeSlideIndex = signal(0);
  
  displayedAnimeCount = computed(() => Math.min(this.animeListSignal()?.length || 0, this.limit));
  displayedAnimes = computed(() => this.animeListSignal()?.slice(0, this.limit) || []);
  totalSlides = computed(() => this.displayedAnimeCount());
  slidesArray = computed(() => Array.from({ length: this.totalSlides() }, (_, i) => i));

  get swiperConfig() {
    return this.config;
  }

  ngOnInit(): void {
    // Inicializar el signal con los datos actuales
    this.animeListSignal.set(this.animeList || []);
    
    setTimeout(() => {
      this.setupSwiperTracking();
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animeList']) {
      // Actualizar el signal interno cuando cambie el input
      this.animeListSignal.set(changes['animeList'].currentValue || []);
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private setupSwiperTracking(): void {
    const swiperElement = document.querySelector(`swiper-container[data-slider="${this.sliderId}"]`) as any;
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

  isCardActive(index: number): boolean {
    return index === this.activeSlideIndex();
  }

  goToSlide(slideIndex: number): void {
    const swiperElement = document.querySelector(`swiper-container[data-slider="${this.sliderId}"]`) as any;
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