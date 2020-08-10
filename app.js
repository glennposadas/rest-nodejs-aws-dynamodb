/* ==========================================================================
   Express Dependencies
   ========================================================================== */

   const express = require('express');
   const logger = require('morgan');
   const bodyParser = require('body-parser');
   const compression = require('compression');
   const cors = require('cors');
   const swaggerUi = require('swagger-ui-express');
   const routes = require('./routes');
   const config = require('./config');
   
   /* ==========================================================================
      Variables
      ========================================================================== */
   
   const SERVER_ENVIRONMENT = process.env.SERVER_ENVIRONMENT || 'LOCAL';
   
   // Init express server
   const app = express();
   
   // All environments
   app.set('environment', SERVER_ENVIRONMENT);
   app.set('port', process.env.PORT || config.port);
   
   app.use(cors());
   
   app.use(
     bodyParser.json({
       limit: '50mb',
       type: '*/*' // json bodyparser to attempt to parse "all the things" which will throw an error if it is not valid json
     })
   );
   
   app.use(compression());
   
   app.get('/health', (req, res) =>
     res.json({
       status: 'ok'
     })
   );
   
   app.get('/', (req, res) => res.send('Welcome to my very first production-level + clean rest app!'));
   
   app.use('/', swaggerUi.serve);
   
   app.use(logger('dev'));
   
   app.use('/', routes);
   app.use(express.static(`${__dirname}/public`));
   
   app.use((req, res) => {
     res.status(404);
     res.send('404');
   });
   
   const httpServer = app.listen(app.get('port'), () =>
     console.log(`Server running on port ${app.get('port')}`)
   );
   
   /*
    * Ensure all inactive connections are terminated by the ELB,
    * by setting this a few seconds higher than the ALB idle timeout
    */
   httpServer.keepAliveTimeout = 305000;
   
   module.exports = app;
   