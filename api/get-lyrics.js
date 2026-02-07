import axios from 'axios';
import { SPOTIFY_API_ENDPOINTS } from '../config/spotify.js';

export default async function handler(req, res) {
	const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
	const origin = req.headers.origin || req.headers.referer || '';

	if (allowedOrigin && !origin.includes(allowedOrigin)) {
		return res.status(403).json({ error: 'Forbidden origin' });
	}

	const { track_name, artist_name, album_name, duration } = req.query;

	if (!track_name || !artist_name || !album_name || !duration) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	try {
		const response = await axios.get(SPOTIFY_API_ENDPOINTS.GET_LYRICS, {
			params: {
				track_name,
				artist_name,
				album_name,
				duration
			},
			headers: {
				'User-Agent': 'Spot-Api v1.0.0 (https://rahul-chaurasiya.com.np)',
				Accept: 'application/json'
			}
		});

		if (response.status == 200) {
			return res.status(200).json(response.data);
		}

		return res.status(response.status).json({ error: 'Failed to fetch lyrics' });
	} catch (err) {
		if (axios.isAxiosError(err) && err.response) {
			if (err.response.status === 404) {
				return res.status(404).json({ error: 'Lyrics not found' });
			}

			return res.status(err.response.status).json({
				error: 'Failed to fetch lyrics'
			});
		}

		return res.status(500).json({ error: 'Internal server error' });
	}
}
