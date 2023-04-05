"use strict";

//libraries
const cds = require("@sap/cds");
const { default: axios } = require("axios");
const FormData = require('form-data');
const credStore = require("./lib/CredentialStore");
const xsenv = require('@sap/xsenv');
const FTPClient = require("./SFTPHandler");
const { SharedSecret, ImportEvents, RealmMapping,FTPServer } = cds.entities('com.sap.pgp.dev.ItkApp');
const logger = require("../utils/logger");
const SMTPClient = require("../utils/mailer");
const Txtracker = require('../utils/TransactionHandler');
const archiver = require('archiver');
const fs = require('fs');
const buffer = require('buffer');
const path = require('path');


xsenv.loadEnv();
let SuccessStatus = true;
let password = null;
let privateKey = null;
let passphrase = null;
const namespace = process.env.CRED_NAMESPACE; 
const SFTPPkey = process.env.SFTP_CRED_PKNAME;
const SFTPPass = process.env.SFTP_CRED_PASSNAME;
const ITKPassname = process.env.ITK_CRED_NAME;

const services = xsenv.getServices({
  credstore: { tag: 'credstore'} }).credstore;

var formattedDate = Math.floor(Date.now() / 1000);
const sauthtype = 'Shared Secret';
var txData;

async function doGetActiveImportEvents(realm){
  
  let ActiveEvents = [];

  try{
  
    let ActiveImportEvents = await SELECT.from(ImportEvents).where({realm : realm, Activated: "X"});
    
    if(ActiveImportEvents.length==0){
      logger.info(`ImportEvent: No Active Events to process`);
      return 0;
     }
     logger.info(`ImportEvent: Number of Active Events Retreived ${ActiveImportEvents.length}`);

    for(const importevent of ActiveImportEvents){
            
      try{
          ActiveEvents.push({ Realm:importevent.Realm, Eventname:importevent.Eventname ,Process:importevent.Process, Operation:importevent.Operation,Activated:importevent.Activated,ImportDir:importevent.ImportDir});
         }
      catch (error){
           logger.info(`ImportEvent:Updating job status for jobs : ${error.toString()}`);
           SuccessStatus = false;
      }
    }
    return ActiveEvents;
  }
  catch (Error)
  {
   SuccessStatus = false;
   logger.error(`ImportEvent: Error while retreiving importing events from Database`);
   return "Error";
  }
 

}


async function doProcessImportEvents(req){
  
   let oData = req.data;
  
   let realm = oData.realm;

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

    let aribainfo = await getAribaDetails(realm);

     if (!aribainfo) {
       logger.error('ImportEvent: Import Events - Error in calling Ariba Details');
       return;
      }
    debugger;

    let activeevents = await doGetActiveImportEvents(realm);

    if (!activeevents)
    {
      logger.error('ImportEvent: No Active Events configured for Import');
      return;
    }

  for (const event of activeevents)
  {
   
    var Realm = event.Realm;
    var Eventname = event.Eventname;
    logger.info(`Starting Import Event Batch for ${Eventname}`)
    var Process = event.Process;
    var Operation = event.Operation;
    var fullload;
    var namefile;
    var destArray;

    var ImportDir = event.ImportDir;
    
      if ( Operation === 'Full')
      {
           fullload = true;
      }
      else
      {
           fullload = false;
      }

       let files = await FTPClient.getFilefromDirectory(Realm,ImportDir,privateKey,passphrase,password);
       

       if (!files) 
       {
        logger.error('ImportEvent: Import Events - Error in SFTP Call');
        doSendEmail(false,Realm);
        return;
      }
       if ( files.length != 0)
       {
       
        var fileArray = [];
        destArray = [];

        for (const file of files)
        {


          let zipbuffer;

          const contentType = file.contentType;

          var fileExtension = path.extname(file.filename);

          if (fileExtension === '.zip') 
          {
            zipbuffer = file.data;
            namefile = file.filename;
            //call Ariba and post move folder..
           await ImportandMove(Realm,Eventname,Process,zipbuffer,fullload,fileArray,ImportDir,namefile,aribainfo)              
          }
          else
          {
            fileArray.push({
              filename: file.filename,
              filedata: file.data,
              ImportDir: ImportDir
             });
           
          }

        }

        //check if array is empty if not call ariba and sftp.. 

        if (fileArray.length != 0) {

          try {
          destArray = fileArray.slice();
          logger.info('going inside zipit');
          await zipit(fileArray) 
        //  debugger;
          var zipBuffer = buffer.Buffer.from(fs.readFileSync('./srv/interim/BatchImportData.zip'));
          var namefile = 'BatchImportData.zip';
          await ImportandMove(Realm,Eventname,Process,zipBuffer,fullload,destArray,ImportDir,namefile,aribainfo);
          
          }  catch(error) { logger.error (`ImportEvent: Error in calling Zip and Import Move : ${error.toString()}`)};
   
                           }  
           
     } 
     
    } // for events

}

async function zipit(fileArray) {
  
  return new Promise((resolve,reject) => {
   // debugger;
    try{
    var output = fs.createWriteStream('./srv/interim/BatchImportData.zip', {flags: 'w'});
    var archive = archiver('zip', { zlib: { level: 9 }});
  
    output.on('close',function() {
     console.log('Import archive has been finalized and output file has closed');
    });

   archive.on('error', function(err) { throw err;});

   archive.pipe(output);

   for (const file of fileArray)
   {
    logger.info(`ImportEvent : Zip It- Adding File from SFTP for processing ${file.filename} `);
    archive.append(file.filedata, {name:file.filename })
   }

   archive.finalize();

   setTimeout(() => {
    resolve('Import Event: Resolve Timeout Exceeded');

   }, 10000);

  }
  catch(error){ reject(error)}
  });
}

async function ImportandMove(Realm,Eventname,Process,zipbuffer,fullload,fileArray,ImportDir,filename,aribainfo)
{
  debugger;
  var EventImportURL = `${aribainfo.RealmURL}` + `${Process}`+ '/fileupload?realm='+ `${Realm}`;
  console.log("Event Import URL formed",EventImportURL);
  const localpath = `./srv/interim/${filename}`;
  var bodyFormData = new FormData();
  bodyFormData.append('event',`${Eventname}`);
  bodyFormData.append('sharedSecret', `${aribainfo.Password}`);

  if (fileArray.length != 0) 
  {
    bodyFormData.append('content', zipbuffer);
  } 
  else
  {
     bodyFormData.append('content', Buffer.from(zipbuffer));
  }
  
  bodyFormData.append('fullload', `${fullload}`);

  await axios({
    method: "post",
    url: EventImportURL,
    data: bodyFormData,
    headers: { "Content-Type": "multipart/form-data" },
  })
  .then(async function (response) {
    logger.info('ImportEvent: Successfully imported data into Ariba');
    
    fs.unlink(localpath, (error) => {
      if (error) {
        logger.error(`Error while deleting the file - ${error.message}`);
      }
      else {
        logger.info('Succesfully deleted local temporary file');
      }
    });

   if ( fileArray.length != 0)
    {
      for ( const file of fileArray) {
        try {
          debugger;
           await doMoveFile(file.ImportDir,file.filename,Realm);
        }
        catch ( error) {
          logger.error(`ImportEvent: Error processing file ${file.filename} error message ${error.message}`);
        }
      }
      doSendEmail(SuccessStatus,Realm);

    }
    else
    {
      //individual zip file
      debugger;
      await doMoveFile(ImportDir,filename,Realm);
      doSendEmail(SuccessStatus,Realm);
    }


               })
  .catch(function (error) {
  // go ahead and record the error..
  SuccessStatus = false;
  logger.error( `ImportEvent: Error calling Import to Ariba - ${error.toString()}`);
  return error;
  });

}

function doSendEmail(Status,Realm)
{
  if (Status)
     {
      txData = {
        Realm: Realm,
        TransactionDate: formattedDate,
        EventName: "Import Event",
        EventMessage: "Import Event Successfully Executed",
        Status:"Success"
      }
       Txtracker.inserttxData(txData).then ( result => {  logger.info(`Import Event: ${result}`); SMTPClient.dosendEmail(Realm,3); });
      
     }
    else 
     {
      txData = {
        Realm: Realm,
        TransactionDate: formattedDate,
        EventName: "Import Event",
        EventMessage: "Import Event failed. Please check application logs",
        Status:"Failure"
      }
      Txtracker.inserttxData(txData).then ( result => {  logger.info(`Import Event: ${result}`); SMTPClient.dosendEmail(Realm,4); });
      
     }
}

async function getAribaDetails(realm){
  var AribaInfo ={};
  var ITKPass;

  try {
        let secret = await SELECT.one.from(SharedSecret).where({realm : realm});
        if ( secret.AuthType == sauthtype)
        {
          let creds = await credStore.readCredential(services, "SolarchitectureCF", "password", ITKPassname);
          ITKPass = creds.value;

        } 
        else
        {
          logger.error('ImportEvent: No Shared Secret Mapping maintained in the configuration');
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
          logger.error( 'ImportEvent: No Realm Mapping Configured');
          SuccessStatus = false;
          return;
        }

  }
catch (error) 
    {
      logger.error( 'ImportEvent: No Realm Mapping Configured');
      SuccessStatus = false;
    }


}

async function doMoveFile(filedirectory,filename,realm){
  logger.info("ImportEvent: Moving files to Archive Folder");
  await FTPClient.doMoveSftpAction(filedirectory,filename,realm,privateKey,passphrase,password);

}

module.exports = {
     doProcessImportEvents
    
};

