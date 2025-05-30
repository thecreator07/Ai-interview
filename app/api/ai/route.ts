
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import MessageModel from "@/models/message.models";
import { ResponseData } from "@/lib/validid";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.BASE_URL
});

const extractedTextPath = path.resolve(process.cwd(), "extracted_text.txt");
const extractedText = await fs.readFile(extractedTextPath, "utf-8");
console.log(extractedText)
const systemMessage = `You are an AI assistant acting as an expert interviewer. Based on the provided content: ${extractedText}

Your task is to:
1. Ask one interview question at a time related to the provided content.
2. Wait for the user's answer.
3. Evaluate the user's answer by:
   - Analyzing the response.
   - Thinking critically about the content.
   - Providing an output that includes a rating and constructive feedback.
   - Validating the evaluation.
   - Presenting the final result with guidelines for improvement.

Follow the steps in sequence: "analyse","rating","guideline",and finally "question"

Rules:
1. Follow the strict JSON output as per the Output schema.
2. Always perform one step at a time and wait for the next input.
3. Carefully analyze the user's answer before proceeding.
4.

Output Format:
{ step: "string", content: "string" }

Example:
User's Answer: "Redux Toolkit is a tool for managing state in React."

Output:
{ step: "analyse", content: "The user provided a basic definition of Redux Toolkit." }
{ step: "rating", content: "3" }
{ step: "guideline", content: "1. The evaluation aligns with standard expectations for understanding Redux Toolkit.
 2.Something 
 3.something" }
{ step: "question", content: "Consider if the answer includes key features and benefits of Redux Toolkit." }

`

const finalResponsedata: ResponseData[] = [];

let previousQuestion = ""; // Track last question

export async function POST(request: NextRequest) {

  try {


    const { messages } = await request.json();
    const conversation = [{ role: "system", content: systemMessage }, ...messages];

    let currentRating = "";
    let currentGuideline = "";
    let currentQuestion = "";

    let retries = 5;

    console.log("user message", messages)
    while (retries--) {
      const response = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        response_format: { type: "json_object" },
        messages: conversation,
        max_tokens: 500,
      });

      const message = response.choices[0].message;
      if (!message.content) break;

      // console.log("Model message:", message);
      conversation.push({ role: "assistant", content: message.content });

      // Step matchers
      const ratingMatch = message.content.match(
        /{[\s\n]*"step"\s*:\s*"rating"\s*,\s*"content"\s*:\s*"([\s\S]*?)"[\s\n]*}/
      );
      const guidelineMatch = message.content.match(
        /{[\s\n]*"step"\s*:\s*"guideline"\s*,\s*"content"\s*:\s*"([\s\S]*?)"[\s\n]*}/
      );
      const questionMatch = message.content.match(
        /{[\s\n]*"step"\s*:\s*"question"\s*,\s*"content"\s*:\s*"([\s\S]*?)"[\s\n]*}/
      );

      if (ratingMatch) {
        currentRating = ratingMatch[1].replace(/\\"/g, '"');
      }

      if (guidelineMatch) {
        currentGuideline = guidelineMatch[1].replace(/\\"/g, '"');
      }

      if (questionMatch) {
        currentQuestion = questionMatch[1].replace(/\\"/g, '"');


        if (previousQuestion && currentRating && currentGuideline) {
          finalResponsedata.push({
            question: messages ? messages[messages.length - 2].content : "",
            rating: currentRating,
            guideline: currentGuideline,
            answer: messages ? messages[messages.length - 1].content : ""
            // filter(() => {
            //   // Get the last user message content
            //   const userMessages = messages?.filter((msg: { role: string, content: string }) => msg.role === 'user');
            //   return userMessages?.length ? userMessages[userMessages.length - 1].content : "";
            // })
          });

          console.log(finalResponsedata)
          currentRating = "";
          currentGuideline = "";
        }


        previousQuestion = currentQuestion;

        break;
      }

      // Simulate user acknowledgement to continue flow
      conversation.push({ role: "user", content: "ok" });
    }

    return NextResponse.json({
      content: currentQuestion || "Failed to generate a question.",
      history: finalResponsedata,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
