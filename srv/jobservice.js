const cds = require('@sap/cds')
const ImportEventHandler = require('./handlers/ImportEvents');
const ExportEventHandler = require('./handlers/ExportEvents');
const SpendVizEventHandler = require('./handlers/SpendVizEvents');
const DeploymentHandler = require('./handlers/Adminservices');

module.exports = cds.service.impl((srv) => {

  srv.on('doProcessImportEvents', ImportEventHandler.doProcessImportEvents);
  srv.on('doProcessExportEvents', ExportEventHandler.doProcessExportEvents);
  srv.on('doProcessSpendVizEvents', SpendVizEventHandler.doProcessSpendVizEvents);
  srv.on('doCreateRealmTemplates', DeploymentHandler.doCreateRealmTemplates);
  srv.on('doCreateFTPTemplates', DeploymentHandler.doCreateFTPTemplates);
  srv.on('doCreateImportTemplates', DeploymentHandler.doCreateImportTemplates);
  srv.on('doCreateExportTemplates', DeploymentHandler.doCreateExportTemplates);
  srv.on('doCreateSpendVizTemplates', DeploymentHandler.doCreateSpendVizTemplates);
  srv.on('doCreateMiscTemplates', DeploymentHandler.doCreateMiscTemplates);
  srv.on('doCreateSSTemplates', DeploymentHandler.doCreateSSTemplates);
  srv.on('doDeleteRealmTemplates', DeploymentHandler.doDeleteRealmTemplates);
  srv.on('doDeleteFTPTemplates', DeploymentHandler.doDeleteFTPTemplates);
  srv.on('doDeleteImportTemplates', DeploymentHandler.doDeleteImportTemplates);
  srv.on('doDeleteExportTemplates', DeploymentHandler.doDeleteExportTemplates);
  srv.on('doDeleteSpendVizTemplates', DeploymentHandler.doDeleteSpendVizTemplates);
  srv.on('doDeleteMiscTemplates', DeploymentHandler.doDeleteMiscTemplates);
  srv.on('doDeleteSSTemplates', DeploymentHandler.doDeleteSSTemplates);
  srv.on('doDeleteTransactionData', DeploymentHandler.doDeleteTransactionData);
  })
