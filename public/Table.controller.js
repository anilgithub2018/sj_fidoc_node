sap.ui.define([
	'jquery.sap.global', './Formatter', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast'
], function(jQuery, Formatter, Controller, JSONModel, MessageToast) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableEditable.Table", {

		onInit: function(evt) {

			var that = this;
			var vhostname = location.hostname;
			if ( vhostname.indexOf('localhost') !== -1 )
				this.service_url = "http://localhost:3000" ;
			else
				this.service_url = "https://stdtest2-217119.appspot.com" ;

			this.readUserList();
            
			this.oTable = this.byId("idProductsTable");
			this.oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));		
			this.getView().setModel(this.oModel);

			this.oEditableTemplate = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Input({
						value: "{oModelUser>username}"
					}), new sap.m.Input({
						value: "{oModelUser>role}"
					}), new sap.m.Input({
						value: "{oModelUser>email}"
					})
				]
			});
		},

		readUserList: function(){

			var that = this;

			var vServiceEndpoint = this.service_url + "/user/Users";
            var aData = jQuery.ajax({
                type : "GET",
                contentType : "application/json",
                url : vServiceEndpoint,
				dataType : "json",
				beforeSend: function(xhr) {
					// xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(jqXHR)
				},				
                success : function(data,textStatus, jqXHR) {

					that.oModelUser = new sap.ui.model.json.JSONModel();
					var UserCollection = {};

					UserCollection.Users = data.sort(function(a, b) {
						if(!b.username) return 0;
						var nameA = a.username.toUpperCase(); // ignore upper and lowercase
						var nameB = b.username.toUpperCase(); // ignore upper and lowercase
						if (nameA < nameB) {
						  return -1;
						}
						if (nameA > nameB) {
						  return 1;
						}
					  
						// names must be equal
						return 0;
					  });
					  
					// UserCollection.Users = data;
					that.oModelUser.setData(UserCollection); 
					that.getView().setModel( that.oModelUser, "oModelUser");

					that.oTable = that.byId("idProductsTable");
					that.oReadOnlyTemplate = that.byId("idProductsTable").removeItem(0);
					that.rebindTable(that.oReadOnlyTemplate, "Navigation");
		
					console.log("success to users get");	
                }

            });
		},

		rebindTable: function(oTemplate, sKeyboardMode) {
			this.oTable.bindItems({
				path: "oModelUser>/Users",
				template: oTemplate ,
				key: "username"
			}).setKeyboardMode(sKeyboardMode);
		},

		onEdit: function() {
			this.aProductCollection = jQuery.extend(true, [], this.oModel.getProperty("/ProductCollection"));
			this.byId("editButton").setVisible(false);
			this.byId("saveButton").setVisible(true);
			this.byId("cancelButton").setVisible(true);
			this.rebindTable(this.oEditableTemplate, "Edit");
		},

		onSave: function() {
			this.byId("saveButton").setVisible(false);
			this.byId("cancelButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
		},

		onCancel: function() {
			this.byId("cancelButton").setVisible(false);
			this.byId("saveButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.oModel.setProperty("/ProductCollection", this.aProductCollection);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
		},

		onAdd: function() {

			if (!this._oAddDialog) {
				this._oAddDialog = sap.ui.xmlfragment("addDialog", "com.myapp.addUser", this);
				this.getView().addDependent(this._oAddDialog);
			}

			this.oModelUserEntry = new sap.ui.model.json.JSONModel(
				JSON.parse('{"username" :"e", "email" : "" , "role" : "" }')
			);
			this.getView().setModel(this.oModelUserEntry , "oModelUserEntry");
			this._oAddDialog.setModel(this.oModelUserEntry , "oModelUserEntry");
			this.getView().getModel("oModelUserEntry").updateBindings();
			this._oAddDialog.open();
		},

		onActionUserSave: function() {
			debugger;

			var that = this;
			that.vUserData = JSON.stringify( this.getView().getModel("oModelUserEntry").getData() );
			
			var vServiceEndpoint = this.service_url + "/user/tenant/add";

			var aData = jQuery.ajax({
                type : "POST",
                contentType : "application/json; charset=utf-8",
				url : vServiceEndpoint,
				data : that.vUserData ,
				dataType : "json",
				beforeSend: function(xhr) {
					// xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(jqXHR)
				},				
                success : function(data,textStatus, jqXHR) {

					console.log("User Saved Successfully");	
					MessageToast.show("User Saved Successfully");

					that.readUserList();

                }

            });

			this._oAddDialog.close();
		},

		onActionCancel: function() {
			this._oAddDialog.close();
		},

		onOrder: function() {
			MessageToast.show("Order button pressed");
		},

		onExit: function() {
			this.aProductCollection = [];
			this.oEditableTemplate.destroy();
			this.oModel.destroy();
		}
	});

	return TableController;

});
