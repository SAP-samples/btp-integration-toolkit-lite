"use strict";

const cds = require("@sap/cds");
const logger = require("./logger");


const { EventLogs } = cds.entities('com.sap.pgp.dev.ItkApp');

function inserttxData(aData)  {
    return new Promise(async function(resolve, reject)    {

    const srv = cds.transaction(aData);

    try {

      
        if (!aData) {
            resolve(0);
            return;
        }       
        logger.info(`Transaction Handler :Processing Transaction records`);
        await srv.run( INSERT .into (EventLogs) .entries (aData) );
        logger.info("Transaction Handler :Successfully inserted data into Ariba Transaction Tracker");

            } catch (e) {
                logger.error(`Error on inserting data in database, aborting file processing, details ${e} `);
                await srv.rollback();
                reject(e);
            }
           
        await srv.commit();
        logger.info('Transaction Handler : Successfully Processed Transcation Data');
        resolve('completed Transactional Handling');
    });

}

module.exports = {
    inserttxData
};