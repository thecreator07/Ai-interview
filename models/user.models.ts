// models/User.ts
import mongoose, { Schema, Types } from 'mongoose';
import { Resume } from './resume.models';

export interface User extends Document {
    _id: string;
    // username: string;
    email: string;
    password: string;
    resumes: Resume[]
    // createdAt: Date
}

const UserSchema: Schema<User> = new Schema({
    // username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // resumes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resume' }],
    // createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const UserModel =
    (mongoose.models.User as mongoose.Model<User>) ||
    mongoose.model<User>('User', UserSchema);


export default UserModel
