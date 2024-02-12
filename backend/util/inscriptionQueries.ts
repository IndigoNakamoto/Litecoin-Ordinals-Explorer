//backend/util/inscriptionQueries.ts

import { Pool } from 'pg';
import { Inscription } from './types';

// Initialize a connection pool
const pool = new Pool({
  user: 'ord_lite_user',
  password: 'ord_lite_pass',
  host: 'localhost',
  port: 5432,
  database: 'ord_lite_db',
});

export const getInscriptionByNumber = async (inscription_number: string): Promise<Inscription | null> => { 
  try { 
    const query = 'SELECT * FROM inscriptions WHERE inscription_number = $1';
    const params = [inscription_number];
    const { rows } = await pool.query(query, params);

    if (rows.length > 0) {
      return rows[0] as Inscription; // Ensure the returned type matches your inscription type
    } else {
      return null; // Return null if no inscription found
    }

  } catch (error) {
    console.error('Error fetching inscription:', error);
    throw error; // Rethrow to allow caller to handle the error
  }
}

export const getInscriptionById = async (inscriptionId: string): Promise<Inscription | null> => { 
  try { 
    const query = 'SELECT * FROM inscriptions WHERE inscription_id = $1';
    const params = [inscriptionId];
    const { rows } = await pool.query(query, params);

    if (rows.length > 0) {
      return rows[0] as Inscription; // Ensure the returned type matches your inscription type
    } else {
      return null; // Return null if no inscription found
    }

  } catch (error) {
    console.error('Error fetching inscription:', error);
    throw error; // Rethrow to allow caller to handle the error
  }
}

// Fetch the content type of an inscription by its ID
export const getInscriptionContentType = async (inscriptionId: string): Promise<string | null> => {
  try {
    const query = 'SELECT content_type FROM inscriptions WHERE inscription_id = $1';
    const params = [inscriptionId];
    const { rows } = await pool.query(query, params);
    
    if (rows.length > 0) {
      return rows[0].content_type; // Return the content type if found
    } else {
      return null; // Return null if no inscription found
    }
  } catch (error) {
    console.error('Error fetching content type for inscription:', error);
    throw error; // Rethrow to allow caller to handle the error
  }
};

// Function to determine the query source based on contentType
const determineQuerySource = (contentType: string): string => {
  const sourceMapping: { [contentType: string]: string } = {
    "Image": "inscriptions_image",
    "image/svg+xml": "inscriptions_image",
    "image/gif": "inscriptions",
    "Model": "inscriptions_model",
    "Text": "inscriptions_text",
    "text/html;charset=utf-8": "inscriptions",
    "text/javascript": "inscriptions",
    "Video": "inscriptions_video",
    "Audio": "inscriptions_audio",
    "Application": "inscriptions_application",
    "application/pdf": "inscriptions",
    "application/json": "inscriptions_application",
  };

  return sourceMapping[contentType] || "inscriptions";
};

export const filterAndSortInscriptions = async (
  contentType: string,
  sortBy: 'newest' | 'oldest' | 'largestfile' | 'largestfee',
  limit: number = 200,
  lastInscriptionNumber?: number,
  cursed: boolean = false
) => {
  const querySource = determineQuerySource(contentType);
  let orderByClause = '';
  let whereClause = 'WHERE TRUE';
  let paginationClause = '';

  switch (sortBy) {
    case 'newest':
      orderByClause = 'ORDER BY inscription_number DESC';
      paginationClause = lastInscriptionNumber ? `AND inscription_number < ${lastInscriptionNumber}` : '';
      break;
    case 'oldest':
      orderByClause = 'ORDER BY inscription_number ASC';
      paginationClause = lastInscriptionNumber ? `AND inscription_number > ${lastInscriptionNumber}` : '';
      break;
    case 'largestfile':
      orderByClause = 'ORDER BY content_length DESC';
      break;
    case 'largestfee':
      orderByClause = 'ORDER BY genesis_fee DESC';
      break;
  }

  if (contentType === "image/svg+xml" || contentType === "image/gif" ||
      contentType === "text/html;charset=utf-8" || contentType === "text/javascript" ||
      contentType === "application/pdf" || contentType === "application/json") {
    whereClause += ` AND content_type = '${contentType}'`;
  }

  if (cursed) {
    whereClause += ' AND inscription_number < 0';
  } else {
    whereClause += ' AND inscription_number >= 0';
  }

  const query = `
    SELECT * FROM ${querySource}
    ${whereClause}
    ${paginationClause}
    ${orderByClause}
    LIMIT $1
  `;
  const params = [limit];

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error executing filter and sort query with pagination:', error);
    throw error;
  }
};

