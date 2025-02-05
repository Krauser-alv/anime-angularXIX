import { Injectable, signal, computed } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ProgressBarService {
    private activeRequests = signal(0);
    private debounceTimeout: any;

    public isLoading = computed(() => this.activeRequests() > 0);

    // Configuración ajustable (podría inyectarse desde un servicio de configuración)
    public config = {
        debounceTime: 50, // Tiempo mínimo para mostrar la barra
        excludedUrls: ['/api/healthcheck'] // URLs a ignorar
    };

    public show() {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.activeRequests.update(v => v + 1);
        }, this.config.debounceTime);
    }

    public hide() {
        clearTimeout(this.debounceTimeout);
        this.activeRequests.update(v => Math.max(0, v - 1));
    }
}