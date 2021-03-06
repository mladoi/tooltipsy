/* tooltipsy by Brian Cray
 * Lincensed under GPL2 - http://www.gnu.org/licenses/gpl-2.0.html
 * Option quick reference:
 * - alignTo: "element" or "cursor" (Defaults to "element")
 * - offset: Tooltipsy distance from element or mouse cursor, dependent on alignTo setting. Set as array [x, y] (Defaults to [0, -1])
 * - content: HTML or text content of tooltip. Defaults to "" (empty string), which pulls content from target element's title attribute
 * - load: function(element, callback) to load content before showing tooltip, callback is called with loaded content
 * - show: function(event, tooltip) to show the tooltip. Defaults to a show(100) effect
 * - hide: function(event, tooltip) to hide the tooltip. Defaults to a fadeOut(100) effect
 * - delay: A delay in milliseconds before showing a tooltip. Set to 0 for no delay. Defaults to 200
 * - css: object containing CSS properties and values. Defaults to {} to use stylesheet for styles
 * - className: DOM class for styling tooltips with CSS. Defaults to "tooltipsy"
 * - showEvent: Set a custom event to bind the show function. Defaults to mouseenter
 * - hideEvent: Set a custom event to bind the show function. Defaults to mouseleave
 * Method quick reference:
 * - $('element').data('tooltipsy').show(): Force the tooltip to show
 * - $('element').data('tooltipsy').hide(): Force the tooltip to hide
 * - $('element').data('tooltipsy').destroy(): Remove tooltip from DOM
 * More information visit http://tooltipsy.com/
 */
 
(function($){
    $.tooltipsy = function (el, options) {
        this.options = options;
        this.$el = $(el);
        this.title = this.$el.attr('title') || '';
        this.$el.attr('title', '');
        this.random = parseInt(Math.random()*10000);
        this.ready = false;
        this.shown = false;
        this.preventShow = false;
        this.loaded = false;
        this.width = 0;
        this.height = 0;
        this.delaytimer = null;

        this.$el.data("tooltipsy", this);
        this.init();
    };

    $.tooltipsy.prototype.init = function () {
        var base = this;

        base.settings = $.extend({}, base.defaults, base.options);
        base.settings.delay = parseInt(base.settings.delay);

        if (typeof base.settings.content === 'function') {
            base.readify(); 
        }

        if (base.settings.showEvent === base.settings.hideEvent && base.settings.showEvent === 'click') {
            base.$el.toggle(function (e) {
                if (base.settings.showEvent === 'click' && base.$el[0].tagName == 'A') {
                    e.preventDefault();
                }
                if (base.settings.delay > 0) {
                    base.delaytimer = window.setTimeout(function () {
                        base.initShow(e);
                    }, base.settings.delay);
                }
                else {
                    base.initShow(e);
                }
            }, function (e) {
                if (base.settings.showEvent === 'click' && base.$el[0].tagName == 'A') {
                    e.preventDefault();
                }
                window.clearTimeout(base.delaytimer);
                base.delaytimer = null;
                base.hide(e);
            });
        }
        else {
            base.$el.bind(base.settings.showEvent, function (e) {
                if (base.settings.showEvent === 'click' && base.$el[0].tagName == 'A') {
                    e.preventDefault();
                }
                if (base.settings.delay > 0) {
                    base.delaytimer = window.setTimeout(function () {
                        base.initShow(e);
                    }, base.settings.delay);
                }
                else {
                    base.initShow(e);
                }
            }).bind(base.settings.hideEvent, function (e) {
                if (base.settings.showEvent === 'click' && base.$el[0].tagName == 'A') {
                    e.preventDefault();
                }
                window.clearTimeout(base.delaytimer);
                base.delaytimer = null;
                base.hide(e);
            });
        }
    };

    $.tooltipsy.prototype.initShow = function(e) {
		var base = this;
		base.preventShow = false;
		if (base.loaded === false) {
			base.settings.load(base.$el, function(html){
				base.loaded = true;
				if (html)
					base.settings.content = html;
				if (!base.preventShow)
					base.show(e);
			});
		} else {
			base.show(e);		
		}
    };
    
    $.tooltipsy.prototype.show = function (e) {
        var base = this;

        if (base.ready === false) {
            base.readify();
        }

        if (base.shown === false) {
            if ((function (o) {
                var s = 0, k;
                for (k in o) {
                    if (o.hasOwnProperty(k)) {
                        s++;
                    }
                }
                return s;
            })(base.settings.css) > 0) {
                base.$tip.css(base.settings.css);
            }
            base.width = base.$tipsy.outerWidth();
            base.height = base.$tipsy.outerHeight();
        }

        if (base.settings.alignTo === 'cursor' && e) {
            var tip_position = [e.pageX + base.settings.offset[0], e.pageY + base.settings.offset[1]];
            if(tip_position[0] + base.width > $(window).width()) {
                var tip_css = {top: tip_position[1] + 'px', right: tip_position[0] + 'px', left: 'auto'};
            }
            else {
                var tip_css = {top: tip_position[1] + 'px', left: tip_position[0] + 'px', right: 'auto'};
            }
        }
        else {
            var tip_position = [
                (function (pos) {
                    if (base.settings.offset[0] < 0) {
                        return pos.left - Math.abs(base.settings.offset[0]) - base.width;
                    }
                    else if (base.settings.offset[0] === 0) {
                        return pos.left - ((base.width - base.$el.outerWidth()) / 2);
                    }
                    else {
                        return pos.left + base.$el.outerWidth() + base.settings.offset[0];
                    }
                })(base.offset(base.$el[0])),
                (function (pos) {
                    if (base.settings.offset[1] < 0) {
                        return pos.top - Math.abs(base.settings.offset[1]) - base.height;
                    }
                    else if (base.settings.offset[1] === 0) {
                        return pos.top - ((base.height - base.$el.outerHeight()) / 2);
                    }
                    else {
                        return pos.top + base.$el.outerHeight() + base.settings.offset[1];
                    }
                })(base.offset(base.$el[0]))
            ];
        }
        base.$tipsy.css({top: tip_position[1] + 'px', left: tip_position[0] + 'px'});
        base.shown = true;
        base.settings.show(e, base.$tipsy.stop(true, true));        
    };

    $.tooltipsy.prototype.hide = function (e) {
        var base = this;
        base.preventShow = true;
        if (base.ready === false) {
            return;
        }
        if (e && e.relatedTarget === base.$tip[0]) {
            base.$tip.bind('mouseleave', function (e) {
                if (e.relatedTarget === base.$el[0]) {
                    return;
                }
                base.settings.hide(e, base.$tipsy.stop(true, true));
            });
            return;
        }
        base.shown = false;
        base.settings.hide(e, base.$tipsy.stop(true, true));
    };

    $.tooltipsy.prototype.readify = function () {
        this.ready = true;
        this.$tipsy = $('<div id="tooltipsy' + this.random + '" style="position:absolute;z-index:2147483647;display:none">').appendTo('body');
        this.$tip = $('<div class="' + this.settings.className + '">').appendTo(this.$tipsy);
        this.$tip.data('rootel', this.$el);
        var e = this.$el;
        var t = this.$tip;
        this.$tip.html(this.settings.content != '' ? (typeof this.settings.content == 'string' ? this.settings.content : this.settings.content(e, t)) : this.title);
    };

    $.tooltipsy.prototype.offset = function (el) {
        var ol = ot = 0;
        if (el.offsetParent) {
            do {
                if (el.tagName != 'BODY') {
                    ol += el.offsetLeft - el.scrollLeft;
                    ot += el.offsetTop - el.scrollTop;
                }
            } while (el = el.offsetParent);
        }
        return {left : ol, top : ot};
    };

    $.tooltipsy.prototype.destroy = function () {
        this.$tipsy.remove();
        $.removeData(this.$el, 'tooltipsy');
    };

    $.tooltipsy.prototype.defaults = {
        alignTo: 'element',
        offset: [0, -1],
        content: '',
        load: function($el, cb) {
        	cb();
        },
        show: function (e, $el) {
            $el.fadeIn(100);
        },
        hide: function (e, $el) {
            $el.fadeOut(100);
        },
        css: {},
        className: 'tooltipsy',
        delay: 200,
        showEvent: 'mouseenter',
        hideEvent: 'mouseleave'
    };

    $.fn.tooltipsy = function(options) {
        return this.each(function() {
            new $.tooltipsy(this, options);
        });
    };

})(jQuery);
