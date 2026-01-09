import React, { useState } from 'react';

// Gallery images - can be dynamically loaded
const GALLERY_IMAGES = [
  '/gallery/gallery-1.jpg',
  '/gallery/gallery-2.jpg',
  '/gallery/gallery-3.jpg',
  '/gallery/gallery-4.jpg',
  '/gallery/gallery-5.jpg',
  '/gallery/gallery-6.jpg',
  '/gallery/gallery-7.jpg',
  '/gallery/gallery-8.jpg',
  '/gallery/gallery-9.jpg',
  '/gallery/gallery-10.jpg',
];

const VIDEOS = [
  {
    id: 1,
    title: 'Drone Video',
    thumbnail: '/videos/about-drone-video.png',
    video: '/videos/Drone_video.mp4',
  },
  {
    id: 2,
    title: 'Motion Sensor Robot',
    thumbnail: '/videos/about-motion-sensor-robot.jpg',
    video: '/videos/Archil_Project_Motion_Sensor.mp4',
  },
  {
    id: 3,
    title: 'IOT Club Introduction',
    thumbnail: '/videos/abou-intro-video.png',
    video: '/videos/IOT CLub Video.mp4',
  },
  {
    id: 4,
    title: 'VJ CO IOT Club',
    thumbnail: '/videos/about-video.png',
    video: '/videos/VJ_CO_IOT_Club_v1.1.mp4',
  },
];

function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7fb] to-white text-gray-900 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Image Gallery Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-[#221F3B] mb-6">Gallery</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Glimpse of some pictures by our students and their created projects
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GALLERY_IMAGES.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%236b7280"%3EGallery Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#221F3B] mb-6">Videos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch our projects in action
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {VIDEOS.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-200 cursor-pointer group"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video overflow-hidden bg-gray-200">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ccircle cx="200" cy="150" r="40" fill="%239ca3af"/%3E%3Cpath d="M190 140 L190 160 L210 150 Z" fill="white"/%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10 text-orange-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-2xl transition"
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt="Gallery"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Video Modal - Popup Style */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-gray-900 text-xl font-semibold transition-all shadow-lg"
            >
              ✕
            </button>
            
            {/* Video Container - Handles both horizontal and vertical videos */}
            <div className="relative bg-black">
              <video
                controls
                autoPlay
                className="w-full max-h-[70vh] object-contain rounded-t-2xl"
                src={selectedVideo.video}
                style={{ aspectRatio: 'auto' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Video Title */}
            <div className="p-6 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">{selectedVideo.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
