;(function ( $, window, document, undefined ) {

    var fitImages = "fitImages",
    dataPlugin = "plugin_" + fitImages,
    // default options
    defaults = {
        animation : 'fade',
        animationTime: 500,
        fitMethod : 'crop',
        ifImageAddContainer: false,
        imageClass : 'fitImages-image'
    };
	
    // PRIVATE METHODS
	var startOnLoad = function(image, container, options) {
		image.one('load',function() {
			fitImage(image, container, options);
        });
        var src = image.attr('src');
        image.attr('src',null).attr('src',src);
	};
	var setImage = function(element, options) {
        var image = element.find('img').first();
        image.css('position', 'relative');
        return image;
    };
    var fitImage = function(image,container,options) {
        var imageDims = getDims(image);
        var containerDims = getDims(container);        
        var prop = getProportion(containerDims,imageDims,options);
        resize(image, imageDims, container, containerDims, prop, options);  
    };
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
        image.addClass(options.imageClass);
        showImage(image, imageDims, container, containerDims, ih, iw, left, top, diff, options);
    };
    var showImage = function(image, imageDims, container, containerDims, ih, iw, left, top, diff, options) {
        container.css({
            'width':containerDims.innerWidth,
            'height':containerDims.innerHeight
        });
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
        	$element = $(this.element);
        	var image = setImage($element, this.options);
    		startOnLoad(image, $element, this.options);
        },
        destroy: function() {
            semiDestroy(this.element);
            this.element.data( dataPlugin, null );
        },
        update: function(){
            semiDestroy(this.element);
            $element = $(this.element);
            var image = setImage($element, this.options);
            startOnLoad(image, $element, this.options);
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