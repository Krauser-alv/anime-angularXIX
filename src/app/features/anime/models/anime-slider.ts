export interface AnimeSliderImages {
    poster: string;
    backdrop: string;
    logo: string;
}

export interface AnimeSlider {
    _id: number;
    title: string;
    overview: string;
    slug: string;
    images: AnimeSliderImages;
    trailer: string;
    rating: string;
    genres: number[];
    quality: number[];
    years: number[];
    type: string;
    release_date: string;
    last_update: string;
    vote_count: string;
    runtime: string;
    original_title: string;
    gallery: string;
    tagline: string;
}