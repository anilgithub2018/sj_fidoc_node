sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";
	
return sap.ui.core.Control.extend("zstd.zstd_log.factory.ColorCircle", {      
                                              
    metadata : {                              
        properties : {
           	"value" : {type: "String", defaultValue: "I"},
			"size" : {type: "sap.ui.core.CSSSize", defaultValue: "20px"},			
			"asc" : {type: "boolean", defaultValue: true},	
			"rlimit" : {type: "int", defaultValue: "90"},	
			"glimit" : {type: "int", defaultValue: "75"}			
        }
    },

    renderer : function(oRm, oControl) {      

		oRm.write("<div"); 
		oRm.writeControlData(oControl);  
		oRm.addStyle("width", oControl.getSize());                                                        
		oRm.addStyle("height", oControl.getSize());
		oRm.writeStyles();
		if(oControl.getAsc()){
			if(oControl.getValue() === 'E' ){
				oRm.addClass("circlered-text"); 
			}else if(oControl.getValue() === 'W'){
				oRm.addClass("circleyellow-text"); 			
			}else{
				oRm.addClass("circlegreen-text"); 			
			}
		}else{
			if(oControl.getValue() <= oControl.getRlimit()){
				oRm.addClass("circlered-text"); 
			}else if((oControl.getValue() > oControl.getRlimit()) && (oControl.getValue() < oControl.getGlimit())){
				oRm.addClass("circleyellow-text"); 			
			}else{
				oRm.addClass("circlegreen-text"); 			
			}		
		}
		oRm.writeClasses();               
		oRm.write(">");
		oRm.write("<div>"); 	  
		oRm.write(oControl.getValue());  
		oRm.write("</div>");                                                
		oRm.write("</div>");
    }
  });

});