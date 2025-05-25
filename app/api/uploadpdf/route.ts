import { NextRequest, NextResponse } from 'next/server';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse');

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json({ error: 'No PDF file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // console.log(await file.text(),file.name)
        const data = await pdfParse(buffer);
        if (!data) {
            return NextResponse.json({ message: "Something went wrong during pdf scanning" })
        }
        // Save extracted text to a .txt file
        const outputPath = path.join(process.cwd(), 'extracted_text.txt');
        // Delete previous file if exists
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        fs.writeFileSync(outputPath, data.text, 'utf8');
        console.log(`Extracted text saved to ${outputPath}`);
        return NextResponse.json({ message: 'PDF uploaded', text: data.text });
    } catch (error) {
        console.error('Error processing PDF:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
