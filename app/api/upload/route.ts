import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
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
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'Only image files are allowed',
      }, { status: 400 });
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File too large. Maximum size is 10MB',
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `image_${timestamp}_${randomSuffix}.jpg`;

    // Process image with Sharp (resize, optimize)
    let processedBuffer = buffer;
    if (file.type !== 'image/svg+xml') {
      processedBuffer = await sharp(Buffer.from(buffer))
        .resize(1920, 1080, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer();
    }

    // Upload using storage adapter
    const storage = createStorageAdapter();
    const fileUrl = await storage.upload(processedBuffer, filename, 'image/jpeg');

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename: filename,
        size: processedBuffer.length,
        mimetype: 'image/jpeg',
      },
    });
  } catch (error) {
    console.error('Failed to upload file:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload file',
    }, { status: 500 });
  }
}
