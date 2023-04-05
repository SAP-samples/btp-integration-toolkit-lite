sap.ui.define([
	'com/sap/pgp/dev/ITKApp/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'com/sap/pgp/dev/AutoRFQApp/model/formatter'
], function (BaseController, JSONModel, formatter) {
	"use strict";
	return BaseController.extend("com.sap.pgp.dev.ITKApp.controller.settings.MasterSettings", {
		formatter: formatter,

		onInit: function () {
			var oViewModel = new JSONModel({
					currentUser: "Administrator",
					lastLogin: new Date(Date.now() - 86400000)
				});

			this.setModel(oViewModel, "view");
		},

		getBundleText: function(sI18nKey, aPlaceholderValues){
			return this.getBundleTextByModel(sI18nKey, this.getModel("i18n"), aPlaceholderValues);
		}
	});
});