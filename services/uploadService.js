/* ==========================================================================
   Dependencies
   ========================================================================== */

   const moment = require('moment');
   const aws = require('aws-sdk');
   const fileHelper = require('../helpers/fileHelper');
   const s3Service = require('./s3Service');
   const ssmService = require('./ssmService');
   const fileService = require('./fileService');
   
   /* ==========================================================================
       Public Functions
       ========================================================================== */
   
   const uploadProjectFile = async (orgId, projId, fileParam) => {
     try {
       const { name, path, type, data, size, task_id, comment_id } = fileParam;
       const rootFolder = `${orgId}/${projId}`;
       const s3_name = fileHelper.getRandomFileName(name);
       const fileKey = `${rootFolder}${path}${s3_name}`;
       const fileBuffer = Buffer.from(data, 'base64');
       const dateTime = moment().valueOf();
   
       const options = {
         Bucket: process.env.S3_FILE_STORAGE,
         Key: fileKey,
         Body: fileBuffer,
         ContentType: type,
         ContentEncoding: 'base64'
       };
   
       await s3Service.upload(options);
   
       const newItem = await fileService.createFile({
         name,
         s3_name,
         type,
         size,
         organization_id: orgId,
         project_id: projId,
         key: fileKey,
         task_id: task_id || null,
         comment_id: comment_id || null,
         color: fileHelper.getRandomColor(),
         created_at: dateTime,
         updated_at: dateTime
       });
   
       return newItem;
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const createProjectFolder = async (orgId, projId, folderParam) => {
     try {
       const { name, path, task_id, task_folder } = folderParam;
       const s3_name = task_folder ? task_id : fileHelper.getRandomFolderName();
       const rootFolder = `${orgId}/${projId}`;
       const folderKey = `${rootFolder}${path}${s3_name}/`;
       const dateTime = moment().valueOf();
   
       await s3Service.createFolder(folderKey);
   
       const newItem = await fileService.createFile({
         name,
         s3_name,
         type: 'folder',
         size: 0,
         organization_id: orgId,
         project_id: projId,
         key: folderKey,
         task_id: task_id || null,
         task_folder: task_folder || false,
         color: fileHelper.getRandomColor(),
         created_at: dateTime,
         updated_at: dateTime
       });
   
       return newItem;
     } catch (err) {
       console.log(err.message);
       throw new Error(err.message);
     }
   };
   
   const generatePresignedUrl = async (key) => {
     try {
       const privateKey = await ssmService.getParameter(
         process.env.CF_PRIVATE_KEY
       );
   
       const signer = new aws.CloudFront.Signer(
         process.env.CF_ACCESS_KEY_ID,
         privateKey
       );
   
       const signedUrl = signer.getSignedUrl({
         url: `${process.env.SUNRISE_FILES_URL}/${key}`,
         expires: moment().utc().add(15, 'minutes').unix()
       });
   
       return signedUrl;
     } catch (err) {
       console.log(err.message);
       throw new Error(err.message);
     }
   };
   
   /* ==========================================================================
       Exports
       ========================================================================== */
   
   module.exports = {
     uploadProjectFile,
     createProjectFolder,
     generatePresignedUrl
   };
   