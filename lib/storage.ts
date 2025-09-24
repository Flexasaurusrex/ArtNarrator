import AWS from 'aws-sdk';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

export interface StorageAdapter {
  upload(file: Buffer, filename: string, contentType: string): Promise<string>;
  delete(url: string): Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'public', 'uploads');
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }

    const filepath = join(this.uploadDir, filename);
    await writeFile(filepath, file);
    
    return `/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    // Implementation for local file deletion
  }
}

class SupabaseStorageAdapter implements StorageAdapter {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and ANON KEY are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET || 'artnarrator';
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filename, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filename);

    return urlData.publicUrl;
  }

  async delete(url: string): Promise<void> {
    const filename = url.split('/').pop();
    if (!filename) return;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([filename]);

    if (error) {
      console.error('Failed to delete file from Supabase:', error);
    }
  }
}

class S3StorageAdapter implements StorageAdapter {
  private s3: AWS.S3;
  private bucket: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.bucket = process.env.AWS_S3_BUCKET || 'artnarrator-uploads';
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: filename,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  async delete(url: string): Promise<void> {
    const key = url.split('/').pop();
    if (!key) return;

    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    await this.s3.deleteObject(params).promise();
  }
}

// Factory function to create storage adapter based on environment
export function createStorageAdapter(): StorageAdapter {
  const storageType = process.env.STORAGE_TYPE || 'local';

  switch (storageType) {
    case 's3':
      return new S3StorageAdapter();
    case 'supabase':
      return new SupabaseStorageAdapter();
    case 'local':
    default:
      return new LocalStorageAdapter();
  }
}
