import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAllFilters, resetFilters } from '../store/slices/filtersSlice';
import { validateDateFilters } from '../utils/dataTransformers';
import '../styles/SearchFilters.scss';

const SearchFilters = ({ onSearch }) => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const { departments } = useSelector((state) => state.departments);
  
  const [localFilters, setLocalFilters] = useState(filters);
  const [dateError, setDateError] = useState('');
  
  const handleInputChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validate date filters (range and realistic bounds)
    const validation = validateDateFilters(localFilters.dateBegin, localFilters.dateEnd);
    if (!validation.isValid) {
      setDateError(validation.error);
      return;
    }
    
    setDateError('');
    dispatch(setAllFilters(localFilters));
    onSearch(localFilters);
  };
  
  const handleReset = () => {
    setDateError('');
    dispatch(resetFilters());
    const resetParams = {
      q: '',
      departmentId: null,
      dateBegin: '',
      dateEnd: '',
    };
    setLocalFilters(resetParams);
    // Clear results by passing null to trigger empty state
    onSearch(null);
  };
  
  // Check if search button should be disabled
  const isSearchDisabled = 
    !localFilters.q && 
    !localFilters.departmentId && 
    !localFilters.dateBegin && 
    !localFilters.dateEnd;
  
  return (
    <form className="search-filters" onSubmit={handleSearch}>
      <div className="search-filters__row">
        <div className="search-filters__field">
          <label htmlFor="search-query">Search</label>
          <input
            id="search-query"
            type="text"
            placeholder="Search artworks..."
            value={localFilters.q}
            onChange={(e) => handleInputChange('q', e.target.value)}
          />
        </div>
        
        <div className="search-filters__field">
          <label htmlFor="department">Department</label>
          <select
            id="department"
            value={localFilters.departmentId || ''}
            onChange={(e) => handleInputChange('departmentId', e.target.value ? parseInt(e.target.value, 10) : null)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="search-filters__row">
        <div className="search-filters__field">
          <label htmlFor="date-begin">
            Start Date
            <span className="search-filters__hint">
              (Use negative numbers for BCE, e.g., -500 for 500 BCE)
            </span>
          </label>
          <input
            id="date-begin"
            type="number"
            placeholder="e.g., -500 or 1500"
            value={localFilters.dateBegin}
            onChange={(e) => handleInputChange('dateBegin', e.target.value)}
          />
        </div>
        
        <div className="search-filters__field">
          <label htmlFor="date-end">
            End Date
            <span className="search-filters__hint">
              (Use negative numbers for BCE, e.g., -400 for 400 BCE)
            </span>
          </label>
          <input
            id="date-end"
            type="number"
            placeholder="e.g., -400 or 1600"
            value={localFilters.dateEnd}
            onChange={(e) => handleInputChange('dateEnd', e.target.value)}
          />
        </div>
      </div>
      
      {dateError && (
        <div className="search-filters__error">{dateError}</div>
      )}
      
      <div className="search-filters__actions">
        <button 
          type="submit" 
          className="btn btn--primary"
          disabled={isSearchDisabled}
        >
          Search
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleReset}>
          Reset Filters
        </button>
      </div>
    </form>
  );
};

export default SearchFilters;
