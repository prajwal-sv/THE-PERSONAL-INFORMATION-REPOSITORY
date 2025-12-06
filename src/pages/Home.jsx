import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-8">
          <Database className="h-16 w-16 text-indigo-600" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          REST API: Personal Information Repository
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A powerful REST API for storing and managing your personal information.
          Create custom fields, store any type of data, and access it securely through our API.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 bg-white text-indigo-600 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}