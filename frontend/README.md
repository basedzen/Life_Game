# Game of Life - Frontend

A React + TypeScript frontend for the Game of Life application - a gamified life tracker with a Tron Legacy-inspired aesthetic.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom Tron-inspired theme
- **UI Components**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Fonts**: Noto Emoji (monochrome)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (Button, Dialog, etc.)
│   ├── IconSelector.tsx # Emoji picker component
│   ├── Layout.tsx      # Main layout wrapper with navigation
│   └── emoji-list.ts   # Curated emoji collection
├── pages/              # Route-level page components
│   ├── BulkWeeklyInput.tsx  # Bulk data entry for weekly rituals
│   ├── ConfigDeck.tsx       # Configuration management
│   ├── LogHistory.tsx       # View and edit log history
│   ├── Logger.tsx           # Quick logging interface
│   ├── WeeklyTracker.tsx    # Weekly progress dashboard
│   └── YearlyDashboard.tsx  # Yearly statistics view
├── lib/                # Utility libraries
│   ├── dateUtils.ts    # Centralized AEDT date handling
│   └── utils.ts        # General utilities (cn helper)
├── App.tsx             # Main app component with routing
├── api.ts              # API base URL configuration
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind config
```

## Key Features

### Date Handling
All date operations use the centralized `dateUtils.ts` module to ensure:
- Consistent AEDT (Australian Eastern Daylight Time) timezone handling
- Standardized `dd/mm/yyyy` format across the application
- Proper date parsing and formatting for API communication

### Pages Overview

- **Logger**: Quick entry interface for logging rituals and quotas with optional date selection
- **Weekly Tracker**: Visual progress dashboard showing weekly ritual completion
- **Bulk Weekly Input**: Efficient bulk data entry for multiple days
- **Log History**: View, edit (date, tag, value), and manage historical log entries
- **Yearly Dashboard**: Annual statistics and trends visualization
- **Config Deck**: Manage rituals, quotas, and application settings

### Design System

The application uses a custom Tron Legacy-inspired design with:
- High-contrast black/white/cyan color scheme
- Monochrome emoji icons via Noto Emoji font
- Glassmorphism effects and glowing accents
- Smooth animations and transitions
- Responsive layout optimized for desktop and mobile

## Development

### Prerequisites
- Node.js 18+ and npm

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure API endpoint in `src/api.ts` (defaults to `http://localhost:8001`)

3. Start development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle (TypeScript check + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Building for Production

```bash
npm run build
```

The optimized production build will be output to the `dist/` directory.

### Docker Deployment

The frontend is served via nginx in production. See the root `docker-compose.yml` for the complete deployment setup.

## Configuration

### Environment Variables

The frontend uses the backend API URL configured in `src/api.ts`. When running in Docker, nginx proxies API requests to the backend service.

### Tailwind Configuration

Custom theme configuration is in `tailwind.config.js`, including:
- Extended color palette with Tron-inspired colors
- Custom animations
- Zinc/Slate base theme

## Authentication

The application includes JWT-based authentication:
- Login page for user authentication
- Token storage in localStorage
- Automatic token inclusion in API requests
- Protected routes requiring authentication

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

When adding new features:
1. Use the centralized `dateUtils` for all date operations
2. Follow the existing component structure and naming conventions
3. Maintain the Tron aesthetic with consistent styling
4. Ensure responsive design works on mobile devices
5. Add TypeScript types for all new code
