import { Database, Shield, Zap } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: <Database className="h-8 w-8 text-indigo-600" />,
      title: 'Flexible Data Storage',
      description:
        'Store any type of personal information with custom fields and dynamic data structures.',
    },
    {
      icon: <Shield className="h-8 w-8 text-indigo-600" />,
      title: 'Secure API',
      description:
        'Your data is protected with industry-standard encryption and JWT authentication.',
    },
    {
      icon: <Zap className="h-8 w-8 text-indigo-600" />,
      title: 'Fast & Reliable',
      description:
        'Built with modern technology to ensure quick access to your data through our REST API.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Personal Information Repository
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern REST API solution for storing and managing personal information.
            Built with flexibility and security in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            API Features
          </h2>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              Our REST API provides a flexible and secure way to store and manage
              personal information. Create custom fields and store any type of data
              you need.
            </p>
            <p className="mb-4">
              The API supports dynamic data structures, allowing you to create and
              modify custom fields on the fly. Each record can have its own unique
              set of fields.
            </p>
            <p>
              With our secure authentication system and modern architecture, you
              can safely store and access your personal information through standard
              REST API endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}