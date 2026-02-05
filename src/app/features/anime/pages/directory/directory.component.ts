import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimesService } from '../../../../core/services/animes.service';
import { GenreFilterComponent } from '../../../../shared/components/genre-filter/genre-filter.component';
import { YearFilterComponent } from '../../../../shared/components/year-filter/year-filter.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { PosterCardComponent } from '../../../../shared/components/poster-card/poster-card.component';
import { NeonLoaderComponent } from '../../../../shared/components/neon-loader/neon-loader.component';
import { OrderFilterComponent } from '../../../../shared/components/order-filter/order-filter.component';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [
    CommonModule,
    GenreFilterComponent,
    YearFilterComponent,
    OrderFilterComponent,
    SearchInputComponent,
    PosterCardComponent,
    NeonLoaderComponent
  ],
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css']
})
export class DirectoryComponent implements OnInit {
  private animeService = inject(AnimesService);

  animes = signal<any[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  selectedGenres = signal<number[]>([]);
  selectedYears = signal<number[]>([]);
  orderBy = signal<string>('modified');

  ngOnInit(): void {
    this.loadAnimes();
  }

  async loadAnimes(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      const genresParam = this.selectedGenres().join(',');
      const yearsParam = this.selectedYears().join(',');
      
      const response: any = await this.animeService.getDirectoryAnimes(
        this.currentPage(),
        30,
        genresParam,
        yearsParam,
        this.orderBy()
      );

      if (response && response.data) {
        this.animes.set(response.data.posts || response.data);
        
        if (response.data.pagination) {
          this.totalPages.set(response.data.pagination.last_page || 1);
        }
      }
    } catch (error) {
      console.error('Error loading directory animes:', error);
      this.animes.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  onGenresChange(genres: number[]): void {
    this.selectedGenres.set(genres);
    this.currentPage.set(1);
    this.loadAnimes();
  }

  onYearsChange(years: number[]): void {
    this.selectedYears.set(years);
    this.currentPage.set(1);
    this.loadAnimes();
  }

  onOrderChange(order: string): void {
    this.orderBy.set(order);
    this.currentPage.set(1);
    this.loadAnimes();
  }

  onSearchChange(query: string): void {
    // El componente de búsqueda maneja su propia navegación
    console.log('Search query:', query);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadAnimes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  clearFilters(): void {
    this.selectedGenres.set([]);
    this.selectedYears.set([]);
    this.orderBy.set('modified');
    this.currentPage.set(1);
    this.loadAnimes();
  }

  get hasActiveFilters(): boolean {
    return this.selectedGenres().length > 0 || this.selectedYears().length > 0;
  }
}
