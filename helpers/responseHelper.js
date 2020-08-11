/* ==========================================================================
   Dependencies
   ========================================================================== */

   const constants = require('../constants');

   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const SUCCESS = (message = null, body = null) => ({
     message: message || constants.STATUS.SUCCESS,
     body
   });
   
   const UNAUTHORIZED = (message = null) => ({
     message: message || constants.STATUS.ERROR
   });
   
   const BAD_REQUEST = (message = null) => ({
     message: message || constants.STATUS.ERROR
   });
   
   const SERVER_ERROR = (message = null) => ({
     message: message || constants.STATUS.ERROR
   });
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = {
     SUCCESS,
     UNAUTHORIZED,
     BAD_REQUEST,
     SERVER_ERROR
   };
   