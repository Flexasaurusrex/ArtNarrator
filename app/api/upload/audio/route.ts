import { NextRequest, NextResponse } from 'next/server';
import { createStorageAdapter } from '@/lib/storage';

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
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'mp3';
    const filename = `audio_${timestamp}_${randomSuffix}.${extension}`;

    // Upload using storage adapter
    const storage = createStorageAdapter();
    const fileUrl = await storage.upload(buffer, filename, file.type);

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
