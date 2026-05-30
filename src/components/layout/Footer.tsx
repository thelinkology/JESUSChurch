import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-church-surface text-church-earth-dark pt-16 pb-8 border-t border-church-earth/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-church-gold/80 flex items-center justify-center font-black text-sm tracking-wider text-white shrink-0">
                JC
              </div>
              <span className="font-serif text-2xl font-semibold tracking-tight">
                <span className="font-extrabold">JESUS</span> Church
              </span>
            </Link>
            <p className="text-church-earth-light leading-relaxed">
              A community of believers dedicated to loving God, loving people, and making disciples of all nations.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-church-earth-light hover:text-church-gold transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-church-earth-light hover:text-church-gold transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-church-earth-light hover:text-church-gold transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xl font-medium mb-6 text-church-gold">Quick Links</h3>
            <ul className="space-y-3">
              {['About Us', 'Sermons', 'Events', 'Ministries', 'Give'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-church-earth-light hover:text-church-gold transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="font-serif text-xl font-medium mb-6 text-church-gold">Service Times</h3>
            <ul className="space-y-4 text-church-earth-light">
              <li>
                <strong className="block text-church-earth-dark font-medium mb-1">Sunday Worship</strong>
                9:00 AM & 11:00 AM
              </li>
              <li>
                <strong className="block text-church-earth-dark font-medium mb-1">Wednesday Night</strong>
                7:00 PM - Bible Study
              </li>
              <li>
                <strong className="block text-church-earth-dark font-medium mb-1">Youth Ministry</strong>
                Fridays at 6:30 PM
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-xl font-medium mb-6 text-church-gold">Contact Us</h3>
            <ul className="space-y-4 text-church-earth-light">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-church-gold shrink-0 mt-0.5" />
                <span>123 Faith Avenue<br />Graceville, ST 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-church-gold shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-church-gold shrink-0" />
                <span>hello@jesuschurch.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-church-earth/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-church-earth-light">
          <p>&copy; {new Date().getFullYear()} Jesus Church. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-church-earth-dark transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-church-earth-dark transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
