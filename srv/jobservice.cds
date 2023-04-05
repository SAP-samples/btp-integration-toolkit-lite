using { com.sap.pgp.dev.ItkApp as my } from '../db/schema';
using { managed, sap } from '@sap/cds/common';

@(requires: ['authenticated-user', 'identified-user','system-user'])
service ItkJobService @(path:'/itkjob') {

    entity RealmMapping as projection on my.RealmMapping;

    entity FTPServer as projection on my.FTPServer;

    entity ImportEvents as projection on my.ImportEvents;

    entity SpendVizEvents as projection on my.SpendVizEvents;

    entity ExportEvents as projection on my.ExportEvents;

    entity SharedSecret as projection on my.SharedSecret;

    entity MiscDetails as projection on my.MiscDetails;

    entity EventLogs as projection on my.EventLogs;

 action doProcessImportEvents (realm: String) returns String;
 action doProcessExportEvents (realm: String) returns String;
 action doProcessSpendVizEvents (realm: String) returns String;
 action doCreateRealmTemplates (entities: array of RealmMapping) returns String;
 action doCreateFTPTemplates (entities: array of FTPServer) returns String;
 action doCreateImportTemplates (entities: array of ImportEvents) returns String;
 action doCreateExportTemplates (entities: array of ExportEvents) returns String;
 action doCreateSpendVizTemplates (entities: array of SpendVizEvents) returns String;
 action doCreateMiscTemplates (entities: array of MiscDetails) returns String;
 action doCreateSSTemplates (entities: array of SharedSecret) returns String;
 action doDeleteRealmTemplates (entities: array of RealmMapping) returns String;
 action doDeleteFTPTemplates (entities: array of FTPServer) returns String;
 action doDeleteImportTemplates (entities: array of ImportEvents) returns String;
 action doDeleteExportTemplates (entities: array of ExportEvents) returns String;
 action doDeleteSpendVizTemplates (entities: array of SpendVizEvents) returns String;
 action doDeleteMiscTemplates (entities: array of MiscDetails) returns String;
 action doDeleteSSTemplates (entities: array of SharedSecret) returns String;
  action doDeleteTransactionData (realm: String) returns String;
}