# Example: flatten-js in a browser

This example illustrates usage of flatten-js library in a browser.
It works "as is" without transpiling in most of the modern browsers.
Project uses https://unpkg tool to deliver the package from npm.
Unpkg assigns package to the **window** global scope under the name ```@flatten-js/core```,
from where the namespace ```Flatten``` may be destructed.
 
## Usage

Move index.html file into browser and see svg graphics created

## Known issues

Does not work in IE.

## Credits
All credits to the [Turf](https://github.com/Turfjs/turf/blob/master/examples/es-modules/index.html) project,
where the idea of this code was forked.

