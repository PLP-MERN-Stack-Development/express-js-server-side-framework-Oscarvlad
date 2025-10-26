const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // Use environment variable or fallback to default for development
  const validApiKey = process.env.API_KEY || 'default-secret-key-123';
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide an API key in the x-api-key header'
    });
  }
  
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }
  
  next();
};

module.exports = { authenticate };