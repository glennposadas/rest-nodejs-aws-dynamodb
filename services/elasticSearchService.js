/* ==========================================================================
   Dependencies
   ========================================================================== */

const aws = require('aws-sdk');
const connectionClass = require('http-aws-es');
const elasticSearch = require('elasticsearch');
const constants = require('../constants');
require('dotenv').config();

/* ==========================================================================
   Connection Credentials
   ========================================================================== */

aws.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY
});

/* ==========================================================================
   Variables
   ========================================================================== */

const elasticClient = new elasticSearch.Client({
  host: {
    protocol: 'https',
    host: process.env.ES_HOST,
    port: '443',
    path: '/'
  },
  log: 'error',
  connectionClass,
  amazonES: {
    credentials: new aws.EnvironmentCredentials('aws')
  },
  maxRetries: 20,
  requestTimeout: 90000
});

/* ==========================================================================
   Public Functions
   ========================================================================== */

const getDocumentsByParams = async (params) => {
  try {
    let result = await elasticClient.search(params);

    result =
      result.hits.hits.map((hit) => {
        hit._source._id = hit._id;
        return hit._source;
      }) || [];

    return result;
  } catch (err) {
    throw new Error(
      err.message || 'An error occurred on (getDocumentsByParams).'
    );
  }
};

const getDocumentsByQuery = async (indexAlias, query, size = 200) => {
  try {
    const docParams = {
      index: indexAlias,
      size
    };

    if (query) {
      docParams.body = {
        query
      };
    }

    let result = await elasticClient.search(docParams);

    result =
      result.hits.hits.map((hit) => {
        hit._source._id = hit._id;
        return hit._source;
      }) || [];

    return result;
  } catch (err) {
    throw new Error(
      err.message || 'An error occurred on (getDocumentsByQuery).'
    );
  }
};

const getDocumentById = async (index, id) => {
  try {
    const params = {
      index,
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  _id: {
                    value: id
                  }
                }
              }
            ]
          }
        }
      }
    };

    const res = await elasticClient.search(params);
    const item = res.hits.hits.pop();

    if (!item) {
      return null;
    }

    return {
      ...item._source,
      _id: item._id
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const createDocument = async (indexAlias, doc) => {
  try {
    const docParams = {
      index: indexAlias,
      body: doc
    };

    const res = await elasticClient.index(docParams);

    return res._id;
  } catch (err) {
    throw new Error(err.message || 'An error occurred on (createDocument).');
  }
};

const updateDocument = async (indexAlias, id, doc) => {
  try {
    delete doc._id;

    const docParams = {
      index: indexAlias,
      id,
      body: {
        doc
      }
    };

    return await elasticClient.update(docParams);
  } catch (err) {
    throw new Error(err.message || 'An error occurred on (updateDocument).');
  }
};

const updateDocumentByQuery = async (indexAlias, field, value) => {
  try {
    const docParams = {
      index: indexAlias,
      query: {
        match: {
          field: value
        }
      }
    };

    await elasticClient.updateByQuery(docParams);

    return constants.RESPONSE_MESSAGES.PARAMETER_UPDATED(
      `[${indexAlias}] ${field} - ${value}`
    );
  } catch (err) {
    throw new Error(
      err.message || 'An error occurred on (updateDocumentByQuery).'
    );
  }
};

const deleteDocument = async (indexAlias, id) => {
  try {
    const docParams = {
      index: indexAlias,
      id
    };

    return await elasticClient.delete(docParams);
  } catch (err) {
    throw new Error(err.message || 'An error occurred on (deleteDocument).');
  }
};

const deleteDocumentByQuery = async (indexAlias, query) => {
  try {
    const docParams = {
      index: indexAlias,
      body: {
        query
      }
    };

    return await elasticClient.deleteByQuery(docParams);
  } catch (err) {
    throw new Error(
      err.message || 'An error occurred on (deleteDocumentByQuery).'
    );
  }
};

const updateNestedObject = async (indexAlias, id, field, value) => {
  try {
    const paramsUpdateNestedObject = {
      index: indexAlias,
      id,
      body: {
        script: {
          source: `ctx._source.${field} = params.value`,
          params: {
            value
          }
        }
      }
    };

    await elasticClient.update(paramsUpdateNestedObject);

    return constants.RESPONSE_MESSAGES.PARAMETER_UPDATED(
      `[${indexAlias}] ${field}`
    );
  } catch (err) {
    throw new Error(
      err.message || 'An error occurred on (updateNestedObject).'
    );
  }
};

const addNestedObject = async (indexAlias, id, field, value) => {
  try {
    const paramsAddNestedObject = {
      index: indexAlias,
      id,
      body: {
        script: {
          source: `ctx._source.${field}.add(params.value)`,
          params: {
            value
          }
        }
      }
    };

    await elasticClient.update(paramsAddNestedObject);

    return constants.RESPONSE_MESSAGES.PARAMETER_CREATED(
      `[${indexAlias}] ${field} - ${value}`
    );
  } catch (err) {
    throw new Error(err.message || 'An error occurred on (addNestedObject).');
  }
};

const updateNestedObjectByField = async (
  indexAlias,
  id,
  collection,
  key,
  field,
  paramValue,
  value
) => {
  try {
    const paramsNestedObject = {
      index: indexAlias,
      id,
      body: {
        script: {
          source: `def targets = ctx._source.${collection}.findAll(obj -> obj.${key} == params.paramValue); 
            for(objT in targets) { objT.${field} = params.value }`,
          params: {
            value,
            paramValue
          }
        }
      }
    };

    await elasticClient.update(paramsNestedObject);

    return constants.RESPONSE_MESSAGES.PARAMETER_UPDATED(
      `[${indexAlias}] ${id} ${key} ${field} - ${value || ''}`
    );
  } catch (err) {
    throw new Error(
      err.message || 'An error occurred on (AddNewNestedObject).'
    );
  }
};

const deleteNestedObject = async (indexAlias, id, field, value) => {
  try {
    const paramsDeleteNestedObject = {
      index: indexAlias,
      id,
      body: {
        script: {
          source: `ctx._source.${field}.removeIf(obj -> obj == ${value})`,
          params: {
            field,
            value
          }
        }
      }
    };

    await elasticClient.update(paramsDeleteNestedObject);

    return constants.RESPONSE_MESSAGES.PARAMETER_DELETED(
      `[${indexAlias}] ${field} - ${value}`
    );
  } catch (err) {
    throw new Error(
      err.message || 'An error occurred on (deleteNestedObject).'
    );
  }
};

const buildGetDocParameters = (query, params) => {
  const { searchAfter, size } = query;
  let { sort, sortBy } = query;

  params.size = size || 200;

  if (searchAfter) {
    params.body.search_after = [searchAfter];
  }

  if (!sort || !sortBy) {
    sort = 'desc';
    sortBy = 'created_at';
  }

  params.sort = [`${sortBy}:${sort}`];

  return params;
};

/* ==========================================================================
   Exports
   ========================================================================== */

module.exports = {
  elasticClient,
  getDocumentsByParams,
  getDocumentsByQuery,
  getDocumentById,
  createDocument,
  updateDocument,
  updateDocumentByQuery,
  deleteDocument,
  deleteDocumentByQuery,
  addNestedObject,
  deleteNestedObject,
  updateNestedObject,
  updateNestedObjectByField,
  buildGetDocParameters
};
