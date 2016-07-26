/*!
 * Vanilla Javascript fitImages plugin
 * Author: Joan Beltran
 * Git: https://github.com/joanbeltran/
 * License: MIT
 */

(function (root, factory) {
    var pluginName = 'fitImages';

    if (typeof define === 'function' && define.amd) {
        define([], factory(pluginName));
    } else if (typeof exports === 'object') {
        module.exports = factory(pluginName);
    } else {
        root[pluginName] = factory(pluginName);
    }
}(this, function (pluginName) {
    'use strict';

    var defaults = {
        fitMethod: 'resize', // resize or crop
        responsive: true
    };


    /**
     * Merge defaults with user options
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     */
    var extend = function (target, options) {
        var prop, extended = {};
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };

    /**
     * Get element and container proportion
     * @param {object} containerDims the container dimensions
     * @param {object} imageDims the image dimensions
     * @param string the way to get the proportion depending on the fit method
     */
    var getProportion = function(containerDims, imageDims, fitMethod) {
        var prop = containerDims.width/imageDims.width;
        if (fitMethod && fitMethod === 'resize') {
            if (containerDims.height/imageDims.height < prop) {
                prop = containerDims.height/imageDims.height;
            }
        } else {
            if (containerDims.height/imageDims.height > prop) {
                prop = containerDims.height/imageDims.height;
            }
        }
        return prop;
    };

    /**
     * Plugin Object
     * @param element The html element to initialize
     * @param {Object} options User options
     * @constructor
     */
    function Plugin(element, options) {
        this.element = element;
        this.options = extend(defaults, options);
        this.imagesObject = [];
        this.init();
    }


    // Plugin prototype
    Plugin.prototype = {
      /**
       * Initialize the plugin
       */
        init: function() {
            for(var i = 0; i < this.element.length; i++) {
                this.imagesObject[i] = new FitImage(this.element[i], this.options);
            }
            if(this.options.responsive) {
                this.responsive();
            }
        },

        responsive: function() {
            var self = this;
            window.onresize = function() {
                for(var i = 0; i < self.element.length; i++) {
                    self.imagesObject[i].update();
                }
            }
        },

        update: function() {
            for(var i = 0; i < this.element.length; i++) {
                this.imagesObject[i].update();
            }
        },

        destroy: function() {
            for(var i = 0; i < this.element.length; i++) {
                this.imagesObject[i].destroy();
            }
            this.update = undefined;
            this.responsive = undefined;
            this.init = undefined;
            this.destroy = undefined;
        }

    };

    /**
     * fitImage Object
     * @param element The html element to initialize
     * @param {Object} options User options
     * @constructor
     */
    function FitImage(element, options) {
        this.element = element;
        this.options = options;
        this.image = this.element.querySelector('img');
        if(this.image) {
            this.waitForImageLoad();
        }
    }

    // FitImage prototype
    FitImage.prototype = {
      /**
       * wait for the image being loaded
       */
      waitForImageLoad: function() {
          var src = this.image.src,
              self = this;
          this.image.onload = function() {
              self.init();
          };
          this.image.src = null;
          this.image.src = src;
      },

      /**
       * defineSizes the defaults
       */
      defineSizes: function() {
          this.containerDims = {
              width: this.element.clientWidth,
              height: this.element.clientHeight,
          };
          this.imageDims = {
              width: this.image.width,
              height: this.image.height
          };
          this.proportion = getProportion(this.containerDims, this.imageDims, this.options.fitMethod);
          this.resizedImageSize = {
              width: this.imageDims.width * this.proportion,
              height: this.imageDims.height * this.proportion
          };
          this.imageOffset = {
              top: 0,
              left: 0
          };
      },

      /**
       * define the new offsets for the image
       */
      defineOffsets: function() {
          if (this.resizedImageSize.height < this.containerDims.height) {
              this.imageOffset.top =- (this.resizedImageSize.height - this.containerDims.height)/2;
          } else if (this.resizedImageSize.height > this.containerDims.height) {
              this.imageOffset.top =- (this.resizedImageSize.height - this.containerDims.height)/2;
          }
          if (this.resizedImageSize.width < this.containerDims.width) {
              this.imageOffset.left =- (this.resizedImageSize.width - this.containerDims.width)/2;
          } else if (this.resizedImageSize.width > this.containerDims.width) {
              this.imageOffset.left =- (this.resizedImageSize.width - this.containerDims.width)/2;
          }
      },

      /**
       * set the new css to th image
       */
      setImageStyles: function() {
          var st = this.image.style;
          st.width = this.resizedImageSize.width;
          st.height = this.resizedImageSize.height;
          st.top = this.imageOffset.top;
          st.left = this.imageOffset.left;
          st.position = 'relative';
      },

      /**
       * define all the sizes and set them to the image
       */
      update: function() {
          if(this.image) {
              this.defineSizes();
              this.defineOffsets();
              this.setImageStyles();
          }
      },

      /**
       * destroy the instance and the styles created
       */
      destroy: function() {
          if(this.image){
              this.image.style.cssText = '';
          }
      },

      /**
       * initialize the Image plugin
       */
      init: function() {
          this.update();
          this.image.style.display = 'inline';
      }
    };

    return Plugin;
}));
