     


/* ---------------------------- akva-grid 1.4 ----------------------------- */

// akva-grid js
// author: Robert Piira (@robertpiira), Johan Garderud (@garberus)
// url: piira.se/akva-grid


var akva = function () {
    // scope variable
    var root;

    return {
        // debug flag
        debug: true,
        // flag to tell if dependencys are available locally
        local: false,
        // initiate akvaGrid with an optional settings object
        init: function (settings) {
            // set scope variable
            root = this;
            // default settings
            defaults = {
                cols: 12,
                leading: 24,
                gutter: 1,
                opacity: 6,
                maxwidth: '',
                width: '',
                minwidth: '',
                zindex: '-1',
                mode: {
                    query: false
                },
                urls: {
                    css: 'http://piira.se/akva-grid/css/akva.css',
                    library: 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js'
                },
                els: {
                    form: 'akva-form',
                    panel: 'akva-panel'
                }
            };
            // ensure there is a settings object
            if (!settings) {
                settings = {};
            }
            // merge settings
            this.settings = this.merge(settings, defaults);
            // include a CSS file
            // if local is true it is assumed this is already available
            if (!this.local) {
                this.include.css(this.settings.urls.css);
            }
            // check if jQuery is available, if not try to find it
            if (typeof jQuery === 'undefined') {
                this.include.js(
                    this.settings.urls.library,
                    function () {
                        root.construct();
                    }
                );
            } else {
                this.construct();
            }
        },
        // constructor for the object, runs after initialisation
        construct: function () {
            // by now, jQuery should be available
            if (typeof jQuery === 'undefined') {
                return;
            }

            // initiate console
            this.console = new akva.debug({
                debug: this.debug,
                method: 'construct'
            });
            this.console.log('akva initiated', this.settings);
            // we're on our way
            this.panel.init();
            // initiate the resize listener
            $(window).resize(this.resizeListener);
            // initiate the toggler 
            $(document).keyup(this.toggle);
        },
        // function to merge one object into the other
        // @param obj1 	Object 	the object to be merged
        // @param obj2 	Object 	the object obj1 is merged into
        merge: function (obj1, obj2) {
            for (var p in obj2) {
                if (obj2[p] && !obj1[p]) {
                    if (typeof obj2[p] == 'Object') {
                        obj1[p] = root.merge(obj1[p], obj2[p]);
                    } else {
                        obj1[p] = obj2[p];
                    }
                }
            }
            return obj1;
        },
        // handles the akva grid control panel
        panel: {
            // initiate panel and set inputs
            init: function () {
                root.setMethod('panel.init');
                root.panelInputs = [
                    {id: 'akva-gridsize', name: 'cols', min: '0', max: '24', step: "", type: 'number', unit: ''},
                    {id: 'akva-linesize', name: 'leading', min: '0', max: '', step: "", type: 'number', unit: 'px'},
                    {id: 'akva-gutter', name: 'gutter', min: '0', max: '', step: "0.1", type: 'number', unit: '%'},
                    {id: 'akva-maxwidth', name: 'maxwidth', min: '0', max: '4', step: "", type: 'number', unit: 'px'},
                    {id: 'akva-width', name: 'width', min: '0', max: '', step: "", type: 'number', unit: '%'},
                    {id: 'akva-minwidth', name: 'minwidth', min: '0', max: '', step: "", type: 'number', unit: 'px'},
                    {id: 'akva-opacity', name: 'opacity', min: '0', max: '10', step: "", type: 'range', unit: ''},
                    {id: 'akva-zindex', name: 'zindex', min: '-1', max: '', step: "", type: 'number', unit: ''},
                    {id: 'akva-breakpoint', name: 'breakpoint', min: '0', max: '', step: "", type: 'breakpoint', unit: 'px'}
                ];
                this.build();
            },
            // generate panel
            build: function () {
                root.setMethod('panel.build');
                var panelToggler = $('<button>').addClass('akva-paneltoggle'),
                    panelWrapper = $('<div>').addClass('akva-panel').attr('id', root.settings.els.panel),
                    form = $('<form>').attr('id', root.settings.els.form),
                    l = root.panelInputs.length,
                    i, el;

                // build panel inputs based on settings in init
                for (i = 0; i < l; i++) {
                    form.append(
                        $('<label>')
                            .attr('for', root.panelInputs[i].id)
                            .text(root.panelInputs[i].name)
                    );
                    form.append(
                        $('<input>')
                            .attr('id', root.panelInputs[i].id)
                            .attr('name', root.panelInputs[i].name)
                            .attr('min', root.panelInputs[i].min)
                            .attr('max', root.panelInputs[i].max)
                            .attr('step', root.panelInputs[i].step)
                            .attr('type', root.panelInputs[i].type)
                            .attr('placeholder', root.panelInputs[i].unit)
                    );
                    if (root.panelInputs[i].type == 'breakpoint') {
                        form.append(
                            $('<span>')
                                .addClass('akva-unit')
                                .css('cursor', 'pointer')
                                .click(function () {
                                    root.breakpoints.registerNew();
                                })
                                .append(
                                $('<strong>')
                                    .text('new')
                            )
                        );
                    }
                }
                panelWrapper.append(form);
                panelWrapper.hide();
                // saves the state of the panel in session storage
                if (root.storage.detectSession && sessionStorage.getItem('panelactive')) {
                    panelWrapper.show();
                    panelToggler.data('active', 'true');
                    root.console.log('sessionStorage supported and panel is active', sessionStorage.panelactive);
                }
                // bind toggler events
                panelToggler.bind('click', function () {
                    if (!panelToggler.data('active')) {
                        panelToggler.data('active', 'true');
                        panelWrapper.stop(true, true).slideDown('fast');
                        sessionStorage.setItem('panelactive', 'true');
                    } else {
                        panelToggler.data('active', false);
                        panelWrapper.stop(true, true).slideUp('fast');
                        sessionStorage.removeItem('panelactive');
                    }
                });
                // bind form event
                panelWrapper.find('form').bind('formChange', function () {
                    root.setMethod('panel.formChange');
                    root.console.log('form changed, new values:', root.panel.getValues());
                    root.grids.activeGrid.update(root.panel.getValues());
                    if (root.storage.detectLocal()) {
                        root.grids.activeGrid.save();
                    }
                });
                // bind panel events in one go
                panelWrapper.find('input[type="range"], input[type="number"]').bind('click keyup', function () {
                    $(this).parent('form').trigger('formChange');
                });
                // insert toggle button and panel into the DOM
                $('body').append(panelToggler);
                $('body').prepend(panelWrapper);

                root.console.log('panel built', panelWrapper);
                this.populate();
            },
            // populate from local storage or defaults
            populate: function () {
                root.setMethod('panel.populate');
                var fields = $('#' + root.settings.els.form).serializeArray(),
                    data = {}, joineddata, identifier, i, l, frag;

                // populate from local storage, if possible
                if (root.storage.detectLocal() && localStorage.getItem('currentData')) {
                    identifier = localStorage.getItem('currentData');
                    joineddata = localStorage.getItem(identifier);
                    joineddata = joineddata.split(';');
                    for (i = 0, l = joineddata.length; i < l; i++) {
                        frag = joineddata[i].split('=');
                        data[frag[0]] = frag[1];
                    }
                    root.console.log('loaded data from local storage');
                } else {
                    data = root.settings;
                }
                $.each(fields, function (i, obj) {
                    $('[name="' + obj.name + '"]').val(data[obj.name]);
                });

                root.console.log('controls populated', data);
                // add the initial grid
                root.grids.add('default');
            },
            // return the form values
            getValues: function () {
                var form = $('#' + root.settings.els.form);

                return {
                    cols: form.find('input[name="cols"]').val(),
                    leading: form.find('input[name="leading"]').val(),
                    gutter: form.find('input[name="gutter"]').val(),
                    opacity: form.find('input[name="opacity"]').val(),
                    maxwidth: form.find('input[name="maxwidth"]').val(),
                    width: form.find('input[name="width"]').val(),
                    minwidth: form.find('input[name="minwidth"]').val(),
                    zindex: form.find('input[name="zindex"]').val()
                }
            }
        },

        grids: {
            // keeps track of the active grid
            activeGrid: null,
            // bucket to stick grids in
            instances: [],
            // creates a new grid
            // @param name 	string 	the identifier for this grid
            add: function (name) {
                root.setMethod('grids.add');

                var form = $('#' + root.settings.els.form),
                    grid = new akva.grid(root.panel.getValues());

                this.instances.push(grid);
                this.activeGrid = grid;
                root.console.log('grid added: ', grid);
            },
            remove: function (name) {
                root.setMethod('grids.remove');
                var grid;

                for (grid in this.instances) {
                    if (grid.properties.name == name) {
                        delete grid;
                        root.console.log('grid deleted: ', name);
                        break;
                    }
                }
            }
        },

        breakpoints: {
            // bucket to stick breakpoints in
            instances: [],

            populate: function () {
                root.setMethod('breakpoints.populate');
            },

            persist: function () {
                root.setMethod('breakpoints.persist');
                // TODO: save breakpoints
            },

            registerNew: function (pos) {
                root.setMethod('breakpoints.register');
                var form = $('#' + root.settings.els.form),
                    pos = form.find('input[name="breakpoint"]').val(),
                    bp = null,
                    l = this.instances.length;

                if ((pos.length > 0) && !this.hasBreakpoint(pos)) {
                    bp = new akva.breakpoint({ pos: pos, remove: this.removeBreakpoint, id: l });
                    this.instances[l] = bp;
                    root.console.log('breakpoint added: ', this.instances);
                }
            },
            // makes sure we can't add multiple breakpoints in the same place
            hasBreakpoint: function(value) {
                var i = 0, l = this.instances.length;

                for (; i<l; i++) {
                    if (this.instances[i].properties.pos == value) {
                        root.console.log('breakpoint at that coordinate already exists');
                        return true;
                    }
                }
                return false;
            },
            // removes a breakpoint from the list
            removeBreakpoint: function(id) {
                var i = 0, l = root.breakpoints.instances.length;

                for (; i<l; i++) {
                    if (root.breakpoints.instances[i].properties.id == id) {
                        root.breakpoints.instances.splice(i, 1);
                        root.console.log('breakpoint removed: ', root.breakpoints.instances);
                        break;
                    }
                }
            }
        },
        // used by an object method to tell the console who's speaking
        // makes debugging easier and as automatic as it can be
        setMethod: function (method) {
            if (this.console) {
                this.console.setMethod(method);
            }
        },
        // storage
        storage: {
            // detect localStorage http://diveintohtml5.org/detect.html
            detectLocal: function () {
                root.setMethod('storage.detectLocal');
                try {
                    return 'localStorage' in window && window['localStorage'] !== null;
                    root.console.log('local storage support detected');
                } catch (e) {
                    return false;
                }
            },
            // detect sessionStorage http://diveintohtml5.org/detect.html
            detectSession: function () {
                root.setMethod('storage.detectSession');
                try {
                    return 'sessionStorage' in window && window['sessionStorage'] !== null;
                    root.console.log('session storage support detected');
                } catch (e) {
                    return false;
                }
            }
        },
        // includes external js or css files in the current context
        include: {
            // method to load a css file
            css: function (url) {
                var ref = document.createElement('link');

                ref.type = 'text/css';
                ref.href = url;
                ref.rel = 'stylesheet';
                document.getElementsByTagName('head')[0].appendChild(ref);
            },
            // use to load a javascript file
            // @param url 		string 		where to load the js from
            // @param callback 	function 	a callback can be provided once the
            //                              js has loaded (optional)
            js: function (url, callback) {
                var script = document.createElement('script');

                script.type = 'text/javascript';
                script.src = url;
                if (callback && typeof callback === 'function') {
                    script.onload = callback;
                }
                document.getElementsByTagName('head')[0].appendChild(script);
            }
        },
        resizeListener: function () {
            //this.setMethod('resizeListener');
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function () {
                //_this.checkBreakpoints();
                root.grids.activeGrid.setGridHeight();
            }, 100);
        },
        toggle: function (e) { 
            var $akvaEls = $('.akva-panel, .akva-paneltoggle, .akva-grid');
            if (e.keyCode == 71) {
                $akvaEls.toggle();
            }
        }
    };
}();
akva.debug = function (settings) {
    var defaults = {
        method: 'console',
        debug: false
    };

    this.properties = settings ? settings : defaults;
};
akva.debug.prototype = {
    log: function () {
        if (this.properties.debug) {
            if (window.loadFirebugConsole) {
                window.loadFirebugConsole();
            }
            if (window.console && window.console.log && window.console.log.apply) {
                window.console.log.apply(
                    window.console, ['akva.' + this.properties.method, arguments]
                );
            }
        }
    },

    setMethod: function (method) {
        this.properties.method = method;
    }
};
/*---------------------------- grid object definition ----------------------- */
akva.grid = function (settings) {
    var defaults = {
        name: 'default',
        method: 'grid',
        debug: true,
        cols: 12,
        leading: 24,
        gutter: 1,
        opacity: 6,
        maxwidth: '',
        width: '',
        minwidth: '',
        zindex: '-1'
    };
    // we need jQuery here
    if (!jQuery) {
        return;
    }

    this.properties = jQuery.extend(defaults, settings);
    this.init();
};
akva.grid.prototype = {
    init: function () {
        this.console = new akva.debug({
            debug: this.properties.debug,
            method: 'grid.instance.' + this.properties.name
        });
        this.console.log('grid initialised', this.properties);
        this.grid = 'akva-grid-' + this.properties.name;
        this.build();
    },
    // build grid foundation
    build: function () {
        $('body')
            .append(
            $('<div>')
                .attr('id', this.grid)
                .addClass('akva-grid')
                .append(
                $('<ul>')
                    .attr('id', this.grid + '-cols')
                    .addClass('akva-cols')
            )
                .append(
                $('<ul>')
                    .attr('id', this.grid + '-baseline')
                    .addClass('akva-baseline')
            )
        );
        this.generate();
    },
    // generates this grid
    generate: function () {
        var i, l = this.properties.cols;

        // set grid height
        this.setGridHeight();
        // opacity, max-width, width, z-index
        $('#' + this.grid).css({
            'opacity': this.properties.opacity / 10,
            'max-width': this.properties.maxwidth + 'px',
            'width': this.properties.width + '%',
            'min-width': this.properties.minwidth + 'px',
            'z-index': this.properties.zindex
        });
        // columns
        $('#' + this.grid + '-cols').empty();
        for (i = 0; i < l; i++) {
            $('#' + this.grid + '-cols')
                .append(
                $('<li>')
                    .css({
                        'padding-left': this.properties.gutter + '%',
                        'padding-right': this.properties.gutter + '%'
                    })
                    .append(
                    $('<div>')
                )
            );
        }
        this.console.log('grid generated');
    },
    // get document height and apply that to akvaGrid container and the baseline grid.
    setGridHeight: function () {
        var height = $('body').innerHeight();

        $('#' + this.grid).height(height);
        this.buildBaseline(height);
        this.console.log('setting akva height: ', height);
    },
    // baseline grid
    buildBaseline: function (h) {
        var lineMarkup = '',
            lines = Math.floor(h / this.properties.leading),
            i;

        $('#' + this.grid + '-baseline').empty();
        for (i = 0; i < lines; i++) {
            $('#' + this.grid + '-baseline')
                .append(
                $('<li>')
                    .css('height', this.properties.leading - 1)
            );
        }
        this.console.log('calculated baseline', lines);
    },
    // updates the properties of the grid
    update: function (settings) {
        this.properties = jQuery.extend(this.properties, settings);
        this.generate();
    },
    // saves grid to local storage
    save: function () {
        var data = [], prop;

        for (prop in this.properties) {
            data.push(prop + '=' + this.properties[prop]);
        }
        // TODO: detect if limit is exceeded, throw error
        localStorage.setItem('currentData', this.grid);
        localStorage.setItem(this.grid, data.join(';'));
        this.console.log('grid successfully saved', data);
    }
};
/*---------------------------- breakpoint definition ------------------------ */
akva.breakpoint = function (settings) {
    var defaults = {
        method: 'breakpoint',
        name: 'default',
        debug: true,
        pos: null,
        id: null,
        remove: null
    };
    // we need jQuery here
    if (!jQuery) {
        return;
    }
    this.properties = jQuery.extend(defaults, settings);
    this.init();
};
akva.breakpoint.prototype = {
    init: function () {
        this.console = new akva.debug({
            debug: this.properties.debug,
            method: 'breakpoint.instance.' + this.properties.id
        });
        this.render();
    },
    // appends the new breakpoint
    render: function() {
        var _this = this;

        $('.akva-panel')
            .append(
            $('<div>')
                .attr('id', 'breakpoint-' + this.properties.pos)
                .css('left', this.properties.pos + 'px')
                .addClass('akva-breakpoint')
                .data('position', this.properties.pos)
                .click(function() {
                    // if a callback is registered on the main object, call it to
                    // remove breakpoint from stack
                    if (_this.properties.remove &&
                        ('function' === typeof _this.properties.remove)) {
                        _this.properties.remove(_this.properties.id);
                    }
                    $(this).remove();
                })
                .append(
                $('<div>')
                    .css('left', this.properties.pos + 'px')
                    .addClass('akva-breakpoint-content')
                    .text(this.properties.pos + 'px')
            )
        );
        this.console.log('breakpoint generated');
    }
    // TODO: finish breakpoint object
};
/*---------------------------- self-detect and initiate --------------------- */
akva.detect = function () {
    if (window.location.hash.indexOf('#akva') > -1) {
        akva.init();
    }
    
}();




