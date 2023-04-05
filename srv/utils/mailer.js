"use strict";

const nodemailer = require("nodemailer");
const { MiscDetails } = cds.entities('com.sap.pgp.dev.ItkApp');
const fs = require('fs');
const logger = require("../utils/logger");
const credStore = require("../handlers/lib/CredentialStore");
const xsenv = require('@sap/xsenv');
const SMTPname = process.env.SMTP_CRED_NAME;
xsenv.loadEnv();

const services = xsenv.getServices({
    credstore: { tag: 'credstore'} }).credstore;

const namespace = process.env.CRED_NAMESPACE;    
const emailcontent = process.env.EMAIL_TEMPLATE;    

async function dosendEmail(realm,EmailBodyID){

    let emailBody = null;
    let emailSubject = null;
    const separator = ';'
    let secure = false;
    let SMTPPass;
    let SFTPInfo = await SELECT.one.from(MiscDetails).where({Realm : realm});
    debugger;
    if (!SFTPInfo) 
        { 
        logger.error(`No SMTP Configuration maintained for realm ${realm}`)
        return;
        }
    
    const hostname = SFTPInfo.SMTPServer;
    const smtpport = SFTPInfo.SMTPPort;
    const smtpsecure = SFTPInfo.Secure;
    if (smtpsecure == 'X') { secure = true };
    const smtpusername = SFTPInfo.SMTPUsername;
    const smtpnotifyemail = SFTPInfo.SMTPNotifyEmail;
    const receipientemail = smtpnotifyemail.split(separator).map(s=> s.trim());
    if (!receipientemail) { return;}
    let creds = await credStore.readCredential(services, namespace, "password", SMTPname);
    SMTPPass = creds.value;
    let transporter = nodemailer.createTransport({
    host: hostname,
    port: smtpport,
    secure: secure,
    auth: {
        user: smtpusername,
        pass: SMTPPass, 
    },
    });

      await transporter.verify().then(console.log).catch(console.error);

       fs.readFile(emailcontent,(err,data) => {
        if (err) throw err;
        const emailData = JSON.parse(data);

        for (const email of emailData)
        {
            if (EmailBodyID == email.Id) {
            emailBody = email.Body;
            emailSubject = email.Subject;
            transporter.sendMail({
                from: smtpusername, 
                to: receipientemail, 
                subject: emailSubject,
                html: emailBody, 
            }).then ( info => { logger.info("Message sent successfully after processing ITK files")})
              .catch(error => { logger.error(`Error Sending EMail from SMTP Server ${error.message}`)})

                                        }
        }

      })
    

}

module.exports = {
    dosendEmail
};