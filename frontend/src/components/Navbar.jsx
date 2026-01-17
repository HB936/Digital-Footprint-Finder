import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaEnvelope, FaUser, FaPhone, FaImage, FaFingerprint, FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/email', icon: FaEnvelope, label: 'Email Search' },
    { path: '/username', icon: FaUser, label: 'Username Search' },
    { path: '/phone', icon: FaPhone, label: 'Phone Search' },
    { path: '/image', icon: FaImage, label: 'Image Search' },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold group">
            <FaFingerprint className="text-2xl text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            <span className="hidden sm:inline text-white group-hover:text-emerald-300 transition-colors">Digital Footprint Finder</span>
            <span className="sm:hidden text-white group-hover:text-emerald-300 transition-colors">DFF</span>
          </Link>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 transition-colors"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          <div className="hidden md:flex space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={
                  isActive(path)
                    ? "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-slate-300 hover:bg-slate-700 hover:text-emerald-300"
                }
              >
                <Icon />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className={isOpen ? "md:hidden block" : "md:hidden hidden"}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={
                  isActive(path)
                    ? "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-slate-300 hover:bg-slate-700 hover:text-emerald-300"
                }
                onClick={() => setIsOpen(false)}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;