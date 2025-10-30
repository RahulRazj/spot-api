import axios from 'axios';
import { getAccessToken } from '../auth/spotifyAuth.js';
import { 
  SPOTIFY_API_ENDPOINTS, 
  TIME_RANGES, 
  VALID_TIME_RANGES, 
  LIMITS 
} from '../config/spotify.js';

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  const origin = req.headers.origin || req.headers.referer || '';

  if (allowedOrigin && !origin.includes(allowedOrigin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  try {
    const token = await getAccessToken();

    // Extract query parameters with defaults
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit) || LIMITS.DEFAULT_TRACKS, LIMITS.MIN), LIMITS.MAX);
    const timePeriod = req.query.time_period || TIME_RANGES.MEDIUM_TERM;

    // Validate time_period parameter
    const timeRange = VALID_TIME_RANGES.includes(timePeriod) ? timePeriod : TIME_RANGES.MEDIUM_TERM;

    try {
      const response = await axios.get(SPOTIFY_API_ENDPOINTS.TOP_TRACKS, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          limit,
          time_range: timeRange
        }
      });

      const data = response.data;

      // Transform the data to a more convenient format
      const topTracks = {
        total: data.total,
        limit: data.limit,
        time_period: timeRange,
        tracks: data.items.map((track, index) => ({
          rank: index + 1,
          id: track.id,
          title: track.name,
          artist: track.artists?.map(a => a.name).join(', '),
          album: track.album?.name,
          albumImageUrl: track.album?.images?.[0]?.url,
          trackUrl: track.external_urls?.spotify,
          previewUrl: track.preview_url,
          popularity: track.popularity,
          duration_ms: track.duration_ms,
          explicit: track.explicit
        }))
      };

      return res.status(200).json(topTracks);
    } catch (spotifyError) {
      console.error('Spotify API error:', spotifyError.response?.data || spotifyError.message);
      return res.status(spotifyError.response?.status || 500).json({ 
        error: 'Failed to fetch top tracks from Spotify' 
      });
    }
  } catch (err) {
    console.error('Error in top-tracks:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}