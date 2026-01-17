import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EmailSearch from './pages/EmailSearch';
import UsernameSearch from './pages/UsernameSearch';
import PhoneSearch from './pages/PhoneSearch';
import ImageSearch from './pages/ImageSearch';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/email" element={<EmailSearch />} />
            <Route path="/username" element={<UsernameSearch />} />
            <Route path="/phone" element={<PhoneSearch />} />
            <Route path="/image" element={<ImageSearch />} />
          </Routes>
        </main>
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </Router>
  );
}

export default App;
