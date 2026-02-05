import { Component, EventEmitter, Output, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnimesService } from '../../../core/services/animes.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent],
  template: `
    <div class="relative w-full">
      <div class="relative">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="onSearchInput($event)"
          (focus)="showResults.set(true)"
          placeholder="Buscar anime..."
          class="w-full px-4 py-2 pl-10 pr-4 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        @if (isSearching()) {
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        }
      </div>

      <!-- Resultados de búsqueda -->
      @if (showResults() && searchResults().length > 0) {
        <div class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          @for (anime of searchResults(); track anime._id) {
            <button
              (click)="selectAnime(anime)"
              class="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <img
                [src]="getImageUrl(anime.images.poster)"
                [alt]="anime.title"
                class="w-16 h-24 object-cover rounded"
                onerror="this.src='https://via.placeholder.com/64x96?text=No+Image'"
              />
              <div class="flex-1 text-left">
                <h4 class="font-medium text-gray-900 dark:text-white line-clamp-1">
                  {{ anime.title }}
                </h4>
                <div class="flex items-center gap-2 mt-1">
                  @if (anime.release_date) {
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ anime.release_date | date:'yyyy' }}
                    </span>
                  }
                  @if (anime.rating) {
                    <div class="flex items-center gap-1">
                      <app-star-rating
                        [rating]="parseFloat(anime.rating) / 2"
                        [interactive]="false"
                        [size]="'small'"
                        [showRatingText]="false"
                      ></app-star-rating>
                      <span class="text-xs text-gray-600 dark:text-gray-400">
                        {{ anime.rating }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            </button>
          }
        </div>
      }

      @if (showResults() && searchQuery && searchResults().length === 0 && !isSearching()) {
        <div class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p class="text-gray-600 dark:text-gray-400">No se encontraron resultados</p>
        </div>
      }
    </div>
  `
})
export class SearchInputComponent {
  @Output() searchChange = new EventEmitter<string>();
  
  private animeService = inject(AnimesService);
  private router = inject(Router);
  private searchSubject = new Subject<string>();

  searchQuery = '';
  searchResults = signal<any[]>([]);
  showResults = signal(false);
  isSearching = signal(false);

  constructor() {
    // Configurar debounce para la búsqueda
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim().length >= 2) {
        this.performSearch(query);
      } else {
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });

    // Cerrar resultados al hacer clic fuera
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('app-search-input')) {
          this.showResults.set(false);
        }
      });
    }
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchChange.emit(query);
    
    if (query.trim().length >= 2) {
      this.isSearching.set(true);
      this.searchSubject.next(query);
    } else {
      this.searchResults.set([]);
      this.isSearching.set(false);
    }
  }

  async performSearch(query: string): Promise<void> {
    try {
      const response: any = await this.animeService.searchAnimes(query, 6);
      if (response && response.data && response.data.posts) {
        this.searchResults.set(response.data.posts);
      } else {
        this.searchResults.set([]);
      }
    } catch (error) {
      console.error('Error searching animes:', error);
      this.searchResults.set([]);
    } finally {
      this.isSearching.set(false);
    }
  }

  selectAnime(anime: any): void {
    // Usar el slug en lugar del _id para la navegación
    this.router.navigate(['/anime', anime.slug]);
    this.showResults.set(false);
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    const cleanPath = path.replace(/\\/g, '').replace(/^\/+/, '');
    return `https://animehack.net/wp-content/uploads/${cleanPath}`;
  }

  parseFloat(value: string): number {
    return parseFloat(value) || 0;
  }
}
