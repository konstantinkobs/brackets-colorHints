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
     * Gets the text of the css file.
     */
    ColorHint.prototype.getCssStyleText = function () {
        
        var text = this.editor.document.getText();
        
        //console.log(text);
        
        return text;
        
    };
    
    /**
     * Returns an array with all color values (without '#')
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
            var code = this.toSix(match[1]);
            
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
    
    /**
     * Calculates a long version of a hex color.
     */
    ColorHint.prototype.toSix = function(color){
        if(color.length === 6){
            return color;
        }
        else{
            return color.charAt(0) + color.charAt(0) + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2);
        }
    }
    
    /**
     * Calculates a short version of a hex color.
     */
    ColorHint.prototype.toThree = function(color){
        if(color.length === 3){
            return color;
        }
        else if(color.charAt(0) === color.charAt(1) && color.charAt(2) === color.charAt(3) && color.charAt(4) === color.charAt(5)){
            return color.charAt(0) + color.charAt(2) + color.charAt(4);
        }
        else{
            return color;
        }
    }
    
    /**
     * Checks, if it is possible to give hints.
     */
    ColorHint.prototype.hasHints = function (editor, implicitChar) {
        this.editor = editor;
        
        return implicitChar ? implicitChar === "#" : false;
        
    };

    /**
     * Calculates the hints
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
    
    /**
     * Extracts the color from hint text
     */
    ColorHint.prototype.getColorFromString = function(string){
        
        var pos = string.lastIndexOf(">");
        return string.substring(pos + 1);
        
    }
    
    /**
     * Inserts the color
     */
    ColorHint.prototype.insertHint = function (hint) {
        
        var code = this.getColorFromString(hint);
        
        code = this.toThree(code);
        
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
