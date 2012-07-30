var graph = Viva.Graph.graph();
var graphics = Viva.Graph.View.svgGraphics();
var turtledstorage = window.localStorage;
var MAX_ENTRIES = 10;
var entrycntr = 0;
var labelsvis = false;
var gstats = { numtriples : 0 ,  numclasses : 0 };

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
	if(labelsvis){ // show only labels
		return	Viva.Graph.svg('text')
				// .attr('width', 200)
				// .attr('height', 10)
				.attr('style', 'stroke-width: 0.1; font-family: Arial; font-size: 60%; stroke: #303030;')
				.text(node.data.label);
	}
	else {
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
	}


})
.placeNode(function(nodeUI, pos){
	if(labelsvis){ 
		nodeUI.attr('x', pos.x - 20).attr('y', pos.y);
	}
	else {
		nodeUI.attr('x', pos.x - 50).attr('y', pos.y);
		nodeUI.attr('cx', pos.x - 50).attr('cy', pos.y);
	}
});

graphics.link(function(link) {
		return Viva.Graph.svg('line')
				.attr('style', 'stroke: #000; fill: #000')
				.attr('title', link.data.label);
		// var g = Viva.Graph.svg('g');
		// g.append(Viva.Graph.svg('text')
		// 		.attr('style', 'stroke-width: 0.1; font-family: Arial; font-size: 60%; stroke: #303030;')
		// 		.text(link.data.label)
		// );
		// g.append(Viva.Graph.svg('line')
		// 		.attr('style', 'stroke: #000; fill: #000')
		// 		.attr('title', link.data.label)
		// );
		// return g;
});

$(document).ready(function(){

	// adjust size of output area
	$("#out").css('width', ($(window).width() - $("#main").width() - 100) * 0.95 );
	$("#out").css('height', $(window).height() * 0.85 );

	$(window).resize(function() {
		$("#out").css('width', ($(window).width() - $("#main").width() - 100) * 0.95 );
		$("#out").css('height', $(window).height() * 0.85 );
	});
	
	// list saved entries
	buildEntryList();

	// first, the RDF store needs to be ready, then we set up the UI/UX
	rdfstore.create(function(store) {
		
		$("#vis").click(function(event){
			var tinput = $("#tinput").val();
			$("#out").html("");
			$("#out-support").hide();
			resetGraph(store);
			
			status("Parsing input ...");
			
			// try parsing the user-supplied input and if successful, build the graph and render it
			store.load("text/turtle", tinput, function(success, results) {
				if(success){
					gstats.numtriples = results;
					status("Valid RDF Turtle. Loaded <strong>" + results + "</strong> triples.");
					if($("#restrictions").is(":visible")){
						applyRestriction(store, $("#sinput").val());
					}
					else{
						buildGraph(store);
					}
					$("#out").show("");
					renderGraph("out");
					$("#out-support").show();
					// @@TODO: count distinct subjects, classes, properties
					$("#stats").html("<strong>Stats:</strong> Triples: " + gstats.numtriples );
					
				}
				else {
					status("<span style='color:red'>Invalid RDF Turtle :(</span>" );
				}
				
			});
		});
		
		// handling examples
		$("#examples").click(function(event) {
			$("#examples-sel").slideToggle('medium', function() {
				if($("#examples-sel").is(":visible")){
					$("#img-examples").css("border-left", "5px solid #f0f0f0"); 
					$("#currententry").hide();
					status("Examples gallery loaded.");
				}
				else{
					$("#img-examples").css("border", "0px solid #fafafa"); 
				} 
			  });
		});
		$("#ex1").click(function(event){ $("#tinput").val(ex1); });
		$("#ex2").click(function(event){ $("#tinput").val(ex2); });

		// handling output support (node/link lables rendering, SVG export)
		$("#labels").click(function(event){
			$("#out").html("");
			if(labelsvis){
				$("#labels").html("show labels");
				$("#labels").css("border-left", "0px solid #fafafa");
				labelsvis = false;
			}
			else {
				$("#labels").html("hide labels");
				$("#labels").css("border-left", "5px solid #f0f0f0");
				labelsvis = true;
			}
			renderGraph("out");
		});

		$("#svgexport").click(function(event){
			var basesvg = $("#out").html();
			var header = '<?xml version="1.0" encoding="UTF-8"?>\n\
 <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">';
			var svgcontent = header + '\n  ' + basesvg.substring(basesvg.indexOf('<svg>') + '<svg>'.length);
			$("body").prepend("<div class='svgout'><button id='closesvgout'>Close</button><div><textarea rows='20' cols='80'>\n" + svgcontent + "</textarea></div></div>");
		});
		
		$("#closesvgout").live('click', function(event){
			$(".svgout").remove();
		});
		

		// handling restrictions (via SPARQL query)
		$("#restrict").click(function(event){ 
			$("#restrictions").slideToggle('slow', function() {
				if($("#restrictions").is(":visible")){
					$("#restrict").css("border-left", "5px solid #f0f0f0"); 
				}
				else{
					$("#restrict").css("border", "0px solid #fafafa"); 
				} 
			  });
			
		});
		
		// handling entry save and load
		$("#save").click(function(event){
			var ename = prompt('Entry name:', '');
			if (ename) {
				if( entrycntr < MAX_ENTRIES ) {
					saveCLOB('turtled.net' + entrycntr, ename, $("#tinput").val());
					entrycntr += 1;
					buildEntryList();
					status("RDF Turtle input saved.");
				}
				else {
					status("Can only save up to " + MAX_ENTRIES + " entries, sorry.");
				}
			}
			else{
				status("You haven't told me under which name to save the entry, canceling ...");
			}
		});
		
		$(".entry").live('click', function(event){
			var ename = getCLOB($(this).attr('id')).name;
			// var timestamp = getCLOB($(this).attr('id')).timestamp;
			var rdfturtle = getCLOB($(this).attr('id')).payload;
			$("#tinput").val(rdfturtle); 
			$("#currententry").html(ename + " <button id='delete' title='" + $(this).attr('id') + "'>Delete!</button>");
			$("#examples-sel").slideUp("fast");
			$("#img-examples").css("border", "0px solid #fafafa"); 
			$("#currententry").slideDown("medium");
		});
		
		$("#delete").live('click', function(event){
			var response = confirm('Are you sure you want to delete this entry?');
			if (response) {
				removeCLOB($(this).attr('title')); // using @title of the delete button to remeber which entry we're on
				$("#currententry").html("");
				buildEntryList();
				status("Entry deleted.");
			}
			else{
				status("Canceling deletion ...");
			}
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

function applyRestriction(store, query){
	store.execute(query, function(success, g){
		store.insert(g, "http://turtled.net/restrictions#", function(success) {
			var namedGraphs  = ["http://turtled.net/restrictions#"];
			store.executeWithEnvironment("SELECT * { ?s ?p ?o }", namedGraphs, namedGraphs, function(success, results){
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
		}) ;
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


// low-level storage API

function buildEntryList(){
	$("#entries").html("");
	for (var i=0; i < MAX_ENTRIES; i++) {
		if(turtledstorage.getItem('turtled.net' + i)) {
			var ename = getCLOB('turtled.net' + i ).name;
			var timestamp = getCLOB('turtled.net' + i ).timestamp;
			$("#entries").append("<span class='entry' title='last updated on " +  timestamp + "' id='turtled.net" + i + "'><img src='img/entry.png' alt='Saved entry' />" + ename + "</span>");
			entrycntr = i +  1;
		}
	}
}

function saveCLOB(key, name, payload) {
	var entry = { timestamp : new Date() , name: name, payload : payload };
	turtledstorage.setItem(key, JSON.stringify(entry));
}

function getCLOB(key){
	var clob = JSON.parse(turtledstorage.getItem(key));
	return clob;
}

function removeCLOB(key){
	turtledstorage.removeItem(key);
}



