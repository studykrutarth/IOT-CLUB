import React, { useState, useEffect } from "react";
import ClickSpark from "../effects/ClickSpark.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { registrationsService, profilesService, eventsService } from "../../services/database.js";
import AuthModal from "../Auth/AuthModal.jsx";

// Fallback events if Supabase is not available or has no events
// Note: These cannot be used for registration as they don't have valid UUIDs
// They are only for display purposes when Supabase events are not loaded
const FALLBACK_EVENTS = [
    {
        id: null, // No valid UUID - registration will be disabled
        title: "AI & Machine Learning Workshop",
        description: "Hands-on introduction to ML concepts",
        date: "2025-01-15",
        fee: 299,
        spots: 50,
        status: 'upcoming',
    },
    {
        id: null,
        title: "Web Development Bootcamp",
        description: "Build modern websites using React",
        date: "2025-01-20",
        fee: 199,
        spots: 50,
        status: 'upcoming',
    },
    {
        id: null,
        title: "Competitive Programming Contest",
        description: "Test your problem-solving skills",
        date: "2025-01-25",
        fee: 99,
        spots: 50,
        status: 'upcoming',
    },
];

function Home() {
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
    const [showVideoModal, setShowVideoModal] = useState(false);

    // Load events from Supabase
    useEffect(() => {
        const loadEvents = async () => {
            try {
                setEventsLoading(true);
                const supabaseEvents = await eventsService.getAll();
                if (supabaseEvents && supabaseEvents.length > 0) {
                    setEvents(supabaseEvents);
                } else {
                    // Use fallback events if no events in database
                    console.warn('No events found in Supabase, using fallback events');
                    setEvents(FALLBACK_EVENTS);
                }
            } catch (error) {
                console.error('Error loading events:', error);
                // Use fallback events on error
                setEvents(FALLBACK_EVENTS);
            } finally {
                setEventsLoading(false);
            }
        };

        loadEvents();
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        enrollment: '',
        branch: '',
        year: '',
        email: '',
        phone: '',
        transactionId: ''
    });

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
        // Check if user is authenticated
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        // Check if user is already registered
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

        // Load user profile to pre-fill form
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
            console.log('Submitting registration...');
            console.log('Selected Event:', selectedEvent);
            console.log('User:', user);
            console.log('Form Data:', formData);

            // Validate event_id - it must be a valid UUID if using Supabase
            if (!selectedEvent.id) {
                throw new Error('Invalid event selected. Please refresh the page and try again.');
            }

            // Check if event_id is a valid UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(selectedEvent.id)) {
                throw new Error('Invalid event ID format. Events must be loaded from Supabase. Please refresh the page.');
            }

            // Create registration in Supabase
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
                status: 'pending', // Will be confirmed after payment verification
            };

            console.log('Registration Data:', registrationData);

            const registration = await registrationsService.create(registrationData);
            console.log('Registration created successfully:', registration);

            // Update user profile if needed
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

            console.log('Registration created:', registration);
            setIsSubmitting(false);
            setSubmitStatus('success');

            setTimeout(() => {
                closeModal();
            }, 2000);
        } catch (error) {
            console.error('Error creating registration:', error);
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });
            
            setIsSubmitting(false);
            setSubmitStatus('error');
            
            // Better error messages for common issues
            let errorMessage = 'Failed to submit registration. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.details) {
                errorMessage = error.details;
            } else if (error.hint) {
                errorMessage = error.hint;
            }
            
            // Specific error handling
            if (error.code === '23503') {
                errorMessage = 'Invalid event. The event may not exist in the database. Please refresh and try again.';
            } else if (error.code === '23505') {
                errorMessage = 'You are already registered for this event!';
            } else if (error.code === '42501') {
                errorMessage = 'Permission denied. Please make sure you are logged in and have the necessary permissions.';
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

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1b1833] to-[#0f0c1d] flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <ClickSpark sparkColor="#FFA500" sparkSize={12}>
        <div className="bg-gradient-to-b from-[#1b1833] to-[#0f0c1d] text-white">
            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode="login"
            />

            {/* HERO SECTION */}
            <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(/hero.jpg)'
                    }}
                >
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
                </div>

                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-white">
                        Welcome to the SCET IoT Club
                    </h1>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-12 text-gray-300">
                        For the Students, by the Students
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() =>
                                document
                                    .getElementById("about")
                                    .scrollIntoView({ behavior: "smooth" })
                            }
                            className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2 text-lg"
                        >
                            <span>Get Started</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* VISION SECTION */}
            <section id="why-us" className="py-24 px-6 bg-gradient-to-b from-[#1b1833] to-[#0f0c1d] text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1">
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 h-full">
                                <h3 className="text-3xl font-bold mb-6 text-orange-400">Vision of SCET IoT Club</h3>
                                <p className="text-gray-300 leading-relaxed mb-6">
                                    IOT Club under Computer Engineering Department at SCET provides you the platform for the students to adopt new skills as well as below mentioned the following visions:
                                </p>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-1">•</span>
                                        <span>To enhance the leadership skills</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-1">•</span>
                                        <span>To explorer interdisciplinary knowledge</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-1">•</span>
                                        <span>To give the exposure of new technology</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-1">•</span>
                                        <span>To showcase the technical skills and share the knowledge among peers</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-1">•</span>
                                        <span>To build stronger community which can learn in team resulting in enhanced coding skills with hardware</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">Student's Response</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Having a great response among students & great enthusiasm among students to develop & learn new things by exploring the technology.
                                    </p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">Infrastructure</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Excellent hardware equipments with best laboratory under the department of Computer Engineering Department.
                                    </p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">Gallery</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Some Glimpse of IoT Club Hands-on-Workshop & projects done by students.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section id="about" className="py-24 px-6 bg-gradient-to-b from-[#f7f7fb] to-white text-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative">
                            <div 
                                className="aspect-video bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group"
                                onClick={() => setShowVideoModal(true)}
                            >
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-orange-700 transition group-hover:scale-110">
                                        <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                    <p className="text-gray-400">Watch Introduction Video</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-4xl font-bold text-[#221F3B] mb-4">About SCET IoT Club</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                The SCET IoT Club was formed in 2016 under Computer Engineering Department with guidance of expert faculties, IoT Club guide the students to build the new things and brings up with new ideas and solution everyday, It provides you a platform to build your technical skills, when it was started in 2016 the great immense response gotten from students by creating projects & exploring new hardware technologies and ideas getting to solve real life base problem.
                            </p>
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
                                <h4 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Activities Done in IoT Club
                                </h4>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-1">○</span>
                                        <span>Various workshops are organised for students to make awareness to IOT, Practical experience with hardware, to share advance technologies related to other domain like robotics, drone, Computer vision.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-1">○</span>
                                        <span>Students Developed some projects on various domains viz.</span>
                                    </li>
                                    <li className="ml-6 space-y-1">
                                        <div>• Gestures based car</div>
                                        <div>• Gestures based home automation</div>
                                        <div>• Classroom projector Automation</div>
                                        <div>• AC Automation</div>
                                        <div>• Object or human tracking drone</div>
                                        <div>• Classroom light/fan automation</div>
                                        <div>• Drone communication</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section id="counts" className="py-16 px-6 bg-gradient-to-b from-[#1b1833] to-[#0f0c1d] text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="text-4xl font-bold text-orange-400 mb-2">5</div>
                            <p className="text-gray-300">Workshop</p>
                        </div>
                        <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="text-4xl font-bold text-orange-400 mb-2">10</div>
                            <p className="text-gray-300">Projects</p>
                        </div>
                        <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="text-4xl font-bold text-orange-400 mb-2">25</div>
                            <p className="text-gray-300">Students</p>
                        </div>
                        <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div className="text-4xl font-bold text-orange-400 mb-2">9</div>
                            <p className="text-gray-300">Events</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES SECTION */}
            <section id="services" className="py-24 px-6 bg-gradient-to-b from-white to-[#f7f7fb] text-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-[#221F3B] mb-4">Services</h2>
                        <p className="text-xl text-gray-600">Various Activities offered by SCET IoT Club</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3 text-gray-900">Hands-On-Workshop</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Various Hands-On-Workshop arranged for the students to give more knowledge related to IoT.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3 text-gray-900">Robotics</h4>
                            <p className="text-gray-600 leading-relaxed">
                                It is a branch of engineering that involves the conception, design, manufacture and operation of robots.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3 text-gray-900">Drone</h4>
                            <p className="text-gray-600 leading-relaxed">
                                It is a flying robot that can be remotely controlled or fly autonomously using software-controlled flight plans in its embedded systems, that work in conjunction with onboard sensors and a global positioning system (GPS).
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3 text-gray-900">Cloud Computing/Artificial Intelligence</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Providing the solutions to the students with the help of Cloud computing and also by using the artificial intelligence.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3 text-gray-900">Computer Vision Projects</h4>
                            <p className="text-gray-600 leading-relaxed">
                                It deals with how computers extract meaningful information from images or videos.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3 text-gray-900">Practical Experience</h4>
                            <p className="text-gray-600 leading-relaxed">
                                To gain some more knowledge by doing small projects with practical projects & experience in leading the group.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FACULTY COORDINATORS SECTION */}
            <section id="doctors" className="py-24 px-6 bg-gradient-to-b from-[#1b1833] to-[#0f0c1d] text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">Faculty Co-ordinators</h2>
                        <p className="text-xl text-gray-300">In a Guidance under the best faculty and having a expertise in IoT</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 flex gap-6">
                            <div className="flex-shrink-0">
                                <img 
                                    src="/teammembers/parizakamboj.jpg" 
                                    alt="Prof.(Dr.) Pariza Kamboj"
                                    className="w-32 h-32 rounded-xl object-cover border-2 border-orange-500/50"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"%3E%3Crect width="128" height="128" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%236b7280"%3EPhoto%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold mb-2 text-orange-400">Prof.(Dr.) Pariza Kamboj</h4>
                                <span className="text-gray-400 mb-3 block">Head Of Department</span>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Qualification : Ph.D. (Comp. Engg.)<br/>
                                    Designation : Professor<br/>
                                    Email : pariza.kamboj@scet.ac.in
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 flex gap-6">
                            <div className="flex-shrink-0">
                                <img 
                                    src="/teammembers/vandanajoshi.jpg" 
                                    alt="Prof. Vandana Joshi"
                                    className="w-32 h-32 rounded-xl object-cover border-2 border-orange-500/50"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"%3E%3Crect width="128" height="128" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%236b7280"%3EPhoto%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold mb-2 text-orange-400">Prof. Vandana Joshi</h4>
                                <span className="text-gray-400 mb-3 block">Assistant Professor</span>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Qualification : M.Tech (Computer Science & Engg)<br/>
                                    Designation : Assistant Professor<br/>
                                    Email : vandana.joshi@scet.ac.in
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section id="faq" className="py-24 px-6 bg-gradient-to-b from-[#f7f7fb] to-white text-gray-900">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-[#221F3B] mb-4">Frequently Asked Questions</h2>
                        <p className="text-xl text-gray-600">
                            To reaching out the most common questions asked by students, for that we have shortlisted some frequently asked questions mentioned below with answers.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <details className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-orange-300 transition-all">
                            <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center gap-3">
                                <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Why to join the SCET IoT Club ?
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed pl-9">
                                The students can able to build the new things and brings up the solutions with new ideas in the daily life challenges.
                            </p>
                        </details>
                        <details className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-orange-300 transition-all">
                            <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center gap-3">
                                <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Which type of projects are there in IoT Club ?
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed pl-9">
                                The students can able to learn the new hardware technologies by creating projects and try to solve the daily life solution.
                            </p>
                        </details>
                        <details className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-orange-300 transition-all">
                            <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center gap-3">
                                <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Which type of activities done in the IoT Club ?
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed pl-9">
                                Various types of workshop will be arranged for the Student, Student can able to do practical experience with the hardware to share the advance technologies by doing the projects in different domains.
                            </p>
                        </details>
                        <details className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-orange-300 transition-all">
                            <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center gap-3">
                                <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Various workshops will be arranged for the students ?
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed pl-9">
                                For the Students the workshop will arranged and the expert talks will also arranged for the students, so they can adapt new technologies and can solve their doubts.
                            </p>
                        </details>
                        <details className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-orange-300 transition-all">
                            <summary className="font-bold text-lg text-gray-900 cursor-pointer flex items-center gap-3">
                                <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Students can also raise their Queries ?
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed pl-9">
                                Students can raise their queries by filling up the contact form in the website.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* EVENTS SECTION */}
            <section
                id="events"
                className="relative py-24 px-6 bg-gradient-to-b from-[#f7f7fb] to-white text-gray-900"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-semibold text-orange-600">Upcoming Events</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#221F3B] mb-6">
                            Discover Your Next Adventure
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
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
                            <p className="text-gray-600">No events available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event, index) => {
                                // Format date for display
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
                                {/* Decorative gradient overlay */}
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
                                                title={!event.id ? 'Events must be loaded from database to enroll' : ''}
                                            >
                                                <span>{!event.id ? 'Loading...' : 'Enroll'}</span>
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
            </section>


            {/* ENROLLMENT MODAL */}
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
                            aria-label="Close modal"
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
                                    {selectedEvent.date}
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

            {/* Video Modal - Full Screen Style */}
            {showVideoModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
                    onClick={() => setShowVideoModal(false)}
                >
                    <div 
                        className="relative bg-black rounded-2xl shadow-2xl w-full max-w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowVideoModal(false)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl font-semibold transition-all shadow-lg"
                        >
                            ✕
                        </button>

                        {/* Video Container - Takes full available space */}
                        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                            <video
                                controls
                                autoPlay
                                className="max-w-full max-h-full w-auto h-auto object-contain"
                                src="/videos/VJ_CO_IOT_Club_v1.1.mp4"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        
                        {/* Video Title */}
                        <div className="p-4 bg-black/80 border-t border-white/10">
                            <h3 className="text-xl font-bold text-white text-center">IOT Club Introduction Video</h3>
                        </div>
                    </div>
                </div>
            )}

        </div>
        </ClickSpark>
    );
}

export default Home;
