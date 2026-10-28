// Format price as Indian Rupees
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

// Calculate discount percentage
export const discountPercent = (original, discounted) => {
  if (!discounted || discounted >= original) return 0;
  return Math.round(((original - discounted) / original) * 100);
};

// Render star rating
export const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push('★');
    else if (i - 0.5 <= rating) stars.push('⯨');
    else stars.push('☆');
  }
  return stars.join('');
};

// Truncate text
export const truncate = (str, n) =>
  str?.length > n ? str.slice(0, n) + '...' : str;

// Get order status style class
export const getStatusClass = (status) => {
  const map = {
    pending:    'badge-warning',
    processing: 'badge-info',
    shipped:    'badge-primary',
    delivered:  'badge-success',
    cancelled:  'badge-danger'
  };
  return map[status] || 'badge-primary';
};

// Date format
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
