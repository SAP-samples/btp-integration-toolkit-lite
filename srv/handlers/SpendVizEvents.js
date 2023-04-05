"use strict";

//libraries
const cds = require("@sap/cds");
const { default: axios } = require("axios");
const FormData = require('form-data');
const credStore = require("./lib/CredentialStore");
const xsenv = require('@sap/xsenv');
const FTPClient = require("./SFTPHandler");
const { SharedSecret, SpendVizEvents, RealmMapping, FTPServer } = cds.entities('com.sap.pgp.dev.ItkApp');
const logger = require("../utils/logger");
const SMTPClient = require("../utils/mailer");
const archiver = require('archiver');
const fs = require('fs');
const buffer = require('buffer');
const path = require('path');
const Txtracker = require('../utils/TransactionHandler');
xsenv.loadEnv();

const namespace = process.env.CRED_NAMESPACE;  
const ITKPassname = process.env.ITK_CRED_NAME;
const SFTPPkey = process.env.SFTP_CRED_PKNAME;
const SFTPPass = process.env.SFTP_CRED_PASSNAME;

let SuccessStatus = true;
let password = null;
let privateKey = null;
let passphrase = null;

var formattedDate = Math.floor(Date.now() / 1000);

var txData;

const services = xsenv.getServices({
  credstore: { tag: 'credstore'} }).credstore;


async function doGetActiveImportEvents(realm){
  
  let ActiveEvents = [];

  try{
  
    let ActiveImportEvents = await SELECT.from(SpendVizEvents).where({realm : realm, Activated: "X"});
    
    if(ActiveImportEvents.length==0){
      logger.info(`No Active Events to process`);
      SuccessStatus = false;
      return 0;
     }
     logger.info(`Updating job status for jobs`);

    for(const importevent of ActiveImportEvents){
            
      try{
          ActiveEvents.push({ Realm:importevent.Realm, Eventname:importevent.Eventname ,Process:importevent.Process, Operation:importevent.Operation,Activated:importevent.Activated,ImportDir:importevent.ImportDir,AuthUser:importevent.AuthUser,sourceSystem:importevent.sourceSystem});
         }
      catch (error){
           SuccessStatus = false;
           logger.info(`Updating job status for jobs`);
      }
    }
    return ActiveEvents;
  }
  catch (Error)
  {
   logger.error(`Error while retreiving importing events from Database`);
   SuccessStatus = false;
   return "Error";
  }
 

}


async function doProcessSpendVizEvents(req){

  let oData = req.data;
  
  let realm = oData.realm;

  let activeevents = await doGetActiveImportEvents(realm);

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
      var Process = event.Process;
      var Operation = event.Operation;
      var ImportDir = event.ImportDir;
      var EventName = event.Eventname;
      var AuthUser = event.AuthUser;
      var sourceSystem = event.sourceSystem;
      var fileexist;
      var namefile;
      var fileArray = [];
      var destArray;
      var ImportDir = event.ImportDir;
      
      // Get File for the specific event..
         let files = await FTPClient.getFilefromDirectory(Realm,ImportDir,privateKey,passphrase,password);

         if (!files) 
         {
          logger.error('Import Events - Error in SFTP Call');
          doSendEmail(false,Realm);
          return;
        }
         if ( files.length != 0)
         {
         
 
          fileArray = [];
  
          for (const file of files)
          {
            let zipbuffer;
  
            const contentType = file.contentType;
  
            var fileExtension = path.extname(file.filename);
  
            if (fileExtension === '.zip') 
            {
              zipbuffer = file.data;
              namefile = file.filename;
             await ImportandMove(Realm,Operation,Process,zipbuffer,fileArray,ImportDir,namefile,AuthUser,sourceSystem,fileexist,EventName)              
            }
            else
            {
              fileArray.push({
                filename: file.filename,
                filedata: file.data,
                ImportDir: ImportDir
               });
              logger.info(`Adding File from SFTP for processing ${file.filename}`)
            }
  
          }
  
          if (fileArray.length != 0) {
  
            destArray = fileArray.slice();
            zipit(fileArray).then ( result =>  { 
              logger.info(result);
              var zipBuffer = buffer.Buffer.from(fs.readFileSync('./srv/interim/SpendVizData.zip'));
              var namefile = 'SpendVizData.zip';
              fileexist = 'X';
              ImportandMove(Realm,Operation,Process,zipBuffer,destArray,ImportDir,namefile,AuthUser,sourceSystem,fileexist,EventName)

            }).catch(error => { logger.error ('Error in calling Import Spend Viz Function')});

            fileArray = []; 
            
              }  
           
      logger.info('Successfully completed Import Events');
    
       } 
       
      } // for events

   
}

function zipit(fileArray) {
  
  return new Promise((resolve,reject) => {
    debugger;
    var output = fs.createWriteStream('./srv/interim/SpendVizData.zip', {flags: 'w'});
    var archive = archiver('zip', { zlib: { level: 9 }});
  
    output.on('close',function() {
     console.log('SpendViz archive has been finalized and output file has closed');
    });

   archive.on('error', function(err) { throw err;});

   archive.pipe(output);

   fileArray.forEach(function(file) {
     logger.info(`SpendViz Event : Adding File from SFTP for processing ${file.filename} `);
     archive.append(file.filedata, {name:file.filename })
   });
   archive.finalize();

   setTimeout(() => {
    resolve('Spend Viz: Zipping Completed');

   }, 10000);
  });
}
async function ImportandMove(Realm,Operation,Process,zipBuffer,fileArray,ImportDir,filename,AuthUser,sourceSystem,fileexist,EventName)
{

  try {

  let aribainfo = await getAribaDetails(Realm);

     if (!aribainfo) {
       logger.error('Import Events - Error in calling Ariba Details');
       return;
      }

  var EventImportURL = `${aribainfo.RealmURL}` + `${Process}`+ `/Main/ad/uploadDataFile/${EventName}?realm=`+ `${Realm}`;
  logger.info(`SpendViz Import URL formed- ${EventImportURL}`);

  let form = new FormData();
  form.append('sharedSecret', `${aribainfo.Password}`);
  form.append('authUser', `${AuthUser}`);
  form.append('sourceSystem', `${sourceSystem}`);
  form.append('operation', `${Operation}`);

  const localpath = `./srv/interim/${filename}`;


  if ( fileexist != 'X')
  {
   logger.info(`Writing zipped data pulled from SFTP to temp folder-${localpath}`);
   fs.writeFileSync(localpath, zipBuffer);
  }

  const fileStream = fs.createReadStream(localpath);
  form.append('content', fileStream);
  logger.info('Succesfully written to local temporary folder');

  const headers = form.getHeaders();

  debugger;

 let response =  await axios.post(EventImportURL,form, {headers} )
  debugger;
 logger.info(response.data);

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
          logger.error(`Error processing file ${file.filename} error message ${error.message}`);
        }
      }
      doSendEmail(SuccessStatus,Realm);
    }
    else
    {
     await doMoveFile(ImportDir,filename,Realm);
     doSendEmail(SuccessStatus,Realm);
    }

}
catch (error)
{
  logger.error(`Error in Import Move function ${error.message}`);
}
 
}



function doSendEmail(Status,Realm)
{
  if (Status)
     {
      txData = {
        Realm: Realm,
        TransactionDate: formattedDate,
        EventName: "SpendViz Event",
        EventMessage: "SpendViz Event Successfully Executed",
        Status:"Success"
      }
      Txtracker.inserttxData(txData);
      SMTPClient.dosendEmail(Realm,5);
     }
    else 
     {
      txData = {
        Realm: Realm,
        TransactionDate: formattedDate,
        EventName: "SpendViz Event",
        EventMessage: "SpendViz Event failed. Please check application logs",
        Status:"Failure"
      }
      Txtracker.inserttxData(txData);
      SMTPClient.dosendEmail(Realm,6);
     }
}

async function getAribaDetails(realm){
  var AribaInfo ={};
  var ITKPass;

  try {
        let secret = await SELECT.one.from(SharedSecret).where({realm : realm});
        if ( secret.AuthType === 'Shared Secret')
        {
          let creds = await credStore.readCredential(services, namespace, "password", ITKPassname);
          ITKPass = creds.value;

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
          logger.error( 'No Realm Mapping Configured');
          SuccessStatus = false;
          return;
        }

  }
catch (error) 
    {
      console.error(error.toString());
      SuccessStatus = false;
    }


}

async function doMoveFile(filedirectory,filename,realm){
  logger.info("Moving files to Archive Folder");
  await FTPClient.doMoveSftpAction(filedirectory,filename,realm,privateKey,passphrase,password);

}

module.exports = {
  doProcessSpendVizEvents
    
};

