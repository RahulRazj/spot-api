import axios from 'axios';
import { Redis } from '@upstash/redis';
import { getAccessToken } from '../auth/spotifyAuth.js';
import { SPOTIFY_API_ENDPOINTS, SPOTIFY_STATUS_CODES } from '../config/spotify.js';

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export default async function handler(req, res) {
	const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
	const origin = req.headers.origin || req.headers.referer || '';

	if (allowedOrigin && !origin.includes(allowedOrigin)) {
		return res.status(403).json({ error: 'Forbidden origin' });
	}

	// Check for ghost mode from Redis
	const ghostModeEnabled = (await redis.get('ghost_mode_enabled')) || false;

	if (ghostModeEnabled) {
		const ghostState = {
			isPlaying: false,
			title: null,
			artist: null,
			album: null,
			albumImageUrl: null,
			songUrl: null,
			deviceName: null,
			deviceType: null,
			progressMs: null,
			durationMs: null
		};
		return res.status(200).json(ghostState);
	}

	try {
		const token = await getAccessToken();

		try {
			const response = await axios.get(SPOTIFY_API_ENDPOINTS.PLAYER_STATE, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			const data = response.data;

			const song = {
				isPlaying: data.is_playing,
				title: data.item?.name,
				artist: data.item?.artists?.map(a => a.name).join(', '),
				album: data.item?.album?.name,
				albumImageUrl: data.item?.album?.images?.[0]?.url,
				songUrl: data.item?.external_urls?.spotify,
				deviceName: data.device?.name,
				deviceType: data.device?.type,
				progressMs: data.progress_ms,
				durationMs: data.item?.duration_ms
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
		console.error('Error in player state:', err);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}
