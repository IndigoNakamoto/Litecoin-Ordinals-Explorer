// backend/util/inscriptionQueries.ts
import { Pool } from 'pg';

// Initialize a connection pool
const pool = new Pool({
  user: 'ord_lite_user',
  password: 'ord_lite_pass',
  host: 'localhost',
  port: 5432,
  database: 'ord_lite_db',
});

type ContentTypeConditions = {
  [key: string]: string;
};

// Mapping content types to their SQL query conditions
// const contentTypeConditions: ContentTypeConditions = {
//   "Text": "text/plain",
//   "ImagesAll": "image/%",
//   "ImagesSVG": "image/svg+xml",
//   "ImagesGIFs": "image/gif",
//   "HTML": "text/html;charset=utf-8",
//   "3D": "model/gltf-binary",
//   "Video": "video/%",
//   "Audio": "audio/%",
//   "JSON": "application/json",
//   "PDF": "application/pdf",
//   "Javascript": "text/javascript",
//   // Add other content types as needed
// };
// Function to determine the query source based on contentType
const determineQuerySource = (contentType: string): string => {
  const sourceMapping: { [contentType: string]: string } = {
      "Text": "inscriptions", // Assuming no materialized view for text/plain, using main table
      "ImagesAll": "inscriptions_images_all",
      "ImagesSVG": "inscriptions_images_svg",
      "ImagesGIFs": "inscriptions", // Assuming no specific view for GIFs
      "HTML": "inscriptions_html",
      "3D": "inscriptions", // Assuming no specific view for 3D
      "Video": "inscriptions_video",
      "Audio": "inscriptions_audio",
      "JSON": "inscriptions", // Assuming no specific view for JSON
      "PDF": "inscriptions", // Assuming no specific view for PDF
      "Javascript": "inscriptions", // Assuming no specific view for Javascript
  };

  return sourceMapping[contentType] || "inscriptions"; // Default to main table if no specific view
};

// Utility function to filter and sort inscriptions by content_type, refactored for content type categories
export const filterAndSortInscriptions = async (
  contentType: string,
  sortBy: 'newest' | 'oldest' | 'largestFile' | 'largestFee',
  limit: number = 200,
  lastInscriptionNumber?: number,
  cursed: boolean = false 
) => {
  const querySource = determineQuerySource(contentType);
  let orderByClause = '';
  let whereClause = '';
  let paginationClause = '';

  // Define orderByClause based on sortBy...
  switch (sortBy) {
    case 'newest':
      orderByClause = 'ORDER BY inscription_number DESC';
      paginationClause = lastInscriptionNumber ? `AND inscription_number < ${lastInscriptionNumber}` : '';
      break;
    case 'oldest':
      orderByClause = 'ORDER BY inscription_number ASC';
      paginationClause = lastInscriptionNumber ? `AND inscription_number > ${lastInscriptionNumber}` : '';
      break;
    case 'largestFile':
      orderByClause = 'ORDER BY content_length DESC';
      break;
    case 'largestFee':
      orderByClause = 'ORDER BY genesis_fee DESC';
      break;
  }

   // Modify or add to the whereClause to include cursed logic
  if (cursed) {
    whereClause += whereClause ? ' AND inscription_number < 0' : 'WHERE inscription_number < 0';
  } else {
    whereClause += whereClause ? ' AND inscription_number >= 0' : 'WHERE inscription_number >= 0';
  }
  // const whereClause = contentType !== 'All' ? `WHERE content_type LIKE '${contentTypeConditions[contentType] || contentType}'` : '';

  
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