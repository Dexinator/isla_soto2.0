# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based web application for the Isla del Soto accessible audio guide system in Santa Marta de Tormes, Salamanca. The project provides multiple types of audioguides (normative, descriptive, easy reading, sign language) and English audio guides for murals and points of interest.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server at localhost:4321
npm run dev

# Build production site to ./dist/
npm run build

# Preview production build locally
npm run preview

# Run Astro CLI commands
npm run astro -- --help
```

## Architecture and Key Components

### Technology Stack
- **Framework**: Astro 5.8.1 with React integration
- **Styling**: Tailwind CSS v4 (via Vite plugin)
- **Languages**: JavaScript/JSX for React components, Astro for pages
- **TypeScript**: Configured with strict mode

### Project Structure

```
src/
├── pages/              # Astro pages (routes)
│   ├── index.astro    # Home page with navigation cards
│   ├── audioguia-*.astro # Different audioguide types
│   ├── signoguia.astro   # Sign language guide
│   └── english/       # English version
├── components/
│   ├── react/         # React interactive components
│   │   ├── AudioPlayer.jsx
│   │   ├── AudioguideContainer.jsx
│   │   ├── SignoguideContainer.jsx
│   │   ├── VimeoPlayer.jsx
│   │   ├── SoundCloudPlayer.jsx
│   │   └── MapComponent.jsx
│   └── ui/            # Astro UI components
│       ├── Layout.astro
│       ├── Header.astro
│       ├── Footer.astro
│       └── Card.astro
├── data/
│   ├── murals.json    # Main data source for murals
│   ├── content-es.json # Spanish translations
│   └── content-en.json # English translations
└── assets/
    └── images/
        ├── sites/     # Mural images
        └── icons/     # Navigation icons
```

### Key Data Structure

The application centers around `murals.json`, which contains mural data with:
- Multilingual titles and descriptions (es/en)
- Audio URLs for different guide types (normal, descriptive, easy)
- Video URLs for sign language guides
- Image paths and alt text
- Location and artist information

### Audio/Video Integration

The app supports multiple audio/video providers:
- **SoundCloud**: Embedded player URLs
- **Vimeo**: Video player for sign language content
- **Direct MP3**: Local or remote audio files
- **Audio.com**: Embedded audio player

### Accessibility Features

Built-in accessibility support includes:
- Multiple audioguide formats (descriptive, easy reading, sign language)
- Multilingual support (Spanish/English)
- Alt text for all images
- ARIA labels and semantic HTML
- High contrast mode support
- Font size adjustment capabilities

### Component Patterns

**React Components**: Handle interactive features like audio playback, playlist management, and map interactions. Components receive data via props from Astro pages.

**Astro Components**: Handle static UI, layouts, and SSG-optimized content. Use `.astro` files for better performance where interactivity isn't needed.

**Data Flow**: Pages import JSON data directly and pass to components. No global state management - each audioguide type manages its own state.

### Image Handling

Images are stored in `src/assets/images/` and imported for optimization. The app uses multiple image components:
- `MuralImage.jsx` - Standard image display
- `MuralImageOptimized.jsx` - Performance-optimized version
- `MuralImageSimple.jsx` - Lightweight variant

### Docker Support

The project includes Docker configurations for both development and production environments with `docker-compose.yml` for orchestration.

## Important Considerations

- The app is mobile-first with responsive design for tablets and desktop
- All audioguide pages follow the same pattern: Container component + data prop
- Audio URLs can be embeds (SoundCloud, Audio.com) or direct MP3 links
- The project uses Astro's static site generation for optimal performance
- React is only used where client-side interactivity is necessary