/* ==========================================================================
   Dependencies
   ========================================================================== */

   const httpStatus = require('http-status-codes');
   const moment = require('moment');
   const responseHelper = require('../../helpers/responseHelper');
   const authHelper = require('../../helpers/authHelper');
   const { RESPONSE_MESSAGES } = require('../../constants');
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const authMiddleware = async (req, res, next) => {
     try {
      let token = req.headers['x-access-token'] || req.headers['authorization']; 
      // Express headers are auto converted to lowercase
      if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length).trimLeft();
      }    
   
       const decoded = await authHelper.decodeToken(
         token,
         process.env.ACCESS_TOKEN_SECRET
       );

       console.log('auth.js: access token:', token);
       console.log('auth.js: decoded: ', decoded);
   
       if (decoded) {
         if (moment().isBefore(moment.unix(decoded.exp))) {
           req.user = decoded;
           console.log('auth.js: decoded! success!');
           next();
         } else {
           console.log('auth.js: Invalid token!');
           throw new Error('Invalid token');
         }
       } else {
        console.log('auth.js: Access token not found!');
         throw new Error('Access token not found');
       }
     } catch (error) {
      console.log('auth.js: Unauthorized!', error);
       return res
         .status(httpStatus.UNAUTHORIZED)
         .json(responseHelper.BAD_REQUEST(RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST));
     }
   };
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = authMiddleware;
   