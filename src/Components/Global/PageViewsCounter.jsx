import React, { useEffect, useState } from 'react';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { collection, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const PageViewsCounter = () => {
  const [pageViews, setPageViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const analytics = getAnalytics();
        const firestore = getFirestore();
        
        // Log page view to Firebase Analytics
        logEvent(analytics, 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: window.location.pathname
        });

        // Update page views count in Firestore
        const pageViewsRef = doc(firestore, 'statistics', 'pageViews');
        const pageViewsDoc = await getDoc(pageViewsRef);

        if (pageViewsDoc.exists()) {
          // Increment the counter
          await updateDoc(pageViewsRef, {
            count: increment(1)
          });
          // Get the updated count
          const updatedDoc = await getDoc(pageViewsRef);
          setPageViews(updatedDoc.data().count);
        } else {
          // Initialize the counter if it doesn't exist
          await updateDoc(pageViewsRef, {
            count: 1
          });
          setPageViews(1);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error tracking page views:', error);
        // Fallback to localStorage if Firestore fails
        const storedViews = localStorage.getItem('pageViews');
        const currentViews = storedViews ? parseInt(storedViews, 10) : 0;
        const updatedViews = currentViews + 1;
        setPageViews(updatedViews);
        localStorage.setItem('pageViews', updatedViews);
        setIsLoading(false);
      }
    };

    trackPageView();
  }, []);

  return (
    <div className="page-views-counter">
      {isLoading ? (
        <p>Loading views...</p>
      ) : (
        <p>Page Views: <span>{pageViews.toLocaleString()}</span></p>
      )}
    </div>
  );
};

export default PageViewsCounter; 