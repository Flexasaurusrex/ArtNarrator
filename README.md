# ArtNarrator

A production-ready web application for creating cinematic video essays with on-screen narration, elegant typography, and professional effects.

## Features

- **Timeline-Based Editing**: Drag & drop scene management with precise timing controls
- **Professional Typography**: Multiple font families with accessibility checks and live preview
- **Cinematic Effects**: Ken Burns, panning, and fade effects with customizable parameters
- **AI Image Generation**: Optional integration with Replicate for AI-powered visuals
- **Background Music**: Waveform editing with auto-ducking and trim controls
- **Multiple Export Formats**: MP4 (H.264) and GIF export with subtitle generation
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Template System**: Pre-built templates for different video styles

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, shadcn/ui
- **State Management**: Zustand with URL serialization
- **Database**: Prisma with SQLite (dev) / PostgreSQL (prod)
- **Video Rendering**: Remotion (React-based video composition)
- **Audio Processing**: wavesurfer.js for waveform visualization
- **File Storage**: Local, AWS S3, or Supabase Storage
- **Deployment**: Vercel (frontend) + render workers for video processing

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd artnarrator
