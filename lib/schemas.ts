import { z } from 'zod';

// Base enums and constants
export const ASPECT_RATIOS = ['1080x1920', '1920x1080', '1080x1080', '1080x1350'] as const;
export const SCENE_FX = ['none', 'fade', 'kenburns_slow', 'kenburns_medium', 'pan_right', 'pan_left'] as const;
export const SAFE_AREAS = ['top', 'bottom', 'custom'] as const;
export const TEXT_WEIGHTS = ['400', '600', '700', '800'] as const;
export const TEXT_ALIGNS = ['left', 'center', 'right'] as const;
export const RENDER_STATUS = ['queued', 'rendering', 'done', 'error'] as const;

// Project Schema
export const ProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  aspect: z.enum(ASPECT_RATIOS),
  fps: z.number().min(24).max(60).default(30),
  bgColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').default('#000000'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateProjectSchema = ProjectSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Scene Schema
export const SceneSchema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  order: z.number().min(0),
  durationSec: z.number().min(0.25).max(30, 'Max scene duration is 30s'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  title: z.string().max(100, 'Title too long').default(''),
  body: z.string().max(500, 'Body text too long').default(''),
  credit: z.string().max(200, 'Credit too long').default(''),
  fx: z.enum(SCENE_FX).default('none'),
  safeArea: z.enum(SAFE_AREAS).default('bottom'),
  textStyleId: z.string().optional(),
});

export const CreateSceneSchema = SceneSchema.omit({ id: true });

export const UpdateSceneSchema = SceneSchema.partial().extend({
  id: z.string(),
});

// Text Style Schema  
export const TextStyleSchema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  name: z.string().min(1).max(50).default('Default'),
  titleFont: z.string().default('Inter'),
  bodyFont: z.string().default('Inter'),
  titleSize: z.number().min(28).max(120).default(64),
  bodySize: z.number().min(16).max(80).default(44),
  weight: z.enum(TEXT_WEIGHTS).default('600'),
  align: z.enum(TEXT_ALIGNS).default('left'),
  shadow: z.number().min(0).max(1).default(0.4),
  outline: z.number().min(0).max(8).default(2),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#ffffff'),
  bgBlur: z.number().min(0).max(1).default(0),
  bgOpacity: z.number().min(0).max(1).default(0),
  padding: z.number().min(8).max(64).default(32),
});

export const CreateTextStyleSchema = TextStyleSchema.omit({ id: true });

// Music Track Schema
export const MusicTrackSchema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  url: z.string().url('Invalid audio URL'),
  inSec: z.number().min(0).default(0),
  outSec: z.number().min(0).optional(),
  volume: z.number().min(0).max(1).default(0.5),
  duckUnderText: z.boolean().default(false),
});

export const CreateMusicTrackSchema = MusicTrackSchema.omit({ id: true });

// Render Job Schema
export const RenderJobSchema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  status: z.enum(RENDER_STATUS).default('queued'),
  progress: z.number().min(0).max(1).default(0),
  outputUrl: z.string().url().optional(),
  logs: z.string().optional(),
  settings: z.string().optional(), // JSON string
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Render Settings Schema
export const RenderSettingsSchema = z.object({
  quality: z.enum(['draft', 'standard', 'high']).default('standard'),
  format: z.enum(['mp4', 'gif']).default('mp4'),
  width: z.number().positive(),
  height: z.number().positive(),
  fps: z.number().min(24).max(60),
  bitrate: z.number().positive().optional(),
  includeSubtitles: z.boolean().default(true),
});

// Complete Project Export Schema (for JSON export/import)
export const ProjectExportSchema = z.object({
  project: ProjectSchema,
  scenes: z.array(SceneSchema),
  textStyles: z.array(TextStyleSchema),
  musicTracks: z.array(MusicTrackSchema),
});

// CSV Import Schema (simplified)
export const SceneCSVSchema = z.object({
  order: z.number().or(z.string().transform(Number)),
  durationSec: z.number().or(z.string().transform(Number)),
  imageUrl: z.string().optional(),
  title: z.string().default(''),
  body: z.string().default(''),
  credit: z.string().default(''),
  fx: z.enum(SCENE_FX).or(z.string()).default('none'),
});

// API Response Schemas
export const ApiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
});

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
});

export const ApiResponseSchema = z.union([ApiSuccessSchema, ApiErrorSchema]);

// Upload Schema
export const UploadResponseSchema = z.object({
  url: z.string(),
  filename: z.string(),
  size: z.number(),
  mimetype: z.string(),
});

// AI Image Generation Schema
export const AIImagePromptSchema = z.object({
  prompt: z.string().min(5, 'Prompt too short').max(500, 'Prompt too long'),
  style: z.enum(['photographic', 'cinematic', 'artistic', 'vintage']).default('cinematic'),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:5']).default('16:9'),
});

// Type exports
export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type CreateScene = z.infer<typeof CreateSceneSchema>;
export type UpdateScene = z.infer<typeof UpdateSceneSchema>;
export type TextStyle = z.infer<typeof TextStyleSchema>;
export type CreateTextStyle = z.infer<typeof CreateTextStyleSchema>;
export type MusicTrack = z.infer<typeof MusicTrackSchema>;
export type CreateMusicTrack = z.infer<typeof CreateMusicTrackSchema>;
export type RenderJob = z.infer<typeof RenderJobSchema>;
export type RenderSettings = z.infer<typeof RenderSettingsSchema>;
export type ProjectExport = z.infer<typeof ProjectExportSchema>;
export type SceneCSV = z.infer<typeof SceneCSVSchema>;
export type ApiResponse<T = any> = { success: true; data: T; message?: string } | { success: false; error: string; details?: any };
export type UploadResponse = z.infer<typeof UploadResponseSchema>;
export type AIImagePrompt = z.infer<typeof AIImagePromptSchema>;

// Validation helpers
export const validateProject = (data: unknown) => ProjectSchema.parse(data);
export const validateScene = (data: unknown) => SceneSchema.parse(data);
export const validateTextStyle = (data: unknown) => TextStyleSchema.parse(data);
export const validateMusicTrack = (data: unknown) => MusicTrackSchema.parse(data);
export const validateRenderJob = (data: unknown) => RenderJobSchema.parse(data);
export const validateRenderSettings = (data: unknown) => RenderSettingsSchema.parse(data);
