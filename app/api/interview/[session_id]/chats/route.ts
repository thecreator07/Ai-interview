import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import ResumeSession from "@/models/resumes.models";
import dbConnect from "@/db";
import mongoose from "mongoose";
import { createSystemMessage } from "@/lib/prompt";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: process.env.BASE_URL,
});

export interface ResponseData {
    question: string;
    rating: string;
    guideline: string;
    answer: string
}



export async function POST(req: NextRequest, { params }: { params: Promise<{ session_id: string }> }) {
    await dbConnect()
    try {
        const { session_id } = await params;
        if (!session_id || !mongoose.isValidObjectId(session_id)) {
            return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
        }
        const { userMessage } = await req.json();
        console.log("userMessage:", userMessage);
        const session = await ResumeSession.findById(session_id);
        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
        // console.log("session", session);
        if (!session.resumeText) {
            return NextResponse.json({ error: "System message not found in session" }, { status: 400 });
        }
        const systemMessage = createSystemMessage(session.resumeText);
        const conversation = [{ role: "system", content: systemMessage }, ...userMessage];
        let currentRating = "";
        let currentGuideline = "";
        let currentQuestion = "";

        const finalResponsedata: ResponseData = {
            question: currentQuestion,
            rating: currentRating,
            guideline: currentGuideline,
            answer: ""
        };
        let anylytics: string = "";
        // console.log("user message", userMessage)
        // console.log(conversation)
        while (conversation.length < 20) {
            const response = await openai.chat.completions.create({
                model: "gemini-2.0-flash",
                response_format: { type: "json_object" },
                messages: conversation,
                max_tokens: 500,
            });

            const aiReply = response.choices[0].message?.content || "AI did not respond.";

            let aiReplyObj: any;
            try {
                aiReplyObj = JSON.parse(aiReply);
            } catch (err) {
                // If AI response is not valid JSON, return error response
                return NextResponse.json({ error: "AI response is not valid JSON", details: aiReply }, { status: 502 });
            }
            console.log("Model message:", aiReplyObj);


            conversation.push({
                role: "assistant",
                content: aiReply,
            });

            const step = aiReplyObj?.step;
            const content = aiReplyObj?.content;

            if (step === "rating") {
                currentRating = content;
                finalResponsedata.rating = currentRating;
            } else if (step === "guideline") {
                currentGuideline = content;
                finalResponsedata.guideline = currentGuideline;
            } else if (step === "question") {
                currentQuestion = content;
                const hasQuestionMark = currentQuestion.includes('?');
                if (
                    userMessage.length >= 2 &&
                    userMessage[userMessage.length - 2]?.role === "assistant" &&
                    userMessage[userMessage.length - 1]?.role === "user"
                ) {
                    finalResponsedata.question = userMessage[userMessage.length - 2].content;
                    finalResponsedata.answer = hasQuestionMark ? userMessage[userMessage.length - 1].content : anylytics;
                }

                currentRating = "";
                currentGuideline = "";
                break;
            } else if (step === "analyse") {
                anylytics = content;
                finalResponsedata.question = "Analytics";
                finalResponsedata.answer = anylytics;
                continue
            } else {
                break;
            }
        }



        console.log("finalresponce:", finalResponsedata);
        if (
            finalResponsedata.question !== "" &&
            finalResponsedata.answer !== "" &&
            finalResponsedata.rating !== "" &&
            finalResponsedata.guideline !== ""
        ) {
            session.conversation.push(finalResponsedata);
            await session.save();
        }
        return NextResponse.json({ content: currentQuestion, sessionId: session._id });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
    }
}





export async function GET(
    _: NextRequest,
    { params }: { params: Promise<{ session_id: string }> }
) {
    await dbConnect();
    const { session_id } = await params;
    console.log("session_id:", session_id);
    if (!session_id || !mongoose.isValidObjectId(session_id)) {
        return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    try {
        const session = await ResumeSession.findById(session_id).lean();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Session fetched successfully", session }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch session' }, { status: 500 });
    }
}