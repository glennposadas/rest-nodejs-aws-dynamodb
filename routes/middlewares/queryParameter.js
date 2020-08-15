/* ==========================================================================
   Dependencies
   ========================================================================== */

   const httpStatus = require('http-status-codes');
   const joi = require('@hapi/joi');
   const { RESPONSE_MESSAGES } = require('../../constants');
   const responseHelper = require('../../helpers/responseHelper');
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const checkQueryParameters = async (req, res, next) => {
     try {
       const { query } = req;
   
       const schema = joi
         .object({
           size: joi.number().min(10).max(2000),
           sort: joi.string().valid('asc', 'desc'),
           sortBy: joi.string(),
           searchAfter: joi.string().length(20)
         })
         .unknown(true);
   
       const { error } = schema.validate(query);
   
       if (error && error.details) {
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(error.details[0].message));
       }
   
       next();
     } catch (error) {
       return res
         .status(httpStatus.INTERNAL_SERVER_ERROR)
         .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
     }
   };
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = checkQueryParameters;
   