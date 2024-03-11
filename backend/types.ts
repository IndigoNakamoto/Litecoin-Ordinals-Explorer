export interface Inscription {
    id: number;
    address: string;
    charms: string[];
    children: string[];
    script_pubkey: string;
    content_length: number;
    content_type: string;
    content_type_type: string;
    genesis_address: string;
    genesis_fee: number;
    genesis_height: number;
    inscription_id: string;
    inscription_number: number;
    nsfw: boolean;
    next: string | null;
    output_value: number;
    parent: string | null;
    previous: string | null
    processed: boolean;
    rune: string;
    sat: string | null;
    satpoint: string;
    timestamp: string;
}

export interface PreInscription {
    address: string;
    content_length: number;
    content_type: string;
    charms: string[];
    children: string[];
    genesis_address?: string;
    genesis_fee: number;
    genesis_height: number;
    inscription_id: string;
    inscription_number: number;
    next?: string;
    output_value: number;
    parent?: string;
    previous?: string;
    processed: boolean;
    rune: string;
    sat: string;
    satpoint: string;
    timestamp: string;
}

export interface Inscribe {
    commit: string;
    inscriptions: [{id: string, locatoin: string}];
    parent: string;
    reveal: string;
    total_fees: number;
}

export interface InscriptionSent { 
    transaction: string;
}
