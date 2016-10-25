
/**
 * Constructor for the ElectoralVoteChart
 *
 * @param shiftChart an instance of the ShiftChart class
 */
function ElectoralVoteChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 150;

    //creates svg element within the div
    self.svg = divelectoralVotes.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party == "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

ElectoralVoteChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    // ******* TODO: PART II *******

    //Group the states based on the winning party for the state;
    //then sort them based on the margin of victory

    var D_TotalEV=0, R_TotalEV=0, I_TotalEV=0;
    
    electionResult.forEach(function(d,i){
       // console.log(d);
        if(d.State_Winner == "I"){
            I_TotalEV = (+d.I_EV_Total);
        }else if(d.State_Winner == "D"){
            D_TotalEV = (+d.D_EV_Total);
        }else(d.State_Winner == "R")
            R_TotalEV = (+d.R_EV_Total);

    })

    /*console.log("R " + R_TotalEV);
    console.log("D " + D_TotalEV);
    console.log("I " + I_TotalEV);*/

    var total_EV = D_TotalEV + R_TotalEV+ I_TotalEV;
    //console.log(total_EV);

    var widthScale = d3.scaleLinear().domain([0, total_EV]).range([0, self.svgWidth]);

    var sortFirstOrder = ['I', 'D', 'R'];

    var electoralVoteData = d3.nest()
        .key(function (d) {
            return d.State_Winner;
        })
        .sortKeys(function(a,b) { return sortFirstOrder.indexOf(a) - sortFirstOrder.indexOf(b); })
        .entries(electionResult);

    console.log(electionResult[0]);

    for(var i = 0; i < electoralVoteData.length; ++i){
        if(electoralVoteData[i].key == "I"){
            electoralVoteData[i].values.sort(function(a,b){return d3.descending(parseFloat(a.Total_EV),parseFloat(b.Total_EV));  });
        }else if(electoralVoteData[i].key == "D" ){
            electoralVoteData[i].values.sort(function(a,b){ return d3.ascending(parseFloat(a.RD_Difference),parseFloat(b.RD_Difference)); });
        }else if(electoralVoteData[i].key == "R"){
            electoralVoteData[i].values.sort(function(a,b){return d3.ascending(parseFloat(a.RD_Difference),parseFloat(b.RD_Difference)); });
        }
    }

    //console.log(electoralVoteData);
    var electoralGroupSvg = self.svg.selectAll("g").data(electoralVoteData);
    electoralGroupSvg.exit().remove();

    //HINT: Use .electoralVotes class to style your bars.
   // var stack = d3.stack();
    electoralGroupSvg = electoralGroupSvg.enter().append("g").merge(electoralGroupSvg);

    var prevPos = 0;
    electoralGroupSvg.attr("transform", function (d,i) {

        if (i != 0) {
            prevPos += d3.sum(electoralVoteData[i-1].values, function (j) {
                return widthScale(parseInt(j.Total_EV));
            });
        }
        return "translate("+(0)+",0)";
    })

    var rectSvg = electoralGroupSvg.selectAll("rect").data(function(d){return d.values;});

    rectSvg.exit().remove();
    rectSvg = rectSvg.enter().append("rect")
        .attr("class","electoralVotes")
        .merge(rectSvg);

    var prevWidth = 0;
    var width_Current = 0;
    rectSvg.attr("x", function(d) {
            var wid = widthScale(parseInt(d.Total_EV));
            if(width_Current == 0){
                width_Current += wid;
                return 0;
            }
            else{
                width_Current += prevWidth;
                prevWidth = wid;
                return width_Current;
            }
        })
        .attr("y", self.svgHeight/2)
        .attr("height", 30)
        .attr("width", function(d) { return widthScale(d.Total_EV); })
        .attr("fill", function (d) {
            if(d.State_Winner == 'I'){
                return "green";
            }
            return colorScale(d.RD_Difference);
        });

    var textSvg = electoralGroupSvg.selectAll("text").data(electoralVoteData);

    textSvg.exit().remove();

    textSvg = textSvg.enter().append("text").merge(textSvg);

    self.svg.append("rect")
        .attr("x",self.svgWidth/2)
        .attr("y",self.svgHeight/2 - 10)
        .attr("width",4)
        .attr("height",50)
        .attr("class","middlePoint");
        //.classed("middlePoint",true);

    self.svg.append("text")
        //.classed("electoralVotesNote",true)
        .attr("class","electoralVotesNote")
        .attr("x",self.svgWidth/2)
        .attr("y",self.svgHeight/2 - 10)
        .text("Electoral Vote (270 needed to win)");

    textSvg.attr("y",self.svgHeight/2-10)
        .attr("class",function(d){return "electoralVoteText "+self.chooseClass(d.key);})
        .text(function(d){
            return d3.sum(d.values,function(i){
                return parseInt(i.Total_EV);
            });
        })
        .attr("x",function(d,i) {
            if (d.key == "R") {
                return self.svgWidth;
            } else if (d.key == "I") {
                return 0;
            }else if (d.key == "D") {
                if(electoralVoteData.length >2){
                    var pos = d3.sum(electoralVoteData[0].values, function (j) {
                        var w = parseInt(j.Total_EV);
                        return widthScale(w);
                    });
                    return pos;
                }else{
                    return 0;
                }
            }
        });
    //Display total count of electoral votes won by the Democrat and Republican party
    //on top of the corresponding groups of bars.
    //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.

    //Just above this, display the text mentioning the total number of electoral votes required
    // to win the elections throughout the country
    //HINT: Use .electoralVotesNote class to style this text element

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

    //******* TODO: PART V *******
    //Implement brush on the bar chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of shiftChart and pass the data corresponding to brush selection.
    var brush = d3.brushX()
            //.x(widthScale)
            .extent([[0, (self.svgHeight/2)-20], [self.svgWidth, (self.svgHeight/2)+50]])
        //.extent([[0, (self.svgHeight)-20], [self.svgWidth, (self.svgHeight)+50]])
        .on("end", brushed);

    var brushsvg = self.svg.append("g").attr("class", "brush").call(brush);

    brushsvg.selectAll("rect")
        .attr("height", self.svgHeight-40);

    var selectedStates = "";

    function brushed() {
        if (!d3.event.selection) return; // Ignore empty selections.
        var d0 = d3.event.selection.map(widthScale.invert);
            //d1 = d0.map(d3.timeDay.round);
        minX = widthScale(d0[0]);
        maxX = widthScale(d0[1]);
        console.log(minX, maxX);
        //console.log(widthScale(minX), widthScale(maxX));
        var prevWidth = 0;
        var width_Current = 0;
        var selectedStates = "";
        electionResult.forEach(function(i){
            var wid = widthScale(parseInt(i.Total_EV));
            //console.log("wid "+wid);
            if(width_Current == 0){
                width_Current += wid;
                prevWidth = wid;
            }else{
                prevWidth = wid;
                width_Current += prevWidth;
            }
            //console.log("wid current "+width_Current);

            //console.log("State outside "+i.State);
            if((width_Current-wid >= minX && width_Current <= maxX)){
                //console.log("prev width "+prevWidth);
                //console.log("width_Current inside "+width_Current);
                console.log("wid "+wid);
                console.log("State "+i.State);
                if(selectedStates.length == 0)
                    selectedStates = selectedStates+ i.State;
                else{
                    selectedStates = selectedStates+ ","+ i.State;
                }

            }

        });
        //console.log(selectedStates);
        var selectedStatesArray = selectedStates.split(",");
        ShiftChart.prototype.update(selectedStatesArray);
    }

};
