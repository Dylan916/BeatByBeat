import axios from 'axios';

/**
 * Extracts a Spotify ID from a full Spotify URL or raw ID string.
 * Supports playlist, album, and track URLs.
 */
export const extractSpotifyId = (input: string): { id: string; type: 'playlist' | 'album' | 'track' } => {
  const trimmed = input.trim();
  
  // Check for Spotify URLs
  const urlMatch = trimmed.match(/spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
  if (urlMatch) {
    return {
      type: urlMatch[1] as 'playlist' | 'album' | 'track',
      id: urlMatch[2],
    };
  }

  // Check for Spotify URI (e.g. spotify:playlist:37i9dQZF1DXcBWIGoYBM5M)
  const uriMatch = trimmed.match(/spotify:(playlist|album|track):([a-zA-Z0-9]+)/);
  if (uriMatch) {
    return {
      type: uriMatch[1] as 'playlist' | 'album' | 'track',
      id: uriMatch[2],
    };
  }

  // Default to playlist if raw ID passed
  return {
    type: 'playlist',
    id: trimmed,
  };
};

export const getAccessToken = async () => {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing Spotify credentials');
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        },
      }
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error('Error fetching access token from Spotify:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
};

export const getPlaylistTracks = async (playlistId: string) => {
  console.log(`Fetching tracks for playlist: ${playlistId}`);

  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(`Successfully fetched ${response.data.items.length} tracks`);
    return response.data.items;
  } catch (error: any) {
    console.error(`Error fetching playlist details:`, error.response?.data || error.message);
    throw new Error(
      `Could not fetch playlist tracks: ${error.response?.data?.error?.message || error.message}`
    );
  }
};

export const getAlbumTracks = async (albumId: string) => {
  console.log(`Fetching tracks for album: ${albumId}`);

  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const album = response.data;
    const tracks = album.tracks.items.map((track: any) => ({
      track: {
        ...track,
        album: {
          images: album.images,
          name: album.name,
        },
      },
    }));

    console.log(`Successfully fetched ${tracks.length} album tracks`);
    return tracks;
  } catch (error: any) {
    console.error(`Error fetching album details:`, error.response?.data || error.message);
    throw new Error(
      `Could not fetch album tracks: ${error.response?.data?.error?.message || error.message}`
    );
  }
};



