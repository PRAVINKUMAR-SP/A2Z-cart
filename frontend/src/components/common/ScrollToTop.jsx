import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that whenever the user navigates to a new page,
 * the scrollbar starts fresh at the very top (0, 0).
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Immediate scroll reset on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    // Fallback for document scrolling elements
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}
