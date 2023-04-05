//@ts-nocheck
sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
],

	function (BaseController, MessageToast, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("com.sap.pgp.dev.ItkApp.controller.ExportsEventsConfig", {

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit: function () {
				var oDataModel = this.getOwnerComponent().getModel("ItkMo");
                var _this = this;
				  oDataModel.read("/ExportEvents", {
					success: function(oData, response) {
					
							for (var i in oData.results) {
								oData.results[i].Checked = oData.results[i].Activated == 'X' ? true : false;

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


			OnPressSave : function(oEvent) {

				var InitialLoadDate = this.getView().byId("INPInitLoad").getValue();
				var RealmID = this.getView().byId("TXRealm").getText();
				var EventName = this.getView().byId("TXEventName").getText();
				var Activated = this.getView().byId("TXActivated").getSelected();
				var Activeflag = Activated === true ? 'X' : '';
				var Process = this.getView().byId("TXProcess").getText();
				var LastLoadDate = this.getView().byId("TXLastLoadDate").getText();
				

				var oEventsData = {
					Realm: RealmID,
					Eventname  : EventName,
					Process : Process,
					InitialLoadDate: InitialLoadDate,
					LastLoadDate : LastLoadDate,
					Activated : Activeflag
					}
	   
				var EventsModel = this.getView().getModel("ItkMo");
				
				var Eventparameter = '/ExportEvents(Realm=\'' +  RealmID + '\'\,Eventname=\''+ EventName + '\'\)';

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

		   },

		   onDetailsPress : function(oEvent) {
			
			var	ExportEventObject = oEvent.getSource().getBindingContext("EventsModel").getObject();
			var   RealmID = ExportEventObject.Realm;
			var   EventName = ExportEventObject.Eventname;
			var   Process = ExportEventObject.Process;

			var oDataModel = this.getView().getModel("ItkMo");

			var _this = this;
		
			oDataModel.read("/ExportEvents", {
				 filters: [new Filter("Realm", FilterOperator.EQ, RealmID),
						   new Filter("Eventname", FilterOperator.EQ, EventName)],
				success: function(oData, response) {
							 
						var InitialLoadDate = oData.results[0].InitialLoadDate === null ? '': oData.results[0].InitialLoadDate;
						var LastLoadDate = oData.results[0].LastLoadDate === null ? '': oData.results[0].LastLoadDate;
						var Activated = oData.results[0].Activated == 'X' ? true : false;;
						
					 	_this.getView().byId("exporteventform").setVisible(true);
						_this.byId("INPInitLoad").setValue(InitialLoadDate);
						_this.byId("TXLastLoadDate").setText(LastLoadDate);
						_this.byId("TXActivated").setSelected(Activated);
						_this.byId("TXRealm").setText(RealmID);
						_this.byId("TXEventName").setText(EventName);
						_this.byId("TXProcess").setText(Process);
						_this.getView().byId("saveevent").setVisible(true);

							},
							error : function(oError) {
								alert("Failure");
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