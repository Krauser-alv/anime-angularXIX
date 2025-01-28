import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { lastValueFrom } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class AnimesService {

    private apiUrl = environment.apiUrl + 'api/rest/';

    constructor(private http: HttpClient) { }

    getSliderAnimes(type: string) {
        const $response = this.http.get(this.apiUrl + `listing?page=1&post_type=animes&posts_per_page=18&genres=&years=&order_by=latest&type=${type}`);
        return lastValueFrom($response);
    }

}
