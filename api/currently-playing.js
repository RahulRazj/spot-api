import axios from 'axios';
import { getAccessToken } from '../auth/spotifyAuth.js';
import { SPOTIFY_API_ENDPOINTS, SPOTIFY_STATUS_CODES } from '../config/spotify.js';

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  const origin = req.headers.origin || req.headers.referer || '';

  if (allowedOrigin && !origin.includes(allowedOrigin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  try {
    const token = await getAccessToken();

    try {
      const response = await axios.get(SPOTIFY_API_ENDPOINTS.CURRENTLY_PLAYING, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data;

      const song = {
        isPlaying: data.is_playing,
        title: data.item?.name,
        artist: data.item?.artists?.map(a => a.name).join(', '),
        album: data.item?.album?.name,
        albumImageUrl: data.item?.album?.images?.[0]?.url,
        songUrl: data.item?.external_urls?.spotify
      };

      return res.status(200).json(song);
    } catch (spotifyError) {
      if (spotifyError.response?.status === SPOTIFY_STATUS_CODES.NO_CONTENT) {
        // No song currently playing
        return res.status(200).json({ isPlaying: false });
      }

      console.error('Spotify API error:', spotifyError.response?.data || spotifyError.message);
      return res.status(spotifyError.response?.status || 500).json({ error: 'Failed to fetch from Spotify' });
    }
  } catch (err) {
    console.error('Error in currently-playing:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
