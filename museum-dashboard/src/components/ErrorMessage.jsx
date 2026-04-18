import '../styles/ErrorMessage.scss';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <div className="error-message__icon">⚠️</div>
      <h3 className="error-message__title">Oops! Something went wrong</h3>
      <p className="error-message__text">{message || 'An unexpected error occurred'}</p>
      {onRetry && (
        <button className="btn btn--primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
