using { com.sap.pgp.dev.ItkApp as my } from '../db/schema';
using { managed, sap } from '@sap/cds/common';

@(requires: ['authenticated-user', 'identified-user', 'system-user'])
service ItkService @(path:'/itk') {

   entity RealmMapping @(restrict : [
            {
            grant : [ '*' ],
            to : [ 'ITKAdmin']
            }
    ]) as projection on my.RealmMapping;

    entity FTPServer @(restrict : [
            {
            grant : [ '*' ],
            to : [ 'ITKAdmin' ]
            }
    ]) as projection on my.FTPServer;


    entity ImportEvents @(restrict : [
            {
            grant : [ '*' ],
            to : [ 'ITKAdmin']
            }
    ]) as projection on my.ImportEvents;

    entity SpendVizEvents @(restrict : [
            {
            grant : [ '*' ],
            to : [ 'ITKAdmin']
            }
    ]) as projection on my.SpendVizEvents;


    entity ExportEvents @(restrict : [
            {
            grant : [ '*' ],
            to : [ 'ITKAdmin']
            }
    ]) as projection on my.ExportEvents;



    entity SharedSecret @(restrict : [
            {
            grant : [ '*' ],
            to : [ 'ITKAdmin']
            }
    ]) as projection on my.SharedSecret;


    entity MiscDetails @(restrict : [
            {
            grant : [ '*' ],
            to : [ 'ITKAdmin']
            }
    ]) as projection on my.MiscDetails;


    entity EventLogs @(restrict : [
            {
            grant : [ '*' ],
            to : [ 'ITKAdmin' ]
            }
    ]) as projection on my.EventLogs;

}