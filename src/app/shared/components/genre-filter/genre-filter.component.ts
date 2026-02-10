import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Genre {
  id: number;
  name: string;
}

@Component({
  selector: 'app-genre-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggleDropdown()"
        class="flex items-center justify-between w-full py-2.5 px-0 text-sm text-gray-900 dark:text-white bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500"
      >
        <span>
          @if (selectedGenres().length === 0) {
            Géneros
          } @else {
            Géneros ({{ selectedGenres().length }})
          }
        </span>
        <svg 
          class="w-4 h-4 transition-transform"
          [class.rotate-180]="isOpen()"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      @if (isOpen()) {
        <div class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          <div class="p-3 space-y-1">
            @for (genre of genres; track genre.id) {
              <label class="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  [checked]="isSelected(genre.id)"
                  (change)="toggleGenre(genre.id)"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span class="ml-2 text-sm text-gray-900 dark:text-gray-300">
                  {{ genre.name }}
                </span>
              </label>
            }
          </div>
          @if (selectedGenres().length > 0) {
            <div class="border-t border-gray-200 dark:border-gray-700 p-2">
              <button
                (click)="clearGenres()"
                class="w-full text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Limpiar selección
              </button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class GenreFilterComponent {
  @Output() genresChange = new EventEmitter<number[]>();

  selectedGenres = signal<number[]>([]);
  isOpen = signal(false);

  genres: Genre[] = [
    { id: 21, name: 'Animación' },
    { id: 22, name: 'Sci-Fi & Fantasy' },
    { id: 23, name: 'Action & Adventure' },
    { id: 63, name: 'Drama' },
    { id: 64, name: 'Misterio' },
    { id: 83, name: 'Comedia' },
    { id: 98, name: 'Crimen' },
    { id: 334, name: 'War & Politics' },
    { id: 838, name: 'Kids' },
    { id: 901, name: 'Familia' },
    { id: 1317, name: 'Romance' },
    { id: 1682, name: 'Western' }
  ];

  constructor() {
    // Cerrar dropdown al hacer clic fuera
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('app-genre-filter')) {
          this.isOpen.set(false);
        }
      });
    }
  }

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  toggleGenre(genreId: number): void {
    const current = this.selectedGenres();
    const index = current.indexOf(genreId);
    
    if (index > -1) {
      this.selectedGenres.set(current.filter(id => id !== genreId));
    } else {
      this.selectedGenres.set([...current, genreId]);
    }
    
    this.genresChange.emit(this.selectedGenres());
  }

  isSelected(genreId: number): boolean {
    return this.selectedGenres().includes(genreId);
  }

  clearGenres(): void {
    this.selectedGenres.set([]);
    this.genresChange.emit([]);
    this.isOpen.set(false);
  }
}
