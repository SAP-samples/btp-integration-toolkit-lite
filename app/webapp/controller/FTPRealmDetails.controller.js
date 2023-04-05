// @ts-nocheck
sap.ui.define([
    "./BaseController",
    "sap/f/LayoutType",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} BaseController
     * @param {typeof sap.f.LayoutType} LayoutType 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel 
     * @param {sap.m.MessageBox} MessageBox 
     * @param {sap.m.MessageToast} MessageToast 
     * @returns 
     */
    function (BaseController, LayoutType, JSONModel, MessageToast,Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("com.sap.pgp.dev.ItkApp.controller.FTPRealmDetails", {


         
            onInit : function () {
                var oViewModelDetail = new JSONModel({
                    busy: true,
                    delay: 0,
                    editable: false,
                    editbutton: true,
                    savebutton:false,
                    cancelbutton:false
                });
                this.setModel(oViewModelDetail,"oViewModelDetail")

              


                this.getRouter().getRoute("FTPRealm").attachPatternMatched(this._onObjectMatched, this);

               
            },

            /* =========================================================== */
            /* event handlers                                              */
            /* =========================================================== */

            /**
             * Event handler for navigating back.
             * We navigate back in the browser history
             * @public
             */
            onNavBack : function () {

                history.go(-1);
            },


            onClose : function (oEvent) {
                this.onCancel(oEvent);
            },


            onEdit : function (oEvent) {
                this._toggleEdit();
            },


            onEdit : function (oEvent) {
                debugger;
                this.getModel("oViewModelDetail").setProperty("/editable", true);
                this.getModel("oViewModelDetail").setProperty("/editbutton", false);
                this.getModel("oViewModelDetail").setProperty("/savebutton", true);
                this.getModel("oViewModelDetail").setProperty("/cancelbutton", true);

            },

            onCancel : function(oEvent){

                this.getModel("oViewModelDetail").setProperty("/editable", false);
                this.getModel("oViewModelDetail").setProperty("/editbutton", true);
                this.getModel("oViewModelDetail").setProperty("/savebutton", false);
                this.getModel("oViewModelDetail").setProperty("/cancelbutton", false);
                //Get the OData again and set it.. 
                var RealmID =   this.getView().byId("RealmID").getText();
                var _this = this;
                var oDataModel = this.getOwnerComponent().getModel("ItkMo");
                oDataModel.read("/FTPServer", {
				 filters: [new Filter("Realm", FilterOperator.EQ, RealmID)],
				
           				success: function(oData, response) {

                        var aProxyType = [];
                        aProxyType.push({Name: "Select.."});
                        aProxyType.push({Name: "HTTP"});
                        aProxyType.push({Name: "SOCKS4"});
                        aProxyType.push({Name: "SOCKS5"});
                        oData.results[0].aProxyTypes = aProxyType;
                        if ( oData.results[0].proxytype == '')
                        {
                            oData.results[0].proxytype = 'Select..'
                        }

						var oModel = new sap.ui.model.json.JSONModel();
						_this.getView().setModel(oModel,"SupplierDetailView");
                        var radioAuthGroup = _this.getView().byId("authradio");
                        
                        if ( oData.results[0].password == 'X')
                        {
                            radioAuthGroup.setSelectedIndex(0);
                        }
                        else if (oData.results[0].privatekey == 'X')
                        {
                            radioAuthGroup.setSelectedIndex(0);
                        }
                        else 
                        {
                            radioAuthGroup.setSelectedIndex(-1);
                        }
                             
						oModel.setData(oData.results[0]);
	 
							},
							error : function(oError) {
								alert("Failure");
							} 
					});

                MessageToast.show("Changes are ignored!!!");
            },


            onAuthClick: function(oEvent){
            var selectedAuth = this.getView().byId("authradio").getSelectedButton();
            if ( selectedAuth.getProperty("text") == "PrivateKey")
            {
                var lpassphrase = this.getView().byId("lblphassphrase");
                lpassphrase.setVisible(true);
                var Ipassphrase = this.getView().byId("Inppassphrase");
                Ipassphrase.setVisible(true);
            }
            else
            {
                var lpassphrase = this.getView().byId("lblphassphrase");
                lpassphrase.setVisible(false);
                var Ipassphrase = this.getView().byId("Inppassphrase");
                Ipassphrase.setVisible(false);   
            }
            
            },

            onSave : function (oEvent) {
                var FTPID = this.getView().byId("FTPID").getValue();
                var password;
                var privatekey;
                var HostName = this.getView().byId("hostname").getValue();
               
                var Port = this.getView().byId("port").getValue();
                var UserName = this.getView().byId("username").getValue();


                var selectedAuth = this.getView().byId("authradio").getSelectedButton();
                if ( selectedAuth.getProperty("text") == "PrivateKey")
                  {
                    privatekey = 'X';
                    password = '';
                    var PassPhrase = this.getView().byId("Inppassphrase").getValue();
                  }
                 else if ( selectedAuth.getProperty("text") == "Password" )
                  {
                   password = 'X';
                   privatekey = '';
                   PassPhrase = '';
                  }

              
                var ProxyType = this.getView().byId("proxytypeselect").getSelectedKey();
               // var ProxyType = this.getView().byId("proxytype").getValue();
                var ProxyHost = this.getView().byId("ProxyHost").getValue();
                var ProxyPort = this.getView().byId("ProxyPort").getValue();
                var RealmID =   this.getView().byId("RealmID").getText();
                var UploadDir = this.getView().byId("uploaddir").getValue();
                var ArchiveDir = this.getView().byId("archivedir").getValue();

                var oFTPData = {
                    ID:FTPID,
					Realm: RealmID,
					hostname  : HostName,
					port : Port,
					username: UserName,
					password : password,
					privatekey : privatekey,
                    passphrase : PassPhrase,
                    proxytype : ProxyType,
                    proxyhost : ProxyHost,
                    proxyport : ProxyPort,
                    UploadDir : UploadDir,
                    ArchiveDir : ArchiveDir
					}
	   
				var FTPModel = this.getView().getModel("ItkMo");
                debugger;
                var FTPParameter = '/FTPServer(ID=' +  FTPID + ')';
                var _this = this;

				FTPModel.update(FTPParameter, oFTPData, 
				{method: "PUT", success: mySuccessHandler, error: myErrorHandler});
				
				function mySuccessHandler(oRetrievedResult){
                            _this.getModel("oViewModelDetail").setProperty("/editable", false);
                            _this.getModel("oViewModelDetail").setProperty("/editbutton", true);
                            _this.getModel("oViewModelDetail").setProperty("/savebutton", false);
                            _this.getModel("oViewModelDetail").setProperty("/cancelbutton", false);
							MessageToast.show("FTP Configuration saved Successfully!!!");
							// debugger;
							}
							function myErrorHandler(oError){
								MessageToast.show("Failed to save FTP Configuration");
							// debugger;
							}

            },

            _onObjectMatched : function (oEvent) {
                var sObjectId = oEvent.getParameter("arguments").objectId;

                var sLayout = sObjectId ? LayoutType.TwoColumnsBeginExpanded : LayoutType.OneColumn;
                this.getModel("RealmView").setProperty("/layout", sLayout);
                
             //   this.getModel("SupplierDetailView").setProperty("/editable", false);

               if (!sObjectId) return;

               console.log("sObjectId in Detail page is" , sObjectId);

                var _this = this;
                
                var oDataModel = this.getOwnerComponent().getModel("ItkMo");
                oDataModel.read("/FTPServer", {
				 filters: [new Filter("Realm", FilterOperator.EQ, sObjectId)],
				
           				success: function(oData, response) {
                        var lpassphrase;
                        var Ipassphrase;
                        
                        var aProxyType = [];
                        aProxyType.push({Name: "Select.."});
						aProxyType.push({Name: "HTTP"});
						aProxyType.push({Name: "SOCKS4"});
						aProxyType.push({Name: "SOCKS5"});
						oData.results[0].aProxyTypes = aProxyType;
                        if ( oData.results[0].proxytype == '')
                        {
                            oData.results[0].proxytype = 'Select..'
                        }
						var oModel = new sap.ui.model.json.JSONModel();
						_this.getView().setModel(oModel,"SupplierDetailView");
                        debugger;
                        var radioAuthGroup = _this.getView().byId("authradio");
                        
                        if ( oData.results[0].password == 'X')
                        {
                            radioAuthGroup.setSelectedIndex(0); //Password
                            lpassphrase = _this.getView().byId("lblphassphrase");
                            lpassphrase.setVisible(false);
                            Ipassphrase = _this.getView().byId("Inppassphrase");
                            Ipassphrase.setVisible(false);  
                        }
                        else if (oData.results[0].privatekey == 'X')
                        {
                            radioAuthGroup.setSelectedIndex(1); //Private Key
                            lpassphrase = _this.getView().byId("lblphassphrase");
                            lpassphrase.setVisible(true);
                            Ipassphrase = _this.getView().byId("Inppassphrase");
                            Ipassphrase.setVisible(true);
                        }
                        else 
                        {
                            radioAuthGroup.setSelectedIndex(-1);
                            var lpassphrase = _this.getView().byId("lblphassphrase");
                            lpassphrase.setVisible(false);
                            var Ipassphrase = _this.getView().byId("Inppassphrase");
                            Ipassphrase.setVisible(false); 
                        }
                        


						oModel.setData(oData.results[0]);
	 
							},
							error : function(oError) {
								alert("Failure");
							} 
					});




            }

          

        });

    });