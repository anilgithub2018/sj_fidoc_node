//Factory Definition
sap.ui.define([
		'sap/m/ColumnListItem',
		'sap/m/MultiComboBox',
		'sap/m/DatePicker',
		'sap/m/TimePicker',
		"zstd/zstd_log/model/formatter"
	], function(ColumnListItem, MultiComboBox, DatePicker, TimePicker, formatter) {
		"use strict";

		var AttributeTableFactory = {
			formatter: formatter,
			factory: function(id, context) {

				var oLabelText = context.getProperty();

				var newColumn = new sap.m.Column({
					header: new sap.m.Label({
								text: oLabelText,
								wrapping:true
							}),
					width : "auto",
					demandPopin: true
				});
			
				return newColumn;
				
			}
		};

		return AttributeTableFactory;

	},
	/* bExport= */
	true);