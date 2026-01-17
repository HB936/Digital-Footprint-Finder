import { Link } from 'react-router-dom';
import { FaEnvelope, FaUser, FaPhone, FaImage } from 'react-icons/fa';
import PrivacySuggestions from '../components/PrivacySuggestions';

function Home() {
  const features = [
    {
      icon: <FaEnvelope className="w-8 h-8" />,
      title: 'Email Search',
      description: 'Check if your email appears in public breach databases',
      path: '/email'
    },
    {
      icon: <FaUser className="w-8 h-8" />,
      title: 'Username Search',
      description: 'Find usernames across multiple online platforms',
      path: '/username'
    },
    {
      icon: <FaPhone className="w-8 h-8" />,
      title: 'Phone Search',
      description: 'Validate and trace phone numbers with open tools',
      path: '/phone'
    },
    {
      icon: <FaImage className="w-8 h-8" />,
      title: 'Image Search',
      description: 'Perform reverse image lookup via free scrapers',
      path: '/image'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4 text-slate-800 dark:text-emerald-300">
        Digital Footprint Finder
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
        Analyze and trace your online presence using free and open-source OSINT tools
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.path}
            className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md hover:shadow-xl 
              transition-all duration-300 border border-slate-100 dark:border-slate-700
              group hover:border-emerald-500/50 dark:hover:border-emerald-500/50
              hover:-translate-y-1"
          >
            <div className="flex flex-col items-center">
              <div className="text-emerald-500 dark:text-emerald-400 mb-4 transform group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-emerald-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {feature.title}</h2>
                            <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Additional Info Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
          <div className="text-emerald-500 dark:text-emerald-400 mb-4">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Privacy First</h3>
          <p className="text-slate-600 dark:text-slate-300">Your searches are secure and private. We never store personal data.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
          <div className="text-emerald-500 dark:text-emerald-400 mb-4">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Real-time Results</h3>
          <p className="text-slate-600 dark:text-slate-300">Get instant insights about your digital presence across platforms.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
          <div className="text-emerald-500 dark:text-emerald-400 mb-4">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Comprehensive Search</h3>
          <p className="text-slate-600 dark:text-slate-300">Multiple data sources ensure thorough digital footprint analysis.</p>
        </div>
      </div>

      <PrivacySuggestions />
    </div>
  );
}

export default Home;