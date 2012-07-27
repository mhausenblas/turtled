var graph = Viva.Graph.graph();
var graphics = Viva.Graph.View.svgGraphics();

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

// graphics.link(function(link) {
// 		return Viva.Graph.svg('line')
// 				.attr('title', link.data.label);
// });


$(document).ready(function(){

	$("#out").css('margin-left', $("#in").width() + 10); // adjust size of output area

	rdfstore.create(function(store) {
		
		$("#vis").click(function(event){
			var tinput = $('#tinput').val();
			
			status("");
			
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
		
		$("#clear").click(function(event){
			$("#out").html("");
		});
	
		$("ellipse").live('click', function(event){
			status("You've selected the resource: <span style='color:blue'>" +  $(this).attr('title') + "</span>" );
		});
		
		$("rect").live('click', function(event){
			status("You've selected the literal: <span style='color:blue'>" +  $(this).attr('title') + "</span>" );
		});
		
		
	});
});

function status(msg){
	$('#status').html(msg);
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


