/* ==========================================================================
   Dependencies
   ========================================================================== */

   const moment = require('moment');
   const elasticSearchService = require('./elasticSearchService');
   const s3Service = require('./s3Service');
   const fileHelper = require('../helpers/fileHelper');
   const constants = require('../constants');
   
   /* ==========================================================================
      Variables
      ========================================================================== */
   
   const INDEX_NAME = constants.ELASTICSEARCH_INDICES.FILE;
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const getAllProjectFiles = async (orgId, projId, query) => {
     try {
       const fileParams = elasticSearchService.buildGetDocParameters(query, {
         index: INDEX_NAME,
         body: {
           query: {
             bool: {
               must: [
                 {
                   term: {
                     organization_id: {
                       value: orgId
                     }
                   }
                 },
                 {
                   term: {
                     project_id: {
                       value: projId
                     }
                   }
                 }
               ]
             }
           }
         }
       });
   
       const files = await elasticSearchService.getDocumentsByParams(fileParams);
   
       return fileHelper.formatUFilesStructure(files);
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const getAllTaskFiles = async (orgId, taskId) => {
     try {
       const files = await elasticSearchService.getDocumentsByQuery(INDEX_NAME, {
         bool: {
           must: [
             {
               term: {
                 organization_id: {
                   value: orgId
                 }
               }
             },
             {
               term: {
                 task_id: {
                   value: taskId
                 }
               }
             }
           ]
         }
       });
   
       return fileHelper.formatUFilesStructure(files);
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const getAllCommentFiles = async (orgId, commentId) => {
     try {
       const files = await elasticSearchService.getDocumentsByQuery(INDEX_NAME, {
         bool: {
           must: [
             {
               term: {
                 organization_id: {
                   value: orgId
                 }
               }
             },
             {
               term: {
                 comment_id: {
                   value: commentId
                 }
               }
             }
           ]
         }
       });
   
       return fileHelper.formatUFilesStructure(files);
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const getFileById = async (orgId, fileId) => {
     try {
       const fileById = await elasticSearchService.getDocumentsByQuery(
         INDEX_NAME,
         {
           bool: {
             must: [
               {
                 term: {
                   _id: {
                     value: fileId
                   }
                 }
               },
               {
                 term: {
                   organization_id: {
                     value: orgId
                   }
                 }
               }
             ]
           }
         }
       );
   
       if (!fileById[0]) {
         return {
           fileByIdErrorMsg: constants.RESPONSE_MESSAGES.DOES_NOT_EXIST_PARAMETER(
             `[${constants.ELASTICSEARCH_INDICES.FILE}] ${fileId}`
           )
         };
       }
   
       return {
         fileByIdResponseMsg: fileById[0]
       };
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const createFile = async (newFile) => {
     try {
       const id = await elasticSearchService.createDocument(INDEX_NAME, newFile);
   
       let item;
   
       do {
         item = await elasticSearchService.getDocumentById(INDEX_NAME, id);
       } while (!item);
   
       return fileHelper.mapItemFormat(item);
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const renameFile = async (id, newName) => {
     try {
       await elasticSearchService.updateDocument(INDEX_NAME, id, {
         name: newName,
         updated_at: moment().valueOf()
       });
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const updateFile = async (id, updatedFile) => {
     try {
       const updatedFileResponseMsg = await elasticSearchService.updateDocument(
         INDEX_NAME,
         id,
         updatedFile
       );
   
       return {
         updatedFileResponseMsg
       };
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const deleteFile = async (id, body) => {
     try {
       const { key, type } = body;
   
       if (type === 'folder') {
         await elasticSearchService.deleteDocumentByQuery(INDEX_NAME, {
           prefix: {
             key: {
               value: key
             }
           }
         });
         await s3Service.emptyS3Directory(key);
       } else {
         await elasticSearchService.deleteDocument(INDEX_NAME, id);
         await s3Service.deleteS3Object(key);
       }
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const isKeyExist = async (path) => {
     try {
       const files = await elasticSearchService.getDocumentsByQuery(INDEX_NAME, {
         term: {
           key: {
             value: path
           }
         }
       });
   
       return !!files[0];
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const getFilesWithName = async (params) => {
     try {
       const { organizationId, projectId, name, type } = params;
       const files = await elasticSearchService.getDocumentsByQuery(INDEX_NAME, {
         bool: {
           must: [
             {
               term: {
                 organization_id: {
                   value: organizationId
                 }
               }
             },
             {
               term: {
                 project_id: {
                   value: projectId
                 }
               }
             },
             {
               term: {
                 name: {
                   value: name
                 }
               }
             },
             {
               term: {
                 type: {
                   value: type
                 }
               }
             }
           ]
         }
       });
   
       return files;
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const validateFileObject = async (orgId, projId, body) => {
     const { name, path, type } = body;
     const rootFolder = `${orgId}/${projId}`;
     const parentPath = rootFolder + path;
     const objectType = type || 'folder';
   
     if (path !== '/') {
       const isPathExist = await isKeyExist(parentPath);
   
       if (!isPathExist) {
         return {
           errMsg: constants.RESPONSE_MESSAGES.DOES_NOT_EXIST_PARAMETER(path)
         };
       }
     }
   
     const sameNameFiles = await getFilesWithName({
       name,
       organizationId: orgId,
       projectId: projId,
       type: objectType
     });
   
     if (sameNameFiles.length > 0) {
       const isObjectExist = fileHelper.checkObjectNotExist(
         parentPath,
         sameNameFiles
       );
   
       if (!isObjectExist) {
         return {
           errMsg: constants.RESPONSE_MESSAGES.EXISTING_PARAMETER(name)
         };
       }
     }
   
     return {
       valid: true
     };
   };
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = {
     getAllProjectFiles,
     getAllTaskFiles,
     getAllCommentFiles,
     getFileById,
     createFile,
     updateFile,
     renameFile,
     deleteFile,
     isKeyExist,
     validateFileObject
   };
   