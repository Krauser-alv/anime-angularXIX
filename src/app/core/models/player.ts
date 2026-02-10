export interface PlayerResponse {
    success: boolean;
    data: PlayerData;
}

export interface PlayerData {
    embeds: PlayerEmbed[];
    downloads: PlayerDownload[];
}

export interface PlayerEmbed {
    url: string;
    lang?: string;
    quality?: string;
    name?: string;
    server?: string;
}

export interface PlayerDownload {
    url: string;
    quality: string;
    type: string;
    size?: string;
}

export interface PlayerSource {
    url: string;
    quality: string;
    type: string;
}

export interface PlayerSubtitle {
    url: string;
    language: string;
    label: string;
}