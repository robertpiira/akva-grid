//WORK IN PROGRESS

// akvaGrid js
// author: Robert Piira, @robertpiira
// url: piira.se

// Big thanks to @garberus for his invaluable JS tips, trix and inspriration.

var akvaGrid = function () {

        //Set some variables.
        var timer = null,
            $window = $(window),
            $akvaPage = $('body');

        var _this = {

            debug: true,

            //Set of akvaGrid defaults.
            defaults: {
                cols: 		12,
                leading: 	24,
                gutter: 	0.9,
                opacity: 	6,
                maxwidth: 	""
            },

            //Define grid element names.
            elements: {
                akvaContainerID: 	'#akva-grid',
                akvaCols: 			'#akva-cols',
                akvaBase: 			'#akva-baseline',
                panelID: 			'#akva-panel',
                formID: 			'#akva-form',
                formGutter: 		'#akva-gutter',
                formLeading: 		'#line-size',
                formOpacity: 		'#akva-opacity',
                formMaxWidth: 		'#akva-maxwidth',
                formCols: 			'#grid-size'
            },

            init: function (options) {

                _this = this;
                
                //To be or not to be
            	//var queryAkva = this.queryAkva("akva");
                //if ( !queryAkva ) { return }

                options = options || {};

                //Add settings object to akvaGrid.
                this.settings = $.extend({}, this.defaults, options);

                //Intial funcs
                this.buildAkvaGrid();
                this.buildPanel();
                this.populateControls();
                this.buildGrid();
                
                //On resize
                $window.resize(this.listenForDocumentHeight);

                //Listen for changes in akvaPanel.
                $(this.elements.formID).find('input[type="range"], input[type="number"]').bind('click keyup', function(){
                	$(this).parent('form').trigger('formChange');
                });
                $(this.elements.formID).bind('formChange', function () {

                    if (_this.detectLocalStorage) {
                        _this.saveToStorage();
                    }

                    _this.repopulateSettings();
                    _this.buildGrid();

                });

            },
            
            queryAkva: function (query) {
            
				var hasAkva = "#" + query,
					match = (window.location+"").match(hasAkva);
				
				return (match != null) ? true : false;

            },

            buildGrid: function () {

                var colMarkup = "";
                
                //Set grid height
                this.setGridHeight();

                //Columns.
                for (var i = 0, ii = this.settings.cols; i < ii; i++) {
                    colMarkup += '<li><div></div></li>';
                }

                //Opacity, max-width		
                $(this.elements.akvaContainerID).css({
                    'opacity': this.settings.opacity / 10,
                    'max-width': this.settings.maxwidth + 'px'
                });

                //Build the cols.
                $(this.elements.akvaCols).html(colMarkup);

                $(this.elements.akvaCols).find('li').each(function () {
                    $(this).css({
                        'padding-left': _this.settings.gutter + '%',
                        'padding-right': _this.settings.gutter + '%'
                    });
                });

                this.log('builGrid: grid built');
            },

            //Baseline grid
            buildBaseline: function (docHeight) {
                var lineMarkup = "",
                    lines = Math.floor(docHeight / this.settings.leading);

                for (var i = 0, ii = lines; i < ii; i++) {
                    lineMarkup += '<li></li>';
                }
                $(this.elements.akvaBase).html(lineMarkup);
                $(this.elements.akvaBase).find('li').css('height', this.settings.leading - 1);

                _this.log('buildBaseline: Calculated baseline', lines);
            },

            buildPanel: function () {

                var $akvaPanelToggler = $('<button class="akva-paneltoggle" />'),
                	$panel = $('<div class="akva-panel akva-hidden"  />'),
                	$panelContent = $(this.elements.formID).clone(true);
                
                $(this.elements.panelID).remove();

                if ( this.detectSessionStorage && sessionStorage.getItem('panelactive')) {
                	$panel.toggleClass('akva-hidden');
                	$akvaPanelToggler.data('active', "true");
                	this.log('buildPanel: SessionStorage supported and panel is active', sessionStorage.panelactive);
                }
              
                
                $akvaPanelToggler.bind('click', function () {

                    if (!$akvaPanelToggler.data('active')) {
                        $akvaPanelToggler.data('active', "true");
                        $panel.stop(true, true).slideDown('fast');
                        sessionStorage.setItem('panelactive', "true");
                        _this.log('buildPanel: Toggel button clicked and active and sessionStorage set to', sessionStorage.panelactive);
                        
                    } else {
                        $akvaPanelToggler.data('active', false);
                        $panel.stop(true, true).slideUp('fast');
                        sessionStorage.removeItem('panelactive');
                        _this.log('buildPanel: Toggel button clicked and inactive and sessionStorage removed', sessionStorage.panelactive);
                    }

                });

                //Insert toggle button and panel into the DOM
                $akvaPage.append($akvaPanelToggler);
                $akvaPage.prepend($panel);
                $panel.html($panelContent);

            },

            //Insert akvaGrid containers into the DOM.
            buildAkvaGrid: function () {
                var akva = $('<div />', {
                    id: 'akva-grid'
                }).append($('<ul id="akva-cols">')).append($('<ul id="akva-baseline">'));
                $akvaPage.append(akva);
            },

            //Populate Controls with defaults/options.
            populateControls: function () {
                var data = $(this.elements.formID).serializeArray();

                if (_this.detectLocalStorage && localStorage.getItem("gridData5") === "true") {
                    $.each(data, function (i, obj) {
                        $('[name="' + obj.name + '"]').val(localStorage.getItem(obj.name));
                    });
                    _this.repopulateSettings();
                    _this.log('populateControls: Values populated from storage', data);
                } else {
                    $.each(data, function (i, obj) {
                        $('[name="' + obj.name + '"]').val(_this.settings[obj.name]);
                    });

                    this.log('populateControls: Controls populated', this.settings);
                }

            },

            //Update settings object via changes in akva-panel form
            //or when loading form values from localStorage.
            repopulateSettings: function () {
                this.settings = {
                    cols: $(_this.elements.formCols).val(),
                    leading: $(_this.elements.formLeading).val(),
                    gutter: $(_this.elements.formGutter).val(),
                    opacity: $(_this.elements.formOpacity).val(),
                    maxwidth: $(_this.elements.formMaxWidth).val()
                };
            },

            //Loop through the akva-panel form and serialize the input values
            //into an array with objects. Save this array in localStorage.
            saveToStorage: function () {
                var data = $(this.elements.formID).serializeArray();

                localStorage.setItem("gridData5", "true");
                $.each(data, function (i, obj) {
                    localStorage.setItem(obj.name, obj.value);
                });
                this.log('saveToStorage: Data saved to local storage', data);
            },

            //This calls setGridHeight method in intervals.
            listenForDocumentHeight: function () {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(_this.setGridHeight, 100);
            },

            //Get document height and apply that to akvaGrid container and the baseline grid.
            setGridHeight: function () {
                var docHeight = $akvaPage.innerHeight();
                $(_this.elements.akvaContainerID).height(docHeight);
                _this.buildBaseline(docHeight);
                _this.log('setGridHeight: Setting akva height:', docHeight);
            },

            //Detect localStorage http://diveintohtml5.org/detect.html
            detectLocalStorage: function () {
                try {
                    return 'localStorage' in window && window['localStorage'] !== null;
                    this.log('detectLocalStorage: local storage support detected');
                } catch (e) {
                    return false;
                }
            },
            
            //Detect localStorage http://diveintohtml5.org/detect.html
            detectSessionStorage: function () {
                try {
                    return 'sessiontorage' in window && window['sessionStorage'] !== null;
                    this.log('detectSessionStorage: session storage support detected');
                } catch (e) {
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



$(document).ready(function () {

    akvaGrid.init({
        opacity: 5,
        cols: 12
    });

});