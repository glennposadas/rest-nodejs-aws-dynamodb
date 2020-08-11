/* ==========================================================================
   Dependencies
   ========================================================================== */

   const swaggerUi = require('swagger-ui-express');
   const swaggerDocument = require('../swagger.json');
   require('dotenv').config();
   
   /* ==========================================================================
      Private Functions
      ========================================================================== */
   
   const checkDocsKey = async (req, res, next) => {
     const { apiKey } = req.query;
   
     if (!apiKey || apiKey !== process.env.DOCS_API_KEY) {
       res.send('Unauthorized');
       return;
     }
   
     next();
   };
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = (router) => {
     router.get(
       '/docs',
       checkDocsKey,
       swaggerUi.serve, swaggerUi.setup(swaggerDocument)
     );
   };
   