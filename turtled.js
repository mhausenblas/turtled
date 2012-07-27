$(document).ready(function(){
	rdfstore.create(function(store) {
		
		$("#vis").click(function(event){
			var tinput = $('#tinput').val();
			
			status("");
			
			store.load("text/turtle", tinput, function(success, results) {
				status("Valid RDF Turtle: " + success);
			});
		});
		
	});
});

function status(msg){
	$('#status').html(msg);
}