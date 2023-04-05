sap.ui.define([
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function(Fragment, Controller, JSONModel,MessageToast) {
"use strict";

var PageController = Controller.extend("com.sap.pgp.dev.ItkApp.controller.AribaSMTPConfig", {


	onInit: function (oEvent) {

		this.getView().setModel(new JSONModel({
			operation: "",
			busy: "",
			key:""
		}), "LocalMo");

		// set explored app's demo model on this sample
		var oDataModel = this.getOwnerComponent().getModel("ItkMo");
		var _this = this;
		var oViewModel = new sap.ui.model.json.JSONModel();
		//this.getView().setModel(oDataModel);
	    	this.getView().setModel(oViewModel, "MiscModel");

			oDataModel.read("/MiscDetails", {
				   success: function(oData, response) {
					var aSecure = [];
					aSecure.push({Name: "Select.."});
					aSecure.push({Name: "Yes"});
					aSecure.push({Name: "No"});
					oData.results[0].aSecureTypes = aSecure;
					if ( oData.results[0].Secure == 'X')
					 {
						oData.results[0].Secure = 'Yes';
					 }
					 else
					 {
						oData.results[0].Secure = 'No';
					 }
					oViewModel.setData(oData.results[0]);
     				_this.byId('edit').setEnabled(true);
					_this._formFragments = {};
					// Set the initial form to be the display one
					_this._showFormFragment("DisplaySMTP");
					_this.getView().getModel("LocalMo").setProperty("/operation","U");
					_this.getView().getModel("LocalMo").setProperty("/key",oData.results[0].ID);
					
		   							
							      },
							   error : function(oError) {
								   //no entries available.. new insert
								   var oemptySMTPData = {
									Realm: "",
									hostname  : "",
									port : "",
									username : "",
									password : "",
									privatekey: "",
									passphrase: "",
									proxytype:  "",
									proxyhost:"",
									proxyport: ""
								}
								   oViewModel.setData(oemptySMTPData);
								   _this.byId('edit').setEnabled(true);
								   _this._formFragments = {};
								   // Set the initial form to be the display one
								   _this._showFormFragment("DisplaySMTP");
							    	_this.getView().getModel("LocalMo").setProperty("/operation","I");
								   


							   } 
					   });

	},

	handleEditPress : function () {
      //  debugger;
		// var oData = this.getView().getModel("ItkMo");
		// var aSecure = [];
		// aSecure.push({Name: "Select.."});
		// aSecure.push({Name: "Yes"});
		// aSecure.push({Name: "No"});
		// oData.aSecureTypes = aSecure;
		// if ( oData.Secure == '')
		//  {
		// 	oData.Secure = 'Select..';
		//  }

		//Clone the data
		this._oSMTPInfo = Object.assign({}, this.getView().getModel("MiscModel").getData());
		this._toggleButtonsAndView(true);

	},

	handleCancelPress : function () {
        debugger;
		//Restore the data
		var oDataModel = this.getOwnerComponent().getModel("ItkMo");
		var _this = this;
		var oViewModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oViewModel, "MiscModel");
		//this.getView().setModel(oDataModel);
		// var oData = oModel.getData();
	    // oData.results[0] = this._oSMTPOriginal;
		// oModel.setData(oData);

		oDataModel.read("/MiscDetails", {
			success: function(oData, response) {
			 var aSecure = [];
			 aSecure.push({Name: "Select.."});
			 aSecure.push({Name: "Yes"});
			 aSecure.push({Name: "No"});
			 oData.results[0].aSecureTypes = aSecure;
			 if ( oData.results[0].Secure == 'X')
			  {
				 oData.results[0].Secure = 'Yes';
			  }
			  else
			  {
				 oData.results[0].Secure = 'No';
			  }
			 oViewModel.setData(oData.results[0]);
			 MessageToast.show("Ariba SMTP changes ignored !!!");
			},
			error : function(oError) {
			//Log Error
			}
		});
		this._toggleButtonsAndView(false);

	},

	

	handleSavePress : function (oEvent) {
		 
		var smtpsecure;

		var Realm = sap.ui.core.Fragment.byId("com.sap.pgp.dev.ItkApp.fragment.ChangeSMTP", "Realm").getValue();
		
		var smtpserver = sap.ui.core.Fragment.byId("com.sap.pgp.dev.ItkApp.fragment.ChangeSMTP", "smtpserver").getValue();
		
	    var smtpport = sap.ui.core.Fragment.byId("com.sap.pgp.dev.ItkApp.fragment.ChangeSMTP", "smtpport").getValue();
		
		var smtpsecure =  sap.ui.core.Fragment.byId("com.sap.pgp.dev.ItkApp.fragment.ChangeSMTP", "smtpsecure").getSelectedKey();
		if (smtpsecure == 'Yes')
		{
			smtpsecure = 'X';
		}

		var smtpusername = sap.ui.core.Fragment.byId("com.sap.pgp.dev.ItkApp.fragment.ChangeSMTP", "smtpusername").getValue();
		
		var smtpnotifyemail = sap.ui.core.Fragment.byId("com.sap.pgp.dev.ItkApp.fragment.ChangeSMTP", "smtpnotifyemail").getValue();

		var operation = this.getView().getModel("LocalMo").getProperty("/operation");
		var ID = this.getView().getModel("LocalMo").getProperty("/key");

		var oMiscData = {
			ID: ID,
			Realm: Realm,
			SMTPServer : smtpserver,
			SMTPPort: smtpport,
			Secure: smtpsecure,
			SMTPUsername: smtpusername,
			SMTPNotifyEmail: smtpnotifyemail		
		}

		if(operation === 'U')
		{
		var SMTPModel = this.getView().getModel("ItkMo");
		var _this = this;
		SMTPModel.update('/MiscDetails(ID=' +  ID + ')', oMiscData, {method: "PUT", success: mySuccessHandler, error: myErrorHandler});

		function mySuccessHandler(oRetrievedResult){
			MessageToast.show("Ariba SMTP and Log related Configuration saved Successfully");
			_this._toggleButtonsAndView(false);
         }
         function myErrorHandler(oError){
			MessageToast.show("Failed to save Ariba SMTP adn Log related configuration.");
			_this._toggleButtonsAndView(false);
            debugger;
         }


		}
		

	},

	_toggleButtonsAndView : function (bEdit) {
		var oView = this.getView();
	//	debugger;

		// var oModel = new sap.ui.model.json.JSONModel();
		// this.getView().setModel(oModel,"SMTPView");

		// Show the appropriate action buttons
		oView.byId("edit").setVisible(!bEdit);
		oView.byId("save").setVisible(bEdit);
		oView.byId("cancel").setVisible(bEdit);

		// Set the right form type
		this._showFormFragment(bEdit ? "ChangeSMTP" : "DisplaySMTP");
	},

	_getFormFragment: function (sFragmentName) {
		var pFormFragment = this._formFragments[sFragmentName],
			oView = this.getView();
        console.log("viewid is" ,  oView.getId())
		if (!pFormFragment) {
			pFormFragment = Fragment.load({
				id: "com.sap.pgp.dev.ItkApp.fragment." + sFragmentName,
				name: "com.sap.pgp.dev.ItkApp.fragment." + sFragmentName
			});
			this._formFragments[sFragmentName] = pFormFragment;
		}

		return pFormFragment;
	},

	_showFormFragment : function (sFragmentName) {
		var oPage = this.byId("page");

		oPage.removeAllContent();
		this._getFormFragment(sFragmentName).then(function(oVBox){
			oPage.insertContent(oVBox);
		});
	}

});

return PageController;

});