//@ts-nocheck
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/f/LayoutType",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
],

	function (BaseController, JSONModel, LayoutType, MessageBox, MessageToast) {
		"use strict";

		return BaseController.extend("com.sap.pgp.dev.ItkApp.controller.FTPRealm", {

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit: function () {
				this.setModel(new JSONModel({
					layout: LayoutType.OneColumn
				}), "RealmView");

				// this.getAccData();
			},

			
			onOpenCreateDialog: function (oEvent) {
				var oContext = this.getModel().createEntry("/Files", {
					properties: {},
					success: function (oData) {
						this.onCloseCreateDialog();
						MessageToast.show("Arquivo criado com sucesso");
					}.bind(this),
					error: function (oError) {
						MessageBox.error("Ocorreu um erro ao tentar criar um arquivo");
					}
				});

				this.openFragment("dev.vinibar.portal.settings.view.FilesCreate", {
					id: "idFilesCreateDialog",
					bindingPath: oContext.getPath()
				});
			},

			onNavBack: function () {
				history.go(-1);
			},


			showDetail: function (oEvent) {

    		    var RealmID = oEvent.getParameter("listItem").getBindingContext("ItkMo").getProperty("Realm");

				this.getRouter().navTo("FTPRealm", {
					objectId: RealmID
				});
			},

            onhandleEdit: function() {

				var oHostName = this.getView().byId("hostname").getValue();
				
			}
	
		});

	});