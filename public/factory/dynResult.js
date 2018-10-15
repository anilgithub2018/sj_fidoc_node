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

				var totColumns = Object.keys(context.getObject());
				var ColumnRef;
				var mycells = [];
				totColumns.sort();

				totColumns.map(function(resultColumn) {

					ColumnRef = "{oModelFileData>" + resultColumn + "}";
					
					mycells.push(
							new sap.m.Text({
								text: ColumnRef
							})						
						);
				});
				
				var oColList = new ColumnListItem({
									cells: mycells
				});
				
				return oColList;
				
			}
		};

		return AttributeTableFactory;

	},
	/* bExport= */
	true);