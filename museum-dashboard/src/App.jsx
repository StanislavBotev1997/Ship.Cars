import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './store/store';
import { selectTheme } from './store/slices/themeSlice';
import Gallery from './pages/Gallery';
import ArtworkDetail from './pages/ArtworkDetail';
import ThemeToggle from './components/ThemeToggle';
import './styles/App.scss';

function AppContent() {
  const theme = useSelector(selectTheme);

  return (
    <div className={`app ${theme}-theme`}>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/artwork/:id" element={<ArtworkDetail />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
