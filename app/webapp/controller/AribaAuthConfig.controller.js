//@ts-nocheck
sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast"
],

	function (BaseController, MessageToast) {
		"use strict";

		return BaseController.extend("com.sap.pgp.dev.ItkApp.controller.AribaAuthConfig", {

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit: function () {
				var oDataModel = this.getOwnerComponent().getModel("ItkMo");
                var _this = this;
				  oDataModel.read("/SharedSecret", {
					success: function(oData, response) {
						var aAuthData = [];
						aAuthData.push({Name: "Select.."});
						aAuthData.push({Name: "Shared Secret"});
						// aAuthData.push({Name: "Certificate"});
						oData.Authtypes = aAuthData;

   	                    var oModel = new sap.ui.model.json.JSONModel();
						_this.getView().setModel(oModel,"AuthModel");
						oModel.setData(oData);
							},
						error : function(oError) {
							//no entries available.. new insert
			
						} 
				});


			},


			onSavePress : function(oEvent) {

				var realmtable = this.getView().byId("authtable");
				var items = realmtable.getRows();
				var _this = this;
			
				items.forEach(function(item){
					// log to the console for debugging only:        
					var Realm = item.getCells()[0].getText();
					var AuthType = item.getCells()[1].getProperty("selectedKey");
					if (Realm === "")
					{
						return;
					}
				    if ( AuthType === 'Select..')
					{
						MessageToast.show("Error Saving Configuration, Please Select Authentication Type");
						return;
					}
					// if ( AuthType === 'Certificate')
					// {
					// 	MessageToast.show("Certificatin Authentication is not supported Yet. ");
					// 	return;
					// }
					var oAuthData = {
						Realm: Realm,
						AuthType: AuthType						
						}
		   
					var AuthModel = _this.getView().getModel("ItkMo");
					
					var Authparameter = '/SharedSecret(Realm=\'' +  Realm + '\'\)';

					AuthModel.update(Authparameter, oAuthData, 
					{method: "PUT", success: mySuccessHandler, error: myErrorHandler});
					
					function mySuccessHandler(oRetrievedResult){
								MessageToast.show("Secret Key Configuration Successfully Saved");
								// debugger;
								}
								function myErrorHandler(oError){
									MessageToast.show("Failed to save Secret Key Configuration");
								// debugger;
								}

				});
   
		   }

		  
		});

	});