/* ==========================================================================
   Dependencies
   ========================================================================== */

   const userController = require('../../controllers/notesController');
   //const permission = require('../middlewares/permission');
   
   /* ==========================================================================
       Exports
       ========================================================================== */
   
   module.exports = router => {
     //console.log('User.js ' + router);
     // const express = require("express")
     // app <--- express()
     // router <--- express.Router()
     // app.use("/fafafa", router)

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
   