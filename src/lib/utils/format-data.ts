import { Contract } from '@/types/contracts';

export const formatCurrency = (amount: string) => {
  const num = Number(amount);
  if (isNaN(num)) return 'N/A';
  
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const getDaysUntil = (dateString: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
};

export const getStatusInfo = (contract: Contract) => {
  if (contract.award) {
    return {
      label: 'Awarded',
      className: 'bg-purple-100 text-purple-700 border-purple-300'
    };
  }

  if (contract.active !== 'Yes') {
    return {
      label: 'Inactive',
      className: 'bg-gray-100 text-gray-700 border-gray-300'
    };
  }

  const daysUntil = getDaysUntil(contract.responseDeadLine || '');
  if (!daysUntil) {
    return {
      label: 'Active',
      className: 'bg-green-100 text-green-700 border-green-300'
    };
  }

  if (daysUntil < 0) {
    return {
      label: 'Closed',
      className: 'bg-red-100 text-red-700 border-red-300'
    };
  }

  if (daysUntil <= 3) {
    return {
      label: `${daysUntil} days left`,
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300'
    };
  }

  return {
    label: `${daysUntil} days left`,
    className: 'bg-green-100 text-green-700 border-green-300'
  };
};