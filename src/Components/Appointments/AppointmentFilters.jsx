import React from 'react';
import { FaList } from 'react-icons/fa';

const AppointmentFilters = ({ 
  filterStatus, 
  sortOrder, 
  onFilterChange, 
  onToggleSortOrder 
}) => {
  const handleSortToggle = () => {
    if (typeof onToggleSortOrder === 'function') {
      onToggleSortOrder();
    }
  };

  return (
    <div className="controls-section">
      <div className="filter-section">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => onFilterChange('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
          onClick={() => onFilterChange('approved')}
        >
          Approved
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => onFilterChange('completed')}
        >
          Completed
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
          onClick={() => onFilterChange('rejected')}
        >
          Rejected
        </button>
      </div>
      
      <button className="sort-btn" onClick={handleSortToggle}>
        <FaList /> {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
      </button>
    </div>
  );
};

export default AppointmentFilters;