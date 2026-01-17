import { FaShieldAlt, FaEnvelope, FaLock, FaImage, FaPhone, FaUser } from 'react-icons/fa';

function PrivacySuggestions() {
  const suggestions = [
    {
      icon: <FaEnvelope className="w-8 h-8" />,
      title: 'Protect Your Email',
      description: 'Use a separate, anonymous email for online services to avoid spam and phishing attacks. Consider using email aliases.'
    },
    {
      icon: <FaLock className="w-8 h-8" />,
      title: 'Secure Your Passwords',
      description: 'Use a password manager to generate and store strong, unique passwords for each of your online accounts.'
    },
    {
      icon: <FaImage className="w-8 h-8" />,
      title: 'Control Your Images',
      description: 'Be mindful of the images you share online. Avoid posting images with sensitive information or geotags.'
    },
    {
      icon: <FaPhone className="w-8 h-8" />,
      title: 'Safeguard Your Phone Number',
      description: 'Avoid sharing your personal phone number online. Use a secondary number or a service like Google Voice.'
    },
    {
      icon: <FaUser className="w-8 h-8" />,
      title: 'Manage Your Usernames',
      description: 'Use different usernames for different platforms to make it harder for others to track your online activity.'
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: 'Enable Two-Factor Authentication',
      description: 'Enable 2FA on all your accounts for an extra layer of security. This makes it much harder for attackers to gain access.'
    }
  ];

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-emerald-300">
        Protect Your Digital Privacy
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-center mb-4">
              <div className="text-emerald-500 dark:text-emerald-400">
                {suggestion.icon}
              </div>
              <h3 className="text-md font-semibold text-slate-800 dark:text-white ml-2">{suggestion.title}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300">{suggestion.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrivacySuggestions;
