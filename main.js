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
        CSSUtils            = brackets.getModule("language/CSSUtils"),
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
        
        return text;
        
    };
    
    /**
     * Extracts the color from hint text
     */
    ColorHint.prototype.getColorFromString = function(string){
        
        var pos = string.lastIndexOf(">");
        return string.substring(pos + 1);
        
    }
    
    /**
     * Compares the brightness of two colors
     */
    ColorHint.prototype.compareBrightness = function(a, b){
        
        var ch = new ColorHint();
        
        // Get Colors
        var c1 = ch.getColorFromString(a);
        var c2 = ch.getColorFromString(b);
        
        // Convert to six characters
        var c1 = ch.toSix(c1);
        var c2 = ch.toSix(c2);
        
        // Calculate Brightness
        var b1 = ch.calcBrightness(c1);
        var b2 = ch.calcBrightness(c2);
        
        // Compare Brightness
        if(b1 < b2) return -1;
        if(b1 > b2) return 1;
        return 0;
        
    }
    
    /**
     * Returns an array with all color values (without '#')
     * inside of the current file
     */
    ColorHint.prototype.getAllColors = function(){
        // get CSS text
        var text = this.getCssStyleText();
        
        // RegEx for matching HEX color values
        var regex = /[ :]#([0-9a-f]{3}|[0-9a-f]{6})[\W;]/ig;
        
        // The typed text for filtering
        var filter = this.typed.substr(1).toLowerCase();
        
        var matches = [];
        // find all matches
        var match = null;
        while (match = regex.exec(text)) {
            
            // the hexcode without #
            var code = match[1].toLowerCase();
            
            // Convert to 6 characters
            var check = this.toSix(code);
            
            // Make short, if possible
            code = this.toThree(code);
            
            // If the found color doesn't begin with the typed color,
            // then go to the next one
            if(code.indexOf(filter) !== 0 && check.indexOf(filter) !== 0){
                continue;
            }
            
            var html = "<div style='display: inline-block; margin-right: 5px; height: 10px; width: 10px; background: #" + code + ";'></div>" + code;
            
            // only put it into the array,
            // if it isn't already in it
            if(matches.indexOf(html) === -1){
                // put them into the array
                matches.push(html);
            }
            
        }
        
        // Sort this array
        matches = matches.sort(this.compareBrightness);
        
        return matches;
    }
    
    /**
     * Calculates the brightness of a hex color.
     * The brighter, the higher the calculated value.
     * 
     * the color must be six characters long
     * 
     * returns an array with color and brightness
     */
    ColorHint.prototype.calcBrightness = function(hexCode){
        var r = parseInt(hexCode.substr(0, 2),16);
        var g = parseInt(hexCode.substr(2, 2),16);
        var b = parseInt(hexCode.substr(4, 2),16);

        return ((r * 299) + (g * 587) + (b * 114)) / 1000;
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
        // Get the current cursor position
        var cursor = this.editor.getCursorPos();
        
        // Get information for the current typed value
        this.info = CSSUtils.getInfoAtPos(this.editor, cursor);
        
        // The value that was typed
        if (!this.info.values[0]) {
            return null;   
        }
        
        this.typed = this.info.values[0].trim();
        
        // RegEx for Hex color
        var regex = /^#[a-f0-9]*$/i;
        
        // Checks if it is a hex color and whether it is
        // useful to provide hints (if everything is written,
        // no more hints are needed)
        var hex = regex.test(this.typed) && (this.typed.length < 7);

        // If it is not a hex color (anymore) don't give hints
        if(!hex){
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
     * Inserts the color
     */
    ColorHint.prototype.insertHint = function (hint) {
        
        // Get offset to hash
        var offset = this.info.offset - 1;
        
        // Get the color from hint
        var code = this.getColorFromString(hint);
        
        // Document objects represent file contents
        var currentDoc = DocumentManager.getCurrentDocument();
        
        // Get the position of our cursor in the document
        var pos = this.editor.getCursorPos();
        
        // Where the range starts that should be replaced
        var start = {line: pos.line , ch: pos.ch - offset};
        
        // Add some text in our document
        // currentDoc.replaceRange(code, start, pos);
        // HACK FOR BRACKETS!!!
        this.editor._codeMirror.replaceRange(code, start, pos);
        
    };
    
    AppInit.appReady(function () {
        var colorHints = new ColorHint();
        CodeHintManager.registerHintProvider(colorHints, ["css", "scss", "less"], 0);
    });
});
