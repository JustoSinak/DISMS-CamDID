import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Phone, MapPin, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const Contact = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/contact/submit', formData);
      
      if (response.data.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={`min-h-screen py-20 ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-gray-50'
      }`}>
        {/* Header Section */}
        <div className={`${
          theme === 'dark'
            ? 'bg-emerald-900'
            : 'bg-emerald-500'
        } py-16`}>
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
            <p className={`text-lg max-w-2xl ${
              theme === 'dark'
                ? 'text-emerald-100'
                : 'text-emerald-50'
            }`}>
              Have questions about CamDID? We're here to help. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className={`rounded-lg shadow-lg p-6 ${
                theme === 'dark'
                  ? 'bg-gray-800'
                  : 'bg-white'
              }`}>
                <h2 className={`text-2xl font-semibold mb-6 ${
                  theme === 'dark'
                    ? 'text-emerald-400'
                    : 'text-emerald-700'
                }`}>Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Mail className={
                        theme === 'dark'
                          ? 'text-emerald-400'
                          : 'text-emerald-500'
                      } />
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        theme === 'dark'
                          ? 'text-gray-100'
                          : 'text-gray-900'
                      }`}>Email</h3>
                      <p className={
                        theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }>support@camdid.cm</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Phone className={
                        theme === 'dark'
                          ? 'text-emerald-400'
                          : 'text-emerald-500'
                      } />
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        theme === 'dark'
                          ? 'text-gray-100'
                          : 'text-gray-900'
                      }`}>Phone</h3>
                      <p className={
                        theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }>+237 680 312 765</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <MapPin className={
                        theme === 'dark'
                          ? 'text-emerald-400'
                          : 'text-emerald-500'
                      } />
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        theme === 'dark'
                          ? 'text-gray-100'
                          : 'text-gray-900'
                      }`}>Address</h3>
                      <p className={
                        theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }>Douala, Cameroon</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Clock className={
                        theme === 'dark'
                          ? 'text-emerald-400'
                          : 'text-emerald-500'
                      } />
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        theme === 'dark'
                          ? 'text-gray-100'
                          : 'text-gray-900'
                      }`}>Working Hours</h3>
                      <p className={
                        theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }>Monday - Friday: 8:00 AM - 5:00 PM</p>
                      <p className={
                        theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }>Saturday: 9:00 AM - 1:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    <Link 
                      to="/faq" 
                      className="flex items-center text-emerald-600 hover:text-emerald-700"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Visit our FAQ
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className={`rounded-lg shadow-lg p-6 ${
                theme === 'dark'
                  ? 'bg-gray-800'
                  : 'bg-white'
              }`}>
                <h2 className={`text-2xl font-semibold mb-6 ${
                  theme === 'dark'
                    ? 'text-emerald-400'
                    : 'text-emerald-700'
                }`}>Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-700'
                      }`}>
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'border border-gray-300 text-gray-900'
                        }`}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-700'
                      }`}>
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'border border-gray-300 text-gray-900'
                        }`}
                        placeholder="Your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark'
                        ? 'text-gray-300'
                        : 'text-gray-700'
                    }`}>
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'border border-gray-300 text-gray-900'
                      }`}
                      placeholder="Message subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark'
                        ? 'text-gray-300'
                        : 'text-gray-700'
                    }`}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'border border-gray-300 text-gray-900'
                      }`}
                      placeholder="Your message here..."
                    ></textarea>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-colors duration-300
                        ${isSubmitting 
                          ? 'bg-emerald-400 cursor-not-allowed' 
                          : theme === 'dark'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </div>

                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 text-center">Message sent successfully! We'll get back to you soon.</p>
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-center">There was an error sending your message. Please try again.</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 