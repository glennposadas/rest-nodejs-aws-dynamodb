/* ==========================================================================
   Dependencies
   ========================================================================== */

   const aws = require('aws-sdk');
   const constants = require('../constants');
   require('dotenv').config();
   
   /* ==========================================================================
      Connection Credentials
      ========================================================================== */
   
   aws.config.update({
     region: process.env.REGION,
    //  endppint: "http://localhost:8000"
     accessKeyId: process.env.ACCESS_KEY,
     secretAccessKey: process.env.SECRET_KEY
   });
   
   /* ==========================================================================
      Variables
      ========================================================================== */
   
   const dynamo = new aws.DynamoDB.DocumentClient();
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */

   const addTableItem = async (tableName, item) => {
     try {
       const docParams = {
         TableName: tableName,
         Item: item
       };
   
       await dynamo.put(docParams).promise();
   
       return constants.RESPONSE_MESSAGES.PARAMETER_CREATED(
         `[Table ${tableName} Item] ${item}`
       );
     } catch (err) {
       console.error(err);
       throw new Error('[Dynamo Service] addTableItem error.');
     }
   };
   
   const updateTableItem = async (tableName, id, item) => {
     try {
       let updateExpression = 'set ';
       const expressionAttributeNames = {};
       const expressionAttributeValues = {};
   
       let index = 0;
       const itemEntries = Object.entries(item);
       const itemLength = itemEntries.length;
   
       for (const [key, value] of itemEntries) {
         updateExpression += `#${key}Field = :${key}Param${
           index < itemLength - 1 ? ', ' : ''
         }`;
         expressionAttributeNames[`#${key}Field`] = key;
         expressionAttributeValues[`:${key}Param`] = value;
         index++;
       }
   
       const params = {
         TableName: tableName,
         Key: {
           id
         },
         UpdateExpression: updateExpression,
         ExpressionAttributeNames: expressionAttributeNames,
         ExpressionAttributeValues: expressionAttributeValues
       };
   
       await dynamo.update(params).promise();
   
       return constants.RESPONSE_MESSAGES.PARAMETER_UPDATED(id);
     } catch (err) {
       console.error(err);
       throw new Error('[Dynamo Service] updateTableItem error.');
     }
   };
   
   const deleteTableItem = async (tableName, queryField, param) => {
     try {
       const params = {
         TableName: tableName,
         Key: {}
       };
   
       params.Key[queryField] = param;
   
       await dynamo.delete(params).promise();
   
       return constants.RESPONSE_MESSAGES.PARAMETER_DELETED(param);
     } catch (err) {
       throw new Error('[Dynamo Service] deleteTableItem error.');
     }
   };
   
   const scanTable = async (tableName, isFilter, queryField, param) => {
     const params = {
       TableName: tableName
     };
   
     if (isFilter) {
       params.FilterExpression = '#queryField = :param';
       params.ExpressionAttributeNames = {
         '#queryField': queryField
       };
       params.ExpressionAttributeValues = {
         ':param': param
       };
     }
   
     try {
       const result = await dynamo.scan(params).promise();
   
       return result.Items;
     } catch (err) {
       console.error(err);
       throw new Error('[Dynamo Service] scanTable error.');
     }
   };
   
   const getItemById = async (tableName, param) => {
     const params = {
       TableName: tableName,
       KeyConditionExpression: 'id = :param',
       ExpressionAttributeValues: {
         ':param': param
       }
     };
   
     try {
       const result = await dynamo.query(params).promise();
   
       return result.Items.length > 0 ? result.Items[0] : null;
     } catch (error) {
       throw new Error('[Dynamo Service] getItemById error.');
     }
   };
   
   const getItemByParams = async (
     tableName,
     indexName,
     conditionExpression,
     expressionAttributes
   ) => {
     const params = {
       TableName: tableName,
       IndexName: indexName,
       KeyConditionExpression: conditionExpression,
       ExpressionAttributeValues: expressionAttributes
     };
   
     try {
       const result = await dynamo.query(params).promise();
   
       return result.Items[0] || null;
     } catch (error) {
       throw new Error('[Dynamo Service] getItemByParams error.');
     }
   };
   
   const queryWithIndex = async (
     tableName,
     indexName,
     conditionExpression,
     expressionAttributes
   ) => {
     const params = {
       TableName: tableName,
       IndexName: indexName,
       KeyConditionExpression: conditionExpression,
       ExpressionAttributeValues: expressionAttributes
     };
   
     try {
       const result = await dynamo.query(params).promise();
   
       return result.Items;
     } catch (error) {
       throw new Error('[Dynamo Service] queryWithIndex error.');
     }
   };
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = {
     dynamo,
     addTableItem,
     updateTableItem,
     deleteTableItem,
     scanTable,
     getItemById,
     getItemByParams,
     queryWithIndex
   };
   