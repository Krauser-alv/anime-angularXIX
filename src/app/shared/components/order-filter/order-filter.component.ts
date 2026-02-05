import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OrderOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-order-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggleDropdown()"
        class="flex items-center justify-between w-full py-2.5 px-0 text-sm text-gray-900 dark:text-white bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500"
      >
        <span>{{ getSelectedLabel() }}</span>
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
        <div class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <div class="p-3 space-y-1">
            @for (option of orderOptions; track option.value) {
              <button
                type="button"
                (click)="selectOrder(option.value)"
                class="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-gray-300"
                [class.bg-blue-100]="selectedOrder() === option.value"
                [class.dark:bg-blue-900]="selectedOrder() === option.value"
                [class.dark:text-blue-200]="selectedOrder() === option.value">
                {{ option.label }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class OrderFilterComponent {
  @Output() orderChange = new EventEmitter<string>();

  selectedOrder = signal<string>('modified');
  isOpen = signal(false);

  orderOptions: OrderOption[] = [
    { value: 'modified', label: 'Más Actualizados' },
    { value: 'a-z', label: 'A - Z' },
    { value: 'z-a', label: 'Z - A' }
  ];

  constructor() {
    // Cerrar dropdown al hacer clic fuera
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('app-order-filter')) {
          this.isOpen.set(false);
        }
      });
    }
  }

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  selectOrder(value: string): void {
    this.selectedOrder.set(value);
    this.orderChange.emit(value);
    this.isOpen.set(false);
  }

  getSelectedLabel(): string {
    const option = this.orderOptions.find(opt => opt.value === this.selectedOrder());
    return option ? option.label : 'Ordenar por';
  }
}
