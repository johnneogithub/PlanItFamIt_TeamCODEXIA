const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

exports.corsProxy = functions.https.onRequest(async (req, res) => {
  const url = req.query.url;
  if (!url) {
    res.status(400).send('URL parameter is required');
    return;
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    res.set('Content-Type', contentType);
    response.body.pipe(res);
  } catch (error) {
    console.error('Error in CORS proxy:', error);
    res.status(500).send('Error fetching the resource');
  }
});

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

app.post('/api/save-patient-record', (req, res) => {
  const recordData = req.body;
  const fileName = `patient_record_${Date.now()}.json`;
  const filePath = path.join(__dirname, 'patient_records', fileName);

  fs.writeFile(filePath, JSON.stringify(recordData, null, 2), (err) => {
    if (err) {
      console.error('Error saving file:', err);
      res.json({ success: false, error: 'Failed to save file' });
    } else {
      res.json({ success: true, message: 'File saved successfully' });
    }
  });
});