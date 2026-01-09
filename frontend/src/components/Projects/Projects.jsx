import React from 'react';

const PROJECTS = [
  {
    id: 1,
    title: 'Gesture Based Car',
    description: 'This is kind of car that can be controlled by just hand gestures. This project has tremendous applications especially in health domain.',
    image: '/gallery/gallery-2.jpg',
    students: [
      'Nency Anghan - 170420107001',
      'Tejaswini Bahurupi - 170420107003',
      'Archil Chovatiya - 170420107005',
      'Kartik Gondaliya - 170420107015',
      'Dhruvish Patel - 170420107032',
      'Sahil Shingala - 170420107051'
    ]
  },
  {
    id: 2,
    title: 'Gesture Based Home Automation',
    description: 'Home automation is the use and control of home appliances remotely or automatically.',
    image: '/gallery/gallery-8.jpg',
    students: [
      'Nency Anghan - 170420107001',
      'Tejaswini Bahurupi - 170420107003',
      'Archil Chovatiya - 170420107005',
      'Kartik Gondaliya - 170420107015',
      'Dhruvish Patel - 170420107032',
      'Sahil Shingala - 170420107051',
      'Rohit Swami - 180420109536'
    ]
  },
  {
    id: 3,
    title: 'Drone Communication',
    description: 'Drone communication maintains connections between drones and a ground station with an adequate data rate for fortifying real-time transmissions.',
    image: '/gallery/gallery-3.jpg',
    students: [
      'Nency Anghan - 170420107001',
      'Tejaswini Bahurupi - 170420107003',
      'Archil Chovatiya - 170420107005',
      'Kartik Gondaliya - 170420107015',
      'Dhruvish Patel - 170420107032',
      'Sahil Shingala - 170420107051',
      'Rohit Swami - 180420109536'
    ]
  },
  {
    id: 4,
    title: 'Home Automation',
    description: 'Home automation is the use and control of home appliances remotely or automatically. It refers to the automatic and electronic control of household features, activity, and appliances.',
    image: '/gallery/gallery-9.jpg',
    students: [
      'Archil Chovatiya - 170420107005',
      'Sahil Shingala - 170420107055',
      'Brijesh Kargar - 1704201075246'
    ]
  },
  {
    id: 5,
    title: 'Projector Controller',
    description: 'This is kind of smart projector which can control all your things by remotely.',
    image: '/gallery/gallery-4.jpg',
    students: [
      'Shahil Mangroliya - 180420107525',
      'Ajay Gajera - 180420107512',
      'Chirag Gujarati - 180420107513',
      'Dhavan Miyani - 180420107550',
      'Sanket Naliyadra - 180420107530',
      'Yash Thummar - 180420107559',
      'Manali Ladhani - 180420107522'
    ]
  },
  {
    id: 6,
    title: 'AC Automation Project',
    description: 'Room Temperature prediction in Air Conditioners is highly challenged and ambiguous in today\'s life.',
    image: '/gallery/gallery-10.jpg',
    students: [
      'Navdeep Dudhat - 180420107511',
      'Prince Bodar - 180420107505',
      'Hiral Rathod - 180420107545',
      'Nisha Kakadiya - 180420107518',
      'Dhruvit Maniya - 180420107526',
      'Gautam Sheta - 180420107554',
      'Sonika Shah - 180420107552',
      'Kunda Anas - 180420107029',
      'Joshi Riddhi - 180420107517'
    ]
  },
  {
    id: 7,
    title: 'Motion Sensed Light',
    description: 'A motion sensor light triggers a response when motion is detected. They can be installed indoors, on walls, ceilings, and in doorways, or outside, on the exterior of buildings and homes.',
    image: '/gallery/gallery-4.jpg',
    students: [
      'Brijesh Patadiya - 190420107040',
      'Manav Dobariya - 190420107011',
      'Abhishek Kumbhani - 190420107027'
    ]
  }
];

function Projects() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7fb] to-white text-gray-900 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-[#221F3B] mb-6">Completed Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Innovative projects developed by our students showcasing IoT applications in real-world scenarios.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200"
            >
              <div className="h-64 overflow-hidden bg-gray-200">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%236b7280"%3EProject Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Students:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {project.students.map((student, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{student}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Projects;
