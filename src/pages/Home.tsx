import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, Clock, MapPin, PlayCircle, Users, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLatestSermon, getSermonById, Sermon } from '../lib/sermonsStore';
import { getChurchSettings, ChurchSettings } from '../lib/settingsStore';
import { getGroups, SmallGroup } from '../lib/groupsStore';
import { getLocations, ChurchLocation } from '../lib/locationsStore';
import { getMinistries, Ministry } from '../lib/ministriesStore';

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1445112098124-3e76dd67983c?q=80&w=2000&auto=format&fit=crop';

export function Home() {
  const [featuredSermon, setFeaturedSermon] = useState<Sermon | null>(null);
  const [settings, setSettings] = useState<Partial<ChurchSettings>>({});
  const [featuredGroups, setFeaturedGroups] = useState<SmallGroup[]>([]);
  const [locations, setLocations] = useState<ChurchLocation[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  // Cache hero image URL so it shows instantly on revisits (no flicker)
  const [heroImageUrl, setHeroImageUrl] = useState<string>(
    () => localStorage.getItem('jc_hero_image_url') || FALLBACK_HERO
  );

  useEffect(() => {
    getChurchSettings().then(async (s) => {
      setSettings(s);
      if (s.hero_image_url) {
        setHeroImageUrl(s.hero_image_url);
        localStorage.setItem('jc_hero_image_url', s.hero_image_url);
      }
      // Load featured sermon by ID, or fall back to latest
      if (s.featured_sermon_id) {
        const sermon = await getSermonById(s.featured_sermon_id).catch(() => null);
        setFeaturedSermon(sermon);
      }
      if (!s.featured_sermon_id) {
        getLatestSermon().then(setFeaturedSermon).catch(() => {});
      }
    }).catch(() => {
      getLatestSermon().then(setFeaturedSermon).catch(() => {});
    });

    // Load featured groups
    getGroups().then(groups => {
      const featured = groups.filter(g => g.is_featured);
      setFeaturedGroups(featured);
    }).catch(() => {});

    // Load church locations
    getLocations().then(setLocations).catch(() => {});

    // Load ministries
    getMinistries().then(setMinistries).catch(() => {});
  }, []);

  const heroTitle = settings.hero_title || 'Experience God\'s Love Together';
  const heroSubtitle = settings.hero_subtitle || 'Join us this Sunday as we worship, learn, and grow in our faith. You belong here, exactly as you are.';
  const heroCta = settings.hero_cta_text || 'Plan a Visit';
  const address = settings.church_address || '';

  // Parse service_times from JSON — null when no data so the card is hidden
  let serviceTimesDisplay: string | null = null;
  if (settings.service_times) {
    try {
      const times = JSON.parse(settings.service_times as unknown as string);
      if (Array.isArray(times)) {
        serviceTimesDisplay = times.map((t: { day: string; times: string[] }) => `${t.day}: ${t.times.join(', ')}`).join('\n');
      } else {
        serviceTimesDisplay = String(settings.service_times);
      }
    } catch {
      serviceTimesDisplay = String(settings.service_times);
    }
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImageUrl}
            alt="Church interior"
            className="w-full h-full object-cover object-[center_30%] md:object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-church-earth-dark/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-church-earth-dark/90 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center text-church-cream pt-20 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <span className="text-church-gold font-medium tracking-wider uppercase text-sm md:text-base">
              Welcome Home
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-church-cream/90 max-w-2xl mx-auto font-light leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 pb-16 md:pb-0">
              <a
                href="#locations"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-church-gold hover:bg-church-gold-dark text-white px-8 py-4 btn-theme font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg text-center cursor-pointer"
              >
                {heroCta}
              </a>
              <Link
                to="/live"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 btn-theme font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
              >
                <PlayCircle className="w-5 h-5" />
                Watch Live
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Times & Location */}
      <section className="bg-church-cream py-20 relative z-20 rounded-t-[3rem] md:-mt-10 md:shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {serviceTimesDisplay && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-8 rounded-2xl bg-white  shadow-sm hover:shadow-md transition-shadow border border-church-earth/5 "
            >
              <div className="w-16 h-16 bg-church-gold/10 rounded-full flex items-center justify-center mb-6 text-church-gold transition-transform hover:scale-110">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3 text-church-earth-dark ">Service Times</h3>
              <p className="text-church-earth-light  whitespace-pre-line">{serviceTimesDisplay}</p>
            </motion.div>
            )}

            {address && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center p-8 rounded-2xl bg-white  shadow-sm hover:shadow-md transition-shadow border border-church-earth/5 "
            >
              <div className="w-16 h-16 bg-church-gold/10 rounded-full flex items-center justify-center mb-6 text-church-gold transition-transform hover:scale-110">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3 text-church-earth-dark ">Location</h3>
              <p className="text-church-earth-light  whitespace-pre-line">{address}</p>
            </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center p-8 rounded-2xl bg-white  shadow-sm hover:shadow-md transition-shadow border border-church-earth/5 "
            >
              <div className="w-16 h-16 bg-church-gold/10 rounded-full flex items-center justify-center mb-6 text-church-gold transition-transform hover:scale-110">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3 text-church-earth-dark ">Next Steps</h3>
              <p className="text-church-earth-light ">New here? We'd love to connect and help you get involved.</p>
              <Link to="/contact" className="mt-4 text-church-gold font-medium hover:text-church-gold-dark flex items-center gap-1 transition-colors">
                Connect <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Sermon Preview */}
      {featuredSermon && (
      <section className="py-24 bg-white ">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl relative group cursor-pointer">
                {featuredSermon?.thumbnail_url ? (
                  <img 
                    src={featuredSermon.thumbnail_url}
                    alt={featuredSermon.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=1000&auto=format&fit=crop" 
                    alt="Latest Sermon" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-church-earth-dark/40 group-hover:bg-church-earth-dark/30 transition-colors flex items-center justify-center">
                  {featuredSermon?.youtubeLink ? (
                    <a href={featuredSermon.youtubeLink} target="_blank" rel="noopener noreferrer" className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </a>
                  ) : (
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-church-gold/10 rounded-full -z-10 blur-2xl"></div>
            </div>
            
            <div className="lg:w-1/2 space-y-6">
              <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Latest Message</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-church-earth-dark  leading-tight">
                {featuredSermon.title}
              </h2>
              <p className="text-lg text-church-earth-light  leading-relaxed">
                {featuredSermon.description}
              </p>
              {featuredSermon && (
                <p className="text-sm text-church-earth-light/70">
                  {featuredSermon.speaker && <span className="font-medium">{featuredSermon.speaker}</span>}
                  {featuredSermon.series && <span> · {featuredSermon.series}</span>}
                </p>
              )}
              <div className="pt-4">
                <Link to="/sermons" className="inline-flex items-center gap-2 bg-church-earth  text-church-cream  px-6 py-3 btn-theme font-medium hover:bg-church-earth-dark hover:bg-church-gold-dark transition-all hover:shadow-md hover:-translate-y-0.5">
                  View All Sermons <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Our Ministries */}
      {ministries.length > 0 && (
        <section className="py-24 bg-church-cream ">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Serve &amp; Grow</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-church-earth-dark  mt-4 mb-6">
                Our Ministries
              </h2>
              <p className="text-church-earth-light  text-lg">
                Discover a place where you can belong, serve, and grow in your faith.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ministries.slice(0, 3).map((ministry, i) => (
                <motion.div
                  key={ministry.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <Link to={`/ministries/${ministry.id}`}>
                    <div className="relative h-72 rounded-2xl overflow-hidden mb-5 shadow-md hover:shadow-xl transition-shadow">
                      {ministry.image_url ? (
                        <img
                          src={ministry.image_url}
                          alt={ministry.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-church-earth-dark" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-church-earth-dark/90 via-church-earth-dark/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-6">
                        <span className="text-church-gold text-xs font-medium tracking-wider uppercase mb-1 block">{ministry.age_group}</span>
                        <h3 className="font-serif text-2xl font-semibold text-white">{ministry.title}</h3>
                      </div>
                    </div>
                    <p className="text-church-earth-light text-sm leading-relaxed line-clamp-2">{ministry.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-church-gold text-sm font-medium hover:text-church-gold-dark transition-colors">
                      Learn More <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/ministries" className="inline-flex items-center gap-2 text-church-gold font-medium hover:text-church-gold-dark transition-colors">
                View All Ministries <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Find Your Community — Featured Groups */}
      {featuredGroups.length > 0 && (
        <section className="py-24 bg-white ">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Get Involved</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-church-earth-dark  mt-4 mb-6">
                Find Your Community
              </h2>
              <p className="text-church-earth-light  text-lg">
                We believe that spiritual growth happens best in relationships. Join a small group and do life together.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredGroups.slice(0, 3).map((group, i) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-church-cream  rounded-2xl p-6 shadow-sm border border-church-earth/5 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center mb-4 text-church-gold">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="inline-block text-xs font-medium text-church-earth-light bg-white px-2 py-1 rounded-md mb-2">{group.category}</span>
                  <h3 className="font-serif text-xl font-semibold text-church-earth-dark  mb-2">{group.name}</h3>
                  <p className="text-church-earth-light  text-sm mb-4 leading-relaxed">{group.description}</p>
                  <div className="text-xs text-church-earth-light  space-y-1">
                    <p><span className="font-medium">Leader:</span> {group.leader}</p>
                    <p><span className="font-medium">When:</span> {group.schedule}</p>
                    <p><span className="font-medium">Where:</span> {group.location}</p>
                  </div>
                  <Link to="/groups" className="mt-4 inline-flex items-center gap-1 text-church-gold text-sm font-medium hover:text-church-gold-dark transition-colors">
                    Learn More <ArrowRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/groups" className="inline-flex items-center gap-2 text-church-gold font-medium hover:text-church-gold-dark transition-colors">
                Browse All Groups <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Church Locations */}
      {locations.length > 0 ? (
        <section id="locations" className="py-24 bg-church-cream ">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Find Us</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-church-earth-dark  mt-4 mb-6">
                Our Locations
              </h2>
              <p className="text-church-earth-light  text-lg">
                <span className="font-extrabold">JESUS</span> Church is growing across multiple locations. Find a home near you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations.map((loc, i) => (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-default"
                >
                  {/* Image with gradient overlay — same pattern as Ministries */}
                  <div className="relative h-72 rounded-2xl overflow-hidden mb-5 shadow-md hover:shadow-xl transition-shadow">
                    {loc.image_url ? (
                      <img
                        src={loc.image_url}
                        alt={loc.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-church-earth-dark" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-church-earth-dark/90 via-church-earth-dark/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      {loc.pastor && (
                        <span className="text-church-gold text-xs font-medium tracking-wider uppercase mb-1 block">
                          Pastor {loc.pastor}
                        </span>
                      )}
                      <h3 className="font-serif text-2xl font-semibold text-white">{loc.name}</h3>
                    </div>
                  </div>

                  {/* Details below image */}
                  <div className="space-y-2 text-sm text-church-earth-light ">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-church-gold shrink-0 mt-0.5" />
                      <span className="whitespace-pre-line">{loc.address}</span>
                    </div>
                    {loc.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-church-gold shrink-0" />
                        <span>{loc.phone}</span>
                      </div>
                    )}
                    {loc.service_times && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-church-gold shrink-0 mt-0.5" />
                        <span className="whitespace-pre-line">{loc.service_times}</span>
                      </div>
                    )}
                  </div>
                  {loc.map_url && (
                    <a
                      href={loc.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-church-gold text-sm font-medium hover:text-church-gold-dark transition-colors"
                    >
                      Get Directions <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 bg-church-cream ">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Find Us</span>
            <h2 className="font-serif text-4xl font-bold text-church-earth-dark  mt-4 mb-4">
              Our Locations
            </h2>
            <p className="text-church-earth-light  text-base max-w-md mx-auto">
              Locations coming soon — check back for our upcoming campuses.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
