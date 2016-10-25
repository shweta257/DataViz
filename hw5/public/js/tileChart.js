/**
 * Constructor for the TileChart
 */
function TileChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required to lay the tiles
 * and to populate the legend.
 */
TileChart.prototype.init = function(){
    var self = this;

    //Gets access to the div element created for this chart and legend element from HTML
    var divTileChart = d3.select("#tiles").classed("content", true);
    var legend = d3.select("#legend").classed("content",true);
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    var svgBounds = divTileChart.node().getBoundingClientRect();
    self.svgWidth = svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgWidth/2;
    var legendHeight = 150;

    //creates svg elements within the div
    self.legendSvg = legend.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",legendHeight)
        .attr("transform", "translate(" + self.margin.left + ",0)")

    self.svg = divTileChart.append("svg")
                        .attr("width",self.svgWidth)
                        .attr("height",self.svgHeight)
                        .attr("transform", "translate(" + self.margin.left + ",0)")
                        .style("bgcolor","green")

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
TileChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party== "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
TileChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<h2 class ="  + self.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
    text +=  "Electoral Votes: " + tooltip_data.electoralVotes;
    text += "<ul>"
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });
    text += "</ul>";
    return text;
}

/**
 * Creates tiles and tool tip for each state, legend for encoding the color scale information.
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
TileChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    //Calculates the maximum number of columns to be laid out on the svg
    self.maxColumns = d3.max(electionResult,function(d){
                                return parseInt(d["Space"]);
                            });

    //Calculates the maximum number of rows to be laid out on the svg
    self.maxRows = d3.max(electionResult,function(d){
                                return parseInt(d["Row"]);
                        });
    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    var presentI = 0;
    electionResult.forEach(function(d){
        if(d.key == "I")
            presentI = 1;
    });

    tip = d3.tip().attr('class', 'd3-tip')
        .direction('se')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
            console.log(d.State_Winner);
            /* populate data in the following format*/
            if(presentI != 1) {
                var tooltip_data = {
                    "state": d.State,
                    "winner":d.State_Winner,
                    "electoralVotes" : d.Total_EV,
                    "result":[
                        {"nominee": d.D_Nominee_prop,"votecount": d.D_Votes,"percentage": d.D_Percentage,"party":"D"} ,
                        {"nominee": d.R_Nominee_prop,"votecount": d.R_Votes,"percentage": d.R_Percentage,"party":"R"}

                    ]
                    // d.State, "ElectoralVotes : "
                };
            }else{
                var tooltip_data = {
                    "state": d.State,
                    "winner":d.State_Winner,
                    "electoralVotes" : d.Total_EV,
                    "result":[
                        {"nominee": d.D_Nominee_prop,"votecount": d.D_Votes,"percentage": d.D_Percentage,"party":"D"} ,
                        {"nominee": d.R_Nominee_prop,"votecount": d.R_Votes,"percentage": d.R_Percentage,"party":"R"} ,
                        {"nominee": d.I_Nominee_prop,"votecount": d.I_Votes,"percentage": d.I_Percentage,"party":"I"}
                    ]
                    // d.State, "ElectoralVotes : "
                };
            }
              /*tooltip_data = {
              "state": d.State,
              "winner":d.State_Winner,
              "electoralVotes" : d.Total_EV,
              "result":[
                  {"nominee": d.D_Nominee_prop,"votecount": d.D_Votes,"percentage": d.D_Percentage,"party":"D"} ,
                  {"nominee": d.R_Nominee_prop,"votecount": d.R_Votes,"percentage": d.R_Percentage,"party":"R"} ,
                  {"nominee": d.I_Nominee_prop,"votecount": d.I_Votes,"percentage": d.I_Percentage,"party":"I"}
              ]
             // d.State, "ElectoralVotes : "
              }*/
             /* pass this as an argument to the tooltip_render function then,
             * return the HTML content returned from that method.
             * */
            return self.tooltip_render(tooltip_data);
        });

    //Creates a legend element and assigns a scale that needs to be visualized
    var legend = self.legendSvg.append("g")
        //.attr("trasform", "translate(40,0)")
        .attr("class", "legendQuantile");

    var legendQuantile = d3.legendColor()
        .shapeWidth(60)
        .cells(10)
        .orient('horizontal')
        .scale(colorScale);

    //legend.selectAll(".legendCells").attr("transform", "translate(100,0");
    legend.style("font-size","10px").call(legendQuantile);

    legend.attr("transform", "translate(100,0)");


    // ******* TODO: PART IV *******
    //Tansform the legend element to appear in the center and make a call to this element for it to display.
    //console.log(electionResult);
    //Lay rectangles corresponding to each state according to the 'row' and 'column' information in the data.
    var electionSvg = self.svg.selectAll("g")
        .data(electionResult);

    electionSvg.exit().remove();

    var electionSvg = electionSvg.enter()
        .append("g").merge(electionSvg);

    electionSvg.call(tip);

    //Display the state abbreviation and number of electoral votes on each of these rectangles

    //Use global color scale to color code the tiles.

    //HINT: Use .tile class to style your tiles;
    // .tilestext to style the text corresponding to tiles

    var rectSvg =electionSvg.selectAll("rect").data(function(d){return [d]});
    rectSvg.exit().remove();
    //ectSvg
    rectSvg = rectSvg.enter().append("rect").merge(rectSvg);

    //rectSvg.append("rect")
        rectSvg.attr("x", function(d) {
            return d.Space*(self.svgWidth-10)/12 +10 ;
        })
        .attr("y", function (d) {
            return d.Row*(self.svgHeight-10)/8 +10 ;
        })
        .attr("height", (self.svgHeight-10)/8 )
        .attr("width", (self.svgWidth-10)/12)
        .attr("fill", function (d) {
            if(d.State_Winner == "I"){
                return "green";
            }else
                //return colorScale(d.Winner_Percentage);
            return colorScale(d.RD_Difference);
        })
        .attr("class","tile")
        .on("mouseover",tip.show)
        .on("mouseout", tip.hide);

    /*var electionSvgGroup = electionSvg.data(electionResult);
    electionSvgGroup .append("text")*/
    var textSvg =electionSvg.selectAll("text").data(function(d){return [d]});
    textSvg.exit().remove();
    //ectSvg
    textSvg = textSvg.enter().append("text").merge(textSvg);
    textSvg.text(function (d) {
            //console.log(d.Abbreviation);
            return d.Abbreviation;
        })
        .attr("dx", function (d) {
            return d.Space*(self.svgWidth-10)/12 +10 + (self.svgWidth-10)/24;
        })
        .attr("dy", function (d) {
            return d.Row*(self.svgHeight-10)/8+10  + (self.svgHeight-10)/16;
        })
        .style('fill','black')
        /*.attr("fill", function (d) {
            return self.chooseClass(d.State_Winner);
        })*/
        .attr("class","tilestext");

    electionSvg.append("text")
        .text(function (d) {
          //  console.log(d.D_EV);
            return d.Total_EV;
        })
        .attr("dx", function (d) {
            return d.Space*(self.svgWidth-10)/12 +10 + (self.svgWidth-10)/24;
        })
        .attr("dy", function (d) {
            return d.Row*(self.svgHeight-10)/8+ 20 + (self.svgHeight)/16;
        })
        //.style("fill","black")
        .style("fill", function (d) {
            return self.chooseClass(d.State_Winner);
        })
        .attr("class","tilestext");

    electionSvg.exit().remove();

    //Call the tool tip on hover over the tiles to display stateName, count of electoral votes
    //then, vote percentage and number of votes won by each party.
    //HINT: Use the .republican, .democrat and .independent classes to style your elements.
};
