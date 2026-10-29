import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base: the built site works under https://saphambn.github.io/lucky-english/ and from any other folder.
export default defineConfig({
  base: './',
  plugins: [react()],
});
