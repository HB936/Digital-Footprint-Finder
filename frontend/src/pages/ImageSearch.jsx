import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaUpload, FaSearch, FaDownload, FaImage, FaExternalLinkAlt } from 'react-icons/fa';

function ImageSearch() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
          try {
            const formData = new FormData();
            formData.append('image', image);
    
            const response = await fetch('/api/image', {
              method: 'POST',
              body: formData,
            });
    
            let data;
            try {
              data = await response.json();
            } catch (jsonError) {
              console.error("JSON parsing error:", jsonError);
              const textResponse = await response.text();
              console.error("Raw response text:", textResponse);
              throw new Error("Could not parse server response. Details in console.");
            }
    
            if (!response.ok) {
              throw new Error(data.error || 'Search failed');
            }
    
            if (!data.success || !data.data) throw new Error('Unexpected response format');
    
            setResults(data.data);
            toast.success('Image search completed successfully!');
          } catch (error) {      console.error('Frontend Error:', error);
      toast.error(error.message || 'Failed to search image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 dark:bg-slate-800 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-3 text-center text-slate-800 dark:text-emerald-400">
        Reverse Image Search
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
        Upload an image to find similar images and related sources online.
      </p>

      {/* Warning Box */}
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
              <li>This search can take a while to complete as it analyzes your image and searches across multiple sources.</li>
              <li>If the search appears to be stuck, please do not worry. It is still working in the background.</li>
              <li>A browser window could open briefly in the background during the search process - this is normal.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search Tips */}
      <div className="mb-8 p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        <h2 className="text-lg font-semibold mb-2 text-slate-700 dark:text-emerald-300">Search Tips</h2>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-sm">
          <li>Use clear, high-quality images for best results.</li>
          <li>Images with distinct features work better than generic ones.</li>
          <li>The search will find visually similar images and potential sources.</li>
          <li>Results may include various sizes and versions of the image.</li>
        </ul>
      </div>

      {/* --- Upload Form --- */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center items-center w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 dark:bg-slate-700 dark:text-slate-300 rounded-lg shadow-lg border dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors group">
              <div className="flex flex-col items-center gap-3">
                <FaUpload className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                <span className="text-base">
                  {image ? image.name : 'Click to select an image'}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Maximum size: 5MB
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !image}
            className="w-full md:w-auto bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <FaSearch className="w-4 h-4" />
            {loading ? 'Searching...' : 'Search Image'}
          </button>
        </div>
      </form>

      {/* Animated Loading State */}
      {loading && (
        <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg space-y-6 text-center">
          <div className="flex justify-center items-center gap-3">
            <FaImage className="w-6 h-6 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-emerald-400">
              Analyzing Image
              <span className="inline-flex">
                <span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </span>
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Searching for similar images and sources across the web
          </p>
          
          {/* Animated progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-progress"></div>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            This may take 30-60 seconds... Please be patient
          </p>
        </div>
      )}

      {/* --- Results --- */}
      {results && !loading && (
        <div className="dark:bg-slate-700 p-6 rounded-lg shadow-lg space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-emerald-400">
              {results.title || 'No title found'}
            </h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              {results.description || 'No description available'}
            </p>
          </div>

          {/* --- Similar Images --- */}
          {Array.isArray(results.images) && results.images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-emerald-400 mb-3">
                Similar Images ({results.images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {results.images.map((img, i) => (
                  <a
                    key={i}
                    href={img}
                    target="_blank"
                    rel="noreferrer"
                    className="relative rounded-lg overflow-hidden group"
                  >
                    <img
                      src={img}
                      alt={`similar-${i}`}
                      className="w-full h-40 object-cover rounded-lg transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <FaExternalLinkAlt />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* --- Source Sites --- */}
          {Array.isArray(results.sites) && results.sites.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-emerald-400 mb-3">
                Source Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.sites.filter(site => site !== 'https://yandex.com/').slice(0, 10).map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="dark:bg-slate-600 p-4 rounded-lg hover:dark:bg-slate-500 transition-colors group"
                  >
                    <p className="text-sm text-slate-400 dark:text-slate-300 truncate group-hover:text-white">
                      {link}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* --- Download JSON --- */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(results, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `image-search-${Date.now()}.json`;
                a.click();
              }}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <FaDownload className="w-4 h-4" />
              Download Results
            </button>
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

export default ImageSearch;