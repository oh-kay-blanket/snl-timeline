# SNL Timeline Visualization

An interactive visualization of Saturday Night Live cast members across all seasons, featuring smooth scroll-based transitions and organic clustering.

## Features

- **Vertical scroll navigation** with snap-to-season behavior
- **Organic clustering** of cast members using force-directed layout
- **Smooth GSAP animations** for cast transitions:
  - New cast members slide in from the left
  - Departing cast members slide out to the right
  - Continuing cast members smoothly reposition
- **Interactive cast members** with hover tooltips and click-to-view bios
- **Sprite-based rendering** for efficient photo display

## Data Source

Cast and season data from: https://docs.google.com/spreadsheets/d/1iK1o_LQ9kEcddWNBS6NihfF5cYatHJZHv4jvNsswd0w

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **GSAP** for smooth animations
- **CSS Grid & Flexbox** for layout

## Project Structure

```
src/
├── components/       # React components
├── data/            # Converted TypeScript data files
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (clustering, sprites, data parsing)
└── App.tsx          # Main application
```

## License

MIT
