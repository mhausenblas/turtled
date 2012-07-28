var graph = Viva.Graph.graph();
var graphics = Viva.Graph.View.svgGraphics();

var ex1 = '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\
@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n\
@prefix : <http://example.org/#> .\n\
\n\
:m a foaf:Person ;\n\
    rdfs:label "Michael" ;\n\
    foaf:knows :r ;\n\
.\n\
\n\
:r a foaf:Person ;\n\
   rdfs:label "Richard" ;\n\
.';

var ex2 = '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\
@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n\
@prefix dc: <http://purl.org/dc/elements/1.1/> .\n\
@prefix schema: <http://schema.org/> .\n\
@prefix : <http://example.org/#> .\n\
\n\
:m a foaf:Person ;\n\
    rdfs:label "Michael" ;\n\
    dc:author :p ;\n\
.\n\
\n\
:p a schema:ScholarlyArticle ;\n\
   rdfs:label "A very important lesson learned ..." ;\n\
   dc:created "2011-11-11" ;\n\
.';



// node.data holds custom object passed to graph.addNode();
graphics.node(function(node) {
	if (node.data.type == 'literal') {
		return Viva.Graph.svg('rect')
				.attr('width', 100)
				.attr('height', 10)
				.attr('style', 'stroke: #000; fill: #fff')
				.attr('title', node.data.label);
	} 
	else {
		return Viva.Graph.svg('ellipse')
				.attr('rx', 100)
				.attr('ry', 10)
				.attr('style', 'stroke: #000; fill: #fff')
				.attr('title', node.data.label);
	}
})
.placeNode(function(nodeUI, pos){
	nodeUI.attr('x', pos.x - 50).attr('y', pos.y);
	nodeUI.attr('cx', pos.x - 50).attr('cy', pos.y);
	
});

graphics.link(function(link) {
		return Viva.Graph.svg('line')
				.attr('style', 'stroke: #000; fill: #000')
				.attr('title', link.data.label);
});


$(document).ready(function(){

	$("#out").css('margin-left', $("#in").width() + 10); // adjust size of output area

	// first, the RDF store needs to be ready, then we set up the UI/UX
	rdfstore.create(function(store) {
		
		$("#vis").click(function(event){
			var tinput = $("#tinput").val();
			$("#out").html("");
			resetGraph(store);
			
			status("Parsing input ...");
			
			// try parsing the user-supplied input and if successful, build the graph and render it
			store.load("text/turtle", tinput, function(success, results) {
				if(success){
					status("Valid RDF Turtle. Loaded <strong>" + results + "</strong> triples.");
					buildGraph(store);
					renderGraph("out");
				}
				else {
					status("<span style='color:red'>Invalid RDF Turtle :(</span>" );
				}
				
			});
		});
		
		// handling examples
		$("#examples").click(function(event){ $('#examples-sel').slideToggle('slow'); });
		$("#ex1").click(function(event){ $('#tinput').val(ex1); });
		$("#ex2").click(function(event){ $('#tinput').val(ex2); });

		// handling save of data or query
		$("#save").click(function(event){
			alert('not yet implemented');
		});
	
		// handling of selected node and arc display
		$("ellipse").live('click', function(event){
			status("You've selected the resource: <span style='color:blue'>" +  $(this).attr('title') + "</span>" );
		});
		
		$("rect").live('click', function(event){
			status("You've selected the literal: <span style='color:blue'>" +  $(this).attr('title') + "</span>" );
		});

		$("line").live('click', function(event){
			status("You've selected the property: <span style='color:blue'>" +  $(this).attr('title') + "</span>" );
		});
		
		
	});
});

function status(msg){
	$('#status').html(msg);
}

function resetGraph(store){
	graph = Viva.Graph.graph();
	store.clear();
}

function buildGraph(store){
	store.execute("SELECT * { ?s ?p ?o }", function(success, results){
		if(success) {
			for (var i=0; i < results.length; i++) {
				graph.addNode(results[i].s.value, { label : results[i].s.value, type : results[i].s.token });
				graph.addNode(results[i].o.value, { label : results[i].o.value, type : results[i].o.token }); 
				graph.addLink(results[i].s.value, results[i].o.value, { label : results[i].p.value });
			};
			status("Successfully built the graph.");
		}
		else {
			status("<span style='color:red'>Problem building the graph, sorry. Blame Michael ...</span>" );
		}
	});
}

function renderGraph(containerID){
	var renderer = Viva.Graph.View.renderer(graph, {
		graphics: graphics,
		renderLinks: true,
		container: document.getElementById(containerID)
	});
	renderer.run();
}


