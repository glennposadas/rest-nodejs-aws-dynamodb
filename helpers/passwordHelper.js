/* ==========================================================================
   Dependencies
   ========================================================================== */

   const crypto = require('crypto');
   require('dotenv').config();
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const createPasswordHash = (id, password) => {
     try {
       return crypto
         .createHash('sha256')
         .update(id + process.env.SALT + password)
         .digest('hex');
     } catch (err) {
       return err.message;
     }
   };
   
   const createEmailInviteCode = (orgName, fromEmail, toEmail, expiresIn) => {
     try {
       return crypto
         .createHash('sha256')
         .update(orgName + fromEmail + toEmail + process.env.EMAIL_INVITE_SALT + expiresIn)
         .digest('hex');
     } catch (err) {
       return err.message;
     }
   };
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = {
     createPasswordHash,
     createEmailInviteCode
   };
   