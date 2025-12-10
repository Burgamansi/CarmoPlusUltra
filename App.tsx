
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Meetings } from './pages/Meetings';
import { Songs } from './pages/Songs';
import { Playlist } from './pages/Playlist';
import { Members } from './pages/Members';
import { Gallery } from './pages/Gallery';
import { MapPage } from './pages/MapPage';
import { Prayers } from './pages/Prayers';
import { Liturgy } from './pages/Liturgy';
import { FeedbackPage } from './pages/Feedback';
import { Devotional } from './pages/Devotional';
import { About } from './pages/About';
import { Admin } from './pages/Admin';
import { MediaPage } from './pages/MediaPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/songs" element={<Songs />} />
            <Route path="/playlist/:id" element={<Playlist />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/members" element={<Members />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/prayers" element={<Prayers />} />
            <Route path="/liturgy" element={<Liturgy />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/devotional" element={<Devotional />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;
