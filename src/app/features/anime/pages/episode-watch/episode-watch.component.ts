import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnimesService } from '../../../../core/services/animes.service';
import { AnimeSlider } from '../../../../core/models/anime-slider';
import { Episode } from '../../../../core/models/episode';
import { PlayerResponse, PlayerEmbed } from '../../../../core/models/player';
import { NeonLoaderComponent } from '../../../../shared/components/neon-loader/neon-loader.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';
import { environment } from '../../../../../environments/environments';

@Component({
  selector: 'app-episode-watch',
  standalone: true,
  imports: [CommonModule, DatePipe, NeonLoaderComponent, StarRatingComponent],
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
  isLoading = signal(true);
  videoUrl = signal<SafeResourceUrl | null>(null);
  servers = signal<PlayerEmbed[]>([]);
  selectedServer = signal<number>(0);

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
    
    if (state && state['episode']) {
      // Navegación desde anime-detail con state
      this.episode.set(state['episode']);
      
      if (state['anime']) {
        this.anime.set(state['anime']);
      } else if (animeId) {
        this.loadAnimeById(animeId);
      }
      
      // Cargar el reproductor del episodio
      this.loadEpisodePlayer(episodeId!);
      this.isLoading.set(false);
    } else if (episodeId) {
      // Navegación con ID de episodio pero sin state
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
    } catch (error) {
      console.error('Error loading episode by ID:', error);
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
    const anime = this.anime();
    if (anime && anime._id) {
      this.router.navigate(['/anime', anime._id], {
        state: { anime: anime }
      });
    } else {
      // Si no hay anime, ir a la página principal
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
}