import React, { useState, useEffect } from 'react';

function App() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    ayurveda: false,
    homeopath: false,
    dentist: false,
    physician: false,
    gynecologist: false
  });
  const [consultationType, setConsultationType] = useState('all'); // 'all', 'video', 'clinic'
  const [sorting, setSorting] = useState({
    fees: false,
    experience: false
  });

  // Fetch doctors data from API
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json');
        const data = await response.json();
        
        // Transform API data to match our application structure
        const transformedData = data.map(doctor => ({
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialities[0]?.name || '',
          experience: parseInt(doctor.experience?.split(' ')[0]) || 0,
          location: doctor.clinic?.address?.locality || '',
          address: doctor.clinic?.name || '',
          fee: parseInt(doctor.fees?.replace('₹', '').trim()) || 0,
          image: doctor.photo || 'https://via.placeholder.com/80',
          languages: doctor.languages || [],
          videoConsult: doctor.video_consult || false,
          inClinic: doctor.in_clinic || false,
          rating: (Math.random() * 2 + 3).toFixed(1) // Generate a random rating between 3.0 and 5.0
        }));
        
        setDoctors(transformedData);
        setFilteredDoctors(transformedData);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
        setFilteredDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...doctors];
    
    // Apply specialty filters
    const activeSpecialtyFilters = Object.entries(filters)
      .filter(([_, isActive]) => isActive)
      .map(([specialty]) => specialty);
      
    if (activeSpecialtyFilters.length > 0) {
      result = result.filter(doctor => {
        const docSpecialty = doctor.specialty.toLowerCase();
        return activeSpecialtyFilters.some(specialty => 
          docSpecialty.includes(specialty.toLowerCase())
        );
      });
    }
    
    // Apply consultation type filter
    if (consultationType !== 'all') {
      result = result.filter(doctor => {
        if (consultationType === 'video') return doctor.videoConsult;
        if (consultationType === 'clinic') return doctor.inClinic;
        return true;
      });
    }
    
    // Apply search
    if (searchQuery) {
      result = result.filter(doctor => 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sorting.fees) {
      result.sort((a, b) => a.fee - b.fee);
    } else if (sorting.experience) {
      result.sort((a, b) => b.experience - a.experience);
    }
    
    setFilteredDoctors(result);
    
    // Update URL with query parameters
    const params = new URLSearchParams();
    
    // Add specialty filters to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(`filter-specialty-${key}`, 'true');
    });
    
    // Add consultation type to URL
    if (consultationType !== 'all') {
      params.set('consultation-type', consultationType);
    }
    
    // Add sorting to URL
    if (sorting.fees) params.set('sort-fees', 'true');
    if (sorting.experience) params.set('sort-experience', 'true');
    
    // Add search query to URL
    if (searchQuery) params.set('search', searchQuery);
    
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [doctors, filters, consultationType, sorting, searchQuery]);

  // Handle URL parameters on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Set specialty filters from URL
    const newFilters = { ...filters };
    Object.keys(filters).forEach(key => {
      newFilters[key] = params.get(`filter-specialty-${key}`) === 'true';
    });
    setFilters(newFilters);
    
    // Set consultation type from URL
    const consultType = params.get('consultation-type');
    if (consultType) {
      setConsultationType(consultType);
    }
    
    // Set sorting from URL
    setSorting({
      fees: params.get('sort-fees') === 'true',
      experience: params.get('sort-experience') === 'true'
    });
    
    // Set search query from URL
    if (params.get('search')) {
      setSearchQuery(params.get('search'));
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handle consultation type change
  const handleConsultationTypeChange = (type) => {
    setConsultationType(type);
  };

  // Handle sort changes
  const handleSortChange = (sortType) => {
    setSorting({
      fees: sortType === 'fees',
      experience: sortType === 'experience'
    });
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The search is already applied through the useEffect
  };

  // Handle appointment booking
  const handleBookAppointment = (doctorId) => {
    // In a real application, this would navigate to a booking form
    alert(`Booking appointment with doctor ID: ${doctorId}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      ayurveda: false,
      homeopath: false,
      dentist: false,
      physician: false,
      gynecologist: false
    });
    setConsultationType('all');
    setSorting({
      fees: false,
      experience: false
    });
    setSearchQuery('');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">Find & Book Doctor Appointments</h1>
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by doctor name, specialty, symptoms..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-6 py-4 rounded-full focus:outline-none focus:ring-2 border-0 shadow-md focus:ring-blue-300 text-gray-800"
                data-testid="search-input"
              />
              <button 
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                data-testid="search-button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 bg-white rounded-lg shadow-sm p-6 h-fit sticky top-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            </div>
            
            <div className="mb-8">
              <h4 className="font-medium mb-3 text-gray-700">Consultation Type</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    consultationType === 'all' 
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleConsultationTypeChange('all')}
                >
                  All
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    consultationType === 'video' 
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleConsultationTypeChange('video')}
                >
                  Video Consult
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    consultationType === 'clinic' 
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleConsultationTypeChange('clinic')}
                >
                  In-Clinic
                </button>
              </div>
            </div>
            
            <div className="mb-8">
              <h4 className="font-medium mb-3 text-gray-700">Sort by</h4>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name="sort"
                    checked={sorting.fees}
                    onChange={() => handleSortChange('fees')}
                    className="form-radio text-blue-600 focus:ring-blue-500"
                    data-testid="sort-fees"
                  />
                  <span className="ml-2 text-gray-700">Price (Low-High)</span>
                </label>
                <label className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name="sort"
                    checked={sorting.experience}
                    onChange={() => handleSortChange('experience')}
                    className="form-radio text-blue-600 focus:ring-blue-500"
                    data-testid="sort-experience"
                  />
                  <span className="ml-2 text-gray-700">Experience (High-Low)</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-gray-700">Specialties</h4>
              <div className="space-y-2">
                {Object.entries({
                  ayurveda: "Ayurveda",
                  homeopath: "Homeopath",
                  dentist: "Dentist",
                  physician: "Physician",
                  gynecologist: "Gynecologist"
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={filters[key]}
                      onChange={(e) => handleFilterChange(key, e.target.checked)}
                      className="form-checkbox text-blue-600 rounded focus:ring-blue-500"
                      data-testid={`filter-specialty-${label}`}
                    />
                    <span className="ml-2 text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center">
              <p className="text-gray-700">
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
              </p>
              <div className="text-sm text-gray-500">
                Showing results for {Object.values(filters).some(v => v) ? 'filtered specialties' : 'all specialties'}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doctor => (
                    <div key={doctor.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row">
                          <div className="flex-shrink-0 flex flex-col items-center mr-6">
                            <img 
                              src={doctor.image} 
                              alt={doctor.name} 
                              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" 
                            />
                            <div className="mt-2 flex items-center">
                              <span className="text-yellow-500 mr-1">★</span>
                              <span className="font-medium">{doctor.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex-1 mt-4 md:mt-0">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-800">Dr. {doctor.name}</h3>
                                <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                                <p className="text-gray-600">{doctor.experience} years experience</p>
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {doctor.videoConsult && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                      </svg>
                                      Video Consult
                                    </span>
                                  )}
                                  {doctor.inClinic && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                      </svg>
                                      In-Clinic
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mt-4 md:mt-0 text-right">
                                <div className="text-lg font-bold text-green-700">₹{doctor.fee}</div>
                                <div className="text-xs text-gray-500">Consultation Fee</div>
                              </div>
                            </div>
                            
                            <div className="mt-4 border-t pt-4">
                              <div className="flex items-center text-gray-600 mb-2">
                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span>{doctor.location}</span>
                              </div>
                              <div className="text-gray-600 mb-2">
                                <strong className="text-gray-700">Clinic:</strong> {doctor.address}
                              </div>
                              {doctor.languages && doctor.languages.length > 0 && (
                                <div className="text-gray-600">
                                  <strong className="text-gray-700">Languages:</strong> {doctor.languages.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          <button 
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center space-x-2"
                            onClick={() => handleBookAppointment(doctor.id)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>Book Appointment</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No doctors found</h3>
                    <p className="text-gray-500">
                      No doctors match your current search criteria. Try adjusting your filters or search query.
                    </p>
                    <button 
                      onClick={clearAllFilters}
                      className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;