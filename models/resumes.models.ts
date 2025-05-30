import mongoose, { Schema, Types } from "mongoose";


export interface Messagedata extends Document {
    question: string
    answer: string
    content: string
    rating: string
    guideline: string
}


const MessageSchema: Schema<Messagedata> = new mongoose.Schema({
    question: { type: String },
    answer: { type: String },
    rating: { type: String, },
    guideline: { type: String },

});

export interface ResumeData extends Document {
    _id: string
    userId: Types.ObjectId | string
    resumeText: string
    systemMessage: string
    sessionTitle: string
    resumeName: string
    conversation: Messagedata[]
    createdAt: Date
    updatedAt: Date
}

const ResumeSessionSchema: Schema<ResumeData> = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeText: { type: String, required: true },
    // systemMessage: { type: String, required: true },
    sessionTitle: { type: String, default: "Interview Session" },
    conversation: [MessageSchema],
    resumeName: { type: String, required: true },

}, { timestamps: true });
const ResumeSession = mongoose.models.ResumeSession || mongoose.model("ResumeSession", ResumeSessionSchema);
export default ResumeSession
