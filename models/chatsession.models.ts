import mongoose, { Schema, Types } from 'mongoose';
import { Message } from './message.models';

export interface ChatSession extends Document {
    _id: string;
    resume: Types.ObjectId | string
    messages: Message[]
    startedAt: Date
    endedAt: Date
}

const ChatSessionSchema: Schema<ChatSession> = new mongoose.Schema({
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
   
},{timestamps:true});

const ChatSessionModel = (mongoose.models.ChatSession as mongoose.Model<ChatSession>) || mongoose.model<ChatSession>('ChatSession', ChatSessionSchema)

export default ChatSessionModel
