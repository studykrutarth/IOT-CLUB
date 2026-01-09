import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { eventsService, registrationsService, profilesService } from '../../services/database.js';
import AuthModal from '../Auth/AuthModal.jsx';

function Events() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [userProfile, setUserProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    enrollment: '',
    branch: '',
    year: '',
    email: '',
    phone: '',
    transactionId: ''
  });

  // Load events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        const supabaseEvents = await eventsService.getAll();
        if (supabaseEvents && supabaseEvents.length > 0) {
          setEvents(supabaseEvents);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      enrollment: '',
      branch: '',
      year: '',
      email: '',
      phone: '',
      transactionId: ''
    });
    setErrors({});
    setSubmitStatus(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.transactionId || formData.transactionId.trim().length < 10) {
      newErrors.transactionId = 'Please enter a valid UPI Transaction ID (minimum 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const openEnrollModal = async (event) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const isRegistered = await registrationsService.isRegistered(user.id, event.id);
      if (isRegistered) {
        alert('You are already registered for this event!');
        return;
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    }

    setSelectedEvent(event);
    setShowModal(true);
    resetForm();

    if (user) {
      try {
        const profile = await profilesService.get(user.id);
        setUserProfile(profile);
        setFormData(prev => ({
          ...prev,
          name: profile?.name || '',
          enrollment: profile?.enrollment || '',
          branch: profile?.branch || '',
          year: profile?.year || '',
          email: user.email || '',
          phone: profile?.phone || '',
        }));
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      resetForm();
      setSelectedEvent(null);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!selectedEvent.id || !uuidRegex.test(selectedEvent.id)) {
        throw new Error('Invalid event. Please refresh the page and try again.');
      }

      const registrationData = {
        user_id: user.id,
        event_id: selectedEvent.id,
        transaction_id: formData.transactionId,
        payment_method: 'UPI',
        amount_paid: parseFloat(selectedEvent.fee),
        enrollment_number: formData.enrollment,
        branch: formData.branch,
        year: formData.year,
        phone: formData.phone,
        email: formData.email || user.email,
        status: 'pending',
      };

      const registration = await registrationsService.create(registrationData);

      if (userProfile) {
        const profileUpdates = {};
        if (formData.name && formData.name !== userProfile.name) profileUpdates.name = formData.name;
        if (formData.enrollment && formData.enrollment !== userProfile.enrollment) profileUpdates.enrollment = formData.enrollment;
        if (formData.branch && formData.branch !== userProfile.branch) profileUpdates.branch = formData.branch;
        if (formData.year && formData.year !== userProfile.year) profileUpdates.year = formData.year;
        if (formData.phone && formData.phone !== userProfile.phone) profileUpdates.phone = formData.phone;

        if (Object.keys(profileUpdates).length > 0) {
          await profilesService.update(user.id, profileUpdates);
        }
      }

      setIsSubmitting(false);
      setSubmitStatus('success');

      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error) {
      console.error('Error creating registration:', error);
      setIsSubmitting(false);
      setSubmitStatus('error');
      
      let errorMessage = 'Failed to submit registration. Please try again.';
      if (error.message) errorMessage = error.message;
      else if (error.details) errorMessage = error.details;
      else if (error.hint) errorMessage = error.hint;
      
      if (error.code === '23503') {
        errorMessage = 'Invalid event. The event may not exist in the database.';
      } else if (error.code === '23505') {
        errorMessage = 'You are already registered for this event!';
      }
      
      setErrors({ submit: errorMessage });
    }
  };

  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        closeModal();
      }
    };

    if (showModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', escHandler);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', escHandler);
    };
  }, [showModal, isSubmitting]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7f7fb] to-white flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7fb] to-white text-gray-900 py-24 px-6">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-orange-600">Upcoming Events</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-[#221F3B] mb-6">
            Discover Your Next Adventure
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Carefully curated events to sharpen your skills, expand your network, and take your career to the next level.
          </p>
        </div>

        {eventsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No events available at the moment.</p>
            <p className="text-sm text-gray-500">Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => {
              const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : 'Date TBA';
              
              return (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 flex flex-col border-2 border-transparent hover:border-orange-200 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <span className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 font-semibold border border-orange-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {eventDate}
                      </span>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed min-h-[3rem]">
                      {event.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Fee</span>
                          <div className="text-2xl font-bold text-orange-600">
                            ₹{event.fee}
                          </div>
                        </div>

                        <button 
                          onClick={() => openEnrollModal(event)}
                          disabled={!event.id}
                          className={`group/btn px-6 py-3 bg-gradient-to-r from-[#221F3B] to-[#3a3560] text-white rounded-xl hover:from-[#3a3560] hover:to-[#221F3B] transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2 ${
                            !event.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span>Enroll</span>
                          {event.id && (
                            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enrollment Modal - Same as Home component */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={!isSubmitting ? closeModal : undefined}
          ></div>

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-8 z-10 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              disabled={isSubmitting}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 rounded-full font-semibold"
            >
              ✕
            </button>

            <div className="text-center mb-6 sm:mb-8 pr-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {selectedEvent.title}
              </h2>
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'Date TBA'}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-200">
                <span className="text-sm text-gray-600">Event Fee:</span>
                <span className="text-lg font-bold text-orange-600">₹{selectedEvent.fee}</span>
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 font-medium text-center">
                    Registration successful! Confirmation email sent to {formData.email}
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 font-medium text-center">
                    {errors.submit || 'Failed to submit registration. Please try again.'}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enrollment Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="enrollment"
                  placeholder="Enter your enrollment number"
                  required
                  value={formData.enrollment}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="ECE">Electronics</option>
                    <option value="ME">Mechanical</option>
                    <option value="CE">Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="">Select Year</option>
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                    <option value="4">Final Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-white border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter 10-digit phone number"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-white border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="border-t-2 border-gray-100 pt-6 mt-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-3">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <p className="text-sm font-bold text-gray-800">
                        Pay ₹{selectedEvent.fee}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">Scan the QR code to complete payment</p>
                  </div>

                  <div className="flex justify-center mb-5">
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-500 shadow-lg transform hover:scale-105 transition-transform">
                      <img
                        src="/UPI_QR.png"
                        alt="UPI QR Code"
                        className="w-52 h-52 sm:w-60 sm:h-60"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23FFA500"%3EUPI QR CODE%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      UPI Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      placeholder="Enter transaction ID from your UPI app"
                      required
                      value={formData.transactionId}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-white border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed ${errors.transactionId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200'}
                      `}
                    />
                    {errors.transactionId && (
                      <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.transactionId}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      After payment, copy the transaction ID from your UPI app
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3.5 text-base font-semibold bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Registration
                    </>
                  )}
                </button>

                <button
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-6 py-3.5 text-base font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-200 hover:border-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
