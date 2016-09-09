$(function() {
	$(".button-collapse").sideNav();
	$(document).ready(function() {
		$('select').material_select();
	});
	
	$('#search-button').click(function(){
		$("#graph").empty();
		//console.log($('#visualization').val());
		var value = $('#visualization').val();
		switch (value) {
			case "sunburst":
				sunburst();
				break;
			case "streamgraph":
				streamgraph();
				break;
			case "raindrops":
				raindrops();
				break;
			case "forceDirectedGraph":
				forceDirectedGraph();
				break;
			default:
				break;
		}
	});
});
