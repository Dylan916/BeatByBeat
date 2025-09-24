import axios from 'axios';

/**
 * Searches Deezer for a track and returns a preview URL.
 * @param trackName The name of the track.
 * @param artistName The name of the artist.
 * @returns The preview URL string, or null if not found.
 */
export const getDeezerPreview = async (trackName: string, artistName: string) => {
  try {
    // We format the search query exactly as Deezer's API expects it.
    const query = `track:"${trackName}" artist:"${artistName}"`;
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;

    const response = await axios.get(url);

    // If Deezer returns any data and the first result has a preview, we use it.
    if (response.data && response.data.data && response.data.data.length > 0) {
      const firstResult = response.data.data[0];
      if (firstResult.preview) {
        return firstResult.preview;
      }
    }

    // If no results or no preview is found, return null.
    return null;

  } catch (error) {
    console.error(`Error fetching Deezer preview for ${trackName}:`, error);
    return null; // Return null on error so the game can continue
  }
};