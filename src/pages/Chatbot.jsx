// Chatbot.jsx
// PlanItAssistant 
import React, { useState, useEffect, useRef } from 'react';
import './ChatbotStyle.css';
import { FaRobot, FaSync, FaPaperPlane, FaCompress, FaExpand, FaArrowLeft } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your secure API key
const API_KEY = "AIzaSyCZKZbTGaRVNnDnhaLJ84fO8kdrANVVDM8";

const Chatbot = () => {
  const [chatInput, setChatInput] = useState("");
  const [chatList, setChatList] = useState([
    { message: "Hi there! I am PlanIt Assistant. How may I help you today?", className: "incoming" }
  ]);
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const chatInputRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize genAI and model inside the component
  const genAI = new GoogleGenerativeAI(API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  // Debugging: Log the model to ensure it's correctly initialized
  useEffect(() => {
    console.log('Initialized model:', model);
  }, [model]);

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    // Create user message entry
    const userMessageEntry = { message: userMessage, className: "outgoing" };
    const thinkingEntry = { message: "Thinking...", className: "incoming" };

    // Update chatList with user's message and a placeholder for the assistant's response
    setChatList((prevList) => [
      ...prevList,
      userMessageEntry,
      thinkingEntry,
    ]);

    // Compute the new chat history including the user's message
    const newChatHistory = [
      ...chatHistory,
      { role: "user", text: userMessage },
    ];

    // Update chatHistory state
    setChatHistory(newChatHistory);

    try {
      // Start a new chat session with the updated history
      const chatSession = await model.startChat({
        generationConfig: {
          temperature: 0.75,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
        history: newChatHistory,
      });

      // Debugging: Log the chatSession to ensure it's correctly initialized
      console.log('Initialized chatSession:', chatSession);

      // Ensure chatSession.sendMessage is a function
      if (typeof chatSession?.sendMessage !== 'function') {
        throw new Error("chatSession.sendMessage is not a function");
      }

      // Send the user's message and await the response
      const result = await chatSession.sendMessage(userMessage);
      const responseText = typeof result?.response?.text === 'string' ? result.response.text : "No response received.";

      // Update chatList by replacing the "Thinking..." placeholder with the actual response
      setChatList((prevList) => [
        ...prevList.slice(0, -1), // Remove the last "Thinking..." entry
        { message: responseText, className: "incoming" },
      ]);

      // Update chatHistory with the assistant's response
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "assistant", text: responseText },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
      // Replace the "Thinking..." placeholder with an error message
      setChatList((prevList) => [
        ...prevList.slice(0, -1),
        { message: "Error fetching response. Please try again.", className: "incoming" },
      ]);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    sendMessage(userMessage);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleChat();
      event.preventDefault();
    }
  };

  const handleRefresh = () => {
    setChatList([{ message: "Hi there! I am PlanIt Assistant. How may I help you today?", className: "incoming" }]);
    setChatHistory([]);
  };

  const handleBack = () => {
    window.history.back();
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatList]);

  // Debugging: Ensure all chat.message entries are strings
  useEffect(() => {
    chatList.forEach((chat, index) => {
      if (typeof chat.message !== 'string') {
        console.error(`chat.message at index ${index} is not a string:`, chat.message);
      }
    });
  }, [chatList]);

  return (
    <div className={`chatbot-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="chatbot">
        <div className="chatbot-header">
          <button className="back-btn" onClick={handleBack} title="Go back">
            <FaArrowLeft />
          </button>
          <div className="header-content">
            <h3>PlanItFamIt</h3>
            <h2>PlanIt Assistant</h2>
          </div>
          <div className="header-buttons">
            <button className="refresh-btn" onClick={handleRefresh} title="Reset conversation">
              <FaSync />
            </button>
            <button className="fullscreen-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>

        <ul className="chatbox" ref={chatContainerRef}>
          {chatList.map((chat, index) => (
            <li key={index} className={`chat-message ${chat.className}`}>
              {chat.className === "outgoing" ? (
                <div className="message-content user-message">
                  <p>{chat.message}</p>
                </div>
              ) : (
                <div className="message-content assistant-message">
                  <span className="bot-icon"><FaRobot /></span>
                  <p>{chat.message}</p>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="chat-input">
          <textarea
            placeholder="Type your message here..."
            spellCheck="false"
            required
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyPress}
            ref={chatInputRef}
            rows={1}
          />
          <button className="send-btn" onClick={handleChat} disabled={!chatInput.trim()}>
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
