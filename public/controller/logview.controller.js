sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";

	return Controller.extend("zstd.zstd_log.controller.logview", {
		onInit: function(evt) {
			
			this.OwnerComponent = this.getOwnerComponent();
			this.getView().setModel(this.OwnerComponent.getModel("oModelUserEntry") , "oModelUserEntry");
			
			this.OwnerComponent.getRouter().getRoute("Mapping").attachPatternMatched(this._onRouteMatchedMapping, this);
		},
		
		onMapFields: function(oEvent){
			this.OwnerComponent.getRouter().navTo("Mapping",{},false);			
		},

		_onRouteMatchedMapping: function(oEvent){
			// var vEmail = oEvent.getParameter("arguments").routeEmail;
		},
		
		onNavBack: function() {
			this.OwnerComponent.getRouter().navTo("Targetlogview", {});
		}		
		
	});
});