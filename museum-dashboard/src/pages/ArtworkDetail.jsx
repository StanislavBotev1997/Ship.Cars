import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArtworkDetail, fetchRelatedArtworks, clearArtworkDetail } from '../store/slices/artworkDetailSlice';
import { getPlaceholderImage } from '../utils/dataTransformers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ArtworkCard from '../components/ArtworkCard';
import '../styles/ArtworkDetail.scss';

const ArtworkDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { artwork, relatedArtworks, loading, loadingRelated, error } = useSelector(
    (state) => state.artworkDetail
  );
  
  useEffect(() => {
    if (id) {
      dispatch(fetchArtworkDetail(parseInt(id, 10)));
    }
    
    return () => {
      dispatch(clearArtworkDetail());
    };
  }, [dispatch, id]);
  
  useEffect(() => {
    if (artwork && !loadingRelated && relatedArtworks.length === 0) {
      dispatch(fetchRelatedArtworks());
    }
  }, [artwork, dispatch, loadingRelated, relatedArtworks.length]);
  
  const handleRetry = () => {
    dispatch(fetchArtworkDetail(parseInt(id, 10)));
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading artwork details..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }
  
  if (!artwork) {
    return null;
  }
  
  const imageUrl = artwork.primaryImage || artwork.primaryImageSmall || getPlaceholderImage();
  
  return (
    <div className="artwork-detail">
      <div className="artwork-detail__nav">
        <Link to="/" className="artwork-detail__back">
          ← Back to Gallery
        </Link>
      </div>
      
      <div className="artwork-detail__content">
        <div className="artwork-detail__image-section">
          <img
            src={imageUrl}
            alt={artwork.title}
            className="artwork-detail__image"
            onError={(e) => {
              e.target.src = getPlaceholderImage();
            }}
          />
          {artwork.isPublicDomain && (
            <span className="artwork-detail__badge">Public Domain</span>
          )}
        </div>
        
        <div className="artwork-detail__info-section">
          <h1 className="artwork-detail__title">{artwork.title}</h1>
          
          <div className="artwork-detail__metadata">
            <div className="artwork-detail__field">
              <span className="artwork-detail__label">Artist:</span>
              <span className="artwork-detail__value">{artwork.artistDisplayName}</span>
            </div>
            
            {artwork.artistDisplayBio && (
              <div className="artwork-detail__field">
                <span className="artwork-detail__label">Artist Bio:</span>
                <span className="artwork-detail__value">{artwork.artistDisplayBio}</span>
              </div>
            )}
            
            <div className="artwork-detail__field">
              <span className="artwork-detail__label">Date:</span>
              <span className="artwork-detail__value">{artwork.objectDate}</span>
            </div>
            
            <div className="artwork-detail__field">
              <span className="artwork-detail__label">Accession Number:</span>
              <span className="artwork-detail__value">{artwork.accessionNumber}</span>
            </div>
            
            <div className="artwork-detail__field">
              <span className="artwork-detail__label">Medium:</span>
              <span className="artwork-detail__value">{artwork.medium}</span>
            </div>
            
            <div className="artwork-detail__field">
              <span className="artwork-detail__label">Dimensions:</span>
              <span className="artwork-detail__value">{artwork.dimensions}</span>
            </div>
            
            <div className="artwork-detail__field">
              <span className="artwork-detail__label">Department:</span>
              <span className="artwork-detail__value">{artwork.department}</span>
            </div>
            
            {artwork.culture && (
              <div className="artwork-detail__field">
                <span className="artwork-detail__label">Culture:</span>
                <span className="artwork-detail__value">{artwork.culture}</span>
              </div>
            )}
            
            {artwork.period && (
              <div className="artwork-detail__field">
                <span className="artwork-detail__label">Period:</span>
                <span className="artwork-detail__value">{artwork.period}</span>
              </div>
            )}
            
            <div className="artwork-detail__field">
              <span className="artwork-detail__label">Credit Line:</span>
              <span className="artwork-detail__value">{artwork.creditLine}</span>
            </div>
            
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="artwork-detail__field artwork-detail__field--tags">
                <span className="artwork-detail__label">Tags:</span>
                <div className="artwork-detail__tags">
                  {artwork.tags.slice(0, 10).map((tag, index) => (
                    <span key={index} className="artwork-detail__tag">
                      {tag.term}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {artwork.objectURL && (
              <div className="artwork-detail__field">
                <a
                  href={artwork.objectURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="artwork-detail__link"
                >
                  View on Met Museum Website →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {relatedArtworks.length > 0 && (
        <div className="artwork-detail__related">
          <h2 className="artwork-detail__related-title">Related Artworks</h2>
          <p className="artwork-detail__related-subtitle">
            From the same period (±50 years)
          </p>
          <div className="artwork-detail__related-grid">
            {relatedArtworks.map((relatedArtwork) => (
              <ArtworkCard key={relatedArtwork.objectID} artwork={relatedArtwork} />
            ))}
          </div>
        </div>
      )}
      
      {loadingRelated && (
        <div className="artwork-detail__related-loading">
          <LoadingSpinner message="Loading related artworks..." />
        </div>
      )}
    </div>
  );
};

export default ArtworkDetail;
