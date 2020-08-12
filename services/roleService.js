/* ==========================================================================
   Dependencies
   ========================================================================== */

const elasticSearchService = require('./elasticSearchService');
const constants = require('../constants');
require('dotenv').config();

/* ==========================================================================
    Variables
    ========================================================================== */

const INDEX_NAME = constants.ELASTICSEARCH_INDICES.ROLE;

/* ==========================================================================
    Public Functions
    ========================================================================== */

const getAllRoles = async (orgId, query) => {
  try {
    const roleParams = elasticSearchService.buildGetDocParameters(query, {
      index: INDEX_NAME,
      body: {
        query: {
          term: {
            organization_id: {
              value: orgId
            }
          }
        }
      }
    });

    const roles = await elasticSearchService.getDocumentsByParams(roleParams);

    return roles;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getRoleById = async (orgId, roleId) => {
  try {
    const roleById = await elasticSearchService.getDocumentsByQuery(
      INDEX_NAME,
      {
        bool: {
          must: [
            {
              term: {
                _id: {
                  value: roleId
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

    return roleById[0];
  } catch (err) {
    throw new Error(err.message);
  }
};

const getRoleByName = async (orgId, name) => {
  try {
    const roleByName = await elasticSearchService.getDocumentsByQuery(
      INDEX_NAME,
      {
        bool: {
          must: [
            {
              term: {
                name: {
                  value: name
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

    return roleByName[0];
  } catch (err) {
    throw new Error(err.message);
  }
};

const createRole = async (newRole) => {
  try {
    const newRoleRes = await elasticSearchService.createDocument(
      INDEX_NAME,
      newRole
    );

    return newRoleRes;
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateRole = async (id, updatedRole) => {
  try {
    const updatedRoleRes = await elasticSearchService.updateDocument(
      INDEX_NAME,
      id,
      updatedRole
    );

    return updatedRoleRes;
  } catch (err) {
    throw new Error(err.message);
  }
};

const deleteRole = async (id, orgId) => {
  try {
    const roleById = await getRoleById(id, orgId);

    if (!roleById) {
      return {
        deletedRoleErrorMsg: 'Role does not exist.'
      };
    }

    const deletedRoleResponseMsg = await elasticSearchService.deleteDocument(
      INDEX_NAME,
      id
    );

    return {
      deletedRoleResponseMsg
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

/* ==========================================================================
   Exports
   ========================================================================== */

module.exports = {
  getAllRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole
};
