//@ts-nocheck
sap.ui.define([
	"./BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter",
	"sap/ui/core/format/DateFormat",
	"sap/ui/table/library"
],

	function (BaseController, Filter, FilterOperator,FilterType,Sorter,DateFormat,library) {
		"use strict";

		var SortOrder = library.SortOrder;

		return BaseController.extend("com.sap.pgp.dev.ItkApp.controller.Transactions", {



			onInit: function () {
				var oDataModel = this.getOwnerComponent().getModel("ItkMo");
				
				var EndDate = Math.floor(Date.now() / 1000);
				const now = new Date();
				const prevdate = new Date(now);
				prevdate.setDate(now.getDate() - 30);
				const StartDate = Math.floor(prevdate.getTime() / 1000);
				
				var oFilter = new sap.ui.model.Filter( {
					path: "TransactionDate",
					operator: sap.ui.model.FilterOperator.BT,
					value1: StartDate,
					value2: EndDate
				}
				)
                var _this = this;
				  oDataModel.read("/EventLogs", {
					filters: [oFilter],
					success: function(oData, response) {

						for (var i in oData.results) {
							let epochdate = oData.results[i].TransactionDate;

							const date = new Date(epochdate * 1000);
							const year = date.getFullYear();
							const month = String(date.getMonth() + 1).padStart(2, '0');
							const day = String(date.getDate()).padStart(2, '0');
							const hours = String(date.getHours()).padStart(2, '0');
							const minutes = String(date.getMinutes()).padStart(2, '0');
							const seconds = String(date.getSeconds()).padStart(2, '0');
						  
							let displaydate =  `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

							
							oData.results[i].txdate = displaydate;

						  }
						  var oModel = new sap.ui.model.json.JSONModel();
						  _this.getView().setModel(oModel,"TransactionModel");
						  oModel.setData(oData);

							//   var oModel = new sap.ui.model.json.JSONModel();
							//   _this.getView().setModel(oModel,"TransactionModel");
							//   oModel.setData(oData);

															
								   },
								error : function(oError) {
									//no entries available.. new insert
					
								} 
						});


			},

			filterGlobally: function(oEvent) {
				var sQuery = oEvent.getParameter("query");
				this._oGlobalFilter = null;
	
				if (sQuery) {
					this._oGlobalFilter = new Filter([
						new Filter("EventName", FilterOperator.Contains, sQuery),
						new Filter("TransactionDate", FilterOperator.Contains, sQuery),
						new Filter("Status", FilterOperator.Contains, sQuery)
					], false);
				}
	
				this._filter();
			},

			_filter: function() {
				var oFilter = null;
    			oFilter = this._oGlobalFilter;
 				this.byId("realmtable").getBinding().filter(oFilter, "Application");
			},

			onSort : function () {
				var oView = this.getView(),
					aStates = [undefined, "asc", "desc"],
					aStateTextIds = ["sortNone", "sortAscending", "sortDescending"],
					sMessage,
					iOrder = oView.getModel("TransactionModel").getProperty("/results");
	
				iOrder = (iOrder + 1) % aStates.length;
				var sOrder = aStates[iOrder];
	
				oView.getModel("TransactionModel").setProperty("/results", iOrder);
				oView.byId("peopleList").getBinding("items").sort(sOrder && new Sorter("LastName", sOrder === "desc"));
	
				sMessage = this._getText("sortMessage", [this._getText(aStateTextIds[iOrder])]);
				MessageToast.show(sMessage);
				},
				clearAllSortings: function(oEvent) {
					var oTable = this.byId("realmtable");
					oTable.getBinding().sort(null);
					this._resetSortingState();
				},

				_resetSortingState: function() {
					var oTable = this.byId("realmtable");
					var aColumns = oTable.getColumns();
					for (var i = 0; i < aColumns.length; i++) {
						aColumns[i].setSorted(false);
					}
				},

				sorttransactionDate: function(oEvent) {
					var oCurrentColumn = oEvent.getParameter("column");
					var oDeliveryDateColumn = this.byId("txdate");
					if (oCurrentColumn != oDeliveryDateColumn) {
						oDeliveryDateColumn.setSorted(false); //No multi-column sorting
						return;
					}
		
					oEvent.preventDefault();
		
					var sOrder = oEvent.getParameter("sortOrder");
					var oDateFormat = DateFormat.getDateInstance({pattern: "YYYY-MM-DD HH:MM:SS"});
		
					this._resetSortingState(); //No multi-column sorting
					oDeliveryDateColumn.setSorted(true);
					oDeliveryDateColumn.setSortOrder(sOrder);
		
					var oSorter = new Sorter(oDeliveryDateColumn.getSortProperty(), sOrder === SortOrder.Descending);
					//The date data in the JSON model is string based. For a proper sorting the compare function needs to be customized.
					oSorter.fnCompare = function(a, b) {
						if (b == null) {
							return -1;
						}
						if (a == null) {
							return 1;
						}
		
						// var aa = oDateFormat.parse(a).getTime();
						// var bb = oDateFormat.parse(b).getTime();

						var aa = new Date(a*1000);
						var bb = new Date(b*1000);


						if (aa < bb) {
							return -1;
						}
						if (aa > bb) {
							return 1;
						}
						return 0;
					};
		
					this.byId("realmtable").getBinding().sort(oSorter);
				}

		});

	});