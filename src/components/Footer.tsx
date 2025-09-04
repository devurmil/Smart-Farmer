import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Smart Farm India</h3>
                <p className="text-sm text-gray-400">Digital Agriculture Solutions</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering farmers with cutting-edge technology and digital solutions for sustainable agriculture. 
              Join thousands of farmers who trust Smart Farm India for their farming needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  Area Calculator
                </Link>
              </li>
              <li>
                <Link to="/disease" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  Disease Detection
                </Link>
              </li>
              <li>
                <Link to="/cost-planning" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  Cost Planning
                </Link>
              </li>
              <li>
                <Link to="/equipment-rental" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  Equipment Rental
                </Link>
              </li>
              <li>
                <Link to="/farm-supply" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  Farm Supply
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  AI Disease Detection
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  GPS Area Calculation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  Equipment Rental
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  Market Intelligence
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  Supplier Network
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  Weather Monitoring
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    Near Gh-4 Garden<br />
                    Gandhinagar, India 382011
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                <a href="tel:+911234567890" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  +91 123 456 7890
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                <a href="mailto:info@smartfarmindia.com" className="text-gray-300 hover:text-green-500 transition-colors text-sm">
                  smartfarmer117@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h4 className="text-lg font-semibold text-white">Subscribe to Our Newsletter</h4>
              <p className="text-gray-400 text-sm mt-1">
                Get the latest farming tips and market updates delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full lg:w-auto space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © 2024 Smart Farm India. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default Footer;
