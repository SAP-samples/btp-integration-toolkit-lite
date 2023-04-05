//@ts-nocheck
sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast"
],

	function (BaseController, MessageToast) {
		"use strict";

		return BaseController.extend("com.sap.pgp.dev.ItkApp.controller.RealmConfig", {

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit: function () {
				var oDataModel = this.getOwnerComponent().getModel("ItkMo");
                var _this = this;
				  oDataModel.read("/RealmMapping", {
					success: function(oData, response) {
						// var oViewModel = new sap.ui.model.json.JSONModel();
						// 	oViewModel.setData(oData.results);
							for (var i in oData.results) {
								oData.results[i].Checked = oData.results[i].DefaultRealm == 'X' ? true : false;
							  }
							  var oModel = new sap.ui.model.json.JSONModel();
							  _this.getView().setModel(oModel,"RealmModel");
							  oModel.setData(oData);

															
								   },
								error : function(oError) {
									//no entries available.. new insert
									console.log(oError);
					
								} 
						});


			},


			onSelectRadio:function(oEvent){
				var oSelectedIndex = oEvent.getParameter("selectedIndex");  
				var oRadioButtonSrc = oEvent.getSource().getAggregation("buttons");  
				var oSelectedRadioText = oRadioButtonSrc[oSelectedIndex].getText();
				alert(oSelectedRadioText);
			  },

			onSavePress : function(oEvent) {

				var realmtable = this.getView().byId("realmtable");
				var items = realmtable.getRows();
				var _this = this;
				var DefaultRealm;
				//var TableData = realmtable.getModel().getData();

				// var items = this.getView().byId("eventstable").getItems();
				items.forEach(function(item){
					// log to the console for debugging only:        
					var RealmRegion = item.getCells()[0].getText();
					var RealmDCURL = item.getCells()[1].getText();
					var Checked = item.getCells()[2].getProperty("selected");
					if ( RealmRegion === "")
						return;

                    if ( Checked === true)
					{
						DefaultRealm = 'X';
					}
					else
					{
						DefaultRealm = '';
					}
					var oRegionData = {
						RealmRegion: RealmRegion,
						RealmDCURL  : RealmDCURL,
						DefaultRealm : DefaultRealm
					
						}
		   
					var RealmModel = _this.getView().getModel("ItkMo");
					
					var Eventparmaeter = '/RealmMapping(RealmRegion=\'' +  RealmRegion + '\'\)';

					RealmModel.update(Eventparmaeter, oRegionData, 
					{method: "PUT", success: mySuccessHandler, error: myErrorHandler});
					
					function mySuccessHandler(oRetrievedResult){
								MessageToast.show("Realm &  Data Center Configuration saved Successfully");
								// debugger;
								}
								function myErrorHandler(oError){
									MessageToast.show("Failed to Save Realm & Data Center Configuration");
								// debugger;
								}

	

				});
   
		   }

		});

	});