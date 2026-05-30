import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';
import { Ministry, getMinistries } from '../lib/ministriesStore';

// Fallback static data (shown while DB loads or if table is empty)
const FALLBACK: Ministry[] = [
  { id: 'kids', title: 'Kids Ministry', age_group: 'Infants - 5th Grade', description: 'We provide a safe, fun, and engaging environment where children can learn about God\'s love through age-appropriate lessons, worship, and activities.', image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop', goals: '[]', sort_order: 0 },
  { id: 'youth', title: 'Youth Ministry', age_group: 'Middle & High School', description: 'Our youth group is a place for students to connect with peers, ask tough questions, and develop a faith of their own that will last a lifetime.', image_url: 'https://images.unsplash.com/photo-1529156069898-49953eb1f5bc?q=80&w=800&auto=format&fit=crop', goals: '[]', sort_order: 1 },
  { id: 'groups', title: 'Small Groups', age_group: 'Adults', description: 'Life is better together. Small groups are the heartbeat of our church—a place to build authentic relationships, study the Bible, and pray for one another.', image_url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=800&auto=format&fit=crop', goals: '[]', sort_order: 2 },
  { id: 'worship', title: 'Worship Team', age_group: 'All Ages', description: 'Using our musical and technical gifts to lead the congregation in authentic, Spirit-led worship each week.', image_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop', goals: '[]', sort_order: 3 },
];

export function Ministries() {
  const navigate = useNavigate();
  const [ministries, setMinistries] = useState<Ministry[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMinistries()
      .then(data => { if (data.length > 0) setMinistries(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-32 pb-24 bg-church-cream min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Connect & Grow</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-church-earth-dark mt-4 mb-6">
            Our Ministries
          </h1>
          <p className="text-xl text-church-earth-light leading-relaxed">
            Find your place to connect, grow, and serve within our church family.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-church-earth/5 animate-pulse">
                  <div className="h-64 bg-church-earth/10" />
                  <div className="p-8 space-y-4">
                    <div className="h-6 bg-church-earth/10 rounded w-2/3" />
                    <div className="h-4 bg-church-earth/10 rounded w-full" />
                    <div className="h-4 bg-church-earth/10 rounded w-3/4" />
                  </div>
                </div>
              ))
            : ministries.map((ministry, i) => (
                <motion.div
                  key={ministry.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-church-earth/5 group cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/ministries/${ministry.id}`)}
                >
                  <div className="h-64 overflow-hidden bg-church-cream">
                    {ministry.image_url ? (
                      <img
                        src={ministry.image_url}
                        alt={ministry.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-16 h-16 text-church-gold/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-serif text-3xl font-semibold text-church-earth-dark">{ministry.title}</h3>
                      <span className="text-sm font-medium text-church-gold bg-church-gold/10 px-3 py-1 rounded-full">{ministry.age_group}</span>
                    </div>
                    <p className="text-church-earth-light text-lg leading-relaxed mb-6 line-clamp-3">
                      {ministry.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-church-gold font-medium group-hover:text-church-gold-dark transition-colors">
                      Learn More →
                    </span>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </div>
  );
}
