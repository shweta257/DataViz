/** Global var to store all match data for the 2014 Fifa cup */
var teamData;

/** Global var for list of all elements that will populate the table.*/
var tableElements;


/** Variables to be used when sizing the svgs in the table cells.*/
var cellWidth = 70,
    cellHeight = 20,
    cellBuffer = 15,
    barHeight = 20;

/**Set variables for commonly accessed data columns*/
var goalsMadeHeader = 'Goals Made',
    goalsConcededHeader = 'Goals Conceded',
    deltaGoalsHeader = 'Delta Goals',
    resultHeader = 'Result',
    winningGameHeader = 'Wins',
    lostGameHeader = 'Losses',
    totalgamesHeader = 'TotalGames',
    resultLabelHeader = 'label';

/** Setup the scales*/
var goalScale = d3.scaleLinear()
    .range([cellBuffer, 2 * cellWidth - cellBuffer]);

/**Used for games/wins/losses*/
var gameScale = d3.scaleLinear()
    .range([0, cellWidth - cellBuffer]);

/**Color scales*/
/**For aggregate columns*/
var aggregateColorScale = d3.scaleLinear()
    .range(['#ece2f0', '#016450']);

/**For goal Column*/
var goalColorScale = d3.scaleQuantize()
    .domain([-1, 1])
    .range(['#cb181d', '#034e7b']);

/**json Object to convert between rounds/results and ranking value*/
var rank = {
    "Winner": 7,
    "Runner-Up": 6,
    'Third Place': 5,
    'Fourth Place': 4,
    'Semi Finals': 3,
    'Quarter Finals': 2,
    'Round of Sixteen': 1,
    'Group': 0
};

//console.log(rank["Winner"]);



//For the HACKER version, comment out this call to d3.json and implement the commented out
// d3.csv call below.

d3.json('data/fifa-matches.json',function(error,data){
    console.log(data);
    teamData = data;
    createTable();
    updateTable();
})


// // ********************** HACKER VERSION ***************************
// /**
//  * Loads in fifa-matches.csv file, aggregates the data into the correct format,
//  * then calls the appropriate functions to create and populate the table.
//  *
//  */
 d3.csv("data/fifa-matches.csv", function (error, csvData) {
     var key;
//
//    // ******* TODO: PART I *******
     teamData = d3.nest()
         .key(function (d) {
             //key = d.Team;
             return d.Team;
         })
         .rollup(function (leaves) {
             //console.log(leaves[0]["Result"]);
             var out = {};
             out["Goals Made"] =d3.sum(leaves, function (d) {
                 return d["Goals Made"];
             });
             out["Goals Conceded"] =d3.sum(leaves, function (d) {
                 return d["Goals Conceded"];
             });
             out["Delta Goals"] =d3.sum(leaves, function (d) {
                 return d["Delta Goals"];
             });
             out["Wins"] =d3.sum(leaves, function (d) {
                 return d["Wins"];
             });
             out["Losses"] =d3.sum(leaves, function (d) {
                 return d["Losses"];
             });
             out["Result"] ={};
             out["Result"]["label"] = leaves[0]["Result"];
             out["Result"]["ranking"] = d3.max(leaves, function (d) {
                 return rank[d["Result"]];
             });
             out["type"] = "aggregate";
             var teamGameData = d3.nest()
                 .key(function (d) {
                    return d.Opponent;
                 }).rollup(function(leafs){
                     //console.log(leaf);
                     var outInside = {};
                     outInside["Wins"] = [];
                     outInside["Losses"] = [];
                     outInside["Goals Made"] = leafs[0]["Goals Made"];
                     outInside["Goals Conceded"] = leafs[0]["Goals Conceded"];
                     outInside["Delta Goals"] = [];
                     outInside["Result"] ={};
                     outInside["Result"]["label"] = leafs[0]["Result"];
                     outInside["Result"]["ranking"] = rank[leafs[0]["Result"]];
                     outInside["type"] = "game";
                     //console.log(leafs[0].Team);
                     outInside["Opponent"] = leafs[0].Team;

                     return outInside;

                 })
                 .entries(leaves);

             out["games"] = teamGameData;
             out["TotalGames"] = leaves.length;
             return out;
         })
         .entries(csvData);
//     console.log(teamData[0]);

 });
// // ********************** END HACKER VERSION ***************************

/**
 * Loads in the tree information from fifa-tree.csv and calls createTree(csvData) to render the tree.
 *
 */
d3.csv("data/fifa-tree.csv", function (error, csvData) {

    //Create a unique "id" field for each game
    csvData.forEach(function (d, i) {
        d.id = d.Team + d.Opponent + i;
    });

    createTree(csvData);
});

/**
 * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
 * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
 *
 */

var sortAscending = true;
var sortHeaderAscending = true;

function sortTable(row_name){
    collapseList();
   // console.log(row_name);
    if(sortAscending) {
        tableElements.sort(function (a, b) {
            if (row_name.match("Goals")) {
                return d3.ascending(a.value[deltaGoalsHeader], b.value[deltaGoalsHeader]);
            }else if (row_name.match("Round/Result")) {
                return d3.ascending(a.value.Result.ranking, b.value.Result.ranking);
            }else if (row_name.match("Wins")) {
                return d3.ascending(a.value[winningGameHeader], b.value[winningGameHeader]);
            }else if (row_name.match("Losses")) {
                return d3.ascending(a.value[lostGameHeader], b.value[lostGameHeader]);
            }else if (row_name.match("Total Games")) {
                return d3.ascending(a.value[totalgamesHeader], b.value[totalgamesHeader]);
            }
        });
        sortAscending = false;
    }else{
        tableElements.sort(function (a, b) {
            if (row_name.match("Goals")) {
                return d3.descending(a.value[deltaGoalsHeader], b.value[deltaGoalsHeader]);
            }else if (row_name.match("Round/Result")) {
                return d3.descending(a.value.Result.ranking, b.value.Result.ranking);
            }else if (row_name.match("Wins")) {
                return d3.descending(a.value[winningGameHeader], b.value[winningGameHeader]);
            }else if (row_name.match("Losses")) {
                return d3.descending(a.value[lostGameHeader], b.value[lostGameHeader]);
            }else if (row_name.match("Total Games")) {
                return d3.descending(a.value[totalgamesHeader], b.value[totalgamesHeader]);
            }
        });
        sortAscending = true;
    }
    updateTable();
}

function sortTableHeader(){
    collapseList();
    if(sortHeaderAscending) {
        tableElements.sort(function(a,b){
            return d3.ascending(a.key, b.key);
        });
        sortHeaderAscending = false;
    }else {
        tableElements.sort(function(a,b){
            return d3.descending(a.key, b.key);
        });
        sortHeaderAscending = true;
    }
    updateTable();
}

function createTable() {

// ******* TODO: PART II *******
    //console.log(teamData);

    goalScale.domain([0,d3.max(teamData,function(d){
        return Math.max(d.value[goalsMadeHeader],d.value[goalsConcededHeader]);
    })]);

    var xAxis = d3.axisTop(goalScale);

    console.log(cellHeight);
    var xAxisSvgElement = d3.select("#goalHeader")
        .append("svg")
        .attr("height",cellHeight)
        .attr("width", 2*cellWidth)
        .append("g")
        .attr("id","xAxis")
        .attr("transform","translate(0,"+(cellHeight-1)+")")
        .call(xAxis);

    gameScale.domain([0,d3.max(teamData,function(d){
        return d.value[totalgamesHeader];
    })]);

    aggregateColorScale.domain([0,d3.max(teamData,function(d){
        return d.value[totalgamesHeader];
    })]);

    tableElements = teamData;
    // ******* TODO: PART V *******

    d3.select("thead").select("tr")
        .select("th")
        .on("click",function(){
            sortTableHeader(this.innerText);
        });

    d3.select("thead").select("tr")
        .selectAll("td")
        .on("click",function(){
            sortTable(this.innerText);
        });

// ******* TODO: PART V *******

}

/**
 * Updates the table contents with a row for each element in the global variable tableElements.
 *
 */
function updateTable() {

// ******* TODO: PART III *******
    var trow = d3.select("tbody").selectAll("tr")
        .data(tableElements);

    trow = trow.enter()
        .append("tr")
        .merge(trow);

    trow.exit().remove();

    var tTeam = trow.selectAll("th")
        .data(function(d){
            //console.log(d.value.type);
        return [{'type': d.value.type, 'vis': 'text', 'value': d.key}];
    });

    tTeam = tTeam.enter()
        .append("th")
        .merge(tTeam);

    tTeam.exit().remove();

    tTeam.attr("class",function(d){
            return d.type;
        })
        .text(function(d){
            if(d.type == "game")
                return "x" + d.value;
            else
                return d.value;
        })
        .on("click",function(d){
            for(var i = 0; i < tableElements.length; i++){
                if(tableElements[i].value.type == d.type){
                    if(tableElements[i].key == d.value){
                        updateList(i);
                        break;
                    }
                }
            }
        });

    var cell = trow.selectAll("td")
        .data(function(d){
            if(d.value.type == "game"){
                return [{
                    'type':d.value.type,'vis':'goals','value':[d.value[goalsMadeHeader],d.value[goalsConcededHeader],d.value[goalsMadeHeader] - d.value[goalsConcededHeader]]},
                    {'type':d.value.type,'vis':'text','value':d.value[resultHeader][resultLabelHeader]},
                    {'type':d.value.type,'vis':'bar','value':d.value[winningGameHeader]},
                    {'type':d.value.type,'vis':'bar','value':d.value[lostGameHeader]},
                    {'type':d.value.type,'vis':'bar','value':d.value[totalgamesHeader]}
                ];
            }

        return [{
            'type':d.value.type,'vis':'goals','value':[d.value[goalsMadeHeader],d.value[goalsConcededHeader],d.value[deltaGoalsHeader]]},
            {'type':d.value.type,'vis':'text','value':d.value[resultHeader][resultLabelHeader]},
            {'type':d.value.type,'vis':'bar','value':d.value[winningGameHeader]},
            {'type':d.value.type,'vis':'bar','value':d.value[lostGameHeader]},
            {'type':d.value.type,'vis':'bar','value':d.value[totalgamesHeader]}
        ];
    });

    cell = cell.enter()
        .append("td")
        .merge(cell);

    cell.exit().remove();

    cell.filter(function(d){
        return d.vis == 'text';
        })
        .text(function(d){
            return d.value;
        });

    var cellGoals = cell.filter(function(d){
        return d.vis == 'goals';
    });

    var goalsColSvg = cellGoals.selectAll("svg")
        .data(function(d){
            return [d];
        });

    goalsColSvg = goalsColSvg.enter()
        .append("svg")
        .attr("width",2*cellWidth)
        .attr("height",cellHeight)
        .merge(goalsColSvg);

    goalsColSvg.exit().remove();

    var goalsColLine = goalsColSvg.selectAll("line")
        .data(function (d) {
            return [d];
        });

    goalsColLine = goalsColLine.enter()
        .append("line")
        .classed("goalbar",true)
        .merge(goalsColLine);

    goalsColLine.exit().remove();

    var goalsCircle = goalsColSvg.selectAll("circle")
        .data(function(d){
                return [
                    {'type': d.type, 'value': [d.value[0], d.value[2]]},
                    {'type': d.type, 'value': [d.value[1], d.value[2]]}
                ];
        });

    goalsCircle = goalsCircle.enter()
        .append("circle")
        .attr("cy",cellHeight/2)
        .classed("goalCircle",true)
        .merge(goalsCircle);

    goalsCircle.exit().remove();

    goalsColLine.attr("x1",function(d){
            return goalScale(Math.min(d.value[0],d.value[1]));
        })
        .attr("y1", function(d){
            if(d.type == "game")
                return (cellHeight/2);
            else
                return (cellHeight/2);
        })
        .attr("x2", function(d){
            return goalScale(Math.max(d.value[0],d.value[1]));
        })
        .attr("y2", function(d){
            if(d.type == "game")
                return (cellHeight/2);
            else
                return (cellHeight/2);
        })
        .attr("stroke-width", 5)
        .attr("stroke", function (d) {
            return goalColorScale(d.value[2]);
        });

    goalsCircle.attr("cx",function(d){
            return goalScale(d.value[0]);
        })
        .attr("stroke",function(d,i){
            if (d.value[1] == 0){
                return "grey";
            }
            else{
                if(i == 0)
                    return "#0868ac";
                else
                    return "#de2d26";
            }
        })
        .attr("fill",function(d,i){
            if (d.type == "aggregate") {
                if (d.value[1] == 0) {
                    return "grey";
                }
                else {
                    if (i == 0)
                        return "#0868ac";
                    else
                        return "#de2d26";
                }
            }
            else{
                return "white";
            }
        });

    var cell_bar = cell.filter(function(d){
        return d.vis == 'bar';
    });

    var barSvg = cell_bar.selectAll("svg")
        .data(function(d){
        return [d];
    });

    barSvg = barSvg.enter()
        .append("svg")
        .attr("height",cellHeight)
        .attr("width",cellWidth)
        .merge(barSvg);

    barSvg.exit().remove();

    var bars = barSvg.selectAll("rect")
        .data(function(d){
        return [d];
    });

    bars = bars.enter()
        .append("rect")
        .attr("height",barHeight)
        .merge(bars);

    bars.attr("width",function(d){
        if(d.type == 'aggregate')
            return gameScale(d.value);
        })
        .attr("fill",function(d){
            if(d.type == 'aggregate')
                return aggregateColorScale(d.value);
        });

    bars.exit().remove();

    var barText = barSvg.selectAll("text")
        .data(function(d){
            console.log(d);
            return [d];
        });

    barText = barText.enter()
        .append("text")
        .classed("label",true)
        .merge(barText);

    barText.attr("x", function(d) {
            if(d.type == 'aggregate')
                return gameScale(d.value)-cellBuffer/2;
        })
        .attr("y",barHeight/2)
        .attr("dy", ".25em")
        .text(function(d) {
            if(d.type == 'aggregate')
                return d.value;
        });

    barText.exit().remove();

    trow.on("mouseover",function(d){
            updateTree(d);
        })
        .on("mouseout",function(d){
            clearTree();
        });
};

/**
 * Collapses all expanded countries, leaving only rows for aggregate values per country.
 *
 */
function collapseList() {

    // ******* TODO: PART IV *******
    for(var i = 0;i < tableElements.length -1; ++i){
        if(tableElements[i].value.type == "aggregate" && tableElements[i+1].value.type == "game"){
            tableElements.splice(i+1,tableElements[i].value["games"].length);
        }
    }
}

/**
 * Updates the global tableElements variable, with a row for each row to be rendered in the table.
 *
 */
function updateList(i) {

    // ******* TODO: PART IV *******
    if(tableElements[i].value.type == 'aggregate'){
        if(i+1 < tableElements.length){
           // console.log(tableElements[i+1].value.type);
            if(tableElements[i+1].value.type == 'game'){
                tableElements.splice(i+1,tableElements[i].value['games'].length);
            }
            else{
                for(var j = 0; j < tableElements[i].value['games'].length; j++) {
                    tableElements.splice(i +j+ 1, 0, tableElements[i].value["games"][j]);
                }
            }
        }
        else if(i == tableElements.length-1){
            for(var j = 0; j < tableElements[i].value['games'].length; j++) {
                tableElements.splice(i +j+ 1, 0, tableElements[i].value["games"][j]);
            }
        }
    }
    updateTable();
}

/**
 * Creates a node/edge structure and renders a tree layout based on the input data
 *
 * @param treeData an array of objects that contain parent/child information.
 */
function createTree(treeData) {

    // ******* TODO: PART VI *******
   // console.log(treeData);
    var root = d3.stratify()
        .id(function(d) {
            return d.id;
        })
        .parentId(function(d) {
            var index = parseInt(d.ParentGame);
            if(!isNaN(index)) {
                return treeData[index].id;
            }
        })
        (treeData);

    var treeLayout = d3.select("#tree");
    var treeLayoutSvg = d3.select(treeLayout.node().parentNode);

    treeLayout.attr("transform","translate(100,0)")
    var tree = d3.tree()
        .size([treeLayoutSvg.attr("height") - 200, treeLayoutSvg.attr("width")- 200]);

    var nodes = tree(root);
    var paths = treeLayout.selectAll("path")
        .data( nodes.descendants().slice(1))
        .enter().append("path")
        .classed("link",true)
        .attr("id",function (d) {
            return d.id;
        })
        .attr("d", function(d) {
            if(d.parent.parent == null) {
                return "M" + d.y  + "," + d.x
                    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                    + " " + (d.parent.y + 25) + "," + d.parent.x;
            }
            else{return "M" + d.y + "," + d.x
                + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                + " " + d.parent.y + "," + d.parent.x;
            }
        });

    var childNode = treeLayout.selectAll("g")
        .data(nodes.descendants())
        .enter()
        .append("g")
        .attr("class","node")
        .attr("transform", function(d) {
            var yVal =0;
                if(d.parent == null)
                     yVal = d.y + 25;
                else
                    yVal = d.y;
            return "translate(" + yVal + "," + d.x + ")";
        });

    childNode.append("circle")
        .attr("r",5)
        .style("fill",function(d){
            if(d.data.Wins == "1")
                return "#364e74";//it should be automatic
        })
        .attr("class",function(d){
            if(d.data.Wins == "1")
                return "winner";
        });

    childNode.append("text")
        .attr("dy",3)
        .attr("dx",function(d){
            if(d.children)
                return -8;
            else
                return 8;
        })
        .style("text-anchor", function(d) {
            if(d.children)
                return "end";
            else
                return "start";
        })
        .text(function(d) {
            return d.data.Team;
        });


};

/**
 * Updates the highlighting in the tree based on the selected team.
 * Highlights the appropriate team nodes and labels.
 *
 * @param team a string specifying which team was selected in the table.
 */
function updateTree(row) {

    // ******* TODO: PART VII ****
    d3.select("#tree")
        .selectAll("text")
        .filter(function(d){
           // console.log(d.data);
            if(row.value.type == 'game') {
                var isPartLabel = false;
                if ((d.id.match(row.key+"*") && row.value.Opponent.match(d.data.Opponent)) || (row.key.match(d.data.Opponent) && row.value.Opponent.match(d.data.Team)))
                    isPartLabel = true;
                return isPartLabel;
            }else
                return row.key == d.data.Team;
        })
        .classed("selectedLabel",true);

    d3.selectAll(".link")
        .filter(function(d){
        if(row.value.type == 'game') {
            var isPartLink = false;
            if ((d.id.match(row.key+"*") && row.value.Opponent.match(d.data.Opponent)) || (row.key.match(d.data.Opponent) && row.value.Opponent.match(d.data.Team)))
                isPartLink = true;
            return isPartLink;
        }else{
            var isPartLink = false;
            if(row.key == d.data.Team  && d.data.Wins == "1")
                isPartLink = true;
            return isPartLink;
        }

        })
        .classed("selected",true);
}

/**
 * Removes all highlighting from the tree.
 */
function clearTree() {

    // ******* TODO: PART VII *******
    d3.selectAll(".selected").classed("selected",false);
    d3.selectAll(".selectedLabel").classed("selectedLabel",false);
}