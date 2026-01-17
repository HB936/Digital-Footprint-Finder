import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaSearch, FaUser, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';

function UsernameSearch() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      toast.error('Please enter a username.');
      return;
    }

    setResults(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Backend server error' }));
        throw new Error(errorData.error || 'An unknown error occurred');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setLoading(false);
            toast.success('Search complete!');
            setResults((prevResults) => {
                if (prevResults === null) {
                    return { results: [], total_found: 0 };
                }
                return prevResults;
            });
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.substring(5).trim();
              try {
                const result = JSON.parse(data);
                if (result.error) {
                  toast.error(result.error);
                } else {
                  setResults((prevResults) => {
                    const newResults = prevResults ? [...prevResults.results, result] : [result];
                    return {
                      results: newResults,
                      total_found: newResults.length,
                    };
                  });
                }
              } catch (error) {
                console.error('Failed to parse JSON:', data);
              }
            }
          }
        }
      };

      processStream();

    } catch (error) {
      toast.error(error.message || 'Failed to search for the username.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 dark:bg-slate-800 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-2 text-center text-slate-800 dark:text-emerald-400">
        Username Search
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
        Search for a username across multiple social media platforms and websites.
      </p>

      <div className="mb-8 p-4 border-l-4 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/50 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <br />
            <ul className="list-disc space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
              <li>This search can take a long time to load because it searches through many different social media platforms.</li>
              <li>If the search appears to be stuck, please do not worry. It is still working in the background.</li>
              <li>Some results may be false positives, as the pages may not exist.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        <h2 className="text-lg font-semibold mb-2 text-slate-700 dark:text-emerald-300">Search Tips</h2>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-sm">
          <li>Try searching with and without special characters.</li>
          <li>The search is case-sensitive on some platforms.</li>
          <li>The results will include profile links when they are available.</li>
          <li>Some platforms may have rate limits.</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username to search"
                className="w-full p-3 pl-10 border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-slate-700 dark:text-slate-200 placeholder:dark:text-slate-400"
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Enter a username to check its availability across different platforms.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <FaSearch className="w-4 h-4" />
            {loading ? 'Searching...' : 'Search Username'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg space-y-6 text-center">
          <div className="flex justify-center items-center gap-3">
            <FaSearch className="w-6 h-6 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400">
              Searching
              <span className="inline-flex">
                <span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </span>
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Scanning multiple platforms for username "<span className="font-semibold text-emerald-500 dark:text-emerald-400">{username}</span>"
          </p>
          
          {/* Animated progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-progress"></div>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            This may take a while... Please be patient
          </p>
        </div>
      )}

      {results && !loading && (
        <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400">Search Results</h2>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
              {results.total_found} Matches Found
            </span>
          </div>

          <div className="grid gap-4">
            {results.results.map((result, index) => (
              <div key={index} className="p-4 dark:bg-slate-800 border dark:border-slate-600 rounded-lg hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold dark:text-slate-200 flex items-center gap-2">
                    {result.platform}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    result.exists
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                  }`}>
                    {result.exists ? 'Found' : 'Not Found'}
                  </span>
                </div>
                {result.exists && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 text-sm flex items-center gap-1 group"
                  >
                    <span>View Profile</span>
                    <FaExternalLinkAlt className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `username-search-${username}.json`;
                a.click();
              }}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <FaDownload className="w-4 h-4" />
              Download Results
            </button>
          </div>

          <div className="mt-8 p-4 border-t dark:border-slate-600">
            <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-emerald-300">Meta</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Meta does not allow us to check if a username exists, so you will have to check manually by clicking the link below.
            </p>
            <a
              href={`https://www.instagram.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 dark:bg-slate-800 border dark:border-slate-600 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <span>Instagram</span>
              <FaExternalLinkAlt className="w-3 h-3 ml-auto" />
            </a>
          </div>
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

export default UsernameSearch;