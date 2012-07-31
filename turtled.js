// CONFIGURATION
var MAX_ENTRIES = 10; // number of entries that a user can save via local Web storage
var DISPLAY_LENGTH_LITERAL = 15; // max. length of a literal label that will be displayed
var DISPLAY_LENGTH_NODE = 30; // max. length of a node label that will be displayed

// internal stuff, do not touch
var graph = Viva.Graph.graph();
var graphics = Viva.Graph.View.svgGraphics();
var turtledstorage = window.localStorage;
var entrycntr = 0;
var labelsvis = false;
var gstats = { numtriples : 0, numentities : 0,  numclasses : 0 };
var URIs2prefixes = {};

// rendering of nodes and properties
graphics.node(function(node) {
	var l = node.data.label;
	var d = l;
	var g = Viva.Graph.svg('g');
	var ellipseRX = 95; // defaults for ...
	var ellipseRY = 15; // use-prefix rendering mode
	
	if($('#useprefixes').is(':checked')){ // user prefers to use prefixes for display
		if(node.data.type != 'literal') { // we have a URI, try to create a short label via prefix
			d = lookupPrefix4URI(node.data.label);	
		} 
	}
	else {
		ellipseRX = 120;
	}
	
	if(labelsvis){ // only lines - show only labels
		if (node.data.type == 'literal') {
			d = '"' + d + '"';
		}
		return	Viva.Graph.svg('text')
				.attr('style', 'stroke-width: 0.1; font-family: Arial; font-size: 60%; stroke: #303030;')
				.text(d);
	}
	else { // ellipses and rects
		if (node.data.type == 'literal') {
			// make it fit in the place available
			if(d.length > DISPLAY_LENGTH_LITERAL){
				d = d.substring(0, DISPLAY_LENGTH_LITERAL) + " ...";
			}
			g.append(Viva.Graph.svg('rect')
					.attr('width', 130)
					.attr('height', 20)
					.attr('style', 'stroke: #000; fill: #fff')
					.attr('title', l));
			g.append(Viva.Graph.svg('text')
					.attr('style', 'stroke-width: 0.1; font-family: Arial; font-size: 60%; stroke: #303030;')
					.attr('title', l)
					.text(d));
		} 
		else {
			// make it fit in the place available
			if(d.length > DISPLAY_LENGTH_NODE){
				d = d.substring(0, DISPLAY_LENGTH_NODE) + " ...";
			}
			g.append(Viva.Graph.svg('ellipse')
					.attr('rx', ellipseRX)
					.attr('ry', ellipseRY)
					.attr('style', 'stroke: #000; fill: #fff')
					.attr('title', l));
			g.append(Viva.Graph.svg('text')
					.attr('style', 'stroke-width: 0.1; font-family: Arial; font-size: 60%; stroke: #303030;')
					.attr('title', l)
					.text(d));
		}
		return g;
	}
})
.placeNode(function(nodeUI, pos){
	if(labelsvis){ // only lines
		nodeUI.attr('x', pos.x - 20).attr('y', pos.y);
	}
	else { // ellipses and rects
		for (var i=0; i < nodeUI.childNodes.length; i++) {
			// console.log("dealing with a " + nodeUI.childNodes[i].constructor.name);
			if(nodeUI.childNodes[i] instanceof SVGTextElement){
				nodeUI.childNodes[i].attr('x', pos.x - 40).attr('y', pos.y + 15);
			}
			if(nodeUI.childNodes[i] instanceof SVGRectElement){
				nodeUI.childNodes[i].attr('x', pos.x - 50).attr('y', pos.y);
			}
			if(nodeUI.childNodes[i] instanceof SVGEllipseElement){
				if($('#useprefixes').is(':checked')){
					nodeUI.childNodes[i].attr('cx', pos.x + 20).attr('cy', pos.y + 10);
					
				}
				else {
					nodeUI.childNodes[i].attr('cx', pos.x + 50).attr('cy', pos.y + 10);
				}
			}
		}
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

	// make sure we have the URI-to-prefix mapping handy when needed
	loadPrefixes();
	
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
					showStats(store);
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
		$("#ex3").click(function(event){ $("#tinput").val(ex3); });

		// handling output support (node/link lables rendering, SVG export)
		$("#labels").click(function(event){
			$("#out").html("");
			if(labelsvis){
				$("#labels").html("full");
				labelsvis = false;
			}
			else {
				$("#labels").html("plain");
				labelsvis = true;
			}
			renderGraph("out");
		});

		$("#useprefixes").click(function(event){
			$("#out").html("");
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
		$("text").live('click', function(event){
			status("You've selected the resource: <span style='color:blue'>" +  lookupPrefix4URI($(this).attr('title')) + "</span>" );
		});

		$("ellipse").live('click', function(event){
			if($('#useprefixes').is(':checked')){
				status("You've selected the resource: <span style='color:blue'>" +  lookupPrefix4URI($(this).attr('title')) + "</span>" );
			}
			else {
				status("You've selected the resource: <span style='color:blue'>" +  $(this).attr('title') + "</span>" );
			}
		});
		
		$("rect").live('click', function(event){
			status("You've selected the literal: <span style='color:blue'>" +  $(this).attr('title') + "</span>" );
		});

		$("line").live('click', function(event){
			if($('#useprefixes').is(':checked')){
				status("You've selected the property: <span style='color:blue'>" +  lookupPrefix4URI($(this).attr('title')) + "</span>" );
			}
			else {
				status("You've selected the property: <span style='color:blue'>" +  $(this).attr('title') + "</span>" );
			}
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

function showStats(store){
	$("#stats").html("<strong>Stats:</strong> " + gstats.numtriples + " triple(s)");

	store.execute("SELECT (COUNT(DISTINCT ?class) AS ?classcount) { ?s a ?class . }", function(success, results){
		gstats.numclasses = results[0].classcount.value;
		store.execute("SELECT (COUNT(DISTINCT ?s) AS ?subjectcount) { ?s ?p ?o. }", function(success, results){
			gstats.numentities = results[0].subjectcount.value;
			$("#stats").html("<strong>Stats:</strong> " +
							gstats.numtriples  + ( gstats.numtriples > 1 ? " triples, " : " triple, " ) +
							gstats.numentities + ( gstats.numentities > 1 ? " entities, " : " entity, " ) +
							gstats.numclasses + ( gstats.numclasses > 1 ? " types. " : " type. " )  
			);
		});
	});
}

// prefixes
function loadPrefixes(){
	$.each(prefixes2URIs, function(key, val) {
		URIs2prefixes[val] = key;
	});
}

function lookupPrefix4URI(URI){
	var candidate = "";
	
	if(URI.indexOf("#") !=  -1){ // we have a hash URI
		candidate = URI.substring(0, URI.indexOf("#") + 1);
		if(URIs2prefixes[candidate]){
			return URIs2prefixes[candidate] + ":" + URI.substring(URI.lastIndexOf("#") + 1);
		}
		else {
			return URI;
		}
	}
	else {
		if(URI.indexOf("/") !=  -1){ // we have a slash URI
			candidate = URI.substring(0, URI.lastIndexOf("/") + 1);
			if(URIs2prefixes[candidate]){
				return URIs2prefixes[candidate] + ":" + URI.substring(URI.lastIndexOf("/") + 1);
			}
			else {
				return URI;
			}
		}
		else return URI;
	}
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



