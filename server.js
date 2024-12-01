const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors'); // Ensure this is imported
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());

// CORS configuration to allow requests only from React development server
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests only from React's development server
  methods: 'GET,POST', // You can specify allowed methods here
  allowedHeaders: 'Content-Type', // Allow the request headers you need
};

// Apply CORS middleware with specific options
app.use(cors(corsOptions));

// Configure Gemini SDK
const apiKey = "AIzaSyCZKZbTGaRVNnDnhaLJ84fO8kdrANVVDM8";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  systemInstruction: `
    Tone: Friendly and Professional
    Your name: PlanIt Assistant

    Instructions: 
    You are a chatbot for PlanItFamIt, a family planning platform partnered with St. Margaret Lying In Clinic. You provide insights about family planning, sex education, and reproductive health. Add emojis where appropriate.`,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

// Gemini Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  // Check if message is valid
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: "Invalid or missing 'message' in request body." });
  }

  // Validate the history format
  if (!Array.isArray(history) || !history.every(entry => entry.role && entry.parts)) {
    return res.status(400).json({ error: "Invalid 'history' format." });
  }

  try {
    console.log('Received message:', message); // Log the incoming message
    console.log('History:', history); // Log the conversation history

    // Ensure history is formatted with roles and parts correctly
    const updatedHistory = history.length === 0 
      ? [{ role: 'user', parts: [{ text: message }] }] 
      : [...history, { role: 'user', parts: [{ text: message }] }];

    // Start a new chat session with the Gemini API
    const chatSession = model.startChat({ generationConfig, history: updatedHistory });

    // Send the user's message and get the assistant's response
    const result = await chatSession.sendMessage(message);

    console.log('Response from Gemini:', result.response.text()); // Log the response

    // Respond back with the assistant's message and the updated history
    res.json({
      response: result.response.text(),
      history: [
        ...updatedHistory,
        { role: 'model', parts: [{ text: result.response.text() }] },
      ],
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    console.error('Error details:', error.message); // Log more detailed error
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Example endpoint for health check
app.get('/api/health', (req, res) => res.send('Server is running!'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
