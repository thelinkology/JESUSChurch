import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Flame, Award, Calendar, CheckCircle2, Settings, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getTodaysDevotional,
  markDevotionalComplete,
  Devotional,
} from '../lib/devotionalsStore';

interface GrowthData {
  streak: number;
  lastReadDate: string | null;
  completedDays: string[];
}

const STATIC_DEVOTIONAL: Devotional = {
  id: 'static',
  title: 'Psalm 23',
  scripture_reference: 'Psalm 23:1-6',
  devotional_date: '',
  content: `1 The Lord is my shepherd; I shall not want.

2 He maketh me to lie down in green pastures: he leadeth me beside the still waters.

3 He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.

4 Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.

5 Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.

6 Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.`,
};

function getBadgeLabel(totalDays: number): string {
  if (totalDays >= 365) return 'Pilgrim';
  if (totalDays >= 90) return 'Devoted';
  if (totalDays >= 30) return 'Faithful';
  if (totalDays >= 7) return 'Seeker';
  return 'Beginner';
}

export function Growth() {
  const { user, isAdmin, isLeader } = useAuth();
  const [data, setData] = useState<GrowthData>({ streak: 0, lastReadDate: null, completedDays: [] });
  const [todaysDevotional, setTodaysDevotional] = useState<Devotional | null>(null);
  const [loadingDevotional, setLoadingDevotional] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (user) {
      const local = localStorage.getItem(`growth_${user.id}`);
      if (local) setData(JSON.parse(local));
    }
    getTodaysDevotional()
      .then(setTodaysDevotional)
      .catch(() => setTodaysDevotional(null))
      .finally(() => setLoadingDevotional(false));
  }, [user]);

  const markReadToday = async () => {
    if (!user) return;
    setMarkingComplete(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      if (data.completedDays.includes(today)) return;

      let newStreak = data.streak;
      if (data.lastReadDate) {
        const diffMs = new Date(today).getTime() - new Date(data.lastReadDate).getTime();
        const diffDays = Math.round(diffMs / 86400000);
        newStreak = diffDays === 1 ? data.streak + 1 : 1;
      } else {
        newStreak = 1;
      }

      const newData: GrowthData = {
        streak: newStreak,
        lastReadDate: today,
        completedDays: [...data.completedDays, today],
      };
      setData(newData);
      localStorage.setItem(`growth_${user.id}`, JSON.stringify(newData));

      // Record in DB if we have a real (non-static) devotional
      if (todaysDevotional && todaysDevotional.id !== 'static') {
        await markDevotionalComplete(todaysDevotional.id, user.id);
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const hasReadToday = data.completedDays.includes(today);
  const devotional = todaysDevotional ?? STATIC_DEVOTIONAL;
  const badge = getBadgeLabel(data.completedDays.length);

  return (
    <main className="pt-32 pb-24 bg-church-cream  min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Spiritual Growth</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-church-earth-dark  mt-4 mb-4">
            Daily Devotional
          </h1>
          <p className="text-xl text-church-earth-light ">Track your reading and build a habit of spending time in the Word.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white  p-6 rounded-2xl shadow-sm border border-church-earth/5  flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-orange-100  text-orange-500  rounded-full flex items-center justify-center mb-4">
              <Flame className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-church-earth-dark  mb-1">{data.streak}</h3>
            <p className="text-sm text-church-earth-light  font-medium uppercase tracking-wider">Day Streak</p>
          </div>
          
          <div className="bg-white  p-6 rounded-2xl shadow-sm border border-church-earth/5  flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-blue-100  text-blue-500  rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-church-earth-dark  mb-1">{data.completedDays.length}</h3>
            <p className="text-sm text-church-earth-light  font-medium uppercase tracking-wider">Total Days Read</p>
          </div>

          <div className="bg-white  p-6 rounded-2xl shadow-sm border border-church-earth/5  flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-church-gold/10  text-church-gold rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-church-earth-dark  mb-1">{badge}</h3>
            <p className="text-sm text-church-earth-light  font-medium uppercase tracking-wider">Current Badge</p>
          </div>
        </div>

        <div className="bg-white  rounded-3xl shadow-sm border border-church-earth/5  overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-church-gold" />
              <h2 className="font-serif text-2xl font-bold text-church-earth-dark ">Today's Reading</h2>
            </div>
            
            {loadingDevotional ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-church-gold" />
              </div>
            ) : (
              <div className="prose prose-lg text-church-earth  max-w-none mb-8">
                <h3 className="text-xl font-bold text-church-earth-dark ">{devotional.title}</h3>
                {devotional.scripture_reference && (
                  <p className="text-sm text-church-earth-light italic mb-4">{devotional.scripture_reference}</p>
                )}
                {devotional.content.split('\n').map((line, i) => (
                  line.trim() ? <p key={i}>{line}</p> : <br key={i} />
                ))}
              </div>
            )}

            <div className="flex justify-center border-t border-church-earth/10  pt-8">
              {!user ? (
                <Link to="/login" className="text-church-gold font-medium hover:text-church-gold-dark transition-colors">
                  Sign in to track your reading
                </Link>
              ) : hasReadToday ? (
                <div className="flex items-center gap-2 text-green-600  bg-green-50  px-6 py-3 rounded-xl font-medium">
                  <CheckCircle2 className="w-6 h-6" />
                  Completed for Today
                </div>
              ) : (
                <button 
                  onClick={markReadToday}
                  disabled={markingComplete || loadingDevotional}
                  className="bg-church-gold hover:bg-church-gold-dark text-white px-8 py-4 rounded-xl font-medium transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {markingComplete
                    ? <Loader2 className="w-6 h-6 animate-spin" />
                    : <CheckCircle2 className="w-6 h-6" />}
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        </div>

        {(isAdmin || isLeader) && (
          <div className="mt-8 text-center">
            <Link
              to="/admin/devotionals"
              className="inline-flex items-center gap-2 text-church-earth-light hover:text-church-gold transition-colors text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              Manage Devotionals
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
