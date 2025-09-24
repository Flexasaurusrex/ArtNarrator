import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided',
      }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({
        success: false,
        error: 'Only audio files are allowed',
      }, { status: 400 });
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File too large. Maximum size is 50MB',
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'mp3';
    const filename = `audio_${timestamp}.${extension}`;
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'audio');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/audio/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename: filename,
        size: buffer.length,
        mimetype: file.type,
      },
    });
  } catch (error) {
    console.error('Failed to upload audio:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload audio file',
    }, { status: 500 });
  }
}
