/* ==========================================================================
   Dependencies
   ========================================================================== */

/* ==========================================================================
   Public Variables
   ========================================================================== */

   const STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
  };
  
  const LOGIN_FIELDS = {
    USERNAME: 'username',
    PASSWORD: 'password',
  };
  
  const USER_FIELDS = {
    ID: 'id',
    NAME: 'name',
    EMAIL: 'email',
    PASSWORD: 'password',
    ROLETYPE: 'role_type'
  };
  
  const NOTE_FIELDS = {
    TITLE: 'title',
    CONTENT: 'content',
    USER_ID: 'user_id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  };

  const ACCESS_LEVELS = {
    user: "author",
    admin: "admin"
  };
  
  const DOCUMENT_COLLECTIONS = {
    AUTHOR: 'Authors',
    NOTE: 'Notes'
  };
  
  const RESPONSE_MESSAGES = {
    MISSING_PARAMETER: (param) => `Missing required parameter/s [${param}]`,
    INVALID_PARAMETER: (param) => `Invalid parameter/s [${param}]`,
    DOES_NOT_EXIST_PARAMETER: (param) => `\`${param}\` does not exist`,
    EXISTING_PARAMETER: (param) => `\`${param}\` already exists`,
    PARAMETER_CREATED: (param) => `${param} successfully created!`,
    PARAMETER_UPDATED: (param) => `${param} successfully updated!`,
    PARAMETER_DELETED: (param) => `${param} successfully deleted!`,
    UNAUTHORIZED_REQUEST: 'Unauthorized request',
    TOKEN_EXPIRED: 'Token has expired. Please login again',
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_PAYLOAD: 'Invalid payload',
    LOGIN_SUCCESSFUL: 'Login Successful!',
    REGISTER_SUCCESSFUL: 'Register Successful!',
    LOGOUT_SUCCESSFUL: 'Logout Successful!',
    SERVER_ERROR: 'Something went wrong!',
  };
  
  /* ==========================================================================
     Exports
     ========================================================================== */
  
  module.exports = {
    STATUS,
    LOGIN_FIELDS,
    RESPONSE_MESSAGES,
    USER_FIELDS,
    NOTE_FIELDS,
    DOCUMENT_COLLECTIONS
  };
  