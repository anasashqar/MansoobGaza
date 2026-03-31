import { useState, useEffect } from 'react';
import { useLang } from './context/LangContext';
import ElevationMap from './components/ElevationMap';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app" dir={t.dir}>
      {loading && <LoadingScreen />}
      <ElevationMap />
    </div>
  );
}

export default App;
