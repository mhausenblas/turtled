var graph = Viva.Graph.graph();
var graphics = Viva.Graph.View.svgGraphics();
var layout = Viva.Graph.Layout.forceDirected(graph, {
	springLength: 30,
	springCoeff: 0.0008,
	dragCoeff: 0.009,
	gravity: -1.2,
	theta: 0.8
});

$(document).ready(function(){

	$("#out").css('margin-left', $("#in").width() + 10);

	rdfstore.create(function(store) {
		
		$("#vis").click(function(event){
			var tinput = $('#tinput').val();
			
			status("");
			
			store.load("text/turtle", tinput, function(success, results) {
				if(success){
					status("Valid RDF Turtle. Loaded <strong>" + results + "</strong> triples.");
					graph.addLink(1, 2);
					renderGraph("out");
				}
				else {
					status("<span style='color:red'>Invalid RDF Turtle :(</span>" );
				}
				
			});
		});
		
	});
});

function status(msg){
	$('#status').html(msg);
}


function listTriples(){
	store.execute("SELECT * { ?s ?p ?o }", function(success, results){
	  if(success) {
	    // process results        
	    if(results[0].s.token === 'uri') {
	      console.log(results[0].s.value);
	    }       
	  }
	});
}

function renderGraph(containerID){
	var renderer = Viva.Graph.View.renderer(graph, {
		layout: layout,
		graphics: graphics,
		renderLinks: true,
		container: document.getElementById(containerID)
	});
	renderer.run();
}


