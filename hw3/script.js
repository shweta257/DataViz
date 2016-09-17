// Global var for FIFA world cup data
var allWorldCupData;


/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */
function updateBarChart(selectedDimension) {

    var svgBounds = d3.select("#barChart").node().getBoundingClientRect(),
        xAxisWidth = 100,
        yAxisHeight = 70;

    //sorts data with respect to ascending years
    // allWorldCupData.sort(function(a,b){
    //     return a.year - b.year;
    // });

    // ******* TODO: PART I *******
    // Create the x and y scales; make
    // sure to leave room for the axes
    //console.log(svgBounds.width);

    var xScale = d3.scaleBand()
        .domain(allWorldCupData.map(function (d) {
            return d.year;
        })).range([svgBounds.width, yAxisHeight]);
        //.padding(.1);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(allWorldCupData, function (d) {
            return parseInt(d[selectedDimension]);
        })])
        .range([svgBounds.height - xAxisWidth, 0]);

    // Create colorScale
    var colorScale = d3.scaleLinear()
        .domain([0, d3.max(allWorldCupData, function (d) {
            return parseInt(d[selectedDimension]);
        })])
        .range(["#74a9cf","#045a8d"]);

    var xAxis = d3.axisLeft()
        .scale(xScale);

    d3.select("#xAxis")
        .attr("transform", "rotate(-90) translate(" + (xAxisWidth - svgBounds.height) + ",0)")
        .call(xAxis);

    var yAxis = d3.axisLeft()
        .scale(yScale);

    d3.select("#yAxis")
        .attr("transform", "translate(" + yAxisHeight + ",0)")
        .transition()
        .duration(1000)
        .call(yAxis);

    var bars = d3.select("#bars").selectAll("rect")
        .data(allWorldCupData);

    bars = bars.enter()
        .append('rect')
        .attr('y', function (d) {
            return svgBounds.height - xAxisWidth;
        })
        .merge(bars);

    bars.exit().remove();
    bars.attr('x', function (d) {
            return xScale(d.year);
        })
        .attr('width', function (d) {
            return xScale.bandwidth();
        })
        .transition()
        .duration(1000)
        .attr('y', function (d) {
            return yScale(d[selectedDimension]);
        })
        .attr('height', function (d) {
            return svgBounds.height - xAxisWidth - yScale(d[selectedDimension]);
        })
        .attr('fill', function (d) {
            return colorScale(d[selectedDimension]);
        });

    // ******* TODO: PART II *******

    // Implement how the bars respond to click events
    // Color the selected bar to indicate is has been selected.
    // Make sure only the selected bar has this new color.

    // Call the necessary update functions for when a user clicks on a bar.
    // Note: think about what you want to update when a different bar is selected.

    bars.on("click",function(d){
        d3.select(".selected").classed("selected", false);
        //d3.select(".selected").property("selected", false);
        d3.select(this).classed("selected",true);
        updateInfo(d);
        updateMap(d);
    });
}

/**
 *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
 *
 *  There are 4 attributes that can be selected:
 *  goals, matches, attendance and teams.
 */
function chooseData() {

    // ******* TODO: PART I *******
    //Changed the selected data when a user selects a different
    // menu item from the drop down.
    var selected_data = d3.select("#dataset").node().value;
    //console.log(selected_data);
    updateBarChart(selected_data);
}

/**
 * Update the info panel to show info about the currently selected world cup
 *
 * @param oneWorldCup the currently selected world cup
 */
function updateInfo(oneWorldCup) {

    // ******* TODO: PART III *******

    // Update the text elements in the infoBox to reflect:
    // World Cup Title, host, winner, runner_up, and all participating teams that year

    // Hint: For the list of teams, you can create an list element for each team.
    // Hint: Select the appropriate ids to update the text content.

    //console.log(oneWorldCup);

    d3.select("#edition").text(oneWorldCup.EDITION);
    d3.select("#host").text(oneWorldCup.host);
    d3.select("#winner").text(oneWorldCup.winner);
    d3.select("#silver").text(oneWorldCup.runner_up);

    var teams_node = d3.select("#teams");
    var teams_list =  teams_node.selectAll("ul").data([1]);

    teams_list = teams_list
        .enter()
        .append("ul")
        .merge(teams_list);

    var participantTeam = teams_list.selectAll("li")
                                .data(oneWorldCup.teams_names);

    participantTeam .exit().remove();

    participantTeam = participantTeam
        .enter()
        .append("li")
        .merge(participantTeam);

    participantTeam.transition()
        .duration(1000)
        .text(function(d){
            return d;
        });
}

/**
 * Renders and updated the map and the highlights on top of it
 *
 * @param the json data with the shape of all countries
 */
function drawMap(world) {

    //(note that projection is global!
    // updateMap() will need it to add the winner/runner_up markers.)

    projection = d3.geoConicConformal().scale(150).translate([400, 350]);
    console.log(world);
    // ******* TODO: PART IV *******

    // Draw the background (country outlines; hint: use #map)
    // Make sure and add gridlines to the map

    // Hint: assign an id to each country path to make it easier to select afterwards
    // we suggest you use the variable in the data element's .id field to set the id

    // Make sure and give your paths the appropriate class (see the .css selectors at
    // the top of the provided html file)
    var path = d3.geoPath()
        .projection(projection);

    d3.select("#map").selectAll("path")
        .data(topojson.feature(world, world.objects.countries).features)
        .enter()
        .append("path")
        .attr("d", path)
        .classed("countries",true)
        .attr("id",function (d) {
            return d.id;
        });

    var graticule = d3.geoGraticule();

    d3.select("#map")
        .append('path')
        .datum(graticule)
        .attr('class', "grat")
        .attr('d', path);
}

/**
 * Clears the map
 */
function clearMap() {

    // ******* TODO: PART V*******
    //Clear the map of any colors/markers; You can do this with inline styling or by
    //defining a class style in styles.css

    //Hint: If you followed our suggestion of using classes to style
    //the colors and markers for hosts/teams/winners, you can use
    //d3 selection and .classed to set these classes on and off here.
    d3.select("#map")
        .selectAll('.host')
        .classed("host", false);
    d3.select("#map")
        .selectAll('.team')
        .classed("team", false);
    d3.select('#winnerCountry').remove();
    d3.select('#runnerupCountry').remove();
}


/**
 * Update Map with info for a specific FIFA World Cup
 * @param the data for one specific world cup
 */
function updateMap(worldcupData) {

    //Clear any previous selections;
    clearMap();

    // ******* TODO: PART V *******

    // Add a marker for the winner and runner up to the map.

    //Hint: remember we have a conveniently labeled class called .winner
    // as well as a .silver. These have styling attributes for the two
    //markers.


    //Select the host country and change it's color accordingly.

    //Iterate through all participating teams and change their color as well.

    //We strongly suggest using classes to style the selected countries.

    var winners = d3.select('#points')
        .selectAll('#winnerCountry')
        .data([worldcupData]);

//    console.log(worldcupData);
    winners.enter()
        .append("circle")
        .attr('class', 'gold')
        .attr('id', 'winnerCountry')
        .attr('r', 10)
        .merge(winners)
        .attr("cx", function (d) {
            return projection(d.win_pos)[0];
        })
        .attr("cy", function (d) {
            return projection(d.win_pos)[1];
        });

    var silverMedal = d3.select('#points')
        .selectAll('#runnerupCountry')
        .data([worldcupData]);

    silverMedal.enter()
        .append("circle")
        .attr('class', 'silver')
        .attr('id', 'runnerupCountry')
        .attr("r", 8)
        .merge(silverMedal)
        .attr("cx", function (d) {
            return projection(d.ru_pos)[0];
        })
        .attr("cy", function (d) {
            return projection(d.ru_pos)[1];
        });


    d3.select("#map")
        .select("#" + worldcupData.host_country_code)
        .classed("host", true);

    worldcupData.teams_iso.forEach(function (j) {
        console.log(j);
        d3.select("#map")
            .select("#" + j )
            .classed("team", true);
    })

}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

//Load in json data to make map
d3.json("data/world.json", function (error, world) {
    if (error) throw error;
    drawMap(world);
});

// Load CSV file
d3.csv("data/fifa-world-cup.csv", function (error, csv) {

    csv.forEach(function (d) {

        // Convert numeric values to 'numbers'
        d.year = +d.YEAR;
        d.teams = +d.TEAMS;
        d.matches = +d.MATCHES;
        d.goals = +d.GOALS;
        d.avg_goals = +d.AVERAGE_GOALS;
        d.attendance = +d.AVERAGE_ATTENDANCE;
        //Lat and Lons of gold and silver medals teams
        d.win_pos = [+d.WIN_LON, +d.WIN_LAT];
        d.ru_pos = [+d.RUP_LON, +d.RUP_LAT];

        //Break up lists into javascript arrays
        d.teams_iso = d3.csvParse(d.TEAM_LIST).columns;
        d.teams_names = d3.csvParse(d.TEAM_NAMES).columns;

    });

    // Store csv data in a global variable
    allWorldCupData = csv;
    // Draw the Bar chart for the first time
    updateBarChart('attendance');
});
