import { NextRequest, NextResponse } from "next/server";
// import ResumeSession from "@/models/resumeSession.model";
import mongoose from "mongoose";
import ResumeSession from "@/models/resumes.models";
import { createSystemMessage } from "@/lib/prompt";
import { createRequire } from "module";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/db";
import { User } from "next-auth";
import { isValidObjectId } from "@/lib/validid";

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse');

export async function POST(req: NextRequest) {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = session?.user
    console.log("user", user)
    if (!session || !session.user) {
        return Response.json(
            {
                success: true,
                message: 'Not authenticated',
            },
            { status: 200 }
        );
    }

    try {
        // const { userId, resumeText } = await req.json();
        const formData = await req.formData();
        const file = formData.get('file');
        console.log(file)
        if (!file || !(file instanceof Blob)) {
            return NextResponse.json({ error: 'No PDF file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await pdfParse(buffer);
        if (!data) {
            return NextResponse.json({ message: "Something went wrong during pdf scanning" })
        }

        // const contents = createSystemMessage(data?.text)

        const session = await ResumeSession.create({
            userId: user._id,
            resumeText: (data?.text) as string,
            // systemMessage: contents,
            resumeName: file.name,
            conversation: [],
        });

        if (!session) {
            return NextResponse.json({ success: false, message: "something went wrong during resume upload!!" }, { status: 401 })
        }
        return NextResponse.json({ sessionId: session._id });
    } catch (error) {
        console.error("Resume upload error:", error);
        return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 });
    }
}


export async function GET(_: NextRequest) {
    await dbConnect();
    try {
        const session = await ResumeSession.find();
        if (!session || session.length === 0) {
            return NextResponse.json({ message: "Sessions not found" }, { status: 404 });
        }
        console.log(session)
        return NextResponse.json({ success: true, message: "All sessions found", data: session }, { status: 200 });
    } catch (error: unknown) {
        let errorMessage = "Failed to fetch sessions";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}




export async function DELETE(req: NextRequest) {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = session?.user
    console.log("user", user)
    if (!session || !session.user) {
        return Response.json(
            {
                success: true,
                message: 'Not authenticated',
            },
            { status: 200 }
        );
    }
    try {
        const { resume_id } = await req.json()
        if (!resume_id || !isValidObjectId(resume_id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid resume ID' },
                { status: 400 }
            );
        }
        
        console.log(resume_id)
        const result = await ResumeSession.deleteOne({ _id: resume_id });

        if (result.deletedCount === 1) {
            return NextResponse.json(
                { success: true, message: 'Resume deleted successfully' },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { success: false, message: 'Resume not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error deleting resume:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
} 