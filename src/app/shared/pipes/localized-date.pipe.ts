import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslationService } from '../../core/services/translation.service';

@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(value: any, format: string = 'mediumDate'): string | null {
    const currentLang = this.translationService.getCurrentLanguage();
    const locale = currentLang === 'es' ? 'es-MX' : 'en-US';
    
    const datePipe = new DatePipe(locale);
    return datePipe.transform(value, format);
  }
}
