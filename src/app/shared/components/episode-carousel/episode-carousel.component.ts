import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, CUSTOM_ELEMENTS_SCHEMA, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EpisodeCardComponent } from '../episode-card/episode-card.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SkeletonEpisodeCardComponent } from '../skeleton-episode-card/skeleton-episode-card.component';
import { SwiperDirective } from '../../directives/swiper.directive';
import { SwiperOptions } from 'swiper/types';
import { Episode } from '../../../core/models/episode';

@Component({
  selector: 'app-episode-carousel',
  standalone: true,
  imports: [CommonModule, EpisodeCardComponent, EmptyStateComponent, SkeletonEpisodeCardComponent, SwiperDirective],
  templateUrl: './episode-carousel.component.html',
  styleUrls: ['./episode-carousel.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EpisodeCarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() episodeList: Episode[] = [];
  @Input() anime: any = null; // Agregar input para el anime
  @Input() isLoading: boolean = false;
  @Input() emptyStateTitle: string = 'No hay episodios disponibles';
  @Input() emptyStateMessage: string = 'No se encontraron episodios en este momento. Intenta más tarde.';
  @Input() emptyStateIcon: 'anime' | 'top' | 'search' | 'error' = 'search';
  @Input() sliderId: string = 'episodes';
  @Input() limit: number = 15;

  // Signal interno para manejar la lista de episodios
  private episodeListSignal = signal<Episode[]>([]);
  
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
      1440: {slidesPerView: 4, spaceBetween: 30},
      992: {slidesPerView: 3, spaceBetween: 30},
      768: {slidesPerView: 2, spaceBetween: 25}, 
      576: {slidesPerView: 1, spaceBetween: 20},
      320: {slidesPerView: 1, spaceBetween: 15},
    }
  };

  activeSlideIndex = signal(0);
  
  displayedEpisodeCount = computed(() => Math.min(this.episodeListSignal()?.length || 0, this.limit));
  displayedEpisodes = computed(() => this.episodeListSignal()?.slice(0, this.limit) || []);
  totalSlides = computed(() => this.displayedEpisodeCount());
  slidesArray = computed(() => Array.from({ length: this.totalSlides() }, (_, i) => i));

  get swiperConfig() {
    return this.config;
  }

  ngOnInit(): void {
    // Inicializar el signal con los datos actuales
    this.episodeListSignal.set(this.episodeList || []);
    
    setTimeout(() => {
      this.setupSwiperTracking();
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['episodeList']) {
      // Actualizar el signal interno cuando cambie el input
      this.episodeListSignal.set(changes['episodeList'].currentValue || []);
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
      const validIndex = Math.max(0, Math.min(slideIndex, this.displayedEpisodeCount() - 1));
      
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
