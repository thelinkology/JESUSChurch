import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, Users, ZoomIn, ZoomOut, Maximize2, Loader2, Youtube, Facebook } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getChurchSettings, ChurchSettings } from '../lib/settingsStore';

/** Extract YouTube embed URL from any YouTube link format */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  // youtu.be short link
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}?autoplay=1&rel=0`;
  // youtube.com/live/ID
  const live = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
  if (live) return `https://www.youtube.com/embed/${live[1]}?autoplay=1&rel=0`;
  // standard watch?v=
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}?autoplay=1&rel=0`;
  // already an embed or channel live stream
  if (url.includes('youtube.com/embed')) return url;
  return null;
}

/** Build Facebook video embed URL */
function getFacebookEmbedUrl(url: string): string | null {
  if (!url) return null;
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&mute=0`;
}

export function Live() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Partial<ChurchSettings>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [messages, setMessages] = useState<{id: string, user: string, text: string, time: string}[]>([
    { id: '1', user: 'System', text: 'Welcome to the live stream! Service begins at 9 AM.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [zoom, setZoom] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChurchSettings().then(s => { setSettings(s); }).catch(() => {}).finally(() => setLoadingSettings(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: user.full_name,
      text: newMessage,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
    setNewMessage('');
  };

  const embedUrl = getYouTubeEmbedUrl(settings.live_youtube_url || '')
    || getFacebookEmbedUrl(settings.live_facebook_url || '');

  const isYouTube = !!getYouTubeEmbedUrl(settings.live_youtube_url || '');
  const title = settings.live_title || 'Sunday Service Live';
  const description = settings.live_description || 'Join us as we worship and hear the Word of God together.';

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));

  return (
    <main className="pt-20 md:pt-24 min-h-screen bg-church-cream flex flex-col">
      <div className="flex-grow container mx-auto px-2 md:px-6 py-4 md:py-8 flex flex-col lg:flex-row gap-4 md:gap-6">

        {/* Video Player Section */}
        <div className="flex-grow flex flex-col gap-3 md:gap-4">

          {/* Video Container — pinch-to-zoom enabled on touch, buttons for desktop */}
          <div className="relative bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-xl border border-church-earth/10">
            {/* Zoom controls */}
            <div className="absolute top-3 right-3 z-10 flex gap-1.5">
              <button
                onClick={handleZoomOut}
                className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {embedUrl && (
                <a
                  href={settings.live_youtube_url || settings.live_facebook_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm"
                  title="Open in new tab"
                >
                  <Maximize2 className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Aspect ratio wrapper — 16:9, touch-action pinch-zoom for mobile */}
            <div
              className="w-full"
              style={{ aspectRatio: '16/9', touchAction: 'pinch-zoom' }}
            >
              {loadingSettings ? (
                <div className="w-full h-full flex items-center justify-center bg-black min-h-[200px]">
                  <Loader2 className="w-8 h-8 animate-spin text-church-gold" />
                </div>
              ) : embedUrl ? (
                <div className="w-full h-full overflow-hidden" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
                  <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    style={{ minHeight: '200px' }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-church-earth-dark/95 text-church-cream gap-4 min-h-[200px] px-4">
                  <div className="flex gap-3">
                    <Youtube className="w-10 h-10 text-red-400 opacity-60" />
                    <Facebook className="w-10 h-10 text-blue-400 opacity-60" />
                  </div>
                  <p className="text-center text-church-cream/70 text-sm max-w-xs">
                    No live stream is scheduled right now.<br />Check back during service times.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stream Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-church-earth/5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h1 className="text-lg md:text-2xl font-serif font-bold text-church-earth-dark flex items-center gap-2">
                {embedUrl && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
                {isYouTube
                  ? <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                  : settings.live_facebook_url
                    ? <Facebook className="w-5 h-5 text-blue-500 shrink-0" />
                    : null
                }
                {title}
              </h1>
              <div className="flex items-center gap-2 text-church-earth-light bg-church-cream px-3 py-1 rounded-full text-sm font-medium shrink-0">
                <Users className="w-4 h-4" />
                <span>Live</span>
              </div>
            </div>
            <p className="text-church-earth-light text-sm md:text-base">{description}</p>
            {zoom !== 1 && (
              <p className="text-xs text-church-earth-light mt-2">Zoom: {Math.round(zoom * 100)}% — <button onClick={() => setZoom(1)} className="text-church-gold hover:underline">Reset</button></p>
            )}
          </motion.div>
        </div>

        {/* Live Chat Section */}
        <div className="w-full lg:w-96 bg-white rounded-xl md:rounded-2xl shadow-sm border border-church-earth/5 flex flex-col h-[400px] md:h-[500px] lg:h-auto">
          <div className="p-4 border-b border-church-earth/10 bg-church-cream/30 rounded-t-xl md:rounded-t-2xl">
            <h2 className="font-serif font-bold text-church-earth-dark">Live Chat</h2>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="text-church-earth-light text-xs mr-2">{msg.time}</span>
                <span className="font-bold text-church-gold mr-1">{msg.user}:</span>
                <span className="text-church-earth-dark">{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-church-earth/10">
            {user ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Say hello..."
                  className="flex-grow px-3 py-2 rounded-xl border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-church-cream/30 text-sm text-church-earth-dark"
                />
                <button
                  type="submit"
                  className="bg-church-gold hover:bg-church-gold-dark text-white p-2 rounded-xl transition-colors shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <div className="text-center p-3 bg-church-cream/50 rounded-xl border border-church-earth/10">
                <p className="text-sm text-church-earth-light mb-2">Sign in to join the chat</p>
                <a href="/login" className="text-church-gold font-medium text-sm hover:underline">Login</a>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
