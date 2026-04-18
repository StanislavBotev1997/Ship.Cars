import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { searchAndFetchArtworks, loadMoreArtworks } from '../store/slices/artworksSlice';
import { setAllFilters } from '../store/slices/filtersSlice';
import { fetchDepartments } from '../store/slices/departmentsSlice';
import { buildQueryParamsFromURL, buildURLFromQueryParams } from '../utils/dataTransformers';
import SearchFilters from '../components/SearchFilters';
import ArtworkCard from '../components/ArtworkCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/Gallery.scss';

const Gallery = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { artworks, loading, loadingMore, error, hasMore, total } = useSelector((state) => state.artworks);
  const filters = useSelector((state) => state.filters);
  const { departments } = useSelector((state) => state.departments);
  
  // Load departments on mount
  useEffect(() => {
    if (departments.length === 0) {
      dispatch(fetchDepartments());
    }
  }, [dispatch, departments.length]);
  
  // Initialize filters from URL on mount
  useEffect(() => {
    const urlParams = buildQueryParamsFromURL(searchParams);
    if (Object.keys(urlParams).length > 0) {
      dispatch(setAllFilters(urlParams));
      dispatch(searchAndFetchArtworks(urlParams));
    } else {
      // Default search to show some artworks
      const defaultParams = { q: 'sunflowers' };
      dispatch(searchAndFetchArtworks(defaultParams));
    }
  }, []); // Only run on mount
  
  const handleSearch = (searchFilters) => {
    // Update URL with new filters
    const newSearchParams = buildURLFromQueryParams(searchFilters);
    setSearchParams(newSearchParams);
    
    // Fetch artworks with new filters
    dispatch(searchAndFetchArtworks(searchFilters));
  };
  
  const handleLoadMore = () => {
    dispatch(loadMoreArtworks());
  };
  
  const handleRetry = () => {
    dispatch(searchAndFetchArtworks(filters));
  };
  
  return (
    <div className="gallery">
      <header className="gallery__header">
        <h1 className="gallery__title">Museum Intelligence Dashboard</h1>
        <p className="gallery__subtitle">
          Explore The Metropolitan Museum of Art Collection
        </p>
      </header>
      
      <div className="gallery__filters">
        <SearchFilters onSearch={handleSearch} />
      </div>
      
      {loading && <LoadingSpinner message="Searching artworks..." />}
      
      {error && !loading && (
        <ErrorMessage message={error} onRetry={handleRetry} />
      )}
      
      {!loading && !error && artworks.length === 0 && (
        <div className="gallery__empty">
          <p>No artworks found. Try adjusting your search filters.</p>
        </div>
      )}
      
      {!loading && artworks.length > 0 && (
        <>
          <div className="gallery__results-info">
            <p>
              Showing {artworks.length} of {total} results
            </p>
          </div>
          
          <div className="gallery__grid">
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.objectID} artwork={artwork} />
            ))}
          </div>
          
          {hasMore && (
            <div className="gallery__load-more">
              <button
                className="btn btn--primary"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Gallery;
