/* ==========================================================================
  Dependencies
  ========================================================================== */
  const SSM = require('aws-sdk/clients/ssm');
  const { cache } = require('./cacheService');
  
  const client = new SSM({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY
  });
  
  /**
   * Retrieves and decrypts a parameter
   * @param parameterName Parameter name. If empty the function will throw
   */
  const getParameter = async (parameterName) => {
    if (!parameterName) {
      throw new Error('No parameter name supplied to ssm helper');
    }
    const cachedData = cache.get(parameterName);
  
    if (cachedData) {
      return cachedData;
    }
  
    try {
      const params = {
        Name: parameterName,
        WithDecryption: true
      };
  
      const output = await client.getParameter(params).promise();
  
      if (!output.Parameter || !output.Parameter.Value) {
        throw new Error('Something went wrong parsing getParameter output');
      }
  
      cache.set(parameterName, output.Parameter.Value);
  
      return output.Parameter.Value;
    } catch (err) {
      throw new Error(`Something went wrong getting parameter: ${err.message}`);
    }
  };
  
  module.exports = {
    getParameter
  };
  