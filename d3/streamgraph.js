function streamgraph(graph) {
	graph = JSON.parse(graph);

	var margin = {
		top : 300,
		right : 50,
		bottom : 50,
		left : 50
	},
	    width = 1000 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	/*var graph = {
		"name" : "VisualizationStreamgraphAverageColor",
		"multimediaobjet" : "11",
		"colors" : ["rgb(255,0,0)", "rgb(255,255,0)", "rgb(0,34,56)"],
		"data" : [[456, 456, 456], [74, 74, 74], [92, 92, 92]]
	};*/

	var data = graph["data"];
	//console.log(data);

	//get the max y of the domain, so that itll never go beyond screen
	var sum = new Array(data.length);
	//placeholder array
	for (var x = 0; x < data.length; x++) {
		sum[x] = 0;
		for (var y = 0; y < data.length; y++) {
			sum[x] += data[y][x];
			//sum up values vertically
		}
	}

	// permute the data
	data = data.map(function(d) {
		return d.map(function(p, i) {
			return {
				x : i,
				y : p,
				y0 : 0
			};
		});
	});

	//console.log(graph["colors"]);
	var color = graph["colors"];

	var x = d3.scale.linear().range([0, width]).domain([0, data[0].length]);

	var y = d3.scale.linear().range([height, 0]).domain([0, d3.max(sum)]);
	//max y is the sum we calculated earlier

	var svg = d3.select("#graph").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var stack = d3.layout.stack().offset("wiggle");
	//<-- creates a streamgraph

	var layers = stack(data);

	//vis type
	var area = d3.svg.area().interpolate('cardinal').x(function(d, i) {
		return x(i);
	}).y0(function(d) {
		return y(d.y0);
	}).y1(function(d) {
		return y(d.y0 + d.y);
	});

	svg.selectAll(".layer").data(layers).enter().append("path").attr("class", "layer").attr("d", function(d) {
		return area(d);
	}).style("fill", function(d, i) {
		return color[i];
	});
}