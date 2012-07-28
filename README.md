# turtled

A simple online RDF Turtle editor.

![Screen shot of turtled v0.0 in action](https://github.com/mhausenblas/turtled/raw/master/doc/turtled-screen-shot-v00.png "Screen shot of turtled v0.0 in action")

## Dependencies and Installation

turtled depends on the following JS libraries (in addition to jQuery), all included in the repo:

* [rdfstore-js](https://github.com/antoniogarrote/rdfstore-js)
* [VivaGraph.JS](https://github.com/anvaka/VivaGraphJS)

In order to deploy it, simply copy all files into a directory. An example deployment is available at [turtled.net](http://turtled.net/).

## Open Issues

* labels of links are missing
* save input and/or query via [Web storage](http://playground.html5rocks.com/#localstorage)
* resize
* SVG export
* restrict via SPARQL query
* proper credit (DERI, etc)

## License and Acknowledgements

The software provided here is in the public domain. Kudos go out to [Richard Cyganiak](https://github.com/cygri) who had the original idea and to all the wonderful people who spent their time making jQuery, rdfstore-js and VivaGraph.JS so useable, useful and awesome.