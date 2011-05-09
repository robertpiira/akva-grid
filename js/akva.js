
// akvaGrid js
// author: Robert Piira
// url: piira.se



var akvaGrid =  function() {
    var _this;
    
    return {
        init: function () {
            _this = this;
            this.buildGrid();
            this.gridHeight();
            this.newGridHeight();
            this.setGrid();
          
        },
        
        buildGrid: function(cols, baselineHeight, opac) { 
        
		
			//Columns
			var colMarkup = "";
			for (var i = 0, ii = cols; i < ii; i++) {
				colMarkup += '<li><div></div></li>';
			}
			
			//Baseline
			var baselineHeight = baselineHeight - 1;
			var lines = $(document).height() / baselineHeight;
			var lineMarkup = "";
			for (var i = 0, ii = lines; i < ii; i++) {
				lineMarkup += '<li></li>';
			}
			
			//Opacity
			var opac = opac / 10;
			$('#akva-grid').css('opacity',opac);			
			
			$('.akva-baseline').html(lineMarkup);
			$('.akva-cols').html(colMarkup);
			$('.akva-baseline li').css('height',baselineHeight);	
		},
        
        gridHeight: function() {
        	var documentHeight = $(document).height();
			$('#akva-grid').height(documentHeight);
		},
		
		newGridHeight: function() {
			$(window).resize(this.gridHeight);
		},
		
		setGrid: function() {	
			$('#akva-form').change(function() {
				
				var cols = $('#grid-size').val();
				var baselineHeight = $('#line-size').val();
				var opac = $('#akva-opacity').val();
				
				_this.buildGrid(cols, baselineHeight, opac);
				
			});
		}		
		
	}
}();






$(window).load(akvaGrid.init());




$(function() {

	var $form = $('#akva-form');	
	
	$form.change(function() {
	
		var data = $form.serializeArray();
	
		localStorage.setItem("gridData", "set");

		$.each(data, function(i, obj) {
			localStorage.setItem(obj.name, obj.value);
		});
		
	});
	
	if (localStorage.getItem("gridData") == "set") {

		var data = $form.serializeArray();

		$.each(data, function(i, obj) {
			$('[name="' + obj.name + '"]').val(localStorage.getItem(obj.name));
		});
		
		var cols = $('#grid-size').val();
		var baselineHeight = $('#line-size').val();
		var opac = $('#akva-opacity').val();
		
		akvaGrid.buildGrid(cols, baselineHeight, opac);
		
	}
	
});




