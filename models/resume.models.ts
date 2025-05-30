import mongoose, { Schema, Types } from 'mongoose';

export interface Resume extends Document {
    _id: string;
    user: Types.ObjectId | string;
    title: string;
    content: string;
    chatSessions: (Types.ObjectId | string)[];
    createdAt: Date;
}

const ResumeSchema: Schema<Resume> = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true }, // Could be raw text or structured JSON
    // chatSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' }],
    
},{timestamps:true});


const ResumeModel = (mongoose.models.Resume as mongoose.Model<Resume>) || mongoose.model<Resume>('Resume', ResumeSchema)

export default ResumeModel
