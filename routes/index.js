/* ==========================================================================
   Dependencies
   ========================================================================== */

   const express = require('express');

   const router = express.Router();
   const fg = require('fast-glob');
   const path = require('path');
   const authMiddleware = require('./middlewares/auth');
   
   /* ==========================================================================
      Controllers
      ========================================================================== */
   
   const authController = require('../controllers/authController');
   const userController = require('../controllers/userController');
   
   /* ==========================================================================
      Public API Endpoints
      ========================================================================== */
   
   router.post('/register', authController.register);
   router.post('/login', authController.login);
   router.post('/logout', authController.logout);
   router.post('/refresh/token', authController.refreshToken);

   router.post('/user/create', userController.createUser);
   
   /* ==========================================================================
      Secured API Endpoints
      ========================================================================== */
   
   require('./docs')(router);
   
   router.use(authMiddleware);
   
   fg.sync('./routes/apiRoutes/*.js', { dot: true }).forEach((file) => {
     require(path.resolve(file))(router);
   });
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = router;
   