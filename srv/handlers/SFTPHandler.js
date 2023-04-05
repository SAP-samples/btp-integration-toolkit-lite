const cds = require("@sap/cds");
const Client = require("ssh2-sftp-client");
const credStore = require("./lib/CredentialStore");
const stream = require('stream');
const xsenv = require('@sap/xsenv');
const { Readable } = stream;
const logger = require("../utils/logger");
const { FTPServer } = cds.entities('com.sap.pgp.dev.ItkApp');


xsenv.loadEnv();

async function getFilefromDirectory(Realm,importdirectory,privateKey,passphrase,password){
  
  const sftp = new Client();
  const connectionInfo = await getSFTPConnectionInfo(Realm,privateKey,passphrase,password);

  let sftpWrapper;

   try {

          sftpWrapper = await sftp.connect(connectionInfo);
          logger.info('SFTPHandler: SFTP Connection Open');

          const files = await sftp.list(importdirectory);

          const fileobj = await getFileObjects(files,sftp,importdirectory);

          return fileobj;

        } catch (error) {
            logger.error(`SFTPHandler:Error in SFTP Connection ${error}`);
          } finally {
        
        if (sftpWrapper) {
            await sftp.end();
            logger.info('SFTPHandler:SFTP Connection Closed');
                        }
        }

}

async function getSFTPConnectionInfo(realm,privateKey,passphrase,password) {

  let FTPinfo = await SELECT.one.from(FTPServer).where({realm : realm});

  if (!FTPinfo.hostname && !FTPinfo.port && !FTPinfo.username) 
    {
      logger.error('SFTPHandler: No Hostname information setup in the configuation');
    return;
    }

    const host = FTPinfo.hostname;
    const port = FTPinfo.port;
    const connectionOptions = {host, port};
          username = FTPinfo.username;
  
        //   logger.info(`Value of SFTP Hostname is ${host}`);
        //  logger.info(`Value of SFTP Port is ${port}`);
  
    if (username)
      connectionOptions.username = username;
    if (password)
      connectionOptions.password = password;
    if (privateKey)
      connectionOptions.privateKey = privateKey;
    if (passphrase)
      connectionOptions.passphrase = passphrase;
    return connectionOptions;

  }

async function doMoveSftpAction(filedirectory,filename,realm,privateKey,passphrase,password){
  const sftp = new Client();
  const connectionInfo = await getSFTPConnectionInfo(realm,privateKey,passphrase,password);
  const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
  const currentTime = new Date().toLocaleTimeString().replace(/:/g, '-').replace(' ', '');
  const newfilename = `${currentDate}-${currentTime}-${filename}`.replace(/\s+/g,'_');


   var oldfolder = `${filedirectory}`+ '/' +  `${filename}`;

   let FTPinfo = await SELECT.one.from(FTPServer).where({realm : realm});

   var movefolder = `${FTPinfo.ArchiveDir}` + '/' + `${newfilename}`;
 
  if ( oldfolder === '' || movefolder === '')
  {
    // log error that no folder is configured
    logger.error('SFTPHandler:No Folder configuration done');
    return;
  }
  else
  {

  try {

    sftpconnect = await sftp.connect(connectionInfo);
    sftpmove =    await sftp.rename(oldfolder,movefolder);

    logger.info(`SFTPHandler:Files successfully moved from ${oldfolder} to ${movefolder}`);
      }
      catch(error)
      {
        logger.error("SFTPHandler:Error moving Files to archive folder");
      }
      finally {
        if (sftpconnect) {
            await sftp.end();
            logger.info('SFTPHandler:SFTP Connection Closed');
        }
      }

    }


}

async function doUploadSftpAction(zipBuffer,Realm,filename,privateKey,passphrase,password){

           const sftp = new Client();

           const connectionInfo = await getSFTPConnectionInfo(Realm,privateKey,passphrase,password);

            let sftpWrapper;
            try {

            sftpWrapper = await sftp.connect(connectionInfo);
            logger.info('SFTPHandler:SFTP Connection Open');
            let FTPinfo = await SELECT.one.from(FTPServer).where({realm : Realm});
         
            const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
            const currentTime = new Date().toLocaleTimeString().replace(/:/g, '-').replace(' ', '');
            const newfilename = `${currentDate}-${currentTime}-${filename}`.replace(/\s+/g,'_');

            var UploadFolder = `${FTPinfo.UploadDir}` + '/' + `${newfilename}` + '.zip';
 
            if ( UploadFolder != '')
              {
                //debugger;
                const readableStream = new Readable({
                  read() {
                    this.push(zipBuffer);
                    this.push(null);
                  },
                });
                await sftp.put(readableStream, UploadFolder);
                logger.info(`SFTPHandler:File uploaded successfully to ${UploadFolder} folder `);
                return 'Success';
               
              }
            else
              {
                // log error that no folder is configured
                return 'Failure';
              }
           
             
            } catch (error) {
                console.log(error);
             } finally {
            if (sftpWrapper) {
                await sftp.end();
                logger.info('SFTPHandler:SFTP Connection Closed');
            }
            }
        }


async function getFileObjects(files,sftp,importdirectory){

  var filesobj = [];
  
  for (const file of files)
  {
    
    var FileType = file.type;

    if ( FileType === '-') {   
      const filePath = `${importdirectory}/${file.name}`;
      let response = await sftp.get(filePath);
      const contentType = getContentType(file.name);
      filesobj.push({filename:file.name, data: response, contentType:contentType});
  }
}
return filesobj;

}

function getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case 'pdf':
        return 'application/pdf';
        case 'doc':
        case 'docx':
        return 'application/msword';
        case 'xls':
        case 'xlsx':
        return 'application/vnd.ms-excel';
        case 'zip':
        return 'multipart/form-data;';
        default:
        return 'application/octet-stream';
    }
    }

module.exports = {
    doUploadSftpAction,
    doMoveSftpAction,
    getFilefromDirectory
};

