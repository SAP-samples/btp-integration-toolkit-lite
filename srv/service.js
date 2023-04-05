const cds = require('@sap/cds')
const ImportEventHandler = require('./handlers/ImportEvents');
const ExportEventHandler = require('./handlers/ExportEvents');
const SpendVizEventHandler = require('./handlers/SpendVizEvents');

module.exports = cds.service.impl((srv) => {

  srv.on('doProcessImportEvents', ImportEventHandler.doProcessImportEvents);
  srv.on('doProcessExportEvents', ExportEventHandler.doProcessExportEvents);
  srv.on('doProcessSpendVizEvents', SpendVizEventHandler.doProcessSpendVizEvents);


  })