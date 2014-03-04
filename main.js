/*
 * Copyright (c) 2014 Konstantin Kobs
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, brackets, $, window */

define(function (require, exports, module) {
    "use strict";

    var AppInit             = brackets.getModule("utils/AppInit"),
        CodeHintManager     = brackets.getModule("editor/CodeHintManager"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        LanguageManager     = brackets.getModule("language/LanguageManager");
    
    /**
     * @constructor
     */
    function ColorHint() {
        
    }

    
    /**
     * Get the CSS style text of the file open in the editor for this hinting session.
     * For a CSS file, this is just the text of the file. For an HTML file,
     * this will be only the text in the <style> tags.
     *
     * @return {string} the "css" text that can be sent to CSSUtils to extract all named flows.
     */
    ColorHint.prototype.getCssStyleText = function () {
        
        var text = this.editor.document.getText();
        
        //console.log(text);
        
        return text;
        
    };
    
    /**
     * Returns an array with alle color values (without '#')
     * inside of the current file
     */
    ColorHint.prototype.getAllColors = function(){
        // get CSS text
        var text = this.getCssStyleText();
        
        // RegEx for matching HEX color values
        var regex = /[ :]#([0123456789abcdef]{3}|[0123456789abcdef]{6})[\W;]/ig;
        
        
        var matches = [];
        // find all matches
        var match = null;
        while (match = regex.exec(text)) {
            
            // the hexcode without #
            var code = match[1];
            
            var html = "<div style='display: inline-block; margin-right: 5px; height: 10px; width: 10px; background: #" + code + ";'></div>" + code;
            
            // only put it into the array,
            // if it isn't already in it
            if(matches.indexOf(html) === -1){
                // put them into the array
                matches.push(html);
            }
            
        }
        
        return matches;
    }
    
    ColorHint.prototype.hasHints = function (editor, implicitChar) {
        this.editor = editor;
        
        console.log("hasHints wurde aufgerufen");
        
        return implicitChar ? implicitChar === "#" : false;
        
    };
       
    /**
     * Returns a list of availble CSS propertyname or -value hints if possible for the current
     * editor context. 
     * 
     * @param {Editor} implicitChar 
     * Either null, if the hinting request was explicit, or a single character
     * that represents the last insertion and that indicates an implicit
     * hinting request.
     *
     * @return {jQuery.Deferred|{
     *              hints: Array.<string|jQueryObject>,
     *              match: string,
     *              selectInitial: boolean,
     *              handleWideResults: boolean}}
     * Null if the provider wishes to end the hinting session. Otherwise, a
     * response object that provides:
     * 1. a sorted array hints that consists of strings
     * 2. a string match that is used by the manager to emphasize matching
     *    substrings when rendering the hint list
     * 3. a boolean that indicates whether the first result, if one exists,
     *    should be selected by default in the hint list window.
     * 4. handleWideResults, a boolean (or undefined) that indicates whether
     *    to allow result string to stretch width of display.
     */
    ColorHint.prototype.getHints = function (implicitChar) {
        
        if(implicitChar !== "#"){
            return null;
        }
        
        var colors = this.getAllColors();
        
        return {
            hints: colors,
            match: null,
            selectInitial: true,
            handleWideResults: false
        };

    };
    
    ColorHint.prototype.getColorFromString = function(string){
        
        var pos = string.lastIndexOf(">");
        return string.substring(pos + 1);
        
    }
    
    /**
     * Inserts a given CSS protertyname or -value hint into the current editor context. 
     * 
     * @param {String} hint 
     * The hint to be inserted into the editor context.
     * 
     * @return {Boolean} 
     * Indicates whether the manager should follow hint insertion with an
     * additional explicit hint request.
     */
    ColorHint.prototype.insertHint = function (hint) {
        
        var code = this.getColorFromString(hint);
        
        // Document objects represent file contents
        var currentDoc = DocumentManager.getCurrentDocument();
        
        // Get the position of our cursor in the document
        var pos = this.editor.getCursorPos();
        
        // Add some text in our document
        currentDoc.replaceRange(code, pos);
        
    };
    
    AppInit.appReady(function () {
        var colorHints = new ColorHint();
        CodeHintManager.registerHintProvider(colorHints, ["css", "scss", "less"], 0);
    });
});
