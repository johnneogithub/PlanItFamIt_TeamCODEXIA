import React, { useEffect, useRef, useState } from 'react';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const PageViewsCounter = () => {
  const [pageViews, setPageViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasTracked = useRef(false); // Prevent duplicate tracking in dev mode

  useEffect(() => {
    if (hasTracked.current) return;

    const trackPageView = async () => {
      try {
        const analytics = getAnalytics();
        const firestore = getFirestore();

        // Log Firebase Analytics event
        logEvent(analytics, 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: window.location.pathname,
        });

        const pageViewsRef = doc(firestore, 'statistics', 'pageViews');
        const pageViewsDoc = await getDoc(pageViewsRef);

        if (pageViewsDoc.exists()) {
          await updateDoc(pageViewsRef, { count: increment(1) });
        } else {
          // Initialize to 975 if it doesn't exist
          await setDoc(pageViewsRef, { count: 975 });
        }

        // Get the latest count after update
        const updatedDoc = await getDoc(pageViewsRef);
        setPageViews(updatedDoc.data().count);
      } catch (error) {
        console.error('Error tracking page views:', error);

        // Fallback to localStorage if Firestore fails
        const storedViews = localStorage.getItem('pageViews');
        const currentViews = storedViews ? parseInt(storedViews, 10) : 975;
        const updatedViews = currentViews + 1;
        setPageViews(updatedViews);
        localStorage.setItem('pageViews', updatedViews);
      } finally {
        setIsLoading(false);
      }
    };

    hasTracked.current = true;
    trackPageView();
  }, []);

  return (
    <div className="page-views-counter">
      {isLoading ? (
        <p>Loading views...</p>
      ) : (
        <p>Page View: {pageViews.toLocaleString()}</p>
      )}
    </div>
  );
};

export default PageViewsCounter;
