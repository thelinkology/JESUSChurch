import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Contact() {
  return (
    <div className="pt-32 pb-24 bg-church-cream min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <span className="text-church-gold font-medium tracking-wider uppercase text-sm">Get in Touch</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-church-earth-dark mt-4 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-church-earth-light leading-relaxed">
            We'd love to hear from you. Whether you have a question, need prayer, or want to get involved.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-church-earth/5"
          >
            <h2 className="font-serif text-3xl font-semibold text-church-earth-dark mb-8">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-church-earth-dark mb-2">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="w-full px-4 py-3 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 focus:border-church-gold transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-church-earth-dark mb-2">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="w-full px-4 py-3 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 focus:border-church-gold transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-church-earth-dark mb-2">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-3 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 focus:border-church-gold transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-church-earth-dark mb-2">Message</label>
                <textarea 
                  id="message" 
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-church-earth/20 focus:outline-none focus:ring-2 focus:ring-church-gold/50 focus:border-church-gold transition-colors resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button 
                type="button"
                className="w-full bg-church-earth hover:bg-church-earth-dark text-church-cream px-6 py-4 btn-theme font-medium transition-colors text-lg"
              >
                Send Message
              </button>
            </form>
          </motion.div>

          {/* Contact Info & Map */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div>
              <h2 className="font-serif text-3xl font-semibold text-church-earth-dark mb-8">Contact Information</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-church-gold/10 rounded-full flex items-center justify-center shrink-0 text-church-gold">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-church-earth-dark text-lg">Address</h4>
                    <p className="text-church-earth-light mt-1">123 Faith Avenue<br/>Graceville, ST 12345</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-church-gold/10 rounded-full flex items-center justify-center shrink-0 text-church-gold">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-church-earth-dark text-lg">Phone</h4>
                    <p className="text-church-earth-light mt-1">(555) 123-4567</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-church-gold/10 rounded-full flex items-center justify-center shrink-0 text-church-gold">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-church-earth-dark text-lg">Email</h4>
                    <p className="text-church-earth-light mt-1">hello@jesuschurch.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-church-gold/10 rounded-full flex items-center justify-center shrink-0 text-church-gold">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-church-earth-dark text-lg">Office Hours</h4>
                    <p className="text-church-earth-light mt-1">Monday - Thursday: 9am - 4pm<br/>Friday: Closed</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map Placeholder */}
            <div className="h-64 bg-church-earth/10 rounded-2xl overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" 
                alt="Map location" 
                className="w-full h-full object-cover opacity-50 grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white px-6 py-3 rounded-full shadow-lg font-medium text-church-earth-dark flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-church-gold" />
                  Get Directions
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
