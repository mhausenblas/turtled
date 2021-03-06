# turtled

A simple online RDF Turtle editor that allows you to render an RDF graph visually, restrict to sub-graphs via SPARQL and to export the visualisation as SVG.
If you fancy, you can watch a [5min screen cast](http://www.youtube.com/watch?v=LRtJAUdASsE) that introduces Turtled and shows how to use it.

![Screen shot of turtled v0.1 in action](https://github.com/mhausenblas/turtled/raw/master/doc/turtled-screen-shot-v01.png "Screen shot of turtled v0.1 in action")

## Dependencies and Installation

Turtled depends on the following JS libraries and data source (in addition to jQuery), all included in the repo:

* To handle RDF: [rdfstore-js](https://github.com/antoniogarrote/rdfstore-js)
* For visualisation: [VivaGraph.JS](https://github.com/anvaka/VivaGraphJS)
* For prefix lookup: [prefix.cc](http://prefix.cc/)

In order to deploy it, simply copy all files into a directory. An example deployment is available at [turtled.net](http://turtled.net/).

## Release planning


### v0.2

* make gravity, springLength and coeff customizable
* ltr layout (subject - key/value)
* add arrows to arcs (via path element)


### v0.1

Released on 2012-07-31.

### v0.0

Initial released on 2012-07-27.


## License and Acknowledgements

The software provided here is in the public domain. Kudos go out to [Richard Cyganiak](https://github.com/cygri) who had the original idea (as well as maintains prefix.cc) and to all the wonderful people who spent their time making jQuery, rdfstore-js and VivaGraph.JS so useable, useful and awesome - especially a shout out to [Antonio Garrote](https://github.com/antoniogarrote) who provided excellent first-level support for his library.