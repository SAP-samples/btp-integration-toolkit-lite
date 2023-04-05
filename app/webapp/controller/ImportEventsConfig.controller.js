//@ts-nocheck
sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast"
],

	function (BaseController, MessageToast) {
		"use strict";

		return BaseController.extend("com.sap.pgp.dev.ItkApp.controller.ImportEventsConfig", {

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit: function () {
				var oDataModel = this.getOwnerComponent().getModel("ItkMo");
                var _this = this;
				  oDataModel.read("/ImportEvents", {
					success: function(oData, response) {
						// var oViewModel = new sap.ui.model.json.JSONModel();
						// 	oViewModel.setData(oData.results);
						var aOperationData = [];
						aOperationData.push({Name: "None"});
						aOperationData.push({Name: "Full"});
						aOperationData.push({Name: "Incremental"});
						oData.Operations = aOperationData;

							for (var i in oData.results) {
								oData.results[i].Checked = oData.results[i].Activated == 'X' ? true : false;
								// oData.results[i].SelectedOper = oData.results[i].Operation 

							  }
							  var oModel = new sap.ui.model.json.JSONModel();
							  _this.getView().setModel(oModel,"EventsModel");
							  oModel.setData(oData);

															
								   },
								error : function(oError) {
									//no entries available.. new insert
					
								} 
						});


			},

			getSelectedIndices: function(evt) {
				var aIndices = this.byId("realmtable").getSelectedIndices();
				var sMsg;
				if (aIndices.length < 1) {
					sMsg = "no item selected";
				} else {
					sMsg = aIndices;
				}
				MessageToast.show(sMsg);
			},


			onSavePress : function(oEvent) {

				var realmtable = this.getView().byId("eventstable");
				var items = realmtable.getRows();
				var _this = this;
				var Activated;
				//var TableData = realmtable.getModel().getData();

				// var items = this.getView().byId("eventstable").getItems();
				items.forEach(function(item){
					// log to the console for debugging only:        
					var Realm = item.getCells()[0].getText();
					var EventName = item.getCells()[1].getText();
					var Process = item.getCells()[2].getText();
					var Checked = item.getCells()[3].getProperty("checked");
					var Operation = item.getCells()[4].getProperty("selectedKey");
					var DownloadDir = item.getCells()[5].getValue();
                    if ( Checked === true)
					{
						Activated = 'X';
					}
					else
					{
						Activated = '';
					}

					if ( Activated === 'X' && ( Operation === 'None' || DownloadDir === ''))
					{
						MessageToast.show("Error Saving Configuration, Please Select Operation and Download Directory for activated Events");
						return;
					}
					var oEventsData = {
						Realm: Realm,
						Eventname  : EventName,
						Process : Process,
						Operation: Operation,
						Activated : Activated,
						ImportDir: DownloadDir
						}
		   
					var EventsModel = _this.getView().getModel("ItkMo");
					
					var Eventparameter = '/ImportEvents(Realm=\'' +  Realm + '\'\,Eventname=\''+ EventName + '\'\)';

					EventsModel.update(Eventparameter, oEventsData, 
					{method: "PUT", success: mySuccessHandler, error: myErrorHandler});
					
					function mySuccessHandler(oRetrievedResult){
								MessageToast.show("Event Configuration Successfully Saved");
								// debugger;
								}
								function myErrorHandler(oError){
									MessageToast.show("Failed to save event Configuration");
								// debugger;
								}

	

				});
   
		   },

		   
			onHighlightToggle: function(oEvent) {
				var oTable = this.byId("table");
				var oToggleButton = oEvent.getSource();
	
				if (oToggleButton.getPressed()) {
					oTable.setRowSettingsTemplate(new RowSettings({
						highlight: "{Status}"
					}));
				} else {
					oTable.setRowSettingsTemplate(null);
				}
			},
	
			onAlternateToggle: function(oEvent) {
				this.byId("table").setAlternateRowColors(oEvent.getParameter("pressed"));
			},
	
			onSelectionModeChange: function(oEvent) {
				var oTable = this.byId("table");
				var sKey = oEvent.getParameter("selectedItem").getKey();
	
				oTable.setSelectionMode(sKey);
			}
		});

	});