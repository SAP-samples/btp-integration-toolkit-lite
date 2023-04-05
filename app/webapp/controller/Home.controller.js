sap.ui.define([
	'./BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'com/sap/pgp/dev/ItkApp/model/formatter',
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, Device, formatter,Fragment,MessageToast,Filter,FilterOperator) {
	"use strict";
	return BaseController.extend("com.sap.pgp.dev.ItkApp.controller.Home", {
		formatter: formatter,

		onInit: function () {
			var oViewModel = new JSONModel({
				isPhone : Device.system.phone
			});
			this.setModel(oViewModel, "view");
			// Device.media.attachHandler(function (oDevice) {
			// 	this.getModel("view").setProperty("/isPhone", oDevice.name === "Phone");
			// }.bind(this));

			this._oGlobalFilter = null;
			this._oPriceFilter = null;

		},

		filterGlobally : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("Name", FilterOperator.Contains, sQuery),
					new Filter("Category", FilterOperator.Contains, sQuery),
					new Filter("Location", FilterOperator.Contains, sQuery),
					new Filter("AssetID", FilterOperator.Contains, sQuery)
				], false);
			}

			this._filter();
		},

		_filter : function() {
			var oFilter = null;

			if (this._oGlobalFilter && this._oPriceFilter) {
				oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			} else if (this._oPriceFilter) {
				oFilter = this._oPriceFilter;
			}

			this.byId("assettable").getBinding().filter(oFilter, "Application");
		},
		onDetailsPress : function(oEvent) {
			// var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
			// 	supplierPath = oEvent.getSource().getBindingContext("products").getPath(),
			// 	supplier = supplierPath.split("/").slice(-1).pop();
			// 	supplier = supplier.substring(21, supplier.length - 2);

			// 	this.oRouter.navTo("InventoryDetailDetail", {layout: oNextUIState.layout, product: this._product, supplier: supplier});
			// // MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));

		//	var oItem= this.getView().byId("assettable").getSelectedItem();
		//	var oEntry = oItem.getBindingContext("products").getObject();
		    var selectedindex = this.getView().byId("assettable").getSelectedIndex();
			if ( selectedindex >= 0 )
			{
			// var productPath = oEvent.getSource().getBindingContext("assettable").getPath();
			// var oEntry = oEvent.getSource().getBindingContext("products").getObject();
			// var oItem= this.getView().byId("assettable");

			var oModel = this.getView().getModel("QuickViewAsset");
			this.openQuickView(oEvent, oModel);
			}
			else
			{
				MessageToast.show("Please selecte an Asset to see the Details");
			}

		},
		openQuickView: function (oEvent, oModel) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pQuickView) {
				this._pQuickView = Fragment.load({
					id: oView.getId(),
					name: "com.sap.pgp.dev.ItkApp.view.QuickViewDialog",
					controller: this
				}).then(function (oQuickView) {
					oView.addDependent(oQuickView);
					return oQuickView;
				});
			}
			this._pQuickView.then(function (oQuickView){
				oQuickView.setModel(oModel);
				oQuickView.openBy(oButton);
			});
		}

	});
});