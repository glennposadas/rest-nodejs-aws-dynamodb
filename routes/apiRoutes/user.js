/* ==========================================================================
   Dependencies
   ========================================================================== */

   const userController = require('../../controllers/userController');
   //const permission = require('../middlewares/permission');
   
   /* ==========================================================================
       Exports
       ========================================================================== */
   
   module.exports = (router) => {
     console.log('User.js ' + router);
     router.get(
       '/user/all',
       userController.getAllUsers
     );
     router.put(
       '/user/update',
      //  permission('user'),
       userController.updateUser
     );
     router.put(
       '/user/password/change',
      //  permission('user'),
       userController.changeUserPassword
     );
   };
   