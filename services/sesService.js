/* ==========================================================================
  Dependencies
  ========================================================================== */

  const aws = require('aws-sdk');

  const ses = new aws.SES({ apiVersion: '2010-12-01' });
  const moment = require('moment');
  const elasticSearchService = require('./elasticSearchService');
  const roleService = require('./roleService');
  const constants = require('../constants');
  const { createEmailInviteCode } = require('../helpers/passwordHelper');
  const config = require('../config');
  const userService = require('./userService');
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
  
  const INDEX_NAME = constants.ELASTICSEARCH_INDICES.EMAIL_INVITE;
  
  /* ==========================================================================
     Private Functions
     ========================================================================== */
  
  const getEmailInvite = async (orgId, fromEmail, toEmail) => {
    try {
      const emailInvite = await elasticSearchService.getDocumentsByQuery(
        INDEX_NAME,
        {
          bool: {
            must: [
              {
                term: {
                  from_email: {
                    value: fromEmail
                  }
                }
              },
              {
                term: {
                  to_email: {
                    value: toEmail
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
  
      return emailInvite[0];
    } catch (err) {
      throw new Error(err.message);
    }
  };
  
  const getEmailInviteByCode = async (code) => {
    try {
      const emailInviteByCode = await elasticSearchService.getDocumentsByQuery(
        INDEX_NAME,
        {
          term: {
            invite_code: {
              value: code
            }
          }
        }
      );
  
      return emailInviteByCode[0];
    } catch (err) {
      throw new Error(err.message);
    }
  };
  
  const sendTemplatedEmail = async (
    emailParams,
    sender,
    roleName
  ) => {
    return new Promise((resolve, reject) => {
      const params = {
        Source: emailParams.from_email,
        Template: 'OrgInviteTemplate',
        Destination: {
          ToAddresses: [emailParams.to_email]
        },
        TemplateData: `{ 
          \"roleName\":\"${roleName}\",
          \"email\":\"${emailParams.to_email}\",
          \"senderName\": \"${sender.name}\",
          \"code\": \"${emailParams.invite_code}\",
          \"redirectUri\": \"${process.env.EMAIL_INVITE_REDIRECT_URI}\"
        }`
      };
  
      ses.sendTemplatedEmail(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  };
  
  /* ==========================================================================
     Public Functions
     ========================================================================== */
  
  const sendInvitationEmail = async (orgId, user, params) => {
    try {
      const fromEmail = user.email;
      const fromName = user.name;
      const toEmail = params.email;
      const teamId = params.team_id;
      const roleId = params.role_id;
  
      if (!fromEmail || !toEmail || !fromName) {
        return {
          errorMsg: 'Required data is missing'
        };
      }
  
      const organization = await organizationService.getOrganizationById(orgId);
  
      if (!organization) {
        return {
          errorMsg: 'Organization not found'
        };
      }
  
      const existingUser = await userService.getUserByEmail(toEmail);
  
      if (existingUser) {
        return {
          errorMsg: 'User is already registered'
        };
      }
  
      const team = await teamService.getTeamById(orgId, teamId);
  
      if (!team) {
        return {
          errorMsg: 'Team not found'
        };
      }
  
      const role = await roleService.getRoleById(orgId, roleId);
  
      if (!role) {
        return {
          errorMsg: 'Role not found'
        };
      }
  
      const emailInvite = await getEmailInvite(orgId, fromEmail, toEmail);
      const dateNow = new Date().getTime();
  
      // Send email right away if there's no ES record of
      // previous invitations
      if (emailInvite) {
        // Check if re-invitation is still on cooldown
        const reInviteTime =
          emailInvite.last_invite_sent + config.emailInviteCoolDown;
  
        if (
          emailInvite.last_invite_sent + config.emailInviteCoolDown >=
          dateNow
        ) {
          return {
            errorMsg: `You already sent an invitation to this email, please try again in ${moment(
              reInviteTime
            ).fromNow(true)}.`
          };
        }
      }
  
      const emailExpiresIn = dateNow + config.emailExpiresIn;
      const emailInviteParams = {
        organization_id: orgId,
        from_email: fromEmail,
        to_email: toEmail,
        status: 'pending',
        expires_in: emailExpiresIn,
        last_invite_sent: dateNow,
        invite_code: createEmailInviteCode(
          organization.name,
          fromEmail,
          toEmail,
          emailExpiresIn
        ),
        team_id: teamId,
        role_id: roleId,
        created_at: emailInvite ? emailInvite.created_at : dateNow,
        updated_at: dateNow
      };
  
      // Send email
      await sendTemplatedEmail(
        emailInviteParams,
        user,
        organization.name,
        team.name,
        role.name
      );
  
      if (emailInvite) {
        await elasticSearchService.updateDocument(
          INDEX_NAME,
          emailInvite._id,
          emailInviteParams
        );
      } else {
        await elasticSearchService.createDocument(INDEX_NAME, emailInviteParams);
      }
  
      return {
        responseMsg: 'Email invite sent!'
      };
    } catch (err) {
      throw new Error(err.message);
    }
  };
  
  const acceptInvitationEmail = async (code, email) => {
    try {
      const emailInvite = await getEmailInviteByCode(code);
  
      if (!emailInvite || emailInvite.to_email !== email) {
        return {
          inviteErrorMsg: 'Invalid invitation code'
        };
      }
  
      if (emailInvite.status === 'accepted') {
        return {
          inviteErrorMsg: `You've already accepted this invitation`
        };
      }
  
      const dateNow = new Date().getTime();
  
      if (emailInvite.last_invite_sent + config.emailExpiresIn <= dateNow) {
        return {
          inviteErrorMsg: 'Invitation Code has expired'
        };
      }
  
      emailInvite.status = 'accepted';
      emailInvite.updated_at = dateNow;
  
      const emailInviteId = emailInvite._id;
      delete emailInvite._id;
  
      elasticSearchService.updateDocument(INDEX_NAME, emailInviteId, emailInvite);
  
      return {
        inviteResponseMsg: {
          team_id: emailInvite.team_id,
          role_id: emailInvite.role_id
        }
      };
    } catch (err) {
      throw new Error(err.message);
    }
  };
  
  /* ==========================================================================
     Exports
     ========================================================================== */
  
  module.exports = {
    sendInvitationEmail,
    acceptInvitationEmail
  };
  