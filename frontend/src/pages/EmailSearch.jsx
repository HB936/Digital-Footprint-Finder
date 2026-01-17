import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaSearch, FaEnvelope, FaDownload, FaExclamationTriangle, FaLock, FaCalendarAlt, FaIndustry, FaChartBar } from 'react-icons/fa';

function EmailSearch() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(email)}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API returned invalid data format. Please try again later.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch data');
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from API');
      }
      
      setResults(data);
      const breachCount = data.ExposedBreaches?.breaches_details?.length || 0;
      toast.success(breachCount ? `Found ${breachCount} breaches for this email` : 'No breaches found for this email');
    } catch (error) {
      toast.error(error.message || 'Failed to search email');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLabel) => {
    switch (riskLabel?.toLowerCase()) {
      case 'high':
        return 'text-red-500 dark:text-red-400';
      case 'medium':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'low':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown';
      if (dateString.length === 4) return dateString; // Year only
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 dark:bg-slate-800 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-2 text-center text-slate-800 dark:text-emerald-400">
        Email Breach Search
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
        Check if your email has been exposed in known data breaches
      </p>
      
      <div className="mb-8 p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        <h2 className="text-lg font-semibold mb-2 text-slate-700 dark:text-emerald-300">Search Tips</h2>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-sm">
          <li>Enter a complete and valid email address</li>
          <li>Results include breach details, exposed data types, and risk assessment</li>
          <li>Information about password strength and industry sectors is provided</li>
          <li>Historical data shows breaches by year</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full p-3 pl-10 border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-slate-700 dark:text-slate-200 placeholder:dark:text-slate-400"
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Your email is only used to search the database and is not stored
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <FaSearch className="w-4 h-4" />
            {loading ? 'Searching...' : 'Search Email'}
          </button>
        </div>
      </form>

      {/* Animated Loading State */}
      {loading && (
        <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg space-y-6 text-center">
          <div className="flex justify-center items-center gap-3">
            <FaEnvelope className="w-6 h-6 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400">
              Checking Breaches
              <span className="inline-flex">
                <span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </span>
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Scanning email "<span className="font-semibold text-emerald-500 dark:text-emerald-400">{email}</span>" across breach databases
          </p>
          
          {/* Animated progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-progress"></div>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            Analyzing breach data... Please wait
          </p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-8">
          {(!results.ExposedBreaches?.breaches_details?.length && !results.ExposedPastes) ? (
            <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <FaLock className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400 mb-2">
                Good News! No Breaches Found
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                This email address hasn't been found in any known data breaches. However, it's important to:
              </p>
              <ul className="text-left text-sm text-slate-600 dark:text-slate-400 space-y-2 max-w-md mx-auto mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 dark:text-emerald-400">•</span>
                  Regularly check for new breaches
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 dark:text-emerald-400">•</span>
                  Use strong, unique passwords
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 dark:text-emerald-400">•</span>
                  Enable two-factor authentication where possible
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 dark:text-emerald-400">•</span>
                  Monitor your accounts for suspicious activity
                </li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                Remember: New breaches are discovered regularly, so it's good practice to check periodically.
              </p>
            </div>
          ) : (
            <>
              {/* Risk Score Section */}
              {results.BreachMetrics?.risk?.[0] && (
                <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400 flex items-center gap-2">
                      <FaExclamationTriangle />
                      Risk Assessment
                    </h2>
                    <span className={`px-4 py-2 rounded-full text-lg font-bold ${getRiskColor(results.BreachMetrics.risk[0].risk_label)}`}>
                      {results.BreachMetrics.risk[0].risk_score}% Risk Score
                    </span>
                  </div>
                  <p className={`text-lg font-medium ${getRiskColor(results.BreachMetrics.risk[0].risk_label)}`}>
                    Risk Level: {results.BreachMetrics.risk[0].risk_label}
                  </p>
                </div>
              )}

              {/* Password Strength Section */}
              {results.BreachMetrics?.passwords_strength?.[0] && (
                <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
                    <FaLock />
                    Password Security Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(results.BreachMetrics.passwords_strength[0]).map(([key, value]) => (
                      <div key={key} className="p-4 dark:bg-slate-800 rounded-lg border dark:border-slate-600">
                        <div className="text-sm text-slate-500 dark:text-slate-400">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Breaches Section */}
              {results.ExposedBreaches?.breaches_details?.length > 0 && (
                <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400">Detected Breaches</h2>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
                      {results.ExposedBreaches.breaches_details.length} {results.ExposedBreaches.breaches_details.length === 1 ? 'Breach' : 'Breaches'} Found
                    </span>
                  </div>
                  <div className="space-y-4">
                    {results.ExposedBreaches.breaches_details.map((breach, index) => (
                      <div key={index} className="p-4 dark:bg-slate-800 rounded-lg border dark:border-slate-600">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            {breach.logo && (
                              <img 
                                src={breach.logo} 
                                alt={breach.breach} 
                                className="w-12 h-12 rounded"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                            <div>
                              <h3 className="text-lg font-medium dark:text-slate-200">{breach.breach}</h3>
                              <a 
                                href={`https://${breach.domain}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-emerald-500 dark:text-emerald-400 hover:underline"
                              >
                                {breach.domain}
                              </a>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              <FaCalendarAlt className="inline mr-1" /> {formatDate(breach.xposed_date)}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              <FaIndustry className="inline mr-1" /> {breach.industry}
                            </div>
                          </div>
                        </div>
                        
                        <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
                          {breach.details}
                        </p>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {breach.xposed_data.split(';').map((data, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">
                              {data}
                            </span>
                          ))}
                        </div>

                        {breach.references && (
                          <a
                            href={breach.references}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-emerald-500 dark:text-emerald-400 text-sm hover:underline inline-block"
                          >
                            Read More →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yearly Statistics */}
              {results.BreachMetrics?.yearwise_details?.[0] && (
                <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
                    <FaChartBar />
                    Historical Breach Timeline
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Object.entries(results.BreachMetrics.yearwise_details[0])
                      .filter(([_, value]) => value > 0)
                      .map(([year, count]) => (
                        <div key={year} className="p-3 dark:bg-slate-800 rounded-lg border dark:border-slate-600">
                          <div className="text-lg font-bold dark:text-slate-200">{year.substring(1)}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{count} breach{count !== 1 ? 'es' : ''}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `email-breach-report-${email}.json`;
                    a.click();
                  }}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  <FaDownload className="w-4 h-4" />
                  Download Full Report
                </button>
              </div>
            </>
          )}
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

export default EmailSearch;