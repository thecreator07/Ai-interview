import mongoose, { Schema, Types } from 'mongoose';

export interface Message extends Document {
    _id: string;
    // chatSession: Types.ObjectId | string
    // sender: string
    question: string
    answer: string
    content: string
    rating: string
    guideline: string
    timestamp: Date
}

const MessageSchema: Schema<Message> = new mongoose.Schema({
    // chatSession: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true }, 
    question: { type: String },
    // sender: { type: String, enum: ['user', 'interviewer'], required: true },
    answer: { type: String },
    // content: { type: String, required: true },
    rating: { type: String, },
    guideline: { type: String },
},{timestamps:true});

const MessageModel = (mongoose.models.Message as mongoose.Model<Message>) || mongoose.model<Message>('Message', MessageSchema)

export default MessageModel
