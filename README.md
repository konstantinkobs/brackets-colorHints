#colorHints
> Add already used hex colors to autocompletion to have quick access to your color palette

When you write CSS you may use many different colors. After some time of designing you have enough colors and just want to use these colors at some point again. But then you have to search for that element with that color, copy the color, find the spot again, where you wanted to insert it, ... and maybe it was the wrong color...

**That was the reason for creating colorHints!**

colorHints scans your current CSS file for colors in hexadecimal notation. When you insert a '#' for inserting a color it shows you all the used colors in your document.

colorHints organizes your colors in two ways:

1. It sorts your colors by their brightness *(dark to bright)*
2. It shortens colors if possible *(see screenshot: #222222 becomes #222)*

![screenshot](screenshots/screenshot1.png)

##How to install
There are three possible ways:

1. Install the extension via the Extension Manager in Brackets: ```File -> Extension Manager -> search for 'colorHints'```
2. Copy the url of this repository and paste it into ```File -> Extension Manager -> Install from URL```
3. [Download the code](https://github.com/konstantinkobs/brackets-colorHints/archive/master.zip) and extract it to the Extensions Folder: ```Help -> Show Extension Folder -> user```