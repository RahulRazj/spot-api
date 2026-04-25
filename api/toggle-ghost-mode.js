import { Redis } from '@upstash/redis';
import crypto from 'crypto';

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

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { password } = req.body;

	if (!password) {
		return res.status(400).json({ error: 'Password required' });
	}

	// Hash the provided password
	const hash = crypto.createHash('sha256').update(password).digest('hex');

	// Get stored password hash from Redis
	const storedHash = await redis.get('ghost_mode_password_hash');

	if (!storedHash) {
		return res.status(401).json({ error: 'Ghost mode not configured. Please setup upstash redis first.' });
	}

	if (hash !== storedHash) {
		return res.status(401).json({ error: 'Invalid password' });
	}

	// Toggle the ghost mode
	const currentState = (await redis.get('ghost_mode_enabled')) || false;
	const newState = !currentState;
	await redis.set('ghost_mode_enabled', newState);

	return res.status(200).json({
		success: true,
		ghostMode: newState
	});
}
