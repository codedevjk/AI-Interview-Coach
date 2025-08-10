const axios = require('axios');

(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/questions');
    console.log('Questions endpoint:', res.data);
  } catch (err) {
    console.error('API test failed:', err.message);
  }
})();