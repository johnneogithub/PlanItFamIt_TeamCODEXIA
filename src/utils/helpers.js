export function capitalizeFirstLetter(string) {
  return string && typeof string === 'string' 
    ? string.charAt(0).toUpperCase() + string.slice(1) 
    : '';
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'approved': return 'bg-success';
    case 'rejected': return 'bg-danger';
    case 'remarked': return 'bg-info';
    default: return 'bg-warning';
  }
} 