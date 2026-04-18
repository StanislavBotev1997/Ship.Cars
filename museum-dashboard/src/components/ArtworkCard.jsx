import { Link } from 'react-router-dom';
import { getPlaceholderImage } from '../utils/dataTransformers';
import '../styles/ArtworkCard.scss';

const ArtworkCard = ({ artwork }) => {
  const imageUrl = artwork.primaryImageSmall || artwork.primaryImage || getPlaceholderImage();
  
  return (
    <Link to={`/artwork/${artwork.objectID}`} className="artwork-card">
      <div className="artwork-card__image-container">
        <img 
          src={imageUrl} 
          alt={artwork.title}
          className="artwork-card__image"
          loading="lazy"
          onError={(e) => {
            e.target.src = getPlaceholderImage();
          }}
        />
      </div>
      <div className="artwork-card__content">
        <h3 className="artwork-card__title">{artwork.title}</h3>
        <p className="artwork-card__artist">{artwork.artistDisplayName}</p>
        <p className="artwork-card__date">{artwork.objectDate}</p>
      </div>
    </Link>
  );
};

export default ArtworkCard;
