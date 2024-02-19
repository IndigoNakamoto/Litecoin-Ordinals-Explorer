// backend/util/types.ts

export interface Inscription {
    address: string;
    charms: string[];
    children: string[];
    content_length: number;
    content_type: string;
    genesis_fee: number;
    genesis_height: number;
    inscription_id: string;
    inscription_number: number;
    next: string;
    output_value: number;
    parent: string;
    previous: string;
    rune: string;
    sat: string;
    satpoint: string;
    timestamp: string;
}

/* 
The Block interface defines blockchain block data:

genesis_height: Block's position in the blockchain sequence.
inscriptions: Array of up to 100 inscription IDs contained in the block.
more: Boolean indicating if additional inscription pages exist (true) or not (false).
page_index: Current page number for viewing block inscriptions, supporting pagination.
*/

export interface Block { 
    genesis_height: number;
    inscriptions: string[];
    more: boolean;
    page_index: number;
}

