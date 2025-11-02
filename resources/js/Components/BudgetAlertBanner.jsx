import React from 'react';

const WarningIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.42 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 16h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const formatIDR = (value) => {
  if (typeof value !== 'number') return value;
  return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
};

export default function BudgetAlertBanner({ alert, onDismiss, className = '' }) {
  if (!alert) return null;

  const getAlertColor = (level) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-red-100',
          border: 'border-red-300',
          iconBg: 'bg-red-100',
          iconText: 'text-red-600',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800',
          progressBar: 'bg-red-500'
        };
      case 'high':
        return {
          bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
          border: 'border-orange-300',
          iconBg: 'bg-orange-100',
          iconText: 'text-orange-600',
          text: 'text-orange-800',
          badge: 'bg-orange-100 text-orange-800',
          progressBar: 'bg-orange-500'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
          border: 'border-yellow-300',
          iconBg: 'bg-yellow-100',
          iconText: 'text-yellow-600',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800',
          progressBar: 'bg-yellow-500'
        };
    }
  };

  const colors = getAlertColor(alert.alert_level);

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 shadow-md ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`${colors.iconBg} p-2 rounded-lg flex-shrink-0`}>
          <WarningIcon className={`w-5 h-5 ${colors.iconText}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h4 className={`font-bold text-sm ${colors.text}`}>
                {alert.category_name} Budget Alert
              </h4>
              <p className={`text-sm mt-1 ${colors.text}`}>
                {alert.message}
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                {alert.percentage.toFixed(0)}%
              </span>
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Dismiss alert"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs mb-2">
            <div>
              <span className="text-gray-600 font-medium">Budget:</span>
              <span className="ml-2 font-bold text-gray-900">
                {formatIDR(alert.budget_amount)}
              </span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Spent:</span>
              <span className="ml-2 font-bold text-gray-900">
                {formatIDR(alert.spent_amount)}
              </span>
            </div>
          </div>
          
          {!alert.is_exceeded && (
            <div className="text-xs mb-2">
              <span className="text-gray-600 font-medium">Remaining:</span>
              <span className="ml-2 font-bold text-green-700">
                {formatIDR(alert.remaining)}
              </span>
            </div>
          )}
          
          {/* Progress bar */}
          <div className="bg-white bg-opacity-50 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${colors.progressBar}`}
              style={{ width: `${Math.min(alert.percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
