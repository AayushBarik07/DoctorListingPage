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
          inClinic: doctor.in_clinic || false
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
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="bg-blue-600 rounded-lg p-6 mb-6">
        <h1 className="text-blue text-2xl font-bold mb-4">Appointment Booking</h1>
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search Symptoms, Doctors, Specialties, Clinics"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 rounded-md focus:outline-none border-amber-50 focus:ring-2 bg-white-700 focus:ring-blue-500"
            data-testid="search-input"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            data-testid="search-button"
          >
            <svg className="w-5 h-5 text-white-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </form>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Sort by</h3>
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="sort-fees"
                name="sort"
                checked={sorting.fees}
                onChange={() => handleSortChange('fees')}
                className="mr-2"
                data-testid="sort-fees"
              />
              <label htmlFor="sort-fees" className="text-gray-700">Price (Low-High)</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-experience"
                name="sort"
                checked={sorting.experience}
                onChange={() => handleSortChange('experience')}
                className="mr-2"
                data-testid="sort-experience"
              />
              <label htmlFor="sort-experience" className="text-gray-700">Experience (High-Low)</label>
            </div>
          </div>
          
          <div className="mb-6">
            <div className='d-flex flex-wrap justify-between'>
              <h3 className="text-lg font-semibold mb-3">Filters</h3>
              <h4 className='text-blue-500'>Clear</h4>
            </div>
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="consultation-all"
                name="consultation-type"
                checked={consultationType === 'all'}
                onChange={() => handleConsultationTypeChange('all')}
                className="mr-2"
              />
              <label htmlFor="consultation-all" className="text-gray-700">All</label>
            </div>
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="consultation-video"
                name="consultation-type"
                checked={consultationType === 'video'}
                onChange={() => handleConsultationTypeChange('video')}
                className="mr-2"
              />
              <label htmlFor="consultation-video" className="text-gray-700">Video Consultation</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="consultation-clinic"
                name="consultation-type"
                checked={consultationType === 'clinic'}
                onChange={() => handleConsultationTypeChange('clinic')}
                className="mr-2"
              />
              <label htmlFor="consultation-clinic" className="text-gray-700">Specialities</label>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Specialties</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-specialty-Ayurveda"
                  checked={filters.ayurveda}
                  onChange={(e) => handleFilterChange('ayurveda', e.target.checked)}
                  className="mr-2"
                  data-testid="filter-specialty-Ayurveda"
                />
                <label htmlFor="filter-specialty-Ayurveda" className="text-gray-700">Ayurveda</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-specialty-Homeopath"
                  checked={filters.homeopath}
                  onChange={(e) => handleFilterChange('homeopath', e.target.checked)}
                  className="mr-2"
                  data-testid="filter-specialty-Homeopath"
                />
                <label htmlFor="filter-specialty-Homeopath" className="text-gray-700">Homeopath</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-specialty-Dentist"
                  checked={filters.dentist}
                  onChange={(e) => handleFilterChange('dentist', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="filter-specialty-Dentist" className="text-gray-700">Dentist</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-specialty-Physician"
                  checked={filters.physician}
                  onChange={(e) => handleFilterChange('physician', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="filter-specialty-Physician" className="text-gray-700">Physician</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-specialty-Gynecologist"
                  checked={filters.gynecologist}
                  onChange={(e) => handleFilterChange('gynecologist', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="filter-specialty-Gynecologist" className="text-gray-700">Gynecologist</label>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <div key={doctor.id} className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row justify-between">
                    <div className="flex">
                      <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-full object-cover" />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        <p className="text-sm text-gray-600">{doctor.experience} yrs exp</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-1">📍</span>
                          <span>{doctor.location}</span>
                        </div>
                        <p className="text-sm text-gray-600">{doctor.address}</p>
                        {doctor.languages && doctor.languages.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Speaks: {doctor.languages.join(', ')}
                          </p>
                        )}
                        <div className="flex mt-1 space-x-2">
                          {doctor.videoConsult && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Video Consult</span>
                          )}
                          {doctor.inClinic && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">In-Clinic</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end justify-between">
                      <p className="text-lg font-semibold text-gray-800">₹ {doctor.fee}</p>
                      <button 
                        className="mt-2 md:mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        onClick={() => handleBookAppointment(doctor.id)}
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-gray-600">No doctors found matching your criteria.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
