import { Pool } from 'pg';

// Initialize a connection pool
const pool = new Pool({
  user: 'ord_lite_user',
  password: 'ord_lite_pass',
  host: 'localhost',
  port: 5432,
  database: 'ord_lite_db',
});

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
  sortBy: 'newest' | 'oldest' | 'largestFile' | 'largestFee',
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
      // Corrected pagination logic for the oldest sort order
      paginationClause = lastInscriptionNumber ? `AND inscription_number > ${lastInscriptionNumber}` : '';
      break;
    case 'largestFile':
      orderByClause = 'ORDER BY content_length DESC';
      break;
    case 'largestFee':
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
