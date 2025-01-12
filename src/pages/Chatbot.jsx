import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../pages/ChatbotStyle.css';
import { FaRobot, FaSync, FaPaperPlane, FaUser, FaCompress, FaExpand, FaArrowLeft } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBuFKyNIr5d7AecVfupZbzrHoIoJRzp7vg"; // Add your Google API key here
const MODEL_NAME = "gemini-2.0-flash-exp";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const chat = model.startChat({
  history: [],
});

const Chatbot = () => {
  const [chatInput, setChatInput] = useState("");
  const [chatList, setChatList] = useState([{ message: "Hi there! I am PlanIt Assistant. How may I help you today?", className: "incoming"}]);
  const chatInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([{ role: 'assistant', text: "Hi there👋! I am PlanIt Assistant. How may I help you today?" }]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Function to handle sending the message
  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return; // Avoid sending empty messages
    
    // Append the user's message and a single "Thinking..." message
    const updatedChatList = [
      ...chatList,
      { message: userMessage, className: "outgoing" },
      { message: "Thinking...", className: "incoming" },
    ];
    
    setChatList(updatedChatList);
    setChatHistory((prev) => [...prev, { role: 'user', text: userMessage }]);

    try {
      const result = await chat.sendMessage(userMessage); // Send message to API
      const response = await result.response.text(); // Await text content from API response

      // Replace "Thinking..." with the assistant's actual response
      const updatedResponseList = updatedChatList.filter(chat => chat.message !== "Thinking...");
      setChatList([...updatedResponseList, { message: response, className: "incoming" }]);
      setChatHistory((prev) => [...prev, { role: 'assistant', text: response }]);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  const createChatLi = useCallback((message, className) => {
    return { message, className };
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Handles when the user sends a message by clicking the button
  const handleChat = () => {
    if (!chatInput.trim()) return; // Prevent sending if no input
    const userMessage = chatInput.trim(); // Capture input message directly
    setChatInput(""); // Clear input
    sendMessage(userMessage); // Pass the message to the sendMessage function
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleChat();
      event.preventDefault();
    }
  };

  const handleRefresh = () => {
    setChatList([{ message: "Hi there! I am PlanIt Assistant. How may I help you today?", className: "incoming"}]);
    setChatHistory([{ role: 'assistant', text: "Hi there👋! I am PlanIt Assistant. How may I help you today?" }]);
  };

  const handleBack = () => {
    console.log("Back button clicked");
    window.history.back();
  };

  useEffect(() => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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
            onKeyPress={handleKeyPress}
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