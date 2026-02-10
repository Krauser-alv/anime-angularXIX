import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Year {
  id: number;
  year: string;
}

@Component({
  selector: 'app-year-filter',
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
          @if (selectedYears().length === 0) {
            Años
          } @else {
            Años ({{ selectedYears().length }})
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
            @for (yearItem of years; track yearItem.id) {
              <label class="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  [checked]="isSelected(yearItem.id)"
                  (change)="toggleYear(yearItem.id)"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span class="ml-2 text-sm text-gray-900 dark:text-gray-300">
                  {{ yearItem.year }}
                </span>
              </label>
            }
          </div>
          @if (selectedYears().length > 0) {
            <div class="border-t border-gray-200 dark:border-gray-700 p-2">
              <button
                (click)="clearYears()"
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
export class YearFilterComponent {
  @Output() yearsChange = new EventEmitter<number[]>();

  selectedYears = signal<number[]>([]);
  isOpen = signal(false);

  years: Year[] = [
    { id: 2, year: '1986' },
    { id: 21, year: '2013' },
    { id: 25, year: '1986' },
    { id: 45, year: '2008' },
    { id: 65, year: '2006' },
    { id: 84, year: '2001' },
    { id: 93, year: '2004' },
    { id: 107, year: '2005' },
    { id: 142, year: '1999' },
    { id: 156, year: '2012' },
    { id: 165, year: '2002' },
    { id: 182, year: '2009' },
    { id: 199, year: '2011' },
    { id: 235, year: '2014' },
    { id: 274, year: '2015' },
    { id: 320, year: '2010' },
    { id: 326, year: '2017' }
  ].sort((a, b) => parseInt(b.year) - parseInt(a.year));

  constructor() {
    // Cerrar dropdown al hacer clic fuera
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('app-year-filter')) {
          this.isOpen.set(false);
        }
      });
    }
  }

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  toggleYear(yearId: number): void {
    const current = this.selectedYears();
    const index = current.indexOf(yearId);
    
    if (index > -1) {
      this.selectedYears.set(current.filter(id => id !== yearId));
    } else {
      this.selectedYears.set([...current, yearId]);
    }
    
    this.yearsChange.emit(this.selectedYears());
  }

  isSelected(yearId: number): boolean {
    return this.selectedYears().includes(yearId);
  }

  clearYears(): void {
    this.selectedYears.set([]);
    this.yearsChange.emit([]);
    this.isOpen.set(false);
  }
}
