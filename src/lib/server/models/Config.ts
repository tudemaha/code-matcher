import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IConfig extends Document {
	access_pin: string;
	matcher_count: number;
	request_count: number;
	last_used_at: Date | null;
	last_created_at: Date | null;
}

const ConfigSchema = new Schema<IConfig>(
	{
		access_pin: {
			type: String,
			default: () => process.env.ACCESS_PIN || '123456',
			required: true,
			trim: true
		},
		matcher_count: {
			type: Number,
			default: 0
		},
		request_count: {
			type: Number,
			default: 0
		},
		last_used_at: {
			type: Date,
			default: null
		},
		last_created_at: {
			type: Date,
			default: null
		}
	},
	{
		timestamps: false
	}
);

export const ConfigModel: Model<IConfig> =
	(mongoose.models.Config as Model<IConfig>) ||
	mongoose.model<IConfig>('Config', ConfigSchema, 'configs');

export async function getOrCreateConfig(): Promise<IConfig> {
	let config = await ConfigModel.findOne();
	if (!config) {
		config = await ConfigModel.create({
			access_pin: process.env.ACCESS_PIN || '123456',
			matcher_count: 0,
			request_count: 0,
			last_used_at: null,
			last_created_at: null
		});
	}
	return config;
}
