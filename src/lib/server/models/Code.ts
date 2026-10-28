import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ICode {
	_id: mongoose.Types.ObjectId;
	title: string;
	programming_language: string;
	code: string;
	created_at: Date;
}

export type CodeDocument = Document<unknown, object, ICode> & ICode;

const CodeSchema = new Schema<ICode>(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
			maxlength: [120, 'Title cannot exceed 120 characters']
		},
		programming_language: {
			type: String,
			required: [true, 'Programming language is required'],
			trim: true,
			lowercase: true
		},
		code: {
			type: String,
			required: [true, 'Reference code is required']
		},
		created_at: {
			type: Date,
			default: Date.now,
			// 48 hours TTL index: 48 * 60 * 60 = 172800 seconds
			index: { expireAfterSeconds: 172800 }
		}
	},
	{
		timestamps: false,
		toJSON: {
			virtuals: true,
			transform: (_doc, ret: Record<string, unknown>) => {
				ret.id = String(ret._id);
				return ret;
			}
		}
	}
);

export const CodeModel: Model<ICode> =
	(mongoose.models.Code as Model<ICode>) || mongoose.model<ICode>('Code', CodeSchema, 'codes');
