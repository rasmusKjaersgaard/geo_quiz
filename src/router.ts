import { useSyncExternalStore } from 'react';

// Tiny hash router: #/ , #/quiz/<id> , #/admin , #/login
function getHash(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h : '/' + h;
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function useRoute(): string {
  return useSyncExternalStore(subscribe, getHash, () => '/');
}

export function navigate(path: string) {
  window.location.hash = path;
}

export type Route =
  | { name: 'home' }
  | { name: 'quiz'; quizId: string }
  | { name: 'admin' }
  | { name: 'notfound' };

export function parseRoute(path: string): Route {
  const parts = path.split('?')[0].split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'quiz' && parts[1]) return { name: 'quiz', quizId: decodeURIComponent(parts[1]) };
  if (parts[0] === 'admin') return { name: 'admin' };
  return { name: 'notfound' };
}
