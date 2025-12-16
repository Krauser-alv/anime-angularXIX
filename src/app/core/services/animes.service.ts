import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AnimesService {

    private apiUrl = environment.apiUrl + 'api/rest/';

    constructor(private http: HttpClient) {
        // console.log('HttpClient:', http); // Depuración
    }

    //https://animehack.net/api/rest/listing?page=1&post_type=animes&posts_per_page=18&genres=&years=&order_by=latest
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

    //https://animehack.net/api/rest/tops?post_type=animes&range=today&limit=30
    // range=today
    // range=week
    // range=month
    getTopsAnimes(range: string, limit: number) {
        const url = this.apiUrl + 'tops';
        const params = {
            post_type: 'animes',
            range,
            limit
        };
        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }
}