// Helper functions for error handling
export const handleApiError = (error) => {
    if (error.response) {
      // Server responded with error
      return error.response.data.message || 'An error occurred';
    } else if (error.request) {
      // Request made but no response
      return 'No response from server';
    } else {
      // Request setup error
      return 'Error setting up request';
    }
  };
  
  export const formatValidationErrors = (errors) => {
    if (!errors) return {};
    return errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {});
  };