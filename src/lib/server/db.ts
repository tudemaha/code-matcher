import mongoose from 'mongoose';
import { MONGODB_URI } from '$app/env/private';

interface MongooseCache {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

declare global {
	var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
	global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
	const uri = MONGODB_URI || process.env.MONGODB_URI;

	if (!uri) {
		throw new Error(
			'MONGODB_URI is not defined. Please set your MongoDB connection string in the .env file.'
		);
	}

	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts: mongoose.ConnectOptions = {
			bufferCommands: false,
			dbName: 'code_matcher'
		};

		cached.promise = mongoose.connect(uri, opts).then((m) => {
			return m;
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}
