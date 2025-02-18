const getApiKey = () => {
  if (process.env.NODE_ENV === 'test') {
    return 'test-api-key';
  }
  try {
    return window.__VITE_ZENRIN_API_KEY__ || 'test-api-key';
  } catch {
    return 'test-api-key';
  }
};

headers: {
  'Content-Type': 'application/json',
  'x-api-key': getApiKey(),
}, 