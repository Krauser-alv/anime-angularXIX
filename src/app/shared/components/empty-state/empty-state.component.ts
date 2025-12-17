import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css']
})
export class EmptyStateComponent {
  @Input() title: string = 'No hay contenido disponible';
  @Input() message: string = 'No se encontró información en este momento. Intenta más tarde.';
  @Input() iconType: 'anime' | 'top' | 'search' | 'error' = 'anime';
}