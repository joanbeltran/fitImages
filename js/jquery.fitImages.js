/*
fitImages 1.3 author: Joan Beltran
MIT License
*/ 
;(function ( $, window, document, undefined ) {

    var fitImages = "fitImages",
    dataPlugin = "plugin_" + fitImages,
    // default options
    defaults = {
        animation : 'fade', // fade or nothing
        animationTime: 400, // animation time
        fitMethod : 'crop', // crop or resize
        responsive : true // true or false
    };
    
    // PRIVATE METHODS
    var getDims = function(elem) {
        var offset = $(elem).offset();
        return {
            offsetTop: offset.top,
            offsetLeft: offset.left,
            width: $(elem).outerWidth(),
            height: $(elem).outerHeight(),
            innerWidth: $(elem).innerWidth(),
            innerHeight: $(elem).innerHeight()
        };
    };
    var getProportion = function(containerDims, imageDims, options) {
        var prop = containerDims.innerWidth/imageDims.width;
        if (options.fitMethod && options.fitMethod=='resize') {
            if (containerDims.innerHeight/imageDims.height < prop) {
                prop = containerDims.innerHeight/imageDims.height;
            }
        } else {
            if (containerDims.innerHeight/imageDims.height > prop) {
                prop = containerDims.innerHeight/imageDims.height;
            }
        }
        return prop;
    };
    var showImage = function(image, ih, iw, left, top, options) {
        image.css({
            'width':iw,
            'height':ih,
            'top':top,
            'left':left
        });
        if (options.animation == 'fade') {
            image.fadeIn(options.animationTime);

        } else {
            image.css('display','inline');
        }
    };
    var resize = function(image, imageDims, container, containerDims, prop, options) {
        var iw = imageDims.width * prop;
        var ih = imageDims.height * prop;
        var top = 0, left = 0, diff;
        if (ih<containerDims.innerHeight) {
            top=-(ih-containerDims.innerHeight)/2;
        } else if (ih>containerDims.innerHeight) {
            top=-(ih-containerDims.innerHeight)/2;
        }
        if (iw<containerDims.innerWidth) {
            left=-(iw-containerDims.innerWidth)/2;
        } else if (iw>containerDims.innerWidth) {
            left=-(iw-containerDims.innerWidth)/2;
        }
        showImage(image, ih, iw, left, top, options);
    };
    var fitImage = function(image, container, options) {
        var imageDims = getDims(image);
        var containerDims = getDims(container);
        var prop = getProportion(containerDims,imageDims,options);
        resize(image, imageDims, container, containerDims, prop, options);  
    };
    var setImage = function(element) {
        var image = element.find('img').first();
        image.css('position', 'relative');
        return image;
    };
    var startOnLoad = function(image, container, options) {
        
        image.one('load', function() {
            fitImage(image, container, options);
        }).each(function() {
          if(this.complete) $(this).load();
        });
        var src = image.attr('src');
        image.attr('src',null).attr('src',src);
    };

    var semiDestroy = function(elem) {
        elem.find('img').removeAttr('style');
        elem.removeAttr('style');
    };
    
    // CONSTRUCTOR
    var Plugin = function ( element ) {
        this.options = $.extend( {}, defaults );
    };

    Plugin.prototype = {
        init: function(options) {
            $.extend( this.options, options );
            var $element = $(this.element);
            var options = this.options;
            var image = setImage($element);
            startOnLoad(image, $element, options);
            if (options.responsive) {
                $(window).resize(function() {
                    fitImage(image, $element, options);
                });
            }
        },
        destroy: function() {
            semiDestroy(this.element);
            this.element.data( dataPlugin, null );
        },
        update: function(){
            semiDestroy(this.element);
            var $element = $(this.element);
            var image = setImage($element, this.options);
            fitImage(image, $element, this.options);
        }

    };

    $.fn[fitImages] = function ( arg ) {
        var args, instance;
        return this.each(function () {
            if (!( $(this).data( dataPlugin ) instanceof Plugin )) {
                $(this).data( dataPlugin, new Plugin( $(this) ) );
            }
            instance = $(this).data( dataPlugin );
            instance.element = $(this);
            if (typeof arg === 'undefined' || typeof arg === 'object') {
                if ( typeof instance['init'] === 'function' ) {
                    instance.init( arg );
                }
            } else if ( typeof arg === 'string' && typeof instance[arg] === 'function' ) {
                args = Array.prototype.slice.call( arguments, 1 );
                return instance[arg].apply( instance, args );
            } else {
                $.error('Method ' + arg + ' does not exist on jQuery.' + fitImages);
            }
        });
    };

})( jQuery, window, document );