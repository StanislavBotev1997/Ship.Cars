import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import Gallery from './pages/Gallery';
import ArtworkDetail from './pages/ArtworkDetail';
import './styles/App.scss';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/artwork/:id" element={<ArtworkDetail />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
