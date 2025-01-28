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

    getSliderAnimes(type: string) {
        const url = this.apiUrl + 'listing';
        const params = {
            page: '1',
            post_type: type,
            posts_per_page: '18',
            genres: '',
            years: '',
            order_by: 'latest'
        };

        const $response = this.http.get(url, { params });
        return lastValueFrom($response);
    }
}