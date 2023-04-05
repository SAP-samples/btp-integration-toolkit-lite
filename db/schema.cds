using { managed, sap, cuid } from '@sap/cds/common';
namespace com.sap.pgp.dev.ItkApp;

entity RealmMapping : managed {
   key  RealmRegion  : String;
        RealmDCURL : String;
        DefaultRealm : String;
                              }

entity FTPServer : cuid {
        Realm : String;
        hostname  : String;
        port : String;
        username : String;
        password : String;
        privatekey: String;
        passphrase: String;
        proxytype:  String;
        proxyhost:String;
        proxyport: String;
        UploadDir:String;
        ArchiveDir: String;
                           }


entity ImportEvents : managed {
   key  Realm: String;
   key  Eventname  : String;
        Process : String;
        Operation: String;
        Activated : String;
        ImportDir: String;
}

entity SpendVizEvents : managed {
   key  Realm: String;
   key  Eventname  : String;
        Process : String;
        Operation: String;
        Activated : String;
        ImportDir: String;
        AuthUser: String;
        sourceSystem: String;
}

entity ExportEvents : managed {
   key  Realm: String;
   key  Eventname  : String;
        Process : String;
        InitialLoadDate: String;
        LastLoadDate: String;
        Activated : String;
}


entity MiscDetails : cuid {
        Realm: String;
        SMTPServer: String;
        SMTPPort: String;
        Secure: String;
        SMTPUsername: String;
        SMTPNotifyEmail:String;

}


entity SharedSecret : managed {
   key  Realm: String;
        AuthType: String;
                              }                        


entity EventLogs : cuid {
        Realm: String;
        TransactionDate: String;
        EventName: String;
        EventMessage: String;
        Status:String;
}

