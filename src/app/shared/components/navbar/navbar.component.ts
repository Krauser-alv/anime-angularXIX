import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { ProgressBarService } from '../../services/progress-bar.service';
import { SearchInputComponent } from '../search-input/search-input.component';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  imports: [ProgressBarComponent, RouterLink, RouterLinkActive, SearchInputComponent, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  private progressBarService = inject(ProgressBarService);
  private translationService = inject(TranslationService);
  public isLoading = computed(() => this.progressBarService.isLoading());
  isDarkMode = false;
  isMobileMenuOpen = false;
  isLanguageMenuOpen = false;
  selectedLanguage = 'es'; // Por defecto español

  ngOnInit(): void {
    // Initialize Flowbite
    initFlowbite();
    this.initializeTheme();
    this.initializeLanguage();
  }

  initializeTheme(): void {
    // Check if theme is saved in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.isDarkMode = true;
        document.documentElement.classList.add('dark');
      }
    }
  }

  initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.selectedLanguage = savedLanguage;
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Cerrar el menú de idiomas si está abierto
    if (this.isMobileMenuOpen) {
      this.isLanguageMenuOpen = false;
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  selectLanguage(lang: string): void {
    this.selectedLanguage = lang;
    this.translationService.setLanguage(lang);
    this.isLanguageMenuOpen = false;
  }
}
