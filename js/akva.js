
// akvaGrid js
// author: Robert Piira, @robertpiira
// url: piira.se

// Big thanks to @garberus for tips, trix and inspriration.


var akvaGrid = function () {

	//Set some variables.
	var timer = null,
		$window = $(window),
		akvaDocHeight = $(document).height(),
		$akvaPage = $('body');
	var _this = { 
   
   		debug: true,
   		
   		//Set of akvaGrid defaults.
   		defaults: {
   			cols: 12,
        	leading: 24,
        	gutter: 0.9,
        	opacity: 9
   		},
   		
   		//Define grid element names.
   		elements: {
   			akvaContainerID: '#akva-grid',
   			akvaCols: '#akva-cols',
	   		akvaBase: '#akva-baseline',
    		panelID: '#akva-panel',
    		formID: '#akva-form',    		formGutter: '#akva-gutter',
    		formLeading: '#line-size',
    		formOpacity: '#akva-opacity',
    		formCols: '#grid-size'
    	},
    	
		init: function (options) {

			_this = this;
			
			var options = options || {};
			
			//Add settings object to akvaGrid.
			this.settings = $.extend({}, this.defaults, options);
			
			//Send akva-grid into the DOM.
			this.buildAkvaGrid();
			this.buildPanel();
			
			//Check if localStorage is supported and if there is any data saved.
			if ( _this.detectLocalStorage && localStorage.getItem("gridData") === "true" ) {
				this.populateValuesFromStorage();
           	}
           	else {
           		this.populateControls();
           	}
           	
			this.buildGrid();
			this.setGridHeight();
			$window.resize(this.listenForDocumentHeight);
			
			
			
			//Listen for changes in akvaPanel.
			$(this.elements.formID).change(function() {
           		
           		if ( _this.detectLocalStorage ) {
					_this.saveToStorage();
	           	}	
	           	_this.repopulateSettings(); 
            	_this.buildGrid();
            });
			
		},
		
		buildGrid: function() { 
		
        	var colMarkup = "",
        		lineMarkup = "",
        		lines;
        	
        	lines = akvaDocHeight / this.settings.leading;
        	
			//Columns.
			for (var i = 0, ii = this.settings.cols; i < ii; i++) {
				colMarkup += '<li><div></div></li>';
			}
			
			//Baseline.
			for (var i = 0, ii = lines; i < ii; i++) {
				lineMarkup += '<li></li>';
			}
			//Opacity.
			$(this.elements.akvaContainerID).css('opacity', this.settings.opacity/10);			
			
			//Build the grid.
			$(this.elements.akvaBase).html(lineMarkup);
			$(this.elements.akvaCols).html(colMarkup);
			$(this.elements.akvaBase).find('li').css('height', this.settings.leading);	

			$(this.elements.akvaCols).find('li').each(function(){
				$(this).css({
					'padding-left': _this.settings.gutter + '%',
					'padding-right': _this.settings.gutter + '%'
				});
			});
	
			this.log('grid built');
		},
		
		buildPanel: function () {
			//If panel is already in the DOM return.
			if ( $(this.elements.formID).length ) { return };
			this.log('buildPanel initialized: We build the panel');
		},
		
		//Insert akvaGrid containers into the DOM.
		buildAkvaGrid: function () {
	   		var thegrid = $('<div />', {
	   			id: 'akva-grid',
	   			class: 'parent-width'
	   		}).append($('<ul id="akva-cols">')).append($('<ul id="akva-baseline">'));

	   		$akvaPage.append(thegrid);
		},

		//Populate Controls with defaults/options.
		populateControls: function () {
        	$(this.elements.formGutter).val(this.settings.gutter);
        	$(this.elements.formLeading).val(this.settings.leading);
        	$(this.elements.formOpacity).val(this.settings.opacity);
        	$(this.elements.formCols).val(this.settings.cols);
        	this.log('controls populated', this.settings);
        },
        
        //Update settings object via changes in akva-panel form
        //or when loading form values from localStorage.
        repopulateSettings: function() {
        	this.settings = {
        		cols: $(_this.elements.formCols).val(),
    		    leading: $(_this.elements.formLeading).val(),
    		    gutter: $(_this.elements.formGutter).val(),
    		    opacity: $(_this.elements.formOpacity).val()	
        	};
        },
        
        //Loop through the akva-panel form and serialize the input values
        //into an array with objects. Save this array in localStorage.
        saveToStorage: function() {
			var data = $(this.elements.formID).serializeArray();
		
			localStorage.setItem("gridData", "true");
			$.each(data, function(i, obj) {
				localStorage.setItem(obj.name, obj.value);
			});
			this.log('Data saved to local storage', data);
		},
		
		//Update values in akva-panel form with saved data from localStorage.
		//Then repopulate the settings object with the saved values.
		populateValuesFromStorage: function() {
			var data;
			
			if (localStorage.getItem("gridData") === "true") {
				data = $(this.elements.formID).serializeArray();
				$.each(data, function(i, obj) {
					$('[name="' + obj.name + '"]').val(localStorage.getItem(obj.name));
				});			
			}
			_this.repopulateSettings(); 
			this.log('Values populated from storage', data);
		},
        
        //This calls setGridHeight method in intervals.
        listenForDocumentHeight: function () {
			if (timer) { clearTimeout(timer); }
			timer = setTimeout(_this.setGridHeight, 100);
		},
        
        //Get document body height and apply that to akvaGrid container.
        setGridHeight: function () {
    		var docHeight = $akvaPage.innerHeight();
    		$(_this.elements.akvaContainerID).height(docHeight);
    		_this.log('Height of document:', docHeight);
        },
        
        detectLocalStorage: function() {
        	try {
        		return 'localStorage' in window && window['localStorage'] !== null;
        		this.log('local storage support detected');
		  	} catch(e){
		  		return false;
		  	}
        },
     	
     	//Log helper function.	
		log: function () {			
			if (this.debug) {
				if (window.loadFirebugConsole) {
					window.loadFirebugConsole();
				}
				if (window.console && window.console.log && window.console.log.apply) {
				    window.console.log.apply(console, ['akvaGrid', arguments]);
				}
			}
		}
     
   };
   
   return _this;
   
}();



$(document).ready(function(){

	akvaGrid.init({
		opacity: 5,
		cols: 6
	});

});




















/*

var akvaGrid =  function() {
    
    var _this;
    
    var defaults = {
    	cols: 12,
    	leading: 24,
    	gutter: 1,
    	opacity: 3
    };
    
    return {
    
        init: function() {
            _this = this;
            
            this.populateValuesFromStorageOrDefaults();
            this.buildGrid();
            this.gridHeight();
            
            $(window).resize(this.gridHeight);
            
            $('#akva-form').change(function() {
            	_this.saveToStorage();
            	_this.buildGrid();
            });
          
        },
        
        buildGrid: function() { 
        
        	var settings = {
		    	cols: $('#grid-size').val(),
		    	leading: $('#line-size').val(),
		    	gutter: $('#akva-gutter').val(),
		    	opacity: $('#akva-opacity').val()
			}
			
		
			//Columns
			var colMarkup = "";
			for (var i = 0, ii = settings.cols; i < ii; i++) {
				colMarkup += '<li><div></div></li>';
			}
			
			//Baseline
			var leading =  settings.leading - 1;
			var lines = $(document).height() / leading;
			var lineMarkup = "";
			for (var i = 0, ii = lines; i < ii; i++) {
				lineMarkup += '<li></li>';
			}
			
			//Gutter
			var gutterSize = '' + settings.gutter + '%';
			
			//Opacity
			var opac = settings.opacity / 10;
			$('#akva-grid').css('opacity',opac);			
			
			//Build the grid
			$('.akva-baseline').html(lineMarkup);
			$('.akva-cols').html(colMarkup);
			$('.akva-baseline li').css('height',leading);	
			$('.akva-cols li').each(function(){
				$(this).css({
					'margin-left': gutterSize,
					'margin-right': gutterSize
				});
			});
			
		},
        
        gridHeight: function() {
        	var documentHeight = $(document).height();
			$('#akva-grid').height(documentHeight);
		},
		
		saveToStorage: function() {
		
			var $form = $('#akva-form');
			var data = $form.serializeArray();
		
			localStorage.setItem("gridData", "true");
	
			$.each(data, function(i, obj) {
				localStorage.setItem(obj.name, obj.value);
			});
			
		},
		
		populateValuesFromStorageOrDefaults: function() {
		
			var $form = $('#akva-form');
			
			if (localStorage.getItem("gridData") == "true") {
	
				var data = $form.serializeArray();
		
				$.each(data, function(i, obj) {
					$('[name="' + obj.name + '"]').val(localStorage.getItem(obj.name));
				});			
			} else {
				
				var settings = {
			    	cols: $('#grid-size').val(defaults.cols),
			    	leading: $('#line-size').val(defaults.leading),
			    	gutter: $('#akva-gutter').val(defaults.gutter),
			    	opacity: $('#akva-opacity').val(defaults.opacity)
				}
				
				_this.buildGrid()
				
			} 
		}	
		
	}
}();

$(document).ready(akvaGrid.init());
*/