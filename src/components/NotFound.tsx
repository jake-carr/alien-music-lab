import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-6xl font-bold mb-8">404</h1>
      <p className="text-2xl mb-4">Oops! This page is out of tune.</p>
      <Link 
        to="/" 
        className="px-6 py-3 text-green-600 underline text-2xl mb-8 hover:text-green-300 transition-colors duration-300"
      >
        Return to app
      </Link>
    </div>
  );
};

export default NotFound;
