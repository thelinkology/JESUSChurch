import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Palette, Video, Calendar as CalendarIcon, User, Shield, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationsDropdown } from '../NotificationsDropdown';

const navLinks = [
  { name: 'About', path: '/about' },
  { name: 'Sermons', path: '/sermons' },
  { name: 'Events', path: '/events' },
  { name: 'Ministries', path: '/ministries' },
  { name: 'Give', path: '/give' },
  { name: 'Prayers', path: '/prayers' },
  { name: 'Groups', path: '/groups' },
  { name: 'Volunteer', path: '/volunteer' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isLeader } = useAuth();
  const { isDarkMode, toggleDarkMode, themes, activeTheme, setActiveTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isTransparent = location.pathname === '/' && !isScrolled && !isMobileMenuOpen;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        !isTransparent
          ? 'bg-church-cream/95 backdrop-blur-md shadow-sm py-4'
          : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm tracking-wider shrink-0 transition-all",
              !isTransparent
                ? "bg-church-gold text-white shadow-sm"
                : "bg-white/20 text-white border border-white/40 backdrop-blur-sm"
            )}>
              JC
            </div>
            <span className={cn("font-serif text-xl font-semibold tracking-tight transition-colors leading-tight", !isTransparent ? "text-church-earth-dark" : "text-church-cream")}>
              <span className="font-extrabold">JESUS</span><br className="hidden" />{' '}Church
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Main Links */}
            <div className="flex items-center gap-1 mr-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:text-church-gold",
                    !isTransparent ? "text-church-earth-dark hover:bg-church-earth/5" : "text-church-cream/90 hover:bg-white/10",
                    location.pathname === link.path && "text-church-gold font-semibold"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Watch Live CTA */}
            <Link
              to="/live"
              className="bg-church-gold hover:bg-church-gold-dark text-white px-5 py-2 btn-theme text-sm font-medium transition-colors flex items-center gap-1.5 mr-3"
            >
              <Video className="w-3.5 h-3.5" /> Watch Live
            </Link>

            {/* Utility icons */}
            <div className="flex items-center gap-1 border-l border-church-earth/20 pl-3">
              {/* Dark mode */}
              <button
                onClick={toggleDarkMode}
                className={cn("p-2 rounded-lg transition-colors", !isTransparent ? "text-church-earth-dark hover:bg-church-earth/5" : "text-church-cream hover:bg-white/10")}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Theme Switcher */}
              <div className="relative">
                <Palette className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
                  style={{ color: !isTransparent ? undefined : 'white' }}
                />
                <select
                  title="Select theme"
                  className={cn(
                    "pl-7 pr-2 py-1.5 text-xs rounded-lg border focus:outline-none appearance-none cursor-pointer",
                    !isTransparent
                      ? "bg-church-cream/60 border-church-earth/20 text-church-earth-dark"
                      : "bg-white/10 border-white/20 text-church-cream"
                  )}
                  value={activeTheme.id}
                  onChange={(e) => {
                    const theme = themes.find(t => t.id === e.target.value);
                    if (theme) setActiveTheme(theme);
                  }}
                >
                  {themes.map(t => (
                    <option key={t.id} value={t.id} className="text-church-earth-dark bg-white">{t.name}</option>
                  ))}
                </select>
              </div>

              {/* User actions */}
              {user ? (
                <>
                  <NotificationsDropdown />
                  <Link
                    to="/growth"
                    className={cn("p-2 rounded-lg transition-colors hover:text-church-gold", !isTransparent ? "text-church-earth-dark hover:bg-church-earth/5" : "text-church-cream/90 hover:bg-white/10")}
                    title="Daily Devotional"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/profile"
                    className={cn("p-2 rounded-lg transition-colors hover:text-church-gold", !isTransparent ? "text-church-earth-dark hover:bg-church-earth/5" : "text-church-cream/90 hover:bg-white/10")}
                    title="My Profile"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors",
                    !isTransparent
                      ? "border-church-earth/30 text-church-earth-dark hover:bg-church-earth/5"
                      : "border-white/30 text-church-cream hover:bg-white/10"
                  )}
                >
                  Sign In
                </Link>
              )}

              {/* Admin icons — leader only */}
              {isLeader && (
                <>
                  <div className="w-px h-4 bg-church-earth/20 mx-1" />
                  <Link
                    to="/admin/themes"
                    className={cn("p-2 rounded-lg transition-colors hover:text-church-gold", !isTransparent ? "text-church-earth-dark hover:bg-church-earth/5" : "text-church-cream/90 hover:bg-white/10")}
                    title="Theme Builder"
                  >
                    <Palette className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/admin"
                    className={cn("p-2 rounded-lg transition-colors hover:text-church-gold", !isTransparent ? "text-church-earth-dark hover:bg-church-earth/5" : "text-church-cream/90 hover:bg-white/10")}
                    title="Admin Dashboard"
                  >
                    <Shield className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-church-earth-dark" />
            ) : (
              <Menu className={cn("w-6 h-6", !isTransparent ? "text-church-earth-dark" : "text-church-cream")} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-church-cream border-t border-church-earth/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "block text-lg font-medium py-2 transition-colors",
                    location.pathname === link.path ? "text-church-gold" : "text-church-earth hover:text-church-gold"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/live"
                className="bg-church-gold hover:bg-church-gold-dark text-white px-6 py-3 btn-theme text-center font-medium transition-colors mt-4"
              >
                Watch Live
              </Link>
              
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-church-earth/10">
                <button 
                  onClick={toggleDarkMode}
                  className="flex items-center gap-3 text-church-earth hover:text-church-gold font-medium py-2 px-2 text-left"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} 
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                
                <div className="flex items-center gap-3 px-2 py-2">
                  <Palette className="w-5 h-5 text-church-earth" />
                  <select 
                    title="Select Theme"
                    className="bg-transparent text-church-earth font-medium focus:outline-none w-full"
                    value={activeTheme.id}
                    onChange={(e) => {
                      const theme = themes.find(t => t.id === e.target.value);
                      if (theme) setActiveTheme(theme);
                    }}
                  >
                    {themes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 text-church-earth hover:text-church-gold font-medium py-2 px-2"
                    >
                      <User className="w-5 h-5" /> My Profile
                    </Link>
                    <Link
                      to="/growth"
                      className="flex items-center gap-3 text-church-earth hover:text-church-gold font-medium py-2 px-2"
                    >
                      <CalendarIcon className="w-5 h-5" /> Devotional
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-3 text-church-earth hover:text-church-gold font-medium py-2 px-2"
                  >
                    <User className="w-5 h-5" /> Sign In
                  </Link>
                )}
                
                {isLeader && (
                  <>
                    <span className="text-sm text-church-earth-light font-medium px-2 mt-2">Admin Tools</span>
                    <Link
                      to="/admin/themes"
                      className="flex items-center gap-3 text-church-gold hover:text-church-gold-dark font-medium py-2 px-2"
                    >
                      <Palette className="w-5 h-5" /> Theme Builder
                    </Link>
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 text-church-gold hover:text-church-gold-dark font-medium py-2 px-2"
                    >
                      <Shield className="w-5 h-5" /> Dashboard
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
