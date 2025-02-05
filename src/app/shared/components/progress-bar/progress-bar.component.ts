import { Component, computed, inject } from '@angular/core';
import { ProgressBarService } from '../../services/progress-bar.service';

@Component({
  selector: 'app-progress-bar',
  template: `
    @if (isLoading()) {
      <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4 dark:bg-gray-700">
        <div class="bg-blue-600 h-1.5 rounded-full dark:bg-blue-500" style="width: 45%"></div>
      </div>
    }
  `,
  styles: []
})
export class ProgressBarComponent {
  private progressBarService = inject(ProgressBarService);
  public isLoading = computed(() => this.progressBarService.isLoading());
}
