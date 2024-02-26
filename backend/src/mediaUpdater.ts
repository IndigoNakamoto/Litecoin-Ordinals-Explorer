import axios from 'axios';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { Pool } from 'pg';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic ? ffmpegStatic : "");

const pool = new Pool({
  user: 'ord_lite_user',
  password: 'ord_lite_pass',
  host: 'localhost',
  port: 5432,
  database: 'ord_lite_db',
  max: 10, // Adjust based on your system's capabilities and needs
  idleTimeoutMillis: 30000,
});

const MEDIA_DIRECTORY = 'media'; // Output path

// Ensure MEDIA_DIRECTORY exists
const ensureMediaDirectoryExists = () => {
  if (!fs.existsSync(MEDIA_DIRECTORY)) {
    fs.mkdirSync(MEDIA_DIRECTORY, { recursive: true });
  }
};

// Fetch and Process Content Function using Axios
async function fetchAndProcessContent(inscription_id: string, content_type: string) {
  try {
    const url = `http://0.0.0.0:80/content/${inscription_id}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const outputPath = path.join(MEDIA_DIRECTORY, `${inscription_id}`);
    ensureMediaDirectoryExists();

    if (content_type.startsWith('image/')) {
      const imageOutputPath = `${outputPath}.webp`;
      await sharp(response.data)
        .webp({ quality: 80 })
        .toFile(imageOutputPath);
      return imageOutputPath;
    } else if (content_type.startsWith('video/') || content_type.startsWith('audio/')) {
      // For video and audio, since axios returns a buffer, you might need to handle it differently
      const mediaOutputPath = `${outputPath}.${content_type.startsWith('video/') ? 'webm' : 'mp3'}`;
      fs.writeFileSync(mediaOutputPath, response.data);
      // Additional processing for conversion can be added here
      return mediaOutputPath;
    } else {
      console.error('Unsupported content type');
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch and process content:', error);
    return null;
  }
}

fetchAndProcessContent('ce21d8685610b290d708b8ec3c006892294e3adfa0ab49a32605cb54f37cc001i0', 'image/jpeg')

// Initialization and processing logic remains mostly unchanged
// Incorporate the fetchAndProcessContent into the media processing workflow as needed

async function initializeMediaDirectory() {
  ensureMediaDirectoryExists();
}

// Adjust listMediaFilesForProcessing, markMediaAsProcessed, processMediaFiles functions to use fetchAndProcessContent
// Note: The detailed implementation of these functions should now integrate the fetchAndProcessContent for fetching and converting content

// Throttle the processing to manage memory usage better
async function startProcessing() {
  try {
    await initializeMediaDirectory();
    // Adjust the workflow to incorporate fetchAndProcessContent
    // Example: await fetchAndProcessContent(inscription_id, content_type);
  } catch (error) {
    console.error('An error occurred during processing:', error);
  }
}

// setInterval(startProcessing, 60000); // Check for new or updated media files every 60 seconds
// startProcessing(); // Initial run
