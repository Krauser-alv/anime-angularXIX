import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ProgressBarService } from '../services/progress-bar.service';
import { finalize } from 'rxjs/operators';

export const progressBarInterceptor: HttpInterceptorFn = (req, next) => {
    const progressBarService = inject(ProgressBarService);

    // Verificar si la URL está excluida
    if (progressBarService.config.excludedUrls.some(url => req.url.includes(url))) {
        return next(req);
    }

    progressBarService.show();

    return next(req).pipe(
        finalize(() => {
            progressBarService.hide();
        })
    );
};