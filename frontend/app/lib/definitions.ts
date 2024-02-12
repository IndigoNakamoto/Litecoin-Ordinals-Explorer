export interface Inscription {
    address: string;
    charms: string[];
    children: string[];
    content_length: number;
    content_type: string;
    content_type_type: string;
    genesis_fee: number;
    genesis_height: number;
    inscription_id: string;
    inscription_number: number;
    next: boolean;
    nsfw: string;
    output_value: number;
    parent: string;
    previous: string;
    processed: boolean;
    rune: string;
    sat: string;
    satpoint: string;
    timestamp: string;
}
