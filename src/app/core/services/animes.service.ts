import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AnimesService {

    private apiUrl = environment.apiUrl + 'api/rest/';

    constructor(private http: HttpClient) {}

    getSliderAnimes(type: string, limit: number) {
        const url = this.apiUrl + 'listing';
        const params = {
            page: '1',
            post_type: type,
            posts_per_page: limit.toString(),
            genres: '',
            years: '',
            order_by: 'latest'
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }

    getTopsAnimes(type: string, range: string, limit: number) {
        const url = this.apiUrl + 'tops';
        const params = {
            post_type: type,
            range,
            limit: limit.toString()
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }

    getDroppedAnimes(limit: number) {
        const url = this.apiUrl + 'listing/episodes';
        const params = {
            page: '1',
            posts_per_page: limit.toString()
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }

    getEpisodes(postId: string) {
        const url = this.apiUrl + 'episodes';
        const params = {
            post_id: postId
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }

    getAnimeBySlug(postName: string, postType: string = 'animes') {
        const url = this.apiUrl + 'single';
        const params = {
            post_name: postName,
            post_type: postType
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }

    // Nuevo endpoint para obtener episodio por slug
    getEpisodeBySlug(postName: string) {
        const url = this.apiUrl + 'single';
        const params = {
            post_name: postName,
            post_type: 'episodes'
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }

    // Nuevo endpoint para obtener el reproductor del episodio
    getEpisodePlayer(postId: string) {
        const url = this.apiUrl + 'player';
        const params = {
            post_id: postId,
            _any: '1'
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }

    // Endpoint mejorado para listing con más opciones
    getAnimesList(page: number = 1, orderBy: string = 'post_modified', order: string = 'desc', postType: string = 'animes', postsPerPage: number = 8) {
        const url = this.apiUrl + 'listing';
        const params = {
            page: page.toString(),
            order_by: orderBy,
            order: order,
            post_type: postType,
            posts_per_page: postsPerPage.toString()
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }

    // Endpoint para directorio con filtros
    getDirectoryAnimes(page: number = 1, postsPerPage: number = 30, genres: string = '', years: string = '', orderBy: string = 'modified') {
        const url = this.apiUrl + 'listing';
        const params: any = {
            page: page.toString(),
            post_type: 'animes',
            posts_per_page: postsPerPage.toString(),
            genres: genres,
            years: years,
            order_by: orderBy
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }

    // Endpoint para búsqueda
    searchAnimes(query: string, postsPerPage: number = 4) {
        const url = this.apiUrl + 'search';
        const params = {
            post_type: 'animes',
            query: query,
            posts_per_page: postsPerPage.toString()
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }
}