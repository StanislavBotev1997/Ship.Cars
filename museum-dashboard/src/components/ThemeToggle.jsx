import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, selectIsDarkMode } from '../store/slices/themeSlice';
import '../styles/ThemeToggle.scss';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(selectIsDarkMode);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle__icon" role="img" aria-hidden="true">
        {isDarkMode ? '☀️' : '🌙'}
      </span>
    </button>
  );
};

export default ThemeToggle;
