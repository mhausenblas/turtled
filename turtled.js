$(document).ready(function(){
	rdfstore.create(function(store) {
		
		$("#vis").click(function(event){
			var tinput = $('#tinput').val();
			
			status("");
			
			store.load("text/turtle", tinput, function(success, results) {
				if(success){
					status("Valid RDF Turtle. Loaded <strong>" + results + "</strong> triples.");
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