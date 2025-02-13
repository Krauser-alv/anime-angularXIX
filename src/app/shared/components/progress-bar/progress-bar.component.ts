import { Component, computed, inject } from '@angular/core';
import { ProgressBarService } from '../../services/progress-bar.service';

@Component({
  selector: 'app-progress-bar',
  template: `
    @if (isLoading()) {
      <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
        <div class="h-full bg-blue-600 rounded-full dark:bg-blue-500 relative">
          <div class="absolute w-1/2 h-full bg-white/20 animate-shine transform -skew-x-12"></div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      @keyframes shine {
        0% { transform: translateX(-100%) skewX(-12deg); }
        100% { transform: translateX(200%) skewX(-12deg); }
      }
      .animate-shine {
        animation: shine 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
      }
    `
  ]
})
export class ProgressBarComponent {
  private progressBarService = inject(ProgressBarService);
  public isLoading = computed(() => this.progressBarService.isLoading());
}
