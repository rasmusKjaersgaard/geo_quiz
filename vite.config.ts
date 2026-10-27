import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// `base: './'` makes every asset URL relative, so the build works on
// GitHub Pages under any repository name (https://<user>.github.io/<repo>/).
// Routing uses the URL hash (#/quiz/flags), so deep links never hit the server.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
