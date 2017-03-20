/**
 * tagbuildr.js - Utility to create DOM elements and add children elements using a declarative string syntax
 * @version 1.0.4
 * @author Will Busby
 * 
 */

(function (global) {
    'use strict';

	/**** Utils ****/

    /*
    *  Check if variable is an element
    *  @param {mixed} obj any value to test
    *  @return {boolean}
    */
    var isElement = void 0;
    if (global && "HTMLElement" in global) {
        isElement = function isElement(obj) {
            return obj instanceof HTMLElement;
        };
    } else {
        isElement = function isElement(obj) {
            return !!(obj && typeof obj === "object" && obj.nodeType === 1 && obj.nodeName);
        };
    }
    
    /*
    *  Check if variable is an array
    *  @param {mixed} obj any value to test
    *  @return {boolean}
    */
    var isArray = void 0;
    if (Array.isArray) {
        isArray = Array.isArray;
    } else {
        isArray = function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };
    }

    /**
    * Main tag building factory function
    * You can have multiple nested calls to the create function from within the children arrays
    * @global
    * @param {String} tagString The element tag string. Use a declarative syntax to define the tag and attributes e.g. h1.title|data-attr=foo, div#main-div etc
    * @param {string|Array} children Either a single child element|string|number or A mixed array of strings|numbers|elements to add as children
    * @return {Element} full DOM element
    */
    function tagbuildr(tagString, children) {
        //transform class and id strings to compatible attributes
        tagString = _handleClassesAndId(tagString);
        var tagStrArray = tagString.split(/\|/);
        var tag = tagStrArray.shift();
        var el = document.createElement(tag);
        var attrs = _sortAttrs(tagStrArray);

        _setDomAttrs(attrs, el);
        //finished with attrs
        attrs = null;

        //return now if no children
        if (!children) {
            return el;
        }

        //if not an array, assume single child and append
        if (!isArray(children)) {
            _append(children, el);
            return el;
        } else {
            //Children array can have a mix of strings and javascript DOM elements.
            _appendChildren(children, el);
        }
        //finished with children
        children = null;

        return el;
    };

    /********** INTERNAL METHODS *********/

    var attrType = {
        '.': 'className',
        '#': 'id'
    };

    /**
     * Remove the css style classes and ids then replace them with a parseable string to add later on
     * @private
     * @param {string} str 
     * @return {string} reformatted tagString
     */
    function _handleClassesAndId(str) {
        return str.replace(/(.*?)([\.|#].[^|]*)(.*)/, function (fullStr, tag, classAndIds, end) {
            if (classAndIds[0] === '|') {
                return fullStr;
            }
            var clsIdArr = classAndIds.split(/(\..[^\.|#]*)/).filter(Boolean);
            var returnArr = [];
            var i = clsIdArr.length;
            while (i--) {
                returnArr.push("|" + attrType[clsIdArr[i][0]] + "=" + clsIdArr[i].substr(1));
            }
            clsIdArr = null;
            return tag + returnArr.join('') + end;
        });
    }

    /**
     * Parse and process the attribute strings into an object of key-value pairs like: attr-name: attr-value
     * @private
     * @param {Array} arr an array of attribute strings e.g src=my-img.jpg
     * @return {Object} a sorted key value pair object ready to add to the element
     */
    function _sortAttrs(arr) {
        var attrs = {};
        for (var i = 0, l = arr.length; i < l; i++) {
            if (/=/.test(arr[i])) {
                var firstEquals = arr[i].indexOf('=');
                var attr = arr[i].substr(0, firstEquals);
                var value = arr[i].substr(firstEquals + 1);
                var current = attrs[attr];
                if (current) {
                    current += " " + value;
                } else {
                    current = value;
                }
                attrs[attr] = current;
            }
        }
        return attrs;
    }

    /**
     * Add attributes to the dom element
     * @private
     * @param {Object} attrs object of key-value pairs of dom attributes. Classes and Id are added directly to element and others are set via setAttribute
     * @param {Element} el the dom element
     */
    function _setDomAttrs(attrs, el) {
        var attr = void 0;
        for (attr in attrs) {
            if (!attrs.hasOwnProperty(attr)) { continue; }
            switch (attr) {
                case 'className':
                case 'id':
                    el[attr] = attrs[attr];
                    break;
                default:
                    el.setAttribute(attr, attrs[attr]);
                    break;
            }
        }
    }

    /**
     * Convenience function to add multiple children nodes to the element
     * @private
     * @param {Array} children a mixed array of strings|elements|html to add to the element
     * @param {Element} el the dom element
     */
    function _appendChildren(children, el) {
        var i = 0;
        var len = children.length;
        for (; i < len; i++) {
            _append(children[i], el);
        }
    }

    /**
     * Main append child function
     * @private
     * @param {string|Element} child a string|Element|html - insertAdjacentHTML is used for strings and html strings as it is much faster when appending multiple children. See test case here: https://jsperf.com/innerhtml-vs-insertadjacenthtml-multiple-children
	 * @param {Element} el
	 *
     */
    function _append(child, el) {
        if (isElement(child)) {
            el.appendChild(child);
        } else {
            el.insertAdjacentHTML('beforeend', child);
        }
    }

	(function (name, context, definition) {
		if (typeof module != 'undefined' && module.exports)
			module.exports = definition;
		else if (typeof define == 'function' && define.amd)
			define(name, definition);
		else if (window)
			context[name] = definition;
			context.tb = definition;
	}('tagbuildr', global, tagbuildr));

}(this));
