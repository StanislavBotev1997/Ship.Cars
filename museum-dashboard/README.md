# Museum Intelligence Dashboard

A production-quality React application for exploring The Metropolitan Museum of Art Collection.

## Tech Stack

- **React** (JavaScript)
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Sass (SCSS)** - Styling
- **Vitest** - Testing
- **Vite** - Build tool

## Features

### Feature A — Research Gallery (Discovery)

- Gallery grid displaying artworks with:
  - Primary image (primaryImageSmall)
  - Title
  - Artist name
  - Object date

- **Filtering System:**
  - Keyword search (q)
  - Department filter (departmentId)
  - Date range filter (dateBegin, dateEnd) supporting BCE and CE
  - Multiple filters work simultaneously

- **Performance Optimizations:**
  - Parallel fetching of object details
  - Pagination/incremental loading (20 items per batch)
  - Responsive UI during filtering
  - Loading states and error handling

- **State Persistence:**
  - All filter state reflected in URL query params
  - Page refresh restores filter state

### Feature B — Artifact Analysis (Detail View)

- Displays comprehensive artwork information:
  - High resolution image (primaryImage)
  - Accession number
  - Medium
  - Dimensions
  - Tags
  - Credit line
  - Artist bio
  - Culture, period, dynasty (when available)

- **Automated Cross-Referencing:**
  - Shows related works based on:
    - Same time period (±50 years of objectBeginDate/objectEndDate)
  - Displays up to 6 related artworks

- **Data Integrity:**
  - Handles missing images gracefully
  - Provides fallbacks for missing metadata
  - Handles inconsistent date formats
  - Manages null values throughout

## Project Structure

```
src/
├── api/
│   └── metMuseumApi.js          # API service layer
├── store/
│   ├── store.js                 # Redux store configuration
│   └── slices/
│       ├── artworksSlice.js     # Artworks list state
│       ├── artworkDetailSlice.js # Artwork detail state
│       ├── filtersSlice.js      # Filter state
│       └── departmentsSlice.js  # Departments state
├── components/
│   ├── ArtworkCard.jsx          # Artwork card component
│   ├── SearchFilters.jsx        # Search and filter component
│   ├── LoadingSpinner.jsx       # Loading indicator
│   └── ErrorMessage.jsx         # Error display component
├── pages/
│   ├── Gallery.jsx              # Main gallery page
│   └── ArtworkDetail.jsx        # Artwork detail page
├── styles/
│   ├── index.scss               # Global styles
│   ├── App.scss                 # App styles
│   ├── Gallery.scss             # Gallery page styles
│   ├── ArtworkCard.scss         # Artwork card styles
│   ├── SearchFilters.scss       # Filter component styles
│   ├── LoadingSpinner.scss      # Loading spinner styles
│   ├── ErrorMessage.scss        # Error message styles
│   └── ArtworkDetail.scss       # Detail page styles
├── utils/
│   └── dataTransformers.js      # Data transformation utilities
├── tests/
│   ├── setup.js                 # Test setup
│   ├── api/                     # API tests
│   ├── store/                   # Redux tests
│   └── utils/                   # Utility tests
├── App.jsx                      # Main app component
└── main.jsx                     # App entry point
```

## Installation

**Note:** This project requires Node.js version 20.19+ or 22.12+. If you're using Node.js 20.16.0, you may encounter compatibility issues with the latest Vite version.

### Option 1: Upgrade Node.js (Recommended)

```bash
# Using nvm (Node Version Manager)
nvm install 20.19.0
nvm use 20.19.0
```

### Option 2: Use Compatible Versions

The project is configured to use Vite 5.4.11 which is compatible with Node.js 20.16.0.

```bash
cd museum-dashboard
npm install
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## API Documentation

This application uses The Metropolitan Museum of Art Collection API:
https://collectionapi.metmuseum.org/public/collection/v1/

### Key Endpoints Used:

- `GET /search` - Search for object IDs
- `GET /objects/{objectID}` - Get object details
- `GET /departments` - Get all departments

## Architecture Highlights

### Clean Code Principles

- **Separation of Concerns:** API layer, state management, UI components are clearly separated
- **Reusable Components:** All UI components are modular and reusable
- **Type Safety:** Comprehensive data transformation with fallbacks
- **Error Handling:** Graceful error handling throughout the application

### Performance Optimizations

- **Parallel Fetching:** Multiple artwork details fetched simultaneously
- **Incremental Loading:** Load more functionality for better UX
- **Image Lazy Loading:** Images load as they come into viewport
- **Memoization:** Redux selectors prevent unnecessary re-renders

### State Management

- **Redux Toolkit:** Modern Redux with less boilerplate
- **Async Thunks:** Handle all async operations
- **Normalized State:** Efficient state structure
- **URL Sync:** Filters synchronized with URL for shareability

## Testing

The project includes test setup for:

- **Unit Tests:** Data transformation functions
- **Integration Tests:** Redux slices and async thunks
- **API Tests:** API service layer

Run tests with:
```bash
npm test
```

## Responsive Design

The application is fully responsive with breakpoints for:
- Desktop (1400px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Add favorites/bookmarking functionality
- Implement advanced search with more filters
- Add artwork comparison feature
- Export search results
- Add user authentication
- Implement virtual scrolling for large result sets

## License

MIT

## Author

Built as a production-quality demonstration of modern React development practices.
