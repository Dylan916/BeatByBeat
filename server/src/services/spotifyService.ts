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
        console.error("Error fetching access token from Spotify:", error);
        throw new Error('Failed to get access token');
    }
};



