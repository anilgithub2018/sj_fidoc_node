sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"zstd/zstd_log/factory/dynResult",
	"zstd/zstd_log/factory/dynColumn",
], function (Controller, History, dynResult, dynColumn) {
	"use strict";

	return Controller.extend("zstd.zstd_log.controller.logview", {
		onInit: function(evt) {
			
			this.OwnerComponent = this.getOwnerComponent();
			this.getView().setModel(this.OwnerComponent.getModel("oModelUserEntry") , "oModelUserEntry");
			
			this.OwnerComponent.getRouter().getRoute("Mapping").attachPatternMatched(this._onRouteMatchedMapping, this);
		},

		onTypeSelectionChange: function(oEvent){

			var vTable = oEvent.getSource();
			var selectedContext = vTable.getSelectedContexts();
			if (selectedContext.length <= 0) {
				return;
			}
			var selectedRow = selectedContext[0].sPath;
			var selectedRowIndex = selectedRow.substring(parseInt(selectedRow.lastIndexOf("/"), 10) + 1);
			this.OwnerComponent.ODataCallsObj.filterFields(selectedRowIndex);
		},
		
		onProcess: function(oEvent){
			var selectedRow = oEvent.getSource().getParent().getBindingContextPath("oModelFileList");
			var selectedRowIndex = selectedRow.substring(parseInt(selectedRow.lastIndexOf("/"), 10) + 1);
			this.OwnerComponent.ODataCallsObj.processFile(selectedRowIndex);
			

			
		},
		

		addType: function(oEvent){
			this.OwnerComponent.ODataCallsObj.addType(oEvent);
		},

		addField: function(oEvent){
			this.OwnerComponent.ODataCallsObj.addField(oEvent);
		},
		
		onMapFields: function(oEvent){
			this.OwnerComponent.getRouter().navTo("Mapping",{},false);			
		},

		onSaveMapping: function(oEvent){
			this.OwnerComponent.ODataCallsObj.onSaveMapping(oEvent);			
		},
	
		onSimulate: function(oEvent){
			this.OwnerComponent.ODataCallsObj.onPostDocument(oEvent);			
		},
	
		handleUploadPress: function(oEvent) {
			var oFileUploader = this.byId("fileUploader");
			if (!oFileUploader.getValue()) {
				sap.m.MessageToast.show("Choose a file first");
				return;
			}
			oFileUploader.upload();
		},
		
		_onRouteMatchedMapping: function(oEvent){
			// var vEmail = oEvent.getParameter("arguments").routeEmail;
		},
		
		onNavBack: function() {
			this.OwnerComponent.getRouter().navTo("Targetlogview", {});
		}		
		
	});
});