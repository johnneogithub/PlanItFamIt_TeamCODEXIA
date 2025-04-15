import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../pages/ChatbotStyle.css';
import { FaRobot, FaPaperPlane, FaUser, FaArrowLeft } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBPkjTSxe-zWtpwYeze0SNK0HMQZ60--Hg"; // Add your Google API key here
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

  // Function to handle sending the message
  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return; // Avoid sending empty messages
    
    // Append the user's message and a single "Thinking..." message
    const updatedChatList = [
      ...chatList,
      { message: userMessage, className: "outgoing" },
      { message: "Thinking...", className: "incoming thinking-animation" },
    ];
    
    setChatList(updatedChatList);
    setChatHistory((prev) => [...prev, { role: 'user', text: userMessage }]);

    try {
      const result = await chat.sendMessage(userMessage); // Send message to API
      const response = await result.response.text(); // Await text content from API response


      const updatedResponseList = updatedChatList.filter(chat => chat.message !== "Thinking...");
      setChatList(updatedResponseList);


      let currentText = '';
      const typingInterval = 3; 
      const typeResponse = (text, index) => {
        if (index < text.length) {
          currentText += text[index];
          setChatList([...updatedResponseList, { message: currentText, className: "incoming" }]);
          setTimeout(() => typeResponse(text, index + 1), typingInterval);
        } else {
          setChatHistory((prev) => [...prev, { role: 'assistant', text: response }]);
        }
      };

      typeResponse(response, 0);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  const createChatLi = useCallback((message, className) => {
    return { message, className };
  }, []);

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

  const handleBack = () => {
    console.log("Back button clicked");
    window.history.back();
  };

  useEffect(() => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatList]);

  return (
    <div className="chatbot-container">
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
                  <p>
                    {chat.message.split(/(\*\*.*?\*\*)/).map((part, i) => 
                      part.startsWith('**') && part.endsWith('**') ? 
                      <strong key={i}>{part.slice(2, -2)}</strong> : 
                      part.replace(/\*/g, '')
                    )}
                  </p>
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