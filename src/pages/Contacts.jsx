import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Upload, UserCircle } from 'lucide-react';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export default function Contacts() {
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    customFields: []
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    phone: '',
    photo: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { token } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address'
      }));
      return false;
    }
    setFormErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validatePhone = (phone) => {
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || isNaN(phoneDigits)) {
      setFormErrors(prev => ({
        ...prev,
        phone: 'Please enter a valid phone number (minimum 10 digits)'
      }));
      return false;
    }
    setFormErrors(prev => ({ ...prev, phone: '' }));
    return true;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormErrors(prev => ({ ...prev, photo: '' }));

    if (file.size > MAX_FILE_SIZE) {
      setFormErrors(prev => ({
        ...prev,
        photo: 'Image size must be less than 1MB'
      }));
      return;
    }

    if (!ALLOWED_FORMATS.includes(file.type)) {
      setFormErrors(prev => ({
        ...prev,
        photo: 'Please upload a JPEG, PNG, or WebP image'
      }));
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: reader.result
        }));
        setIsUploading(false);
      };
      reader.onerror = () => {
        setFormErrors(prev => ({
          ...prev,
          photo: 'Failed to read image file'
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setFormErrors(prev => ({
        ...prev,
        photo: 'Failed to process image'
      }));
      setIsUploading(false);
    }
  };

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/contacts');
      console.log('Fetched records:', response.data);
      setRecords(response.data.contacts || []);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Failed to fetch records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecords();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(formData.email);
    const isPhoneValid = validatePhone(formData.phone);

    if (!isEmailValid || !isPhoneValid || formErrors.photo) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, '')
      };

      if (editingId) {
        const response = await axios.put(`/api/contacts/${editingId}`, formattedData);
        console.log('Update response:', response.data);
        toast.success('Record updated successfully');
      } else {
        const response = await axios.post('/api/contacts', formattedData);
        console.log('Create response:', response.data);
        toast.success('Record added successfully');
      }
      
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', photo: '', customFields: [] });
      setFormErrors({ email: '', phone: '', photo: '' });
      setEditingId(null);
      await fetchRecords();
    } catch (error) {
      console.error('Operation error:', error.response || error);
      const errorMessage = error.response?.data?.message || 'Operation failed';
      toast.error(errorMessage);
      
      if (errorMessage.includes('image')) {
        setFormErrors(prev => ({
          ...prev,
          photo: errorMessage
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    console.log('Editing record:', record);
    setFormData({
      name: record.name,
      email: record.email,
      phone: record.phone,
      photo: record.photo || '',
      customFields: record.customFields || []
    });
    setFormErrors({ email: '', phone: '', photo: '' });
    setEditingId(record._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`/api/contacts/${id}`);
        toast.success('Record deleted successfully');
        await fetchRecords();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete record');
      }
    }
  };

  const addCustomField = () => {
    if (!newFieldLabel.trim()) {
      toast.error('Please enter a field label');
      return;
    }

    const labelExists = formData.customFields.some(
      field => field.label.toLowerCase() === newFieldLabel.toLowerCase()
    );

    if (labelExists) {
      toast.error('A field with this name already exists');
      return;
    }

    setFormData({
      ...formData,
      customFields: [...formData.customFields, { label: newFieldLabel, value: '' }]
    });
    setNewFieldLabel('');
  };

  const removeCustomField = (index) => {
    const updatedFields = formData.customFields.filter((_, i) => i !== index);
    setFormData({ ...formData, customFields: updatedFields });
  };

  const updateCustomFieldValue = (index, value) => {
    const updatedFields = formData.customFields.map((field, i) => 
      i === index ? { ...field, value } : field
    );
    setFormData({ ...formData, customFields: updatedFields });
  };

  const updateCustomFieldLabel = (index, newLabel) => {
    if (!newLabel.trim()) {
      toast.error('Field label cannot be empty');
      return;
    }

    const labelExists = formData.customFields.some(
      (field, i) => i !== index && field.label.toLowerCase() === newLabel.toLowerCase()
    );

    if (labelExists) {
      toast.error('A field with this name already exists');
      return;
    }

    const updatedFields = formData.customFields.map((field, i) => 
      i === index ? { ...field, label: newLabel } : field
    );
    setFormData({ ...formData, customFields: updatedFields });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Personal Information Records</h1>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', phone: '', photo: '', customFields: [] });
            setFormErrors({ email: '', phone: '', photo: '' });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Record</span>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No records found. Add your first record!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div
              key={record._id}
              className="bg-white p-6 rounded-lg shadow-md space-y-4"
            >
              <div className="flex items-center space-x-4">
                {record.photo ? (
                  <img
                    src={record.photo}
                    alt={record.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-16 h-16 text-gray-400" />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {record.name}
                  </h3>
                  <p className="text-gray-600">{record.email}</p>
                  <p className="text-gray-600">{record.phone}</p>
                </div>
              </div>
              
              {record.customFields?.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  {record.customFields.map((field, index) => (
                    <p key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-600">{field.label}:</span>
                      <span className="text-gray-700">{field.value}</span>
                    </p>
                  ))}
                </div>
              )}

              <div className="flex space-x-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(record)}
                  className="flex items-center space-x-1 px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(record._id)}
                  className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Record' : 'Add New Record'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Contact"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-24 h-24 text-gray-400" />
                  )}
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="h-5 w-5 text-gray-600" />
                  </label>
                </div>
              </div>
              {formErrors.photo && (
                <p className="text-sm text-red-600 text-center">{formErrors.photo}</p>
              )}
              {isUploading && (
                <p className="text-sm text-gray-600 text-center">Uploading image...</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    validateEmail(e.target.value);
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d-+() ]/g, '');
                    setFormData({ ...formData, phone: value });
                    validatePhone(value);
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., (123) 456-7890"
                  required
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Additional Information Fields</h3>
                </div>
                
                {formData.customFields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateCustomFieldLabel(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Field Name"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCustomField(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateCustomFieldValue(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Field Value"
                    />
                  </div>
                ))}

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="Enter new field name"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add Field
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Processing...' : (editingId ? 'Update Record' : 'Add Record')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}