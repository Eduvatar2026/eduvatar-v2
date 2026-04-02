import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to textbook-data directory
    const uploadDir = join(process.cwd(), 'textbook-data');
    await mkdir(uploadDir, { recursive: true });
    
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      filename,
      message: `Uploaded ${filename}. Run 'npm run process-pdfs' to extract text content.`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
