import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaSearch, FaPhone, FaDownload } from 'react-icons/fa';

function PhoneSearch() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = phoneNumber.replace(/\s/g, '');
    if (!phone) {
      toast.error('Please enter a phone number');
      return;
    }
    if (!phone.startsWith('+')) {
      toast.error('Please include a country code (e.g., +1 for US)');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending POST request to /api/phone');
      const response = await fetch('http://localhost:3000/api/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      console.log('Data from backend:', data);
      
      if (!response.ok) throw new Error(data.error);
      
      try {
        setResults(data);
      } catch (error) {
        console.error('Error setting results:', error);
      }
      
      toast.success('Phone search completed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to search phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 dark:bg-slate-800 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-2 text-center text-slate-800 dark:text-emerald-400">
        Phone Number Search
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
        Search for information associated with a phone number across various databases
      </p>
      
      <div className="mb-8 p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        <h2 className="text-lg font-semibold mb-2 text-slate-700 dark:text-emerald-300">Tips</h2>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-sm">
          <li>Include country code for international numbers (e.g., +1 for US)</li>
          <li>Remove any special characters or spaces</li>
          <li>Results may include carrier information and location data</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number (e.g., +1234567890)"
                className="w-full p-3 pl-10 border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-slate-700 dark:text-slate-200 placeholder:dark:text-slate-400"
              />
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Enter a phone number to search for associated information
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <FaSearch className="w-4 h-4" />
            {loading ? 'Searching...' : 'Search Phone Number'}
          </button>
        </div>
      </form>

      {/* Animated Loading State */}
      {loading && (
        <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg space-y-6 text-center">
          <div className="flex justify-center items-center gap-3">
            <FaPhone className="w-6 h-6 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400">
              Searching Number
              <span className="inline-flex">
                <span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </span>
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Looking up information for "<span className="font-semibold text-emerald-500 dark:text-emerald-400">{phoneNumber}</span>"
          </p>
          
          {/* Animated progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-progress"></div>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            Analyzing phone data... Please wait
          </p>
        </div>
      )}

      {results && !loading && (
        <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400">Search Results</h2>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
              Found Data
            </span>
          </div>
          
          <div className="dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-600">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="font-semibold text-slate-400">Raw local:</div>
              <div className="text-slate-300">{results.raw_local}</div>
              <div className="font-semibold text-slate-400">Local:</div>
              <div className="text-slate-300">{results.local}</div>
              <div className="font-semibold text-slate-400">E164:</div>
              <div className="text-slate-300">{results.e164}</div>
              <div className="font-semibold text-slate-400">International:</div>
              <div className="text-slate-300">{results.international}</div>
              <div className="font-semibold text-slate-400">Country:</div>
              <div className="text-slate-300">{results.country}</div>
            </div>
          </div>

          <a
            href={results.google_search_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-black text-white px-6 py-3 rounded-lg transition-colors hover:bg-slate-800"
          >
            Click to see results
          </a>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            We can't show you any more information based on this as this is in a gray area legally. Therefore, you will have to search it yourself.
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 50%;
            margin-left: 25%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }

        .animate-bounce {
          animation: bounce 1.4s ease-in-out infinite;
        }

        .delay-0 {
          animation-delay: 0s;
        }

        .delay-100 {
          animation-delay: 0.2s;
        }

        .delay-200 {
          animation-delay: 0.4s;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default PhoneSearch;