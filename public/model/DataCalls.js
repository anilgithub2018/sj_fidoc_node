sap.ui.define([
		"sap/ui/base/Object",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"zstd/zstd_log/controller/ErrorHandler",
		"zstd/zstd_log/model/formatter",
		"sap/ui/core/util/Export",
		"sap/ui/core/util/ExportTypeCSV"		
	], function (Object, JSONModel, Filter, FilterOperator, ErrorHandler,formatter,Export,ExportTypeCSV) {
		// "use strict";

		return Object.extend("zstd.zstd_log.model.ODataCalls", {
			
			formatter: formatter,
			
			constructor: function(oModel, oViewModel, oComponent, oResourceBundle) {
				
				
				//make oDataCalls
				// this._oDataModel = new sap.ui.model.odata.ODataModel(oModel.sServiceUrl, true);
				// this._oDataModel.setSizeLimit(10000);
				this.service_url = "https://sjfidoc-dot-stdtest2-217119.appspot.com";
				this._oDataModel = new JSONModel();
				
				//adjust view for busy indicator
				this._oViewModel = oViewModel;
		
				//container to store result of oData Call		
				this._oLocalJsonMdl = new JSONModel();
				this._oLocalJsonMdl.setSizeLimit(10000);
				this._oLocalJsonMdl.setDefaultBindingMode("TwoWay");

				this._oDataResults = {};
				this._oDataResults.Login = {};
				this._oDataResults.Login = oModel.getData();
	
				//to raise events that will be listened by other controllers
				this.eventBus = oComponent.getEventBus();
				
				this._oComponent = oComponent;
				
				//get the language dependent texts
				this.oResourceBundle = oResourceBundle;
				
				//errorHandler modified to give more detailed errors
				this._oErrorHandler1 = new ErrorHandler(oComponent, oResourceBundle, this._oDataModel);

				this.oGlobalBusyDialog = new sap.m.BusyDialog({"title":"","text":"Processing request..","showCancelButton":true});

				var sPath = jQuery.sap.getModulePath("zstd.zstd_log", "/model/mandatoryLogin.json");
				this.oMandatoryLogin = new JSONModel(sPath).attachRequestCompleted({},function(oEvent1) { oEvent1.getSource().getData(); },null);
				this._oComponent.setModel(this.oMandatoryLogin, "mandatoryLogin");

				var sPath1 = jQuery.sap.getModulePath("zstd.zstd_log", "/model/mandatorySignup.json");
				this.oMandatorySignup = new JSONModel(sPath1).attachRequestCompleted({},function(oEvent1) { oEvent1.getSource().getData(); },null);
				this._oComponent.setModel(this.oMandatorySignup, "mandatorySignup");

				var sPath2 = jQuery.sap.getModulePath("zstd.zstd_log", "/model/mandatoryResetPassword.json");
				this.oMandatoryResetPassword = new JSONModel(sPath2).attachRequestCompleted({},function(oEvent1) { oEvent1.getSource().getData(); },null);
				this._oComponent.setModel(this.oMandatoryResetPassword, "mandatoryResetPassword");

			},

			
			getJsonModel: function(){
				return this._oLocalJsonMdl;	
			},
			
		readFileList: function(){
		
			var that = this;

				if(location.hostname.indexOf('hana') !== -1 )
					this.service_url = 'http://localhost:3000';
			
			this.oGlobalBusyDialog.open();
			
			var vServiceEndpoint = this.service_url + "/fileService/getFileList";
            var aData = jQuery.ajax({
                type : "GET",
                crossDomain:true,
                contentType : "application/json; charset=utf-8",
                url : vServiceEndpoint,
				dataType : "json",
				beforeSend: function(xhr) {
					// xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(jqXHR)
					that.oGlobalBusyDialog.close();
				},				
                success : function(data,textStatus, jqXHR) {

					that.oGlobalBusyDialog.close();

					that.oModelFileList = new sap.ui.model.json.JSONModel();
					var fileList = {};

					fileList.files = data;
					  
					// UserCollection.Users = data;
					that.oModelFileList.setData(fileList); 
					that._oComponent.setModel( that.oModelFileList, "oModelFileList");
					that._oComponent.getModel("oModelFileList").updateBindings();
                }

            });
		},

		readRecTypes: function(){
		
			var that = this;

			if(location.hostname.indexOf('hana') !== -1 )
				this.service_url = 'http://localhost:3000';
					
			var vServiceEndpoint = this.service_url + "/recType/getList";
            var aData = jQuery.ajax({
                type : "GET",
                crossDomain:true,
                contentType : "application/json; charset=utf-8",
                url : vServiceEndpoint,
				dataType : "json",
				beforeSend: function(xhr) {
					// xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
				},
				error: function (jqXHR, textStatus, errorThrown) {
					// console.log(jqXHR)
				},				
                success : function(data,textStatus, jqXHR) {

					that.oModelRecTypes = new sap.ui.model.json.JSONModel();
					var RecTypes = {};

					// RecTypes.recType = data;

					RecTypes.recType = data.sort(function(a, b) {
						if(!b.seqNo) return 0;
						var nameA = a.seqNo.toUpperCase(); // ignore upper and lowercase
						var nameB = b.seqNo.toUpperCase(); // ignore upper and lowercase
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
					that.oModelRecTypes.setData(RecTypes); 
					that._oComponent.setModel( that.oModelRecTypes, "oModelRecTypes");
					that._oComponent.getModel("oModelRecTypes").updateBindings();

					that.filterFields("0");
					// that.oTable = that.byId("idProductsTable");
					// that.oReadOnlyTemplate = that.byId("idProductsTable").removeItem(0);
					// that.rebindTable(that.oReadOnlyTemplate, "Navigation");
		
					// console.log("success RecTypes");	
                }

            });
		},
		
		addType: function(oEvent){

			var vrecType = this.oModelRecTypes.getData();
			vrecType.recType.push({recDesc: "", recType: ""});
			this.oModelRecTypes.setData(vrecType);
			this._oComponent.getModel("oModelRecTypes").updateBindings();
		},
		
		filterFields: function(typeSelectedRowIndex){

			if(typeSelectedRowIndex){
				var vrecType = this.oModelRecTypes.getData();
				this.readRecFields(vrecType.recType[typeSelectedRowIndex]);
			}
		},
		
		processFile: function(SelectedRowIndex){
			if(SelectedRowIndex){
				var vFileList = this.oModelFileList.getData();
				var vSelectedFile =  vFileList.files[SelectedRowIndex].fileName;

				if(vSelectedFile){

					var that = this;
		
					if(location.hostname.indexOf('hana') !== -1 )
						this.service_url = 'http://localhost:3000';
							
					var vServiceEndpoint = this.service_url + "/fileService/fileRead?filename=" + vSelectedFile;
		            var aData = jQuery.ajax({
		                type : "GET",
		                crossDomain:true,
		                contentType : "application/json; charset=utf-8",
		                url : vServiceEndpoint,
						dataType : "json",
						beforeSend: function(xhr) {
							// xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
						},
						error: function (jqXHR, textStatus, errorThrown) {
							// console.log(jqXHR)
						},				
		                success : function(data, textStatus, jqXHR) {
		
							that.oModelFileData = new sap.ui.model.json.JSONModel();
							var fileData = {};
		
							fileData.records = data;
							fileData.SelectedFile = vSelectedFile;
							 
							var fieldHeaders = [];
							for( var colName in fileData.records[0]){
								fieldHeaders.push(fileData.records[0][colName]);
							}

							that._oComponent.getRouter().navTo("ProcessDoc",{},false);	

							fileData.colName = fieldHeaders;
							fileData.records.splice(0,1);  //remove header

							// UserCollection.Users = data;
							that.fileData = fileData;
							
							that.oModelFileData.setData(fileData); 
							that._oComponent.setModel( that.oModelFileData, "oModelFileData");
							that._oComponent.getModel("oModelFileData").updateBindings();

							that.readRecFieldsAll();
						
		                }
		
		            });

				}
			}
		},		

		onPostDocument: function(oEvent, mode){

//			var oModelrecFieldsData =  this._oComponent.getModel("oModelrecFields").getData();
			var that = this;

			if(location.hostname.indexOf('hana') !== -1 )
				this.service_url = 'http://localhost:3000';

			var deepData = {};
			deepData.data = that.processRec;
			deepData.mode = mode;
			
			var vMappedData = JSON.stringify(deepData);
			that.processLog = [];
				debugger;
			var vServiceEndpoint = this.service_url + "/fiDoc/fiDoc";
            var aData = jQuery.ajax({
                type : "POST",
                crossDomain:true,
                contentType : "application/json; charset=utf-8",
                url : vServiceEndpoint,
				dataType : "json",
				data : vMappedData,
				beforeSend: function(xhr) {
					// xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
				},
				error: function (jqXHR, textStatus, errorThrown) {
					// console.log(jqXHR)
				},				
                success : function(data,textStatus, jqXHR) {
					that.processLog = data;

					var vMapData = that._oComponent.getModel("oModelMappedData").getData();
					vMapData.processLog = that.processLog;
					that._oComponent.getModel("oModelMappedData").setData("oModelMappedData", vMapData);
					that._oComponent.getModel("oModelMappedData").updateBindings();
                }

            });
		},


		readRecFieldsAll: function(){

			var that = this;
			
			var vServiceEndpoint = this.service_url + "/recFields/getList";
            var aData = jQuery.ajax({
                type : "GET",
                crossDomain:true,
                contentType : "application/json; charset=utf-8",
                url : vServiceEndpoint,
				dataType : "json",
				beforeSend: function(xhr) {
					// xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
				},
				error: function (jqXHR, textStatus, errorThrown) {
					// console.log(jqXHR)
				},				
                success : function(data,textStatus, jqXHR) {

					that.oModelrecFieldsAll = [];
					var recFields = {};
					recFields.recFields = data;

					recFields.recFields = recFields.recFields.sort(function(a, b) {
						if(!b.seqNo) return 0;
						var nameA = parseFloat(a.seqNo); // ignore upper and lowercase
						var nameB = parseFloat(b.seqNo); // ignore upper and lowercase
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
					that.oModelrecFieldsAll = recFields ;
					that.processRec = [];

				that.fileData.records.forEach(function(lsfileData, index, array){
					var recType = parseFloat(lsfileData[0],0);
					var recStructure = {};
					
					that.oModelrecFieldsAll.recFields.forEach(function(lsrecFields, rindex, rarray){
						if( parseFloat(lsrecFields.recType,0) === recType ){
							lsrecFields.fldName = lsrecFields.fldName.replace(/\s/g,"");
							recStructure[lsrecFields.fldName] = lsfileData[(lsrecFields.seqNo - 1)];
						}
					});
					
					that.processRec.push(recStructure);
			
				});					

//prepare file display - copy array
				that.fileWithAllFields =  JSON.parse(JSON.stringify(that.processRec)); 

				that.fileWithAllFields.forEach(function(lsProcessRec, rindexPR, rarrayPR){
					
					that.oModelrecFieldsAll.recFields.forEach(function(lsrecFields, rindex, rarray){
						if( lsProcessRec[lsrecFields.fldName] ){ //if field found then do nothing
						} else {
							lsProcessRec[lsrecFields.fldName] = "";
						}
						
					});
				});
					
				var contextStringify = JSON.stringify(that.processRec, null, "\t");
				var map = {};
				map.JsonString = contextStringify;
				map.fileWithAllFields = that.fileWithAllFields;
				map.recFields = that.oModelrecFieldsAll.recFields;

				map.recFields = map.recFields.sort(function(a, b) {
					if(!b.fldName) return 0;
					var nameA = a.fldName; // ignore upper and lowercase
					var nameB = b.fldName; // ignore upper and lowercase
					if (nameA < nameB) {
					  return -1;
					}
					if (nameA > nameB) {
					  return 1;
					}
					// names must be equal
					return 0;
				  });

				
				that.oModelMappedData = new sap.ui.model.json.JSONModel();
				that.oModelMappedData.setData(map); 
				that._oComponent.setModel( that.oModelMappedData, "oModelMappedData");
				that._oComponent.getModel("oModelMappedData").updateBindings();
					// console.log("success RecTypes");	
                }

            });
            
		},

		readRecFields: function(selectedRecordType){
		
			var recType = selectedRecordType.recType;
			this.selectedRecordType = selectedRecordType;
			
			var that = this;

			if(location.hostname.indexOf('hana') !== -1 )
				this.service_url = 'http://localhost:3000';

			var sPath = jQuery.sap.getModulePath("zstd.zstd_log", "/model/dropdownFields.json");
			this.oModelDropdownFields = new JSONModel(sPath).attachRequestCompleted({},function(oEvent1) { 
				var ddData = this.getData(); 
				var filter = "recType";
				var filterValue = that.selectedRecordType.recType;
				var filteredArray = ddData.fields.filter(function(lsArray) {
								    return lsArray[filter] === filterValue;
				});				

				ddData.fields = filteredArray;
				that._oComponent.getModel("oModelDropdownFields").setData(ddData);
				that._oComponent.getModel("oModelDropdownFields").updateBindings();
				
			},null);
			this._oComponent.setModel(this.oModelDropdownFields, "oModelDropdownFields");
					
			var vServiceEndpoint = this.service_url + "/recFields/getList";
            var aData = jQuery.ajax({
                type : "GET",
                crossDomain:true,
                contentType : "application/json; charset=utf-8",
                url : vServiceEndpoint,
				dataType : "json",
				beforeSend: function(xhr) {
					// xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
				},
				error: function (jqXHR, textStatus, errorThrown) {
					// console.log(jqXHR)
				},				
                success : function(data,textStatus, jqXHR) {

					that.oModelrecFields = new sap.ui.model.json.JSONModel();
					var recFields = {};
					recFields.recFields = [];

					$.each(data, function(sytabix,ls_data){
						if( ls_data.recType === recType){
							recFields.recFields.push(ls_data);
						}
					});

					recFields.recFields = recFields.recFields.sort(function(a, b) {
						if(!b.seqNo) return 0;
						var nameA = parseFloat(a.seqNo); // ignore upper and lowercase
						var nameB = parseFloat(b.seqNo); // ignore upper and lowercase
						if (nameA < nameB) {
						  return -1;
						}
						if (nameA > nameB) {
						  return 1;
						}
					  
						// names must be equal
						return 0;
					  });

					// recFields.recFields = data;
					recFields.selectedRecordType = selectedRecordType;
					that.selectedRecordType = selectedRecordType;
					// UserCollection.Users = data;
					that.oModelrecFields.setData(recFields); 
					that._oComponent.setModel( that.oModelrecFields, "oModelrecFields");
					that._oComponent.getModel("oModelrecFields").updateBindings();

					// console.log("success RecTypes");	
                }

            });
            
		},


		addField: function(oEvent){
			var vrecField = this.oModelrecFields.getData();
			vrecField.recFields.push({fldName: "", recType: this.selectedRecordType.recType , seqNo: ""});
			this.oModelrecFields.setData(vrecField);
			this._oComponent.getModel("oModelrecFields").updateBindings();
		},

		onSaveMapping: function(oEvent){

			var oModelrecFieldsData =  this._oComponent.getModel("oModelrecFields").getData();
			var that = this;

			if(location.hostname.indexOf('hana') !== -1 )
				this.service_url = 'http://localhost:3000';
				
			var vServiceEndpoint = this.service_url + "/recFields/add";
            var aData = jQuery.ajax({
                type : "POST",
                crossDomain:true,
                contentType : "application/json; charset=utf-8",
                url : vServiceEndpoint,
				dataType : "json",
				data : JSON.stringify(oModelrecFieldsData),
				beforeSend: function(xhr) {
					// xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
				},
				error: function (jqXHR, textStatus, errorThrown) {
					// console.log(jqXHR)
				},				
                success : function(data,textStatus, jqXHR) {
					that.readRecFields(that.selectedRecordType);
                }

            });
			
		},



		readUserList: function(){
			var that = this;

				// if(location.hostname.indexOf('hana') !== -1 )
				// 	this.service_url = 'http://localhost:3000';
					
			var vServiceEndpoint = this.service_url + "/user/Users";
            var aData = jQuery.ajax({
                type : "GET",
                crossDomain:true,
                contentType : "application/json; charset=utf-8",
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
					that._oComponent.setModel( that.oModelUser, "oModelUser");
					that._oComponent.getModel("oModelUser").updateBindings();

					// that.oTable = that.byId("idProductsTable");
					// that.oReadOnlyTemplate = that.byId("idProductsTable").removeItem(0);
					// that.rebindTable(that.oReadOnlyTemplate, "Navigation");
		
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

			
			readEntitySet: function(vEntitySetName){
//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity

// this._oLocalJsonMdl;	
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){

							this._oDataResults.CampaignSet = oMainPromisResult.results;
							// this._oDataResults.CampaignBrandsSet = oMainPromisResult.CampaignBrandsSet.results;
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);
					}.bind(this)
				);
				
				var oExpandEntities = [
					"$expand=CampaignDetails"
				];
				
			//  this.showBusyIndicator(true);

				
				// var keyValue = 3000136081;
				// if( this._oLocalJsonMdl.getData() ) {
				// 	if ( this._oLocalJsonMdl.getData().Kunag ) {
				// 		keyValue = this._oLocalJsonMdl.getData().Kunag;
				// 	}
				// }
				// vEntitySetName = vEntitySetName + "('" + keyValue + "')";

				if(!this._oDataResults.DatabChar) { this._oDataResults.DatabChar = "" ; }
				if(!this._oDataResults.DatbiChar) { this._oDataResults.DatbiChar = "" ; }
				
				vEntitySetName = vEntitySetName + "?$filter=DatabChar eq '" + this._oDataResults.DatabChar
							+ "' and DatbiChar eq '" + this._oDataResults.DatbiChar + "'" ;
				this.clearJsonModel();				
// BrandMaterialSet?$skip=0&$top=20&$orderby=Brand%20asc
				this._oDataModel.read("/" + vEntitySetName ,
					{
						urlParameters: oExpandEntities,
						success: function(response) {
							this.oFetchMainDeferred.resolve(response);
						}.bind(this),
						error: function(oError) {
							this.oFetchMainDeferred.reject();
							this._oErrorHandler1._showServiceError(oError.response.body);
							this.showBusyIndicator(false);
							this.oGlobalBusyDialog.close();							
						}.bind(this)
					}
				);
					
			},
			


			readSingleEntity: function(vEntitySetName, vCampID){
//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity

// this._oLocalJsonMdl;	
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){
							this._oDataResults.Campaign = oMainPromisResult;
							//validation did not work during create
							if ( this._oDataResults.Campaign.DatabChar === "00000000" ) {
								this._oDataResults.Campaign.DatabChar = ""; }
							if ( this._oDataResults.Campaign.DatbiChar === "00000000" ) {
								this._oDataResults.Campaign.DatbiChar = ""; }
								
							this._oDataResults.Campaign.CampaignDetails = oMainPromisResult.CampaignDetails.results;
							this._oDataResults.Campaign.PartnerList     = oMainPromisResult.PartnerList.results;

							//prepare unique list of brands
							this._oDataResults.Campaign.Brands = [];
							//loop at Campaigns to find unique brands
							this._oDataResults.Campaign.CampaignDetails.forEach(function(item, index, array){

								var filter = "Brand";
								var keyword = item.Brand;
								
								var filteredArray = this._oDataResults.Campaign.Brands.filter(function(lsBrand) {
								    return lsBrand[filter] === keyword;
								});

								if(!filteredArray || filteredArray.length === 0){
									this._oDataResults.Campaign.Brands.push(item);
								}
								
							   }.bind(this)
							);
							
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);
					}.bind(this)
				);
				
				var oExpandEntities = [
					"$expand=CampaignDetails,PartnerList"
				];
				
			//  this.showBusyIndicator(true);

				vEntitySetName = vEntitySetName + "('" + vCampID + "')";
				
				// vEntitySetName = vEntitySetName + "?$filter=DatabChar eq '' and DatbiChar eq ''";
				// this.clearJsonModel();				
// BrandMaterialSet?$skip=0&$top=20&$orderby=Brand%20asc
				this._oDataModel.read("/" + vEntitySetName ,
					{
						urlParameters: oExpandEntities,
						success: function(response) {
							this.oFetchMainDeferred.resolve(response);
						}.bind(this),
						error: function(oError) {
							this.oFetchMainDeferred.reject();
							this._oErrorHandler1._showServiceError(oError.response.body);
							this.showBusyIndicator(false);
							this.oGlobalBusyDialog.close();							
						}.bind(this)
					}
				);

//get brand dropdown list				
				this.fetchBrands();
				this.fetchBrandMaterials();
				
			},
			
			saveDeepEntity: function(){

				this.validateData();
				if( this.validationError === true ){
					this.refreshUIScreen();
					return false;
				}

				var requestData    = this._oLocalJsonMdl.getData();
				var deepEntityData = {};

				//get first level structure from json model
				for (var property in requestData.Campaign) {
				   //console.log(`key= ${property} value = ${requestData[property]}  `);
				   if(typeof requestData[property] === "object"){
				   } else {
				   	  deepEntityData[property] = requestData.Campaign[property];
				   }
				}

				//add deep entity dependent tables
				deepEntityData.CampaignDetails = requestData.Campaign.CampaignDetails ;
				deepEntityData.PartnerList = requestData.Campaign.PartnerList ;

				$.each(deepEntityData.CampaignDetails, function(sytabix,lsCampaignDetails){
					var filter = "Brand";
					var keyword = lsCampaignDetails.Brand;

					var filteredArray = this._oDataResults.Campaign.Brands.filter(function(item) {
					    return item[filter] == keyword;
					});
					if(filteredArray && filteredArray.length > 0){
						lsCampaignDetails.MinDisc = filteredArray[0].MinDisc;
						lsCampaignDetails.MaxDisc = filteredArray[0].MaxDisc;						
					}
					if( lsCampaignDetails.NewInd === true ){
						lsCampaignDetails.NewInd = "";
					}
				}.bind(this));


				//convert space to zero otherwise oData dumps
				var CampaignBrandEntity = this._oDataModel.getServiceMetadata().dataServices.schema[0].entityType[1].property;
				
				deepEntityData.CampaignDetails.forEach(function(item, index, array){
					for (var fname in item) {
						for( var fieldname in CampaignBrandEntity){
							if(CampaignBrandEntity[fieldname].name === fname && item[CampaignBrandEntity[fieldname].name] === "" ){
								if ( CampaignBrandEntity[fieldname].type === "Edm.Decimal" ){
									item[CampaignBrandEntity[fieldname].name] = "0";
								}
							}
						}
					}
				});
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				this._oDataModel.create("/CampaignSet", deepEntityData, {
					success: function(oResponse) {

						this._oDataResults.Campaign = oResponse;
						this._oDataResults.Campaign.CampaignDetails = oResponse.CampaignDetails.results;
						this._oDataResults.Campaign.PartnerList     = oResponse.PartnerList.results;

						//prepare unique list of brands
						this._oDataResults.Campaign.Brands = [];
						//loop at Campaigns to find unique brands
						this._oDataResults.Campaign.CampaignDetails.forEach(function(item, index, array){

							var filter = "Brand";
							var keyword = item.Brand;
							
							var filteredArray = this._oDataResults.Campaign.Brands.filter(function(lsBrand) {
							    return lsBrand[filter] === keyword;
							});

							if(!filteredArray || filteredArray.length === 0){
								this._oDataResults.Campaign.Brands.push(item);
							}
							
						   }.bind(this)
						);
							
						this.oGlobalBusyDialog.close();
						this.showMessage("Data Saved " + this._oDataResults.Campaign.CampId );
						this.refreshUIScreen();
						
					}.bind(this),
					error: function(oError) {
						this._oViewModel.setProperty("/busy", false);
						this.oGlobalBusyDialog.close();
						if (oError.response !== undefined) {
							this._oErrorHandler1._showServiceError(oError.response.body);
						} else {
							this._oErrorHandler1._showServiceError('Error in backend call');
						}

					}.bind(this)
				});
				
			},

			copyEntity: function(oEvent){
				this._oDataResults.Campaign.CampId = "";
				this.refreshUIScreen();
			},

			fetchBrands: function() {
				this._oDataModel.read("/BrandsSet", {
					success: function(oResponse) {
						this._oDataResults.Brands = oResponse.results;
						this._oDataResults.Brands.splice(0, 0, {"Brand":"", "Brandname":""});
						this.refreshUIScreen();
						return;
					}.bind(this),
					error: function(oError) {
						this._oViewModel.setProperty("/busy", false);
						this._oErrorHandler1._showServiceError(oError.response.body);
					}
				});
			},					


			fetchBrandMaterials: function() {
				this._oDataModel.read("/BrandMaterialSet", {
					success: function(oResponse) {
						this._oDataResults.BrandMaterials = oResponse.results;
						this.refreshUIScreen();
						return;
					}.bind(this),
					error: function(oError) {
						this._oViewModel.setProperty("/busy", false);
						this._oErrorHandler1._showServiceError(oError.response.body);
					}
				});
			},					

			
			// fetchDropDown: function(iZkey1, iZvalue, iPromisToResolve) {
			// 	var key1Filter = new Filter("Zkey", FilterOperator.EQ, iZkey1);
			// 	var key2Filter = new Filter("Zvalue", FilterOperator.EQ, iZvalue);
			// 	this._oDataModel.read("/BrandsSet", {
			// 		filters: [key1Filter, key2Filter],
			// 		success: function(oResponse) {
			// 			iPromisToResolve.resolve(oResponse.results);
			// 			return;
			// 		}.bind(this),
			// 		error: function(oError) {
			// 			this.oFetchMainDeferred.reject();
			// 			this._oViewModel.setProperty("/busy", false);
			// 			this._oErrorHandler1._showServiceError(oError.response.body);
			// 		}
			// 	});
			// },		
			
			// setProcessDD: function(ddDataProcess,oEvent){

			// 	this._oDataResults.ddProcess = ddDataProcess;
			// 	this.refreshUIScreen();
			// },
			
			refreshUIScreen: function(){
				this._oLocalJsonMdl.setData(this._oDataResults);
				this._oLocalJsonMdl.updateBindings();				
			},
			
			clearJsonModel: function(){
				var DatabChar = this._oDataResults.DatabChar;
				var DatbiChar = this._oDataResults.DatbiChar;
				
				this._oDataResults = {};  //link header data
				this._oDataResults.DatabChar = DatabChar;
				this._oDataResults.DatbiChar = DatbiChar;
				
				this.refreshUIScreen();

			},

		onDataExportBrandMaterialSet : function(oEvent) {
// https://help.sap.com/viewer/468a97775123488ab3345a0c48cadd8f/7.4.19/en-US/f1ee7a8b2102415bb0d34268046cd3ea.html
			var tModel = this._oLocalJsonMdl;
			var oExport = new Export({

				// Type that willmytype be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : ","
					
				}),

				// Pass in the model created above
				models : tModel,

				// binding information for the rows aggregation
				rows : {
					path : "/BrandMaterialSet/"
				},

				// column definitions with column name and binding info for the content
			
				columns: [{
					name: "Brand",
					template: {
						content: {
							path: "Brand"
						}
					}
				}, {
					name: "Matnr",
					template: {
						content: {
							path: "Matnr"
						}
					}
				}]
			});

			// download exported file
			oExport.saveFile("BrandMaterialSet").catch(function(oError) {
				return 'Error Downloading';
			}).then(function() {
				oExport.destroy();
			});
		},				

		AddCampaignBrand: function(oEvent){
			var i = 0;
			while ( i < 6) {
// New Array to append to JSON Model	
				var obj = {
					CampId:  "",
					Brand: "",
					Matnr: "",
					MinDisc:  "0",
					MaxDisc: "0",
					BrandErr:"None",
					MinDiscErr:"None",
					MaxDiscErr:"None",
					NewInd: true
				};
			
				this._oDataResults.Campaign.Brands.push(obj);
				i++;
			}
			this.refreshUIScreen();
		},

		AddCampaignDetails: function(oEvent){
			var i = 0;
			while ( i < 6) {
// New Array to append to JSON Model	
				var obj = {
					CampId:  "",
					Brand: "",
					Matnr: "",
					MinDisc:  "0",
					MaxDisc: "0",
					BrandErr:"None",
					MinDiscErr:"None",
					MaxDiscErr:"None",
					NewInd: true
				};
			
				this._oDataResults.Campaign.CampaignDetails.push(obj);
				i++;
			}
			this.refreshUIScreen();
		},

		AddAllBrands: function(oEvent){
			
//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity

//set busy indicator
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){
							// this._oDataResults.BrandMaterialSet = oMainPromisResult.results;
		//loop at all rows
							$.each(oMainPromisResult.results, function(sytabix,ls_BrandMaterialSet){
		//loop at all fields in a row


								var obj = {
									CampId:  "",
									Brand: ls_BrandMaterialSet.Brand,
									Matnr: ls_BrandMaterialSet.Matnr,
									Bezei: ls_BrandMaterialSet.Bezei,
									Maktx: ls_BrandMaterialSet.Maktx,
									MinDisc:  "0",
									MaxDisc: "0",
									BrandErr:"None",
									MinDiscErr:"None",
									MaxDiscErr:"None"
								};
								
								var filter = "Brand";
								var keyword = ls_BrandMaterialSet.Brand;

								var filteredArray = this._oDataResults.Campaign.CampaignDetails.filter(function(item) {
								    return item[filter] == keyword;
								});

								if(ls_BrandMaterialSet.Bezei !== ""){
									if(!filteredArray || filteredArray.length === 0){
										this._oDataResults.Campaign.Brands.push(obj);
									}
								}

							}.bind(this));
							
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);

					}.bind(this)
				);
				
				var oExpandEntities = [
					// "$expand=PgeneralToPPG04,PgeneralToPPG19PG20,PgeneralToPPG23BP,PgeneralToPPG23P"
				];
				

// BrandMaterialSet?$skip=0&$top=20&$orderby=Brand%20asc 
				this._oDataModel.read("/" + 'BrandMaterialSet' + "?$skip=0&$top=200", 
					{
						urlParameters: oExpandEntities,
						success: function(response) {
							this.oFetchMainDeferred.resolve(response);
						}.bind(this),
						error: function(oError) {
							this.oFetchMainDeferred.reject();
							this._oErrorHandler1._showServiceError(oError.response.body);
							this.showBusyIndicator(false);
						}.bind(this)
					}
				);			
		},		


		AddAllBrandMaterials: function(oEvent){

			if(this._oDataResults.BrandMaterials){
				// this._oDataResults.BrandMaterialSet = oMainPromisResult.results;
//loop at all rows
				$.each(this._oDataResults.BrandMaterials, function(sytabix,ls_BrandMaterialSet){
//loop at all fields in a row

					var obj = {
						CampId:  "",
						Brand: ls_BrandMaterialSet.Brand,
						Matnr: ls_BrandMaterialSet.Matnr,
						Bezei: ls_BrandMaterialSet.Bezei,
						Maktx: ls_BrandMaterialSet.Maktx,
						MinDisc:  "0",
						MaxDisc: "0",
						BrandErr:"None",
						MinDiscErr:"None",
						MaxDiscErr:"None"
					};
					
					//look for brand first
					var filter = "Brand";
					var keyword = ls_BrandMaterialSet.Brand;

					var filteredArray = this._oDataResults.Campaign.Brands.filter(function(item) {
					    return item[filter] === keyword;
					});
					
					if( filteredArray.length > 0 ){  //brand is included in campaign
					//look if material is not in already
						filter = "Matnr";
						keyword = ls_BrandMaterialSet.Matnr;
	
						filteredArray = this._oDataResults.Campaign.CampaignDetails.filter(function(item) {
						    return item[filter] === keyword;
						});
	
						if(ls_BrandMaterialSet.Bezei !== ""){
							if(!filteredArray || filteredArray.length === 0){
								this._oDataResults.Campaign.CampaignDetails.push(obj);
							}
						}
					}

				}.bind(this));
				
			}
			this.refreshUIScreen();
				
		},		
		
		AddAllPartners: function(oEvent){

//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){
		//loop at all rows
							$.each(oMainPromisResult.results, function(sytabix,ls_ZsdCampPartnerSet){
		//loop at all fields in a row
								var obj = {
									CampId:  this._oDataResults.Campaign.CampId,
									Kunag: ls_ZsdCampPartnerSet.Kunag,
									SoldtoName: ls_ZsdCampPartnerSet.Name1
								};
	
								var filter = "Kunag";
								var keyword = ls_ZsdCampPartnerSet.Kunag;
								
								var filteredArray = this._oDataResults.Campaign.PartnerList.filter(function(item) {
								    return item[filter] == keyword;
								});

								if(!filteredArray || filteredArray.length === 0){
									this._oDataResults.Campaign.PartnerList.push(obj);
								}

							}.bind(this));
							
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);
						
					}.bind(this)
				);
				
				var oExpandEntities = [
					// "$expand=PgeneralToPPG04,PgeneralToPPG19PG20,PgeneralToPPG23BP,PgeneralToPPG23P"
				];
				

// BrandMaterialSet?$skip=0&$top=20&$orderby=Brand%20asc 
				this._oDataModel.read("/" + 'ZsdCampPartnerSet' + "?$skip=0&$top=2000", 
					{
						urlParameters: oExpandEntities,
						success: function(response) {
							this.oFetchMainDeferred.resolve(response);
						}.bind(this),
						error: function(oError) {
							this.oFetchMainDeferred.reject();
							this._oErrorHandler1._showServiceError(oError.response.body);
							this.showBusyIndicator(false);
						}.bind(this)
					}
				);			
		},				
		
		DeleteCampaignDetails: function(selectedIndex){

			if(selectedIndex){
				this._oDataResults.Campaign.CampaignDetails.splice(selectedIndex, 1);
			}
		},

		DeleteCampaignBrand: function(selectedIndex){

			if(selectedIndex){
				var vDeletedBrand = this._oDataResults.Campaign.Brands.splice(selectedIndex, 1);

				var filter = "Brand";
				var keyword = vDeletedBrand[0].Brand;

				var filteredArray = this._oDataResults.Campaign.CampaignDetails.filter(function(item) {
				    return item[filter] !== keyword;
				});
				//set the matnr that are not deleted
				this._oDataResults.Campaign.CampaignDetails = filteredArray;
			}
		},
		
		AddPartnerList: function(oEvent){
			var i = 0;
			while ( i < 6) {
// New Array to append to JSON Model	
				var obj = {
					CampId:  this._oDataResults.Campaign.CampId,
					Kunag: ""
				};
			
				this._oDataResults.Campaign.PartnerList.push(obj);
				i++;
			}

			this.refreshUIScreen();
		},
		
		DeletePartnerList: function(selectedIndex){

			if(selectedIndex){
				this._oDataResults.Campaign.PartnerList.splice(selectedIndex, 1);
			}
		},

			showBusyIndicator: function(inOnOff){

				if( inOnOff === true || inOnOff === false){
					this._oViewModel.setProperty("/busy", inOnOff);
					this._oViewModel.updateBindings();
				}
				
			},

			readSearchHelp: function(searchHelpName, lSearchService, oFetchDeferred, vEntityProperty){

				var myresponse;
				var myodata;

				var oJsonModelSearchHelp = new sap.ui.model.json.JSONModel();
				var oDataModelSearchHelp = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZSD_CAMP_SRV", true );
				oDataModelSearchHelp.read("/DynamicSearchHelpSet?$filter= Tabname eq '" + searchHelpName + "'", null, null, false,
				function(response, oData) {
					oJsonModelSearchHelp.setData(jQuery.extend({}, response.results));
					myresponse = response;
					myodata = oData;
					if( oData != null )
					{
						this._oDataResults.searchHelp = [];
						this._oDataResults.searchHelpOutputCols = [];
						
						oData.data.results.forEach(function(item, index, array){
							if ( item.Outputstyle === '02' ){  //input
								this._oDataResults.searchHelp.push(item);
							}
							if ( item.Outputstyle === '01' ) {  //output

								var lFieldName = vEntityProperty.find(function(oField){
										if( item.Fieldname === oField.name.toUpperCase() ){
											return true;
										}
									}
							);	
							if(lFieldName)
								this._oDataResults.searchHelpOutputCols.push(item);
							}
						}.bind(this)
						);
						//this._oDataResults.searchHelp = oData.data.results;
						this._oDataResults.searchHelpName = searchHelpName;  //keep the sh name
						this._oDataResults.SearchService  = lSearchService;  //keep the sh service name
						this.refreshUIScreen();
						oFetchDeferred.resolve();	
					}
				}.bind(this),
				function(response) {
					oFetchDeferred.reject();
					jQuery.sap.log.getLogger().error("HelpUrl Data fetch failed" + response.toString());
				}.bind(this));
							
			},
			
			resetSearchHelp: function(){
				this._oDataResults.searchHelpResult = [];
			},
			
			showMessage: function(msg){
				sap.m.MessageToast.show(msg, {
				    duration: 3000                  // default
				    // width: "15em",                   // default
				    // my: "center bottom",             // default
				    // at: "center bottom",             // default
				    // of: window,                      // default
				    // offset: "0 0",                   // default
				    // collision: "fit fit",            // default
				    // onClose: null,                   // default
				    // autoClose: true,                 // default
				    // animationTimingFunction: "ease", // default
				    // animationDuration: 1000,         // default
				    // closeOnBrowserNavigation: true   // default
				});				
			},

			readSearchHelpResults: function(oFilter, lSearchHelpName, lSearchService){

				var myresponse;
				var myodata;
				var lEntitySetToCall;
				this.oGlobalBusyDialog.open();
				
				lEntitySetToCall = '/' + lSearchService + 'Set';
				var oJsonModelSearchHelpResult = new sap.ui.model.json.JSONModel();
				var oDataModelSearchHelpResult = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZSD_CAMP_SRV", true );
				oDataModelSearchHelpResult.read(lEntitySetToCall, {
					filters: oFilter,
					success: function(response, oData) {

								oJsonModelSearchHelpResult.setData(jQuery.extend({}, response.results));
								myresponse = response;
								myodata = oData;
								if( oData != null )
								{
									this._oDataResults.searchHelpResult = oData.data.results;
									this.refreshUIScreen();
								}
								
								this.oGlobalBusyDialog.close();
								
							}.bind(this),
					error: function(response) {
							jQuery.sap.log.getLogger().error("Data fetch failed" + response.toString());
							this.oGlobalBusyDialog.close();
						}.bind(this)
				});
							
			},
			
			dateCompareGreater: function( firstDate, SecondDate ){
				var fd = new Date( firstDate.slice(0,4), firstDate.slice(4,6), firstDate.slice(6,8));
				var sd = new Date( SecondDate.slice(0,4), SecondDate.slice(4,6), SecondDate.slice(6,8));
				if( fd > sd){
					return false;
				} else {
					return true;
				}
			},
			
			validateData: function(vMode, vReset){

				switch(vMode) {
				    case 'Login':
						this.oManFields = this._oComponent.getModel("mandatoryLogin").getData();        
				        break;
				    case 'SignUp':
						this.oManFields = this._oComponent.getModel("mandatorySignup").getData();        
				        break;
				    case 'ResetPassword':
						this.oManFields = this._oComponent.getModel("mandatoryResetPassword").getData();        
				        break;
				    default:
				    	break;
				}
				
				this.validationError = false;
			
				if(this.oManFields)
				{

					$.each( this.oManFields, function( key, value ) {
							this.oManFields[key] = 'None';

							if( !vReset ) { //in case of reset do not check anything
								if( this._oDataResults.Login[key] === "" || this._oDataResults.Login[key] === 0 )
								{
									this.oManFields[key] = 'Error';
									this.validationError = true;
								}
								
								if( key === "email" && this.validationError === false ){
									if ( !this.formatter.validEmail(this._oDataResults.Login[key])){
										this.oManFields[key] = 'Error';
										this.validationError = true;
									}     
								}
							}
							
					}.bind(this));

				}

				switch(vMode) {
				    case 'Login':
						this._oComponent.getModel("mandatoryLogin").setData(this.oManFields);
						this._oComponent.getModel("mandatoryLogin").updateBindings();
				        break;
				    case 'SignUp':
						this._oComponent.getModel("mandatorySignup").setData(this.oManFields);
						this._oComponent.getModel("mandatorySignup").updateBindings();
				        break;
				    case 'ResetPassword':
						this._oComponent.getModel("mandatoryResetPassword").setData(this.oManFields);
						this._oComponent.getModel("mandatoryResetPassword").updateBindings();
				        break;
				    default:
				    	break;
				}
				
	
				if(this.validationError === true){
					this.showMessage(this.oResourceBundle.getText("fillData"));
				}
				this.refreshUIScreen();	
			}

		}); //end of return

	}
);