
// akvaGrid js
// author: Robert Piira
// url: piira.se



var akvaGrid =  function() {
    
    var _this;
    
    var defaults = {
    	cols: 12,
    	leading: 22,
    	opacity: 5
    };
    
    return {
    
        init: function () {
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
        
        	var opts = {
			    	cols: $('#grid-size').val(),
			    	leading: $('#line-size').val(),
			    	opacity: $('#akva-opacity').val()
			};
		
			//Columns
			var colMarkup = "";
			for (var i = 0, ii = opts.cols; i < ii; i++) {
				colMarkup += '<li><div></div></li>';
			}
			
			//Baseline
			var leading =  opts.leading - 1;
			var lines = $(document).height() / leading;
			var lineMarkup = "";
			for (var i = 0, ii = lines; i < ii; i++) {
				lineMarkup += '<li></li>';
			}
			
			//Opacity
			var opac = opts.opacity / 10;
			$('#akva-grid').css('opacity',opac);			
			
			//
			$('.akva-baseline').html(lineMarkup);
			$('.akva-cols').html(colMarkup);
			$('.akva-baseline li').css('height',leading);	
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
			
				$('#grid-size').val(defaults.cols);
			    $('#line-size').val(defaults.leading);
			   	$('#akva-opacity').val(defaults.opacity);
			
			}
		}	
		
	}
}();

$(window).load(akvaGrid.init());
