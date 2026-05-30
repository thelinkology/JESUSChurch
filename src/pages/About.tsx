import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Users, Globe, BookOpen } from 'lucide-react';
import { getChurchSettings, getLeadership, ChurchSettings, LeadershipMember } from '../lib/settingsStore';

export function About() {
  const [settings, setSettings] = useState<Partial<ChurchSettings>>({});
  const [leaders, setLeaders] = useState<LeadershipMember[]>([]);

  useEffect(() => {
    getChurchSettings().then(setSettings).catch(() => {});
    getLeadership().then(setLeaders).catch(() => {});
  }, []);

  const pillars = [
    { key: 'vision', title: 'Vision', scripture: 'Matthew 28', icon: <Users className="w-8 h-8" />, fallback: 'WIN SOULS & MAKE DISCIPLES' },
    { key: 'mission', title: 'Mission', scripture: '2 Timothy 2', icon: <BookOpen className="w-8 h-8" />, fallback: 'TO MAKE EVERY BELIEVER A LEADER OF LEADERS' },
    { key: 'purpose', title: 'Purpose', scripture: 'Matthew 22', icon: <Heart className="w-8 h-8" />, fallback: 'TO LOVE GOD TO LOVE PEOPLE' },
    { key: 'cause', title: 'Cause', scripture: 'Genesis 12', icon: <Globe className="w-8 h-8" />, fallback: 'NATION TRANSFORMATION' },
  ] as const;

  return (
    <main className="pt-32 pb-24 bg-church-cream  min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Our Story</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-church-earth-dark mt-4 mb-8">
            About <span className="font-extrabold">JESUS</span> Church
          </h1>
          <p className="text-xl text-church-earth-light  leading-relaxed">
            {settings.church_tagline || 'We are a vibrant community of believers dedicated to loving God, loving people, and making a difference in our city and beyond.'}
          </p>
        </motion.div>

        {/* Welcome Message & Mission/Vision */}
        <div className="mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-church-earth-dark  mb-6">
              Welcome to <span className="text-church-gold">JESUS</span> Church
            </h2>
            <div className="w-24 h-1 bg-church-gold mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-church-earth-light  leading-relaxed">
              We are a community of believers dedicated to loving God, loving people, and making a difference in our world.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pillars.map((item, i) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-white  p-8 rounded-3xl shadow-sm border border-church-earth/5  hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-church-gold/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
                
                <div className="w-16 h-16 bg-church-cream  rounded-2xl flex items-center justify-center text-church-gold mb-8 group-hover:scale-110 transition-transform duration-500 relative z-10">
                  {item.icon}
                </div>
                
                <div className="relative z-10">
                  <span className="text-church-gold font-medium tracking-wider uppercase text-sm mb-2 block">
                    Our {item.title}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-church-earth-dark  mb-4 leading-snug">
                    {(settings as Record<string, string>)[item.key] || item.fallback}
                  </h3>
                  <p className="text-church-earth-light  text-sm italic">
                    {item.scripture}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-church-earth-dark  mb-4">Our Leadership</h2>
            <p className="text-church-earth-light  text-lg">Meet the team dedicated to serving our church family.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {leaders.length > 0 ? leaders.map((leader, i) => (
              <motion.div 
                key={leader.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 shadow-lg border-4 border-white  transition-transform duration-500 group-hover:scale-105">
                  <img 
                    src={leader.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&size=192&background=c9a96e&color=fff`}
                    alt={leader.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-church-earth-dark ">{leader.name}</h3>
                <p className="text-church-gold font-medium mt-1">{leader.role}</p>
                {leader.bio && <p className="text-church-earth-light text-sm mt-2 max-w-xs mx-auto">{leader.bio}</p>}
              </motion.div>
            )) : (
              // Skeleton placeholders while loading
              [1,2,3].map(i => (
                <div key={i} className="text-center animate-pulse">
                  <div className="w-48 h-48 mx-auto rounded-full bg-church-cream mb-6" />
                  <div className="h-4 bg-church-cream rounded w-32 mx-auto mb-2" />
                  <div className="h-3 bg-church-cream rounded w-24 mx-auto" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
