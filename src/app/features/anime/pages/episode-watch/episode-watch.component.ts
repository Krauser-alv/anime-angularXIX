import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnimesService } from '../../../../core/services/animes.service';
import { AnimeSlider } from '../../../../core/models/anime-slider';
import { Episode } from '../../../../core/models/episode';
import { PlayerResponse, PlayerEmbed } from '../../../../core/models/player';
import { NeonLoaderComponent } from '../../../../shared/components/neon-loader/neon-loader.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LocalizedDatePipe } from '../../../../shared/pipes/localized-date.pipe';
import { environment } from '../../../../../environments/environments';

@Component({
  selector: 'app-episode-watch',
  standalone: true,
  imports: [CommonModule, NeonLoaderComponent, StarRatingComponent, TranslatePipe, LocalizedDatePipe],
  templateUrl: './episode-watch.component.html',
  styleUrls: ['./episode-watch.component.css']
})
export class EpisodeWatchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private animeService = inject(AnimesService);

  private readonly apiUrl = environment.apiUrl + 'wp-content/uploads';
  private readonly tmdbImageUrl = 'https://image.tmdb.org/t/p/w500';

  anime = signal<AnimeSlider | null>(null);
  episode = signal<Episode | null>(null);
  allEpisodes = signal<Episode[]>([]);
  isLoading = signal(true);
  videoUrl = signal<SafeResourceUrl | null>(null);
  servers = signal<PlayerEmbed[]>([]);
  downloads = signal<any[]>([]);
  selectedServer = signal<number>(0);
  downloadsExpanded = signal<boolean>(false);
  isOverviewExpanded = signal<boolean>(false);
  isCurrentEpisodeWatched = signal<boolean>(false);

  ngOnInit(): void {
    const animeId = this.route.snapshot.paramMap.get('animeId');
    const episodeId = this.route.snapshot.paramMap.get('episodeId');
    const episodeSlug = this.route.snapshot.paramMap.get('episodeSlug');
    
    console.log('Episode Watch - AnimeId:', animeId, 'EpisodeId:', episodeId, 'EpisodeSlug:', episodeSlug);
    
    // Priorizar la carga por slug si está disponible
    if (episodeSlug) {
      this.loadEpisodeBySlug(episodeSlug);
      return;
    }
    
    // Obtener datos del state de navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || window.history.state;
    
    if (state && state['episode'] && state['anime']) {
      // Navegación desde anime-detail con state completo
      console.log('Loading from state with complete data');
      this.episode.set(state['episode']);
      this.anime.set(state['anime']);
      
      // Cargar todos los episodios para navegación
      this.loadAllEpisodes();
      
      // Cargar el reproductor del episodio usando el ID del episodio del state
      const episodeFromState = state['episode'];
      this.loadEpisodePlayer(episodeFromState._id.toString());
      
      // Cargar estado de episodios vistos
      this.loadWatchedStatus();
      
      this.isLoading.set(false);
    } else if (animeId && episodeId) {
      // Navegación directa con IDs pero sin state - cargar datos desde API
      console.log('Loading from API with IDs');
      this.loadEpisodeAndAnimeById(animeId, episodeId);
    } else if (episodeId) {
      // Solo ID de episodio - cargar datos básicos
      console.log('Loading basic episode data');
      this.loadEpisodeById(episodeId);
    } else {
      console.warn('No se recibieron parámetros válidos');
      this.isLoading.set(false);
    }
  }

  async loadEpisodeById(episodeId: string): Promise<void> {
    try {
      this.isLoading.set(true);
      // Cargar el reproductor directamente con el ID
      await this.loadEpisodePlayer(episodeId);
      
      // Crear un episodio básico si no tenemos los datos
      const basicEpisode: Episode = {
        _id: parseInt(episodeId),
        title: 'Cargando...',
        slug: '',
        type: 'episode',
        episode_type: 'standard',
        overview: '',
        runtime: '',
        show_id: '',
        still_path: '',
        vote_average: '0',
        vote_count: '0',
        season_number: 1,
        episode_number: 1
      };
      this.episode.set(basicEpisode);
      
      // Intentar cargar el anime y episodios si es posible
      await this.createBasicAnime('0');
      await this.loadAllEpisodes();
    } catch (error) {
      console.error('Error loading episode by ID:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadEpisodeAndAnimeById(animeId: string, episodeId: string): Promise<void> {
    try {
      this.isLoading.set(true);
      console.log('Loading episode and anime by IDs:', animeId, episodeId);
      
      // Cargar el anime primero
      const animeResponse: any = await this.animeService.getAnimeBySlug(animeId, 'animes');
      if (animeResponse && animeResponse.data) {
        this.anime.set(animeResponse.data);
        console.log('Anime loaded:', animeResponse.data.title);
        
        // Cargar todos los episodios
        await this.loadAllEpisodes();
        
        // Buscar el episodio específico en la lista cargada
        const allEpisodes = this.allEpisodes();
        const targetEpisode = allEpisodes.find(ep => ep._id.toString() === episodeId);
        
        if (targetEpisode) {
          this.episode.set(targetEpisode);
          console.log('Episode found in list:', targetEpisode.title);
        } else {
          // Si no se encuentra, crear un episodio básico
          const basicEpisode: Episode = {
            _id: parseInt(episodeId),
            title: 'Episodio',
            slug: '',
            type: 'episode',
            episode_type: 'standard',
            overview: '',
            runtime: '',
            show_id: animeId,
            still_path: '',
            vote_average: '0',
            vote_count: '0',
            season_number: 1,
            episode_number: 1
          };
          this.episode.set(basicEpisode);
          console.log('Episode not found, using basic episode');
        }
        
        // Cargar el reproductor
        await this.loadEpisodePlayer(episodeId);
        
        // Cargar estado de episodios vistos
        this.loadWatchedStatus();
      } else {
        console.warn('Could not load anime data');
        await this.loadEpisodeById(episodeId);
      }
    } catch (error) {
      console.error('Error loading episode and anime by IDs:', error);
      await this.loadEpisodeById(episodeId);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadEpisodeBySlug(episodeSlug: string): Promise<void> {
    try {
      this.isLoading.set(true);
      console.log('Loading episode by slug:', episodeSlug);
      
      const response: any = await this.animeService.getEpisodeBySlug(episodeSlug);
      console.log('Episode response:', response);
      
      if (response && response.data) {
        if (response.data.episode && response.data.serie) {
          // Estructura: {episode: {...}, serie: {...}}
          const episodeData = response.data.episode;
          const serieData = response.data.serie;
          
          console.log('Setting episode signal with:', episodeData);
          console.log('Setting anime signal with:', serieData);
          
          this.episode.set(episodeData);
          this.anime.set(serieData);
          
          console.log('After setting - episode signal:', this.episode());
          console.log('After setting - anime signal:', this.anime());
          
          // Cargar todos los episodios para navegación
          this.loadAllEpisodes();
          
          // Cargar el reproductor
          if (episodeData._id) {
            await this.loadEpisodePlayer(episodeData._id.toString());
          }
        } else if (response.data._id && response.data.title) {
          // El episodio está directamente en data
          this.episode.set(response.data);
          console.log('Episode loaded directly from data:', response.data);
          
          // Crear un anime básico usando show_id si está disponible
          if (response.data.show_id) {
            await this.loadAnimeById(response.data.show_id);
            // Cargar todos los episodios después de cargar el anime
            await this.loadAllEpisodes();
          } else {
            await this.createBasicAnime('0');
          }
          
          // Cargar el reproductor
          await this.loadEpisodePlayer(response.data._id.toString());
        } else {
          console.warn('Unexpected response structure:', response.data);
          this.createBasicEpisode(episodeSlug);
        }
      } else {
        console.warn('No episode data received');
        this.createBasicEpisode(episodeSlug);
      }
    } catch (error) {
      console.error('Error loading episode by slug:', error);
      this.createBasicEpisode(episodeSlug);
    } finally {
      this.isLoading.set(false);
      console.log('Loading finished. isLoading:', this.isLoading(), 'anime:', !!this.anime(), 'episode:', !!this.episode());
    }
  }

  createBasicEpisode(slug: string): void {
    const parts = slug.split('-');
    let episodeNumber = 1;
    let seasonNumber = 1;
    
    // Buscar números en el slug
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'temporada' && i + 1 < parts.length) {
        seasonNumber = parseInt(parts[i + 1]) || 1;
      }
      if (parts[i] === 'episodio' && i + 1 < parts.length) {
        episodeNumber = parseInt(parts[i + 1]) || 1;
      }
    }
    
    const basicEpisode: Episode = {
      _id: 0,
      title: `Episodio ${episodeNumber}`,
      slug: slug,
      type: 'episode',
      episode_type: 'standard',
      overview: 'Episodio cargado desde URL',
      runtime: '',
      show_id: '',
      still_path: '',
      vote_average: '0',
      vote_count: '0',
      season_number: seasonNumber,
      episode_number: episodeNumber
    };
    this.episode.set(basicEpisode);
    this.createBasicAnime('0');
    this.loadEpisodePlayer(slug);
  }

  async createBasicAnime(animeId: string): Promise<void> {
    const basicAnime: AnimeSlider = {
      _id: parseInt(animeId) || 0,
      title: 'Anime',
      overview: '',
      slug: '',
      images: { poster: '', backdrop: '', logo: '' },
      trailer: '',
      rating: '0',
      genres: [],
      quality: [],
      years: [],
      type: 'animes',
      release_date: '',
      last_update: '',
      vote_count: '0',
      runtime: '0',
      original_title: '', // Dejar vacío para que no se muestre
      gallery: '',
      tagline: ''
    };
    this.anime.set(basicAnime);
  }

  async loadAnimeById(animeId: string): Promise<void> {
    try {
      // Intentar cargar el anime usando el endpoint de listing
      const response: any = await this.animeService.getAnimesList(1, 'post_modified', 'desc', 'animes', 1);
      if (response && response.data && response.data.length > 0) {
        // Por ahora usar el primer anime como placeholder
        // En una implementación real, necesitarías un endpoint específico para obtener anime por ID
        this.anime.set(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading anime by ID:', error);
    }
  }

  async loadEpisodePlayer(episodeId: string): Promise<void> {
    try {
      console.log('Loading player for episode:', episodeId);
      
      const response: any = await this.animeService.getEpisodePlayer(episodeId);
      console.log('Player response:', response);
      
      if (response && response.data) {
        console.log('Player data structure:', response.data);
        
        // Manejar downloads si existen
        if (response.data.downloads && Array.isArray(response.data.downloads)) {
          console.log('Found downloads:', response.data.downloads.length, 'download links');
          this.downloads.set(response.data.downloads);
        }
        
        if (response.data.embeds && Array.isArray(response.data.embeds)) {
          console.log('Found embeds array:', response.data.embeds.length, 'servers');
          this.servers.set(response.data.embeds);
          if (response.data.embeds.length > 0) {
            this.selectServer(0);
          }
        } else if (Array.isArray(response.data)) {
          console.log('Multiple servers found:', response.data.length);
          const embeds = response.data.map((item: any, index: number) => ({
            url: item.embed_url || item.url || '',
            lang: item.name || item.server || `Servidor ${index + 1}`
          }));
          this.servers.set(embeds);
          if (embeds.length > 0) {
            this.selectServer(0);
          }
        } else if (response.data.embed_url) {
          console.log('Single server with embed_url');
          this.servers.set([{
            url: response.data.embed_url,
            lang: response.data.name || response.data.server || 'Servidor 1'
          }]);
          this.selectServer(0);
        } else {
          console.log('Checking for alternative URL properties...');
          const possibleUrls = ['url', 'iframe', 'src', 'link', 'stream_url'];
          let foundUrl = null;
          
          for (const prop of possibleUrls) {
            if (response.data[prop]) {
              foundUrl = response.data[prop];
              console.log(`Found URL in property '${prop}':`, foundUrl);
              break;
            }
          }
          
          if (foundUrl) {
            this.servers.set([{ url: foundUrl, lang: 'Servidor 1' }]);
            this.selectServer(0);
          } else {
            console.warn('No embed_url found in response');
            this.setupFallbackVideoUrl();
          }
        }
      } else {
        console.warn('No player data received');
        this.setupFallbackVideoUrl();
      }
    } catch (error) {
      console.error('Error loading episode player:', error);
      this.setupFallbackVideoUrl();
    }
  }

  selectServer(index: number): void {
    const servers = this.servers();
    if (servers && servers[index]) {
      this.selectedServer.set(index);
      const server = servers[index];
      const url = server.url || `https://example.com/embed/${this.episode()?._id}`;
      this.videoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    }
  }

  setupFallbackVideoUrl(): void {
    const episode = this.episode();
    if (episode) {
      const url = `https://example.com/embed/${episode._id}`;
      this.videoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    }
  }

  goBackToAnime(): void {
    // Usar el historial del navegador para volver a la página anterior
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Si no hay historial, ir al home
      this.router.navigate(['/']);
    }
  }

  get episodeTitle(): string {
    const anime = this.anime();
    const episode = this.episode();
    if (!episode) return '';
    
    if (anime && anime.title) {
      return `${anime.title}: Temporada ${episode.season_number} Episodio ${episode.episode_number}`;
    } else {
      return `Temporada ${episode.season_number} Episodio ${episode.episode_number}`;
    }
  }

  get episodeOriginalTitle(): string {
    const episode = this.episode();
    if (!episode || !episode.title) return '';
    
    // Extraer solo el título del episodio sin la información de temporada/episodio
    const title = episode.title;
    // Si el título contiene información de temporada/episodio, intentar extraer solo el nombre
    const parts = title.split(':');
    if (parts.length > 1) {
      // Si hay dos puntos, tomar la parte después del segundo ':'
      const episodePart = parts.slice(1).join(':').trim();
      // Remover información de "Temporada X Episodio Y" si existe
      const cleanTitle = episodePart.replace(/Temporada\s+\d+\s+Episodio\s+\d+/i, '').trim();
      return cleanTitle || episodePart;
    }
    return title;
  }

  get animeRating(): number {
    const anime = this.anime();
    if (!anime || !anime.rating) return 0;
    return parseFloat(anime.rating) / 2; // Convertir de 0-10 a 0-5
  }

  get episodeRating(): number {
    const episode = this.episode();
    if (!episode || !episode.vote_average) return 0;
    return parseFloat(episode.vote_average) / 2; // Convertir de 0-10 a 0-5
  }

  getServerDisplayName(server: PlayerEmbed, index: number): string {
    const quality = server.quality || 'HD';
    const lang = server.lang || 'Latino';
    
    // Extraer dominio de la URL
    let domain = '';
    try {
      const url = new URL(server.url);
      domain = url.hostname.replace('www.', '');
    } catch {
      domain = `servidor${index + 1}`;
    }
    
    return `${quality}-${lang}-${domain}`;
  }

  toggleDownloads(): void {
    this.downloadsExpanded.set(!this.downloadsExpanded());
  }

  toggleOverview(): void {
    this.isOverviewExpanded.set(!this.isOverviewExpanded());
  }

  imageApiUrl(path: string): string {
    if (!path) return '';
    // Limpiar las barras escapadas (\/) y asegurar que no haya doble barra
    const cleanPath = path.replace(/\\/g, '').replace(/^\/+/, '');
    return this.apiUrl + '/' + cleanPath;
  }

  episodeImageUrl(path: string): string {
    if (!path) return '';
    // Limpiar las barras escapadas y construir URL de TMDB
    const cleanPath = path.replace(/\\/g, '');
    return this.tmdbImageUrl + cleanPath;
  }

  // Métodos para navegación entre episodios
  async loadAllEpisodes(): Promise<void> {
    const anime = this.anime();
    if (!anime || !anime._id) {
      console.log('No anime available for loading episodes');
      return;
    }

    try {
      console.log('Loading all episodes for anime:', anime._id);
      const response: any = await this.animeService.getEpisodes(anime._id.toString());
      if (response && response.data) {
        console.log('Loaded episodes:', response.data.length);
        
        // Log de los primeros episodios para debug
        console.log('First 5 episodes before sorting:', response.data.slice(0, 5).map((ep: Episode) => ({
          id: ep._id,
          title: ep.title,
          season: ep.season_number,
          episode: ep.episode_number
        })));
        
        // Ordenar episodios por temporada y número de episodio
        const sortedEpisodes = response.data.sort((a: Episode, b: Episode) => {
          if (a.season_number !== b.season_number) {
            return a.season_number - b.season_number;
          }
          return a.episode_number - b.episode_number;
        });
        
        console.log('First 5 episodes after sorting:', sortedEpisodes.slice(0, 5).map((ep: Episode) => ({
          id: ep._id,
          title: ep.title,
          season: ep.season_number,
          episode: ep.episode_number
        })));
        
        this.allEpisodes.set(sortedEpisodes);
        console.log('Episodes set:', this.allEpisodes().length);
        
        // Log del episodio actual y su posición
        const currentEpisode = this.episode();
        if (currentEpisode) {
          const currentIndex = sortedEpisodes.findIndex((ep: Episode) => ep._id === currentEpisode._id);
          console.log('Current episode in sorted list:', {
            index: currentIndex,
            id: currentEpisode._id,
            title: currentEpisode.title
          });
          
          if (currentIndex > 0) {
            console.log('Previous episode would be:', {
              id: sortedEpisodes[currentIndex - 1]._id,
              title: sortedEpisodes[currentIndex - 1].title
            });
          }
          
          if (currentIndex < sortedEpisodes.length - 1) {
            console.log('Next episode would be:', {
              id: sortedEpisodes[currentIndex + 1]._id,
              title: sortedEpisodes[currentIndex + 1].title
            });
          }
        }
        
        // Forzar actualización de la vista después de cargar episodios
        setTimeout(() => {
          console.log('Forcing view update after episodes loaded');
        }, 100);
      }
    } catch (error) {
      console.error('Error loading all episodes:', error);
    }
  }

  getCurrentEpisodeIndex(): number {
    const currentEpisode = this.episode();
    const allEpisodes = this.allEpisodes();
    
    if (!currentEpisode || !allEpisodes.length) {
      return -1;
    }
    
    const index = allEpisodes.findIndex(ep => ep._id === currentEpisode._id);
    return index;
  }

  getPreviousEpisode(): Episode | null {
    const currentIndex = this.getCurrentEpisodeIndex();
    const allEpisodes = this.allEpisodes();
    
    if (currentIndex <= 0 || !allEpisodes.length) {
      return null;
    }
    
    return allEpisodes[currentIndex - 1];
  }

  getNextEpisode(): Episode | null {
    const currentIndex = this.getCurrentEpisodeIndex();
    const allEpisodes = this.allEpisodes();
    
    if (currentIndex === -1 || currentIndex >= allEpisodes.length - 1) {
      return null;
    }
    
    return allEpisodes[currentIndex + 1];
  }

  canGoToPrevious(): boolean {
    return this.getPreviousEpisode() !== null;
  }

  canGoToNext(): boolean {
    return this.getNextEpisode() !== null;
  }

  canGoToAnime(): boolean {
    const anime = this.anime();
    return anime !== null && anime._id > 0 && anime.title !== 'Anime';
  }

  goToPreviousEpisode(): void {
    const previousEpisode = this.getPreviousEpisode();
    const anime = this.anime();
    
    console.log('Navigating to previous episode:', previousEpisode?.title);
    console.log('Previous episode ID:', previousEpisode?._id);
    console.log('Current episode ID:', this.episode()?._id);
    console.log('Anime ID:', anime?._id);
    
    if (previousEpisode && anime) {
      // Marcar el episodio actual como visto antes de navegar
      const currentEpisode = this.episode();
      if (currentEpisode) {
        this.markEpisodeAsWatched(currentEpisode._id, anime._id.toString());
      }
      
      // Usar router con configuración especial para permitir navegación a la misma ruta
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/anime', anime._id, 'episode', previousEpisode._id], {
          state: { anime: anime, episode: previousEpisode }
        });
      });
    }
  }

  goToNextEpisode(): void {
    const nextEpisode = this.getNextEpisode();
    const anime = this.anime();
    
    console.log('Navigating to next episode:', nextEpisode?.title);
    console.log('Next episode ID:', nextEpisode?._id);
    console.log('Current episode ID:', this.episode()?._id);
    console.log('Anime ID:', anime?._id);
    
    if (nextEpisode && anime) {
      // Marcar el episodio actual como visto antes de navegar
      const currentEpisode = this.episode();
      if (currentEpisode) {
        this.markEpisodeAsWatched(currentEpisode._id, anime._id.toString());
      }
      
      // Usar router con configuración especial para permitir navegación a la misma ruta
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/anime', anime._id, 'episode', nextEpisode._id], {
          state: { anime: anime, episode: nextEpisode }
        });
      });
    }
  }

  goToAnimeDetail(): void {
    const anime = this.anime();
    console.log('Navigating to anime detail:', anime?.title);
    console.log('Anime ID:', anime?._id);
    
    if (anime && anime._id > 0) {
      // Marcar el episodio actual como visto antes de navegar
      const currentEpisode = this.episode();
      if (currentEpisode) {
        this.markEpisodeAsWatched(currentEpisode._id, anime._id.toString());
      }
      
      this.router.navigate(['/anime', anime._id], {
        state: { anime: anime }
      });
    }
  }

  // Método para marcar episodio como visto en localStorage
  markEpisodeAsWatched(episodeId: number, animeId: string): void {
    const cacheKey = `watched_episodes_${animeId}`;
    let watchedEpisodes: number[] = [];
    
    // Cargar episodios vistos existentes
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        watchedEpisodes = JSON.parse(cached);
      } catch (error) {
        console.error('Error loading watched episodes from cache:', error);
        watchedEpisodes = [];
      }
    }
    
    // Agregar el episodio actual si no está ya marcado
    if (!watchedEpisodes.includes(episodeId)) {
      watchedEpisodes.push(episodeId);
      localStorage.setItem(cacheKey, JSON.stringify(watchedEpisodes));
      console.log('Episode marked as watched:', episodeId);
    }
  }

  // Cargar estado de episodios vistos
  loadWatchedStatus(): void {
    const anime = this.anime();
    const episode = this.episode();
    
    if (!anime || !episode) return;
    
    const cacheKey = `watched_episodes_${anime._id}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const watchedEpisodes: number[] = JSON.parse(cached);
        this.isCurrentEpisodeWatched.set(watchedEpisodes.includes(episode._id));
      } catch (error) {
        console.error('Error loading watched episodes from cache:', error);
        this.isCurrentEpisodeWatched.set(false);
      }
    } else {
      this.isCurrentEpisodeWatched.set(false);
    }
  }

  // Toggle del estado de visto del episodio actual
  toggleCurrentEpisodeWatched(): void {
    const anime = this.anime();
    const episode = this.episode();
    
    if (!anime || !episode) return;
    
    const cacheKey = `watched_episodes_${anime._id}`;
    let watchedEpisodes: number[] = [];
    
    // Cargar episodios vistos existentes
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        watchedEpisodes = JSON.parse(cached);
      } catch (error) {
        console.error('Error loading watched episodes from cache:', error);
        watchedEpisodes = [];
      }
    }
    
    // Toggle del estado
    const isCurrentlyWatched = watchedEpisodes.includes(episode._id);
    if (isCurrentlyWatched) {
      // Remover de la lista
      watchedEpisodes = watchedEpisodes.filter(id => id !== episode._id);
      this.isCurrentEpisodeWatched.set(false);
      console.log('Episode unmarked as watched:', episode._id);
    } else {
      // Agregar a la lista
      watchedEpisodes.push(episode._id);
      this.isCurrentEpisodeWatched.set(true);
      console.log('Episode marked as watched:', episode._id);
    }
    
    // Guardar en localStorage
    localStorage.setItem(cacheKey, JSON.stringify(watchedEpisodes));
  }
}