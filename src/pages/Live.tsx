import React from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Users, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Live() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{id: string, user: string, text: string, time: string}[]>([
    { id: '1', user: 'System', text: 'Welcome to the live stream! Service begins at 9 AM.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    setMessages([...messages, {
      id: Date.now().toString(),
      user: user.full_name,
      text: newMessage,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
    setNewMessage('');
  };

  return (
    <main className="pt-24 min-h-screen bg-church-cream  flex flex-col">
      <div className="flex-grow container mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-6">
        
        {/* Video Player Section */}
        <div className="flex-grow flex flex-col gap-4">
          <div className="bg-black rounded-2xl overflow-hidden aspect-video relative shadow-xl border border-church-earth/10 ">
            {/* Placeholder for YouTube Embed */}
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https.youtube.com/embed/live_stream?channel=UCUZHFZ9jIKrLroW8LcyJEQQ" 
              title="YouTube live video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="bg-white  p-6 rounded-2xl shadow-sm border border-church-earth/5 ">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-serif font-bold text-church-earth-dark  flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                Sunday Service Live
              </h1>
              <div className="flex items-center gap-2 text-church-earth-light  bg-church-cream  px-3 py-1 rounded-full text-sm font-medium">
                <Users className="w-4 h-4" />
                <span>245 Watching</span>
              </div>
            </div>
            <p className="text-church-earth-light ">Join us as we worship and hear the Word of God together.</p>
          </div>
        </div>

        {/* Live Chat Section */}
        <div className="w-full lg:w-96 bg-white  rounded-2xl shadow-sm border border-church-earth/5  flex flex-col h-[600px] lg:h-auto">
          <div className="p-4 border-b border-church-earth/10  bg-church-cream/30  rounded-t-2xl">
            <h2 className="font-serif font-bold text-church-earth-dark ">Live Chat</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4 flex flex-col">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="text-church-earth-light  text-xs mr-2">{msg.time}</span>
                <span className="font-bold text-church-gold mr-2">{msg.user}:</span>
                <span className="text-church-earth-dark ">{msg.text}</span>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-church-earth/10 ">
            {user ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Say hello..."
                  className="flex-grow px-4 py-2 rounded-xl border border-church-earth/20  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30  text-sm text-church-earth-dark "
                />
                <button 
                  type="submit"
                  className="bg-church-gold hover:bg-church-gold-dark text-white p-2 rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <div className="text-center p-3 bg-church-cream/50  rounded-xl border border-church-earth/10 ">
                <p className="text-sm text-church-earth-light  mb-2">Sign in to join the chat</p>
                <a href="/login" className="text-church-gold font-medium text-sm hover:underline">Login</a>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
