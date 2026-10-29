import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadClips } from './lib/audio';
import { allLines } from './lib/say';
import './styles.css';

// tools/ load the page in a browser and call this to list every line that needs a recording.
(window as unknown as {ALL_LINES: typeof allLines}).ALL_LINES = allLines;
loadClips();
createRoot(document.getElementById('app')!).render(<App/>);
