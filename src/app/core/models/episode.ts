export interface Episode {
    _id: number;
    title: string;
    slug: string;
    type: string;
    episode_type: string;
    overview: string;
    runtime: string;
    show_id: string;
    still_path: string;
    vote_average: string;
    vote_count: string;
    season_number: number;
    episode_number: number;
}
