import axios from 'axios';

export const getAccessToken = async () => {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Missing Spotify credentials');
    }
    
    try {
        // axios.post(url, body, config)
        const response = await axios.post('https://accounts.spotify.com/api/token', // url
            'grant_type=client_credentials', // body of request
            { // config of request
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token from Spotify:', error);
        throw new Error('Failed to get access token');
    }
};

export const getPlaylistTracks = async (playlistId: string) => {
    
    
    console.log(`Fetching tracks for playlist: ${playlistId}`);
    
    try {
        const accessToken = await getAccessToken();
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log(`Successfully fetched ${response.data.items.length} tracks`);
        return response.data.items;
    } catch (error) {
        console.error(`Error details:`, error.response?.data || error.message);
        console.error(`Status:`, error.response?.status);
        throw new Error(`Could not fetch playlist tracks: ${error.response?.data?.error?.message || error.message}`);
    }
}

export const getAlbumTracks = async (albumId: string) => {

    console.log(`Fetching tracks for album: ${albumId}`);
    
    try {
        const accessToken = await getAccessToken();
        const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const tracks = response.data.tracks
        console.log(`Successfully fetched ${tracks.total} tracks`);
        return tracks.items;
    } catch (error) {
        console.error(`Error details:`, error.response?.data || error.message);
        console.error(`Status:`, error.response?.status);
        throw new Error(`Could not fetch album tracks: ${error.response?.data?.error?.message || error.message}`);
    }

}


