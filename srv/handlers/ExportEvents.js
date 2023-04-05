"use strict";

const cds = require("@sap/cds");
const { default: axios } = require("axios");
const FormData = require('form-data');
const credStore = require("./lib/CredentialStore");
const xsenv = require('@sap/xsenv');
const FTPClient = require("./SFTPHandler");
const { SharedSecret, ExportEvents, RealmMapping, FTPServer } = cds.entities('com.sap.pgp.dev.ItkApp');
const logger = require("../utils/logger");
const moment = require('moment');
const SMTPClient = require("../utils/mailer");
const Txtracker = require('../utils/TransactionHandler');
const namespace = process.env.CRED_NAMESPACE;
const SFTPPkey = process.env.SFTP_CRED_PKNAME;
const SFTPPass = process.env.SFTP_CRED_PASSNAME;
const ITKPassName = process.env.ITK_CRED_NAME;


xsenv.loadEnv();
let SuccessStatus = true;
let password = null;
let privateKey = null;
let passphrase = null;

const services = xsenv.getServices({
  credstore: { tag: 'credstore'} }).credstore;

var formattedDate = Math.floor(Date.now() / 1000);
var txData;

  async function doGetActiveExportEvents(realm){
  
  let ActiveEvents = [];

  try {
  
    let ActiveExportEvents = await SELECT.from(ExportEvents).where({realm : realm, Activated: "X"});
    
    if(ActiveExportEvents.length==0){
      logger.info(`No Active Events to process`);
      return 0;
     }
    
    for(const Exportevent of ActiveExportEvents){
            
      try{
          ActiveEvents.push({ Realm:Exportevent.Realm, Eventname:Exportevent.Eventname ,Process:Exportevent.Process, InitialLoadDate:Exportevent.InitialLoadDate,Activated:Exportevent.Activated,LastLoadDate:Exportevent.LastLoadDate});
         }
      catch (error)
         {
          logger.error(`Error Updating job status for jobs`);
          SuccessStatus = false;
         }
    }
    return ActiveEvents;
  }
  catch (Error)
  {
     logger.error(`Error while retrieving data from Export Events`);
     SuccessStatus = false;
     return "Error";
  }
 

}


async function doProcessExportEvents(req){

  let oData = req.data;
  let realm = oData.realm;
  const CurrentLoadDate = Date.now();
  debugger;

  let aribainfo = await getAribaDetails(realm);
  if (!aribainfo) { 
    doSendEmail(false,Realm);
    return;
  }
  let activeevents = await doGetActiveExportEvents(realm);

  let FTPinfo = await SELECT.one.from(FTPServer).where({realm : realm});

  if (FTPinfo.privatekey && FTPinfo.passphrase)
  {
    let credprivatekey = await credStore.readCredential(services, namespace, "key", SFTPPkey);
    const privatekeybuffer = Buffer.from(credprivatekey.value, 'base64');
    privateKey = privatekeybuffer.toString();
    privateKey = privateKey.replace(/\\n/g,'\n');
    passphrase = FTPinfo.passphrase;

  }
  else if (FTPinfo.password)
  {
    let creds = await credStore.readCredential(services, namespace, "password", SFTPPass);
    password = creds.value;

  }
  
  logger.info('Completed retreiving credentials fo SFTP');

  for (const event of activeevents)
  {
 
    var Realm = event.Realm;
    var Eventname = event.Eventname;
    var Process = event.Process;
    var InitialLoadDate = event.InitialLoadDate;
    var LastLoadDate = event.LastLoadDate;
    
    var FromDate;
    
    var EventExportURL = `${aribainfo.RealmURL}` + `${Process}`+ '/filedownload?realm='+ `${Realm}`;
    logger.info(`Event Export URL formed - ${EventExportURL}`);
    
    if ( LastLoadDate === "")
      {
        FromDate =  moment(InitialLoadDate,'YYYY-DD-MM HH:mm:ss').unix();
      }
      else
      {
         FromDate = LastLoadDate.split('.')[0];
      }

      var bodyFormData = new FormData();
      bodyFormData.append('event', `${Eventname}`);
      bodyFormData.append('sharedSecret', `${aribainfo.Password}`);
      bodyFormData.append('from', `${FromDate}`);
      bodyFormData.append('to', `${CurrentLoadDate}`);

      await axios({
        method: "post",
        url: EventExportURL,
        data: bodyFormData,
        responseType: 'arraybuffer',
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(async (response) => 
      {
        await doExporttoSFTP(response,Realm,Eventname,CurrentLoadDate);
      })
      .catch(function (error) {
      logger.error(error);
      SuccessStatus = false;
      return error;
      });


    } // for events

    doSendEmail(SuccessStatus,Realm);

}

function doSendEmail(Status,Realm)
{
  if (Status){
    txData = {
      Realm: Realm,
      TransactionDate: formattedDate,
      EventName: "Export Event",
      EventMessage: "Export Event Successfully Executed",
      Status:"Success"
    }
    Txtracker.inserttxData(txData);
    SMTPClient.dosendEmail(Realm,1);
  }
  else 
  {
    txData = {
      Realm: Realm,
      TransactionDate: formattedDate,
      EventName: "Export Event",
      EventMessage: "Export Event failed. Please check application logs",
      Status:"Failure"
    }
    SMTPClient.dosendEmail(Realm,2);
  }
}
async function getAribaDetails(realm){
  var AribaInfo ={};
  var ITKPass;
  try {
        let secret = await SELECT.one.from(SharedSecret).where({realm : realm});
        if ( secret.AuthType === 'Shared Secret')
        {
           let creds = await credStore.readCredential(services, namespace, "password", ITKPassName);
           ITKPass = creds.value;
          
        } 
        else
        {
          logger.error('No Shared Secret Mapping maintained in the configuration');
          return;
        }
        let RealmDC = await SELECT.one.from(RealmMapping).where({DefaultRealm : 'X'});

        if (RealmDC.RealmDCURL != '' )
        {
          AribaInfo.RealmURL = RealmDC.RealmDCURL;
          AribaInfo.Password = ITKPass
          return AribaInfo;
        }
        else
        {
          logger.error('No Realm Mapping maintained in the configuration');
          SuccessStatus = false;
          return;
        }

  }
catch (error) 
    {
      logger.error(`Error in getAribaDetails function: ${error.toString()}`);
    }


}

async function doExporttoSFTP(response,Realm,Eventname,CurrentLoadDate)
{
    const zipBuffer = Buffer.from(response.data);
    var filename = Eventname.replace(/\s+/g,'');
  
    let callftp = await FTPClient.doUploadSftpAction(zipBuffer,Realm,filename,privateKey,passphrase,password);
    if (callftp === 'Success')
    { 
      // record the current time to last time.
      await UPDATE(ExportEvents).set({LastLoadDate:CurrentLoadDate}).where({Realm:Realm,Eventname:Eventname});
      //debugger;

    }
    else
    {
      // record error
    }

}

module.exports = {
  doProcessExportEvents
};

