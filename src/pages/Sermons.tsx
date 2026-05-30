import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayCircle, Calendar, Search, Bookmark, BookmarkCheck, X, Clock, ExternalLink } from 'lucide-react';
import { Sermon, getSermons } from '../lib/sermonsStore';

interface LastWatchedEntry {
  sermon: Sermon;
  startSeconds: number;
}

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function Sermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState('');
  
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [lastWatched, setLastWatched] = useState<LastWatchedEntry | null>(null);
  const [playingSermon, setPlayingSermon] = useState<Sermon | null>(null);
  const [resumeSeconds, setResumeSeconds] = useState(0);
  const openedAtRef = useRef<number | null>(null);
  const [isLandscape, setIsLandscape] = useState(() => window.innerWidth > window.innerHeight);

  useEffect(() => {
    const update = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getSermons();
    setSermons(data);
    setLoading(false);
    
    const savedBookmarks = localStorage.getItem('sermon_bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    
    const savedLastWatched = localStorage.getItem('sermon_last_watched');
    if (savedLastWatched) {
      try {
        const parsed = JSON.parse(savedLastWatched);
        // Support both old format {id, title, ...} and new {sermon, startSeconds}
        if (parsed.sermon) {
          setLastWatched(parsed as LastWatchedEntry);
        } else {
          setLastWatched({ sermon: parsed as Sermon, startSeconds: 0 });
        }
      } catch { /* ignore */ }
    }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let newBookmarks;
    if (bookmarks.includes(id)) {
      newBookmarks = bookmarks.filter(b => b !== id);
    } else {
      newBookmarks = [...bookmarks, id];
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('sermon_bookmarks', JSON.stringify(newBookmarks));
  };

  const playSermon = (sermon: Sermon, startSeconds = 0) => {
    setPlayingSermon(sermon);
    setResumeSeconds(startSeconds);
    openedAtRef.current = Date.now();
    const entry: LastWatchedEntry = { sermon, startSeconds };
    setLastWatched(entry);
    localStorage.setItem('sermon_last_watched', JSON.stringify(entry));
  };

  const closeModal = () => {
    if (playingSermon && openedAtRef.current !== null) {
      const elapsed = Math.floor((Date.now() - openedAtRef.current) / 1000);
      const newStart = resumeSeconds + elapsed;
      const entry: LastWatchedEntry = { sermon: playingSermon, startSeconds: newStart };
      setLastWatched(entry);
      localStorage.setItem('sermon_last_watched', JSON.stringify(entry));
    }
    setPlayingSermon(null);
    openedAtRef.current = null;
  };

  const filteredSermons = sermons.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.description.toLowerCase().includes(search.toLowerCase());
    const matchesSeries = seriesFilter ? s.series === seriesFilter : true;
    const matchesSpeaker = speakerFilter ? s.speaker === speakerFilter : true;
    return matchesSearch && matchesSeries && matchesSpeaker;
  });

  const uniqueSeries = Array.from(new Set(sermons.map(s => s.series)));
  const uniqueSpeakers = Array.from(new Set(sermons.map(s => s.speaker)));

  return (
    <div className="pt-32 pb-24 bg-church-cream  min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Messages</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-church-earth-dark  mt-4 mb-6">
            Sermons
          </h1>
          <p className="text-xl text-church-earth-light  leading-relaxed">
            Catch up on recent messages or re-watch your favorites.
          </p>
        </motion.div>

        {/* Last Watched Banner */}
        {lastWatched && !search && !seriesFilter && !speakerFilter && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-6xl mx-auto mb-12 bg-church-earth-dark  text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl border border-transparent "
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 text-church-gold mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium uppercase tracking-wider text-sm">Continue Watching</span>
              </div>
              <h2 className="text-3xl font-serif font-bold mb-2">{lastWatched.sermon.title}</h2>
              <p className="text-church-cream/80 mb-6 line-clamp-2">{lastWatched.sermon.description}</p>
              <button 
                onClick={() => playSermon(lastWatched.sermon, lastWatched.startSeconds)}
                className="bg-church-gold hover:bg-church-gold-dark text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" /> {lastWatched.startSeconds > 0 ? 'Resume Sermon' : 'Watch Sermon'}
              </button>
            </div>
            <div className="md:w-1/3 aspect-video rounded-xl overflow-hidden relative group cursor-pointer" onClick={() => playSermon(lastWatched.sermon, lastWatched.startSeconds)}>
              <img 
                src={`https://img.youtube.com/vi/${getYouTubeId(lastWatched.sermon.youtubeLink)}/maxresdefault.jpg`}
                alt={lastWatched.sermon.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters & Search */}
        <div className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-church-earth-light  w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search sermons..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-church-earth/10  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-white  text-church-earth-dark  placeholder:text-church-earth-light/50 :text-church-cream/30"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={seriesFilter}
              onChange={e => setSeriesFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-church-earth/10  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-white  text-church-earth-dark "
            >
              <option value="">All Series</option>
              {uniqueSeries.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              value={speakerFilter}
              onChange={e => setSpeakerFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-church-earth/10  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-white  text-church-earth-dark "
            >
              <option value="">All Speakers</option>
              {uniqueSpeakers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Sermons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-church-earth/5 animate-pulse">
                <div className="aspect-video bg-church-earth/10" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-church-earth/10 rounded w-1/3" />
                  <div className="h-5 bg-church-earth/10 rounded w-3/4" />
                  <div className="h-3 bg-church-earth/10 rounded w-full" />
                  <div className="h-3 bg-church-earth/10 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : filteredSermons.length === 0 ? (
            <div className="col-span-full text-center py-12 text-church-earth-light ">
              No sermons found matching your criteria.
            </div>
          ) : (
            filteredSermons.map((sermon, i) => (
              <motion.div 
                key={sermon.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white  rounded-2xl overflow-hidden shadow-sm border border-church-earth/5  group flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => playSermon(sermon)}
              >
                <div className="relative aspect-video">
                  <img 
                    src={`https://img.youtube.com/vi/${getYouTubeId(sermon.youtubeLink)}/hqdefault.jpg`}
                    alt={sermon.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-church-earth-dark/20 group-hover:bg-church-earth-dark/40 transition-colors flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                  <button 
                    onClick={(e) => toggleBookmark(sermon.id, e)}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-colors"
                  >
                    {bookmarks.includes(sermon.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-church-gold fill-church-gold" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-church-gold text-sm font-medium mb-2 block">{sermon.series}</span>
                  <h3 className="font-serif text-xl font-semibold text-church-earth-dark  mb-2 line-clamp-2">
                    {sermon.title}
                  </h3>
                  <p className="text-church-earth-light  text-sm mb-4 line-clamp-2 flex-grow">{sermon.description}</p>
                  <div className="flex items-center justify-between text-sm text-church-earth-light/80  mt-auto pt-4 border-t border-church-earth/10 ">
                    <span className="font-medium text-church-earth-dark ">{sermon.speaker}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {sermon.date}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {playingSermon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
            onClick={closeModal}
          >
            {/* Top bar */}
            <div
              className="flex items-center gap-3 px-4 py-3 shrink-0 bg-gradient-to-b from-black to-transparent z-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex-1 min-w-0">
                <p className="text-church-gold text-xs font-medium uppercase tracking-wider truncate">
                  {playingSermon.series}
                </p>
                <h3 className="text-white font-serif font-semibold text-sm md:text-base truncate leading-tight">
                  {playingSermon.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${getYouTubeId(playingSermon.youtubeLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/80 hover:text-white border border-white/25 hover:border-white/60 rounded-lg px-3 py-1.5 text-xs font-medium transition-all bg-white/10 hover:bg-white/20 backdrop-blur-sm whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Open in YouTube</span>
                </a>
                <button
                  className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/60 rounded-lg transition-all backdrop-blur-sm"
                  onClick={closeModal}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video area */}
            <div
              className={`flex items-center justify-center flex-1 min-h-0 ${isLandscape ? 'p-0' : 'px-0 pb-4 md:p-8'}`}
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`bg-black shadow-2xl overflow-hidden ${
                  isLandscape
                    ? 'w-full h-full'
                    : 'w-full aspect-video md:rounded-2xl md:max-w-5xl'
                }`}
                onClick={e => e.stopPropagation()}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeId(playingSermon.youtubeLink)}?autoplay=1${resumeSeconds > 0 ? `&start=${resumeSeconds}` : ''}`}
                  title={playingSermon.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </motion.div>
            </div>

            {/* Portrait hint */}
            {!isLandscape && (
              <p
                className="text-center text-white/30 text-xs pb-3 shrink-0 md:hidden"
                onClick={e => e.stopPropagation()}
              >
                Rotate phone for fullscreen · Tap outside to close
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

