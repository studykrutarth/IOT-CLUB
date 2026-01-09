import React, { useState } from 'react';

function AboutUs() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7fb] via-white to-[#f7f7fb] text-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-[#1b1833] via-[#2a2548] to-[#1b1833] text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
            About SCET IoT Club
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The SCET IoT Club was formed in 2016 under Computer Engineering Department with guidance of expert faculties.
            IoT Club guides students to build new things and brings up with new ideas and solutions every day.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Video and About Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
            {/* Video Section */}
            <div className="relative group">
              <div 
                className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-orange-500/20"
                onClick={() => setShowVideoModal(true)}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                      <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-white font-medium text-lg">Watch Introduction Video</p>
                    <p className="text-gray-300 text-sm mt-2">Click to play</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>

            {/* About Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-4">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-orange-600">Our Story</span>
              </div>
              <h2 className="text-4xl font-bold text-[#221F3B]">Building Innovation Since 2016</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                The SCET IoT Club was formed in 2016 under Computer Engineering Department with guidance of expert faculties. 
                IoT Club guides students to build new things and brings up with new ideas and solutions every day. 
                It provides you a platform to build your technical skills.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                When it was started in 2016, we received an immense response from students by creating projects & exploring 
                new hardware technologies and ideas to solve real-life problems.
              </p>
            </div>
          </div>

          {/* Vision and Activities Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Vision Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Vision</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 leading-relaxed">To enhance the leadership skills</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 leading-relaxed">To explore interdisciplinary knowledge</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 leading-relaxed">To give the exposure of new technology</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 leading-relaxed">To showcase the technical skills and share the knowledge among peers</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 leading-relaxed">To build stronger community which can learn in team resulting in enhanced coding skills with hardware</span>
                </li>
              </ul>
            </div>

            {/* Activities Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Activities</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Various workshops are organized for students to make awareness to IoT, practical experience with hardware, 
                to share advance technologies related to other domains like robotics, drone, Computer vision.
              </p>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Projects Developed
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Gestures based car</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Gestures based home automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Classroom projector Automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">•</span>
                    <span>AC Automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Object or human tracking drone</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Classroom light/fan automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Drone communication</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-5xl font-bold text-orange-600 mb-2">2016</div>
              <div className="text-gray-700 font-semibold">Founded</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 text-center border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-5xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-700 font-semibold">Active Members</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center border-2 border-green-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-5xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-700 font-semibold">Projects Completed</div>
            </div>
          </div>
        </div>
      </section>

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
  );
}

export default AboutUs;
