import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageAuthor, Achievement } from '../types';
import { startChat, sendMessageToChat } from '../services/geminiService';
import { Chat } from '@google/genai';

interface ChatbotProps {
  initialMessage: string | null;
  onTriggerEmergency: () => void;
  achievements: Achievement[];
}

const BotIcon = () => (
  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-blue flex items-center justify-center text-white shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  </div>
);

const UserIcon = () => (
  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-teal flex items-center justify-center text-white shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  </div>
);

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

const SoundWaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072" className="animate-ping opacity-75 absolute"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const ChatMessage: React.FC<{
  message: Message;
  onSpeak: (message: Message) => void;
  isSpeaking: boolean;
}> = ({ message, onSpeak, isSpeaking }) => {
  const isUser = message.author === MessageAuthor.USER;
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <BotIcon />}
      <div
        className={`px-4 py-3 rounded-2xl max-w-lg shadow-sm ${
          isUser 
            ? 'bg-gradient-to-br from-brand-blue to-brand-teal text-white rounded-br-none' 
            : 'bg-white text-brand-gray-darkest rounded-bl-none'
        }`}
      >
        <p className="text-base whitespace-pre-wrap">{message.text}</p>
      </div>
      {!isUser && (
        <button 
            onClick={() => onSpeak(message)} 
            className="p-1 text-brand-gray hover:text-brand-blue self-center flex-shrink-0" 
            aria-label="Read message aloud"
        >
          {isSpeaking ? <SoundWaveIcon /> : <SpeakerIcon />}
        </button>
      )}
       {isUser && <UserIcon />}
    </div>
  );
};


const Chatbot: React.FC<ChatbotProps> = ({ initialMessage, onTriggerEmergency, achievements }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emergencyTriggerCode = '[TRIGGER_EMERGENCY_MODAL]';

  useEffect(() => {
    chatRef.current = startChat(achievements);

    const handleInitialMessage = async () => {
        if (initialMessage) {
            const userMessage: Message = { id: Date.now().toString(), author: MessageAuthor.USER, text: initialMessage };
            setMessages([userMessage]);
            setIsLoading(true);

            try {
                const botResponse = await sendMessageToChat(chatRef.current!, initialMessage);
                let finalBotResponse = botResponse;
                if (finalBotResponse.startsWith(emergencyTriggerCode)) {
                    onTriggerEmergency();
                    finalBotResponse = finalBotResponse.replace(emergencyTriggerCode, '').trim();
                }
                const botMessage: Message = { id: (Date.now() + 1).toString(), author: MessageAuthor.BOT, text: finalBotResponse };
                setMessages((prev) => [...prev, botMessage]);
            } catch (error) {
                const errorMessage: Message = { id: (Date.now() + 1).toString(), author: MessageAuthor.BOT, text: "Sorry, I'm having trouble responding right now." };
                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        } else {
            setMessages([{
                id: Date.now().toString(),
                author: MessageAuthor.BOT,
                text: "Hello! I'm Serenity, your personal AI assistant. Whether you want to explore your feelings, discuss your day, or chat about topics like movies or career, I'm here to support you. What's on your mind?",
            }]);
        }
    };
    handleInitialMessage();

  }, [initialMessage, onTriggerEmergency, achievements]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (input.trim() === '' || isLoading || !chatRef.current) return;

    const userMessage: Message = { id: Date.now().toString(), author: MessageAuthor.USER, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let botResponse = await sendMessageToChat(chatRef.current, input);
      
      if (botResponse.startsWith(emergencyTriggerCode)) {
        onTriggerEmergency();
        botResponse = botResponse.replace(emergencyTriggerCode, '').trim();
      }
      
      const botMessage: Message = { id: (Date.now() + 1).toString(), author: MessageAuthor.BOT, text: botResponse };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), author: MessageAuthor.BOT, text: "Sorry, I'm having trouble responding right now." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onTriggerEmergency]);
  
  const handleSpeak = useCallback((message: Message) => {
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }

    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setSpeakingMessageId(null);
    };
    setSpeakingMessageId(message.id);
    window.speechSynthesis.speak(utterance);
  }, [speakingMessageId]);

  return (
    <div className="flex flex-col flex-1 bg-brand-sky-blue pb-16">
      <div className="p-4 border-b bg-white">
        <h2 className="text-xl font-bold text-brand-gray-darkest text-center">AI Chat with Care</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            message={msg} 
            onSpeak={handleSpeak}
            isSpeaking={speakingMessageId === msg.id}
          />
        ))}
         {isLoading && (
             <div className="flex items-start gap-3 my-4 justify-start">
              <BotIcon />
              <div className="px-4 py-3 rounded-2xl max-w-sm bg-white text-brand-gray-darkest rounded-bl-none flex items-center shadow-sm">
                  <div className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.15s] mx-1.5"></div>
                  <div className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-bounce"></div>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Share your thoughts..."
            className="flex-1 px-4 py-3 bg-brand-gray-light border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue placeholder:text-brand-gray text-brand-gray-darkest transition-shadow focus:shadow-md"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="p-3 text-white font-semibold bg-gradient-to-r from-brand-blue to-brand-teal rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;