import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { SwiperContainer } from 'swiper/element';
import { SwiperOptions } from 'swiper/types';

@Directive({
    selector: '[appSwiper]',
    standalone: true
})
export class SwiperDirective implements AfterViewInit {
    @Input() config?: SwiperOptions;

    constructor(private el: ElementRef<SwiperContainer>) { }

    ngAfterViewInit(): void {
        // Asignar la configuración completa al elemento
        if (this.config) {
            Object.assign(this.el.nativeElement, this.config);
        }

        // Inicializar el swiper
        this.el.nativeElement.initialize();
    }
}
