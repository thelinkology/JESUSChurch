import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, MapPin, X, CheckCircle2, Users } from 'lucide-react';
import { ChurchEvent, getEvents, rsvpToEvent, getUserRsvpedEventIds, getRegistrationsByEvent, EventRegistration } from '../lib/eventsStore';
import { useAuth } from '../contexts/AuthContext';

export function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [rsvpForm, setRsvpForm] = useState({ name: '', email: '' });
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rsvpedEventIds, setRsvpedEventIds] = useState<Set<string>>(new Set());
  const [expandedAttendeesId, setExpandedAttendeesId] = useState<string | null>(null);
  const [attendeesMap, setAttendeesMap] = useState<Record<string, EventRegistration[]>>({});
  const [loadingAttendeesId, setLoadingAttendeesId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  // Pre-fill RSVP form with logged-in user's info
  useEffect(() => {
    if (user) {
      setRsvpForm({ name: user.full_name || '', email: user.email || '' });
    }
  }, [user]);

  // Load which events this user has already RSVP'd to
  useEffect(() => {
    if (user?.email) {
      getUserRsvpedEventIds(user.email).then(ids => {
        setRsvpedEventIds(new Set(ids));
      });
    } else {
      setRsvpedEventIds(new Set());
    }
  }, [user?.email]);

  const loadEvents = async () => {
    setLoading(true);
    const data = await getEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleRSVP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedEvent) return;
    const name = user?.full_name || rsvpForm.name;
    const email = user?.email || rsvpForm.email;
    if (!name || !email) return;
    await rsvpToEvent(selectedEvent.id, name, email);
    setRsvpedEventIds(prev => new Set([...prev, selectedEvent.id]));
    // Optimistically update attendees map if it was already loaded
    setAttendeesMap(prev => {
      if (prev[selectedEvent.id] === undefined) return prev;
      const fresh: EventRegistration = { id: Date.now().toString(), event_id: selectedEvent.id, name, email };
      return { ...prev, [selectedEvent.id]: [...prev[selectedEvent.id], fresh] };
    });
    setRsvpSuccess(true);
    setTimeout(() => {
      setRsvpSuccess(false);
      setSelectedEvent(null);
      setRsvpForm({ name: user?.full_name || '', email: user?.email || '' });
    }, 2500);
  };

  const toggleAttendees = async (eventId: string) => {
    if (expandedAttendeesId === eventId) { setExpandedAttendeesId(null); return; }
    setExpandedAttendeesId(eventId);
    if (attendeesMap[eventId] === undefined) {
      setLoadingAttendeesId(eventId);
      const regs = await getRegistrationsByEvent(eventId);
      setAttendeesMap(prev => ({ ...prev, [eventId]: regs }));
      setLoadingAttendeesId(null);
    }
  };

  // Simple calendar logic
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      return { dayNumber, dateStr, events: dayEvents };
    }
    return { dayNumber: null, dateStr: null, events: [] };
  });

  return (
    <div className="pt-32 pb-24 bg-church-cream  min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Connect & Grow</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-church-earth-dark  mt-4 mb-6">
            Upcoming Events
          </h1>
          <p className="text-xl text-church-earth-light  leading-relaxed">
            Join us for worship, fellowship, and community outreach.
          </p>        </motion.div>

        {/* My RSVPs — only shown to logged-in users who have registrations */}
        {user && rsvpedEventIds.size > 0 && (() => {
          const myEvents = events.filter(e => rsvpedEventIds.has(e.id));
          if (myEvents.length === 0) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-10"
            >
              <div className="bg-church-earth-dark rounded-2xl p-5 border border-church-gold/20 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-church-gold" />
                  <h3 className="text-white font-serif font-semibold text-lg">My Registered Events</h3>
                  <span className="ml-auto bg-church-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">{myEvents.length}</span>
                </div>
                <div className="space-y-2">
                  {myEvents.map(ev => (
                    <div key={ev.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                      <div>
                        <p className="text-white font-medium text-sm">{ev.title}</p>
                        <p className="text-church-cream/60 text-xs mt-0.5">{ev.date} · {ev.time} · {ev.location}</p>
                      </div>
                      <span className="flex items-center gap-1 text-green-400 text-xs font-semibold whitespace-nowrap ml-4">
                        <CheckCircle2 className="w-4 h-4" /> Registered
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })()
        }

        {/* Calendar View */}
        <div className="max-w-6xl mx-auto bg-white  rounded-3xl shadow-sm border border-church-earth/10  overflow-hidden mb-16">
          <div className="flex items-center justify-between p-6 border-b border-church-earth/10  bg-church-earth-dark  text-white">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">&larr;</button>
            <h2 className="text-2xl font-serif font-bold">{monthName}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">&rarr;</button>
          </div>
          
          <div className="grid grid-cols-7 text-center border-b border-church-earth/10  bg-church-cream/50 ">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 font-medium text-church-earth-light  text-sm uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 auto-rows-fr">
            {days.map((day, i) => (
              <div 
                key={i} 
                className={`min-h-[100px] md:min-h-[140px] p-2 border-b border-r border-church-earth/5  ${day.dayNumber ? 'bg-white ' : 'bg-church-cream/30 '}`}
              >
                {day.dayNumber && (
                  <>
                    <span className={`text-sm font-medium ${day.events.length > 0 ? 'text-church-gold' : 'text-church-earth-light '}`}>
                      {day.dayNumber}
                    </span>
                    <div className="mt-1 space-y-1">
                      {day.events.map(event => (
                        <div 
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="text-xs bg-church-gold/10  text-church-earth-dark  p-1.5 rounded cursor-pointer hover:bg-church-gold/20 hover:bg-church-gold/30 transition-colors truncate border border-church-gold/20 "
                        >
                          <span className="font-semibold">{event.time}</span> {event.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming List View (Mobile Friendly) */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-serif font-bold text-church-earth-dark  mb-6">All Upcoming Events</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-church-earth/5">
                    <div className="h-4 bg-church-earth/10 rounded w-1/4 mb-3" />
                    <div className="h-5 bg-church-earth/10 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-church-earth/10 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <p className="text-church-earth-light  text-center py-8">No upcoming events scheduled.</p>
            ) : (
              events.map((event, i) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white  p-6 rounded-2xl shadow-sm border border-church-earth/5  flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h4 className="font-serif text-2xl font-semibold text-church-earth-dark  mb-2">{event.title}</h4>
                    <p className="text-church-earth-light  mb-4">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-church-earth-light/80 mb-4">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {event.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                    </div>
                    {/* Attendee list */}
                    <div>
                      <button
                        onClick={e => { e.stopPropagation(); toggleAttendees(event.id); }}
                        className="flex items-center gap-1.5 text-sm text-church-earth-light hover:text-church-gold transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        {loadingAttendeesId === event.id
                          ? 'Loading…'
                          : attendeesMap[event.id] !== undefined
                            ? `${attendeesMap[event.id].length} registered ${expandedAttendeesId === event.id ? '▲' : '▼'}`
                            : 'View attendees ▼'}
                      </button>
                      {expandedAttendeesId === event.id && attendeesMap[event.id] && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {attendeesMap[event.id].length === 0 ? (
                            <p className="text-xs text-church-earth-light italic">No registrations yet — be the first!</p>
                          ) : (
                            attendeesMap[event.id].map((reg, idx) => (
                              <span key={idx} className="bg-church-gold/10 text-church-earth-dark text-xs px-3 py-1 rounded-full border border-church-gold/20">
                                {reg.name}
                              </span>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {rsvpedEventIds.has(event.id) ? (
                    <span className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-100 text-green-700 border border-green-200 px-6 py-3 rounded-xl font-medium whitespace-nowrap">
                      <CheckCircle2 className="w-4 h-4" /> Registered
                    </span>
                  ) : (
                    <button 
                      onClick={() => setSelectedEvent(event)}
                      className="w-full md:w-auto bg-church-earth  text-church-cream  px-6 py-3 btn-theme font-medium hover:bg-church-earth-dark hover:bg-church-gold-dark transition-colors whitespace-nowrap"
                    >
                      RSVP Now
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white  rounded-3xl shadow-2xl overflow-hidden border border-church-earth/10 "
            >
              <div className="p-6 border-b border-church-earth/10  flex justify-between items-center bg-church-cream ">
                <h3 className="font-serif text-2xl font-bold text-church-earth-dark ">RSVP</h3>
                <button onClick={() => setSelectedEvent(null)} className="text-church-earth-light  hover:text-church-earth-dark :text-church-cream transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                {selectedEvent && rsvpedEventIds.has(selectedEvent.id) ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-church-earth-dark mb-2">You're already registered!</h4>
                    <p className="text-church-earth-light">
                      We have your spot saved for <span className="font-semibold">{selectedEvent.title}</span>. See you there!
                    </p>
                  </div>
                ) : rsvpSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100  rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600 " />
                    </div>
                    <h4 className="text-xl font-bold text-church-earth-dark  mb-2">RSVP Confirmed!</h4>
                    <p className="text-church-earth-light ">
                      We look forward to seeing you at {selectedEvent.title}.
                    </p>
                  </div>
                ) : user ? (
                  // Logged-in: 1-click confirm, no form needed
                  <>
                    <div className="mb-6 bg-church-cream/50  p-4 rounded-xl border border-church-earth/5 ">
                      <h4 className="font-semibold text-church-earth-dark  mb-1">{selectedEvent.title}</h4>
                      <p className="text-sm text-church-earth-light  flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> {selectedEvent.date} at {selectedEvent.time}
                      </p>
                    </div>
                    <p className="text-sm text-church-earth-light mb-3">Registering as:</p>
                    <div className="bg-church-cream rounded-xl p-4 flex items-center gap-3 mb-6 border border-church-earth/10">
                      <div className="w-10 h-10 rounded-full bg-church-gold/20 flex items-center justify-center text-church-gold font-bold text-sm shrink-0">
                        {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-church-earth-dark text-sm">{user.full_name || 'Member'}</p>
                        <p className="text-church-earth-light text-xs">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRSVP()}
                      className="w-full bg-church-gold hover:bg-church-gold-dark text-white py-3 rounded-xl font-medium transition-colors btn-theme"
                    >
                      Confirm RSVP
                    </button>
                  </>
                ) : (
                  // Guest: show name + email form
                  <>
                    <div className="mb-6 bg-church-cream/50  p-4 rounded-xl border border-church-earth/5 ">
                      <h4 className="font-semibold text-church-earth-dark  mb-1">{selectedEvent.title}</h4>
                      <p className="text-sm text-church-earth-light  flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> {selectedEvent.date} at {selectedEvent.time}
                      </p>
                    </div>
                    
                    <form onSubmit={(e) => handleRSVP(e)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-church-earth-light  mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={rsvpForm.name}
                          onChange={e => setRsvpForm({...rsvpForm, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-church-earth/20  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-white  text-church-earth-dark "
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-church-earth-light  mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={rsvpForm.email}
                          onChange={e => setRsvpForm({...rsvpForm, email: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-church-earth/20  focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-white  text-church-earth-dark "
                          placeholder="john@example.com"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-church-gold hover:bg-church-gold-dark text-white py-3 rounded-xl font-medium transition-colors btn-theme mt-4"
                      >
                        Confirm RSVP
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
