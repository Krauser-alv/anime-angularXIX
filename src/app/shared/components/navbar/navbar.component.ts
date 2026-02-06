import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { ProgressBarService } from '../../services/progress-bar.service';
import { SearchInputComponent } from '../search-input/search-input.component';

@Component({
  selector: 'app-navbar',
  imports: [ProgressBarComponent, RouterLink, RouterLinkActive, SearchInputComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  private progressBarService = inject(ProgressBarService);
  public isLoading = computed(() => this.progressBarService.isLoading());
  isDarkMode = false;

  ngOnInit(): void {
    // Initialize Flowbite
    initFlowbite();
    this.initializeTheme();
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
}
