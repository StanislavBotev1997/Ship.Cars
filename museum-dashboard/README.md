# Museum Intelligence Dashboard

A React-based web application for exploring The Metropolitan Museum of Art Collection. Built as a technical assignment for Ship.Cars, this project demonstrates modern frontend development practices with a focus on performance, scalability, and user experience.

## Features

- **Research Gallery** - Browse artworks with advanced filtering (keyword search, department, date range)
- **Progressive Loading** - Efficient pagination with "Load More" functionality
- **Artifact Detail View** - Comprehensive artwork information with high-resolution images
- **Related Works** - Automated cross-referencing based on time period
- **URL State Persistence** - Shareable URLs that preserve filter state
- **Dark Mode** - Custom theme toggle for improved accessibility
- **Error Handling** - Graceful fallbacks for missing data and API errors
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

## Tech Stack

- **React** - UI library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Sass (SCSS)** - Styling
- **Vitest** - Testing framework

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd museum-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm test` - Run test suite with Vitest
- `npm run lint` - Run ESLint for code quality checks

## Project Structure

```
src/
├── api/                    # API service layer
├── components/             # Reusable UI components
├── pages/                  # Page-level components
├── store/                  # Redux store and slices
├── styles/                 # SCSS stylesheets
├── utils/                  # Utility functions
└── tests/                  # Test files
```

## API

This application uses the **Metropolitan Museum of Art Collection API**:

- Base URL: `https://collectionapi.metmuseum.org/public/collection/v1/`
- Documentation: [Met Museum API](https://metmuseum.github.io/)

Key endpoints:
- `/search` - Search for artwork IDs
- `/objects/{objectID}` - Retrieve artwork details
- `/departments` - List all museum departments

## Notes

This project was built as part of the Ship.Cars technical interview process. The implementation emphasizes:

- **Performance** - Parallel data fetching, incremental loading, and optimized rendering
- **Scalability** - Modular architecture with clear separation of concerns
- **Code Quality** - Clean code principles, comprehensive error handling, and maintainable structure
- **User Experience** - Responsive design, loading states, and intuitive navigation

## License

MIT
