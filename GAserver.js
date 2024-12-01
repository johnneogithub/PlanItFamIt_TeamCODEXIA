const express = require('express');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 5000;

// Replace this with your GA4 Property ID
const GA4_PROPERTY_ID = 'YOUR_GA4_PROPERTY_ID';

async function getPageViews(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path-to-your-service-account.json', // Replace with the path to your service account key
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsDataClient = google.analyticsdata({
      version: 'v1beta', // GA4 uses 'v1beta'
      auth: await auth.getClient(),
    });

    const result = await analyticsDataClient.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`, // This is the GA4 property format
      requestBody: {
        dateRanges: [
          {
            startDate: '30daysAgo',
            endDate: 'today',
          },
        ],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              matchType: 'EXACT',
              value: req.query.pagePath || '/',
            },
          },
        },
      },
    });

    // Extract page views for the specified page path
    const pageViews =
      result.data.rows && result.data.rows.length > 0
        ? result.data.rows[0].metricValues[0].value
        : 0;

    res.json({ pageViews });
  } catch (error) {
    console.error('Error fetching page views:', error);
    res.status(500).send('Error fetching page views');
  }
}

app.get('/api/page-views', getPageViews);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
