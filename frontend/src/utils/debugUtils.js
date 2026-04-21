// Utility function to safely handle mgt.clearMarks calls
// Add this at the top of any file where mgt.clearMarks error occurs

export const safeClearMarks = (mgt) => {
  // Debug: Check what mgt contains
  console.log('mgt object:', mgt);
  console.log('mgt type:', typeof mgt);
  console.log('mgt keys:', mgt ? Object.keys(mgt) : 'mgt is null/undefined');

  // Safe check for clearMarks function
  if (mgt && typeof mgt.clearMarks === 'function') {
    try {
      mgt.clearMarks();
      console.log('clearMarks called successfully');
    } catch (error) {
      console.error('Error calling clearMarks:', error);
    }
  } else {
    console.warn('mgt.clearMarks is not available or not a function');
    // If clearMarks is not needed, you can remove this call entirely
    // Or implement alternative logic here
  }
};

// If mgt is supposed to be a performance monitoring object, use this instead:
export const performanceClearMarks = (markName) => {
  if (typeof performance !== 'undefined' && performance.clearMarks) {
    try {
      performance.clearMarks(markName);
      console.log(`Performance mark '${markName}' cleared`);
    } catch (error) {
      console.error('Error clearing performance mark:', error);
    }
  }
};

// Global error handler for mgt.clearMarks errors
export const setupGlobalErrorHandler = () => {
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('mgt.clearMarks is not a function')) {
      console.error('mgt.clearMarks error detected:', event.error);
      console.log('Error stack:', event.error.stack);
      console.log('Check if mgt is defined:', typeof window.mgt);
      console.log('mgt object:', window.mgt);

      // Prevent the error from propagating
      event.preventDefault();
    }
  });

  // Override console.error to catch mgt references
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args.some(arg => typeof arg === 'string' && arg.includes('mgt.clearMarks'))) {
      console.log('mgt.clearMarks error intercepted:', args);
      console.log('Checking global mgt:', window.mgt);
    }
    originalConsoleError.apply(console, args);
  };
};