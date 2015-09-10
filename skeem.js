var diameter = 600,
    radius = diameter / 2,
    innerRadius = radius - 120,
	margin = {top: 80, right: 120, bottom: 85, left: 120},
	svg_width = diameter + margin.left + margin.right,
	svg_height = diameter + margin.top + margin.bottom;

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return 1; });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(0.8)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select("#skeem").append("svg")
	.attr("id", "skeemi_ID")
    .attr("width", 10) 
    .attr("height", 10) 
  .append("g")
    .attr("transform", "translate(" + (radius + margin.left) + "," + (radius + margin.top) + ")");


function vali_oppekava(d){

	d3.select("#seosed").remove();
	d3.select("#oppeained").remove();

	d3.select("#skeem").append("svg")
	.attr("id", "skeemi_ID")
    .attr("width", 10) 
    .attr("height", 10) 
  .append("g")
    .attr("transform", "translate(" + (radius + margin.left) + "," + (radius + margin.top) + ")");

	
	if(d == "intro"){
		d3.select("svg") 
			.attr("width", 0)
			.attr("height", 0)
		.append("g")
			.attr("transform", "translate(" + (radius + margin.left) + "," + (radius + margin.top) + ")");

		d3.select("#header p").html(textintro);
		d3.select("#juhised p").html(juhised_intro);
	}
	else{
		d3.select("svg")    
			.attr("width", svg_width)
			.attr("height", svg_height)
		.append("g")
			.attr("transform", "translate(" + (radius + margin.left) + "," + (radius + margin.top) + ")");
		
		if(d == "remove"){
			//d3.select("#skeemi_ID").select("svg").remove();
			svg.selectAll("*").remove();
		}
		else{
			create_figure(d);
		}
	}
	

};

function create_figure(classes){

	var link = svg.append("g").attr("id", "seosed").selectAll(".link"),
		node = svg.append("g").attr("id", "oppeained").selectAll(".node");
		
		
	//d3.json("ained_mat.json", function(error, classes) {

	  var nodes = cluster.nodes(packageHierarchy(classes)),
		  links = import_eeldusained(nodes),
		  links2 = import_eeldusained2(nodes);


	  link2 = link
		  .data(bundle(links2))
		.enter().append("path")
		  .each(function(d) { d.source2 = d[0], d.target2 = d[d.length - 1]; })
		  .attr("class", "link")
		  .style("stroke-dasharray", ("5, 5"))
		  .attr("d", line);
		  
	 link = link
		  .data(bundle(links))
		.enter().append("path")
		  .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
		  .attr("class", "link")
		  .attr("d", line);
		  
	  node = node
		  .data(nodes.filter(function(n) { return !n.children; }))
		.enter().append("text")
		  .attr("class", "node")
		  .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
		  .attr("dy", ".31em")
		  .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")" + (d.x < 180 ? "" : "rotate(180)"); })
		  .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		  .text(function(d) { return d.key; })
		  .on("mouseover", mouseovered)
		  .on("mouseout", mouseouted);
	// });

	function mouseovered(d) {

	  node
		  .each(function(n) { n.target = n.source = false; });
	  node
		  .each(function(n) { n.target2 = n.source2 = false; });


	  link
		  .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
		  .classed("link--source", function(l) {if (l.source === d) return l.target.target = true; })
		.filter(function(l) { return l.target === d || l.source === d; })
		  .each(function() { this.parentNode.appendChild(this); });
		  
	  link2
		  .classed("link--target2", function(l) { if (l.target2 === d) return l.source2.source2 = true; })
		  .classed("link--source2", function(l) {if (l.source2 === d) return l.target2.target2 = true; })
		.filter(function(l) { return l.target2 === d || l.source2 === d; })
		  .each(function() { this.parentNode.appendChild(this); });


	  node
		  .classed("node--target", function(n) { return n.target; })
		  .classed("node--source", function(n) { return n.source; });
		  
	  node
		  .classed("node--target2", function(n) { return n.target2; })
		  .classed("node--source2", function(n) { return n.source2; });

	}


	function mouseouted(d) {

	  link
		  .classed("link--target", false)
		  .classed("link--source", false);
		  
	  link2
		  .classed("link--target2", false)
		  .classed("link--source2", false);

	  node
		  .classed("node--target", false)
		  .classed("node--source", false);
	  node
		  .classed("node--target2", false)
		  .classed("node--source2", false);

	}

	d3.select(self.frameElement).style("height", diameter + "px");

	function packageHierarchy(classes) {
	  var map = {};

	  function find(name, data) {
		var node = map[name], i;
		if (!node) {
		  node = map[name] = data || {name: name, children: []};
		  if (name.length) {
			node.parent = find(name.substring(0, i = name.lastIndexOf("_")));
			node.parent.children.push(node);
			node.key = name.substring(i + 1);
		  }
		}
		return node;
	  }

	  classes.forEach(function(d) {
		var newname = d.semester.concat("_", d.aine);
		find(newname, d);
	  });

	  return map[""];
	}

	function import_eeldusained(nodes) {
	  var map = {},
		  imports = [];

	  nodes.forEach(function(d) {
		map[d.aine] = d;
	  });

	  nodes.forEach(function(d) {
		if (d.eeldusained) d.eeldusained.forEach(function(i) {
		  imports.push({source: map[d.aine], target: map[i]});
		});
	  });

	  return imports;
	}

	function import_eeldusained2(nodes) {
	  var map = {},
		  imports = [];

	  nodes.forEach(function(d) {
		map[d.aine] = d;
	  });

	  nodes.forEach(function(d) {
		if (d.eeldusained2) d.eeldusained2.forEach(function(i) {
		  imports.push({source: map[d.aine], target: map[i]});
		});
	  });

	  return imports;
	}
};

$("#filters a").click(function() {
    $("#filters a").removeClass("active");
    $(this).addClass("active");
	
	var ind = $(this).attr("id");
	
});


d3.select("#skeem").attr("align","center");
