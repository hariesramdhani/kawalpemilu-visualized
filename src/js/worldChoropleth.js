export const worldChoropleth = (id, filename) => {
  let w = 1200,
      h = 700;

  let margin = {
    top: 60,
    bottom: 40,
    left: 70,
    right: 40
  };

  let tooltip = d3.select(`#${id}`)
                  .append("div")
                  .style("position", "fixed")
                  .style("z-index", 1)
                  .style("visibility", "hidden");;

  // define map projection
  let projection = d3.geoMercator()
                    .translate([600, 500])
                    .scale([150]);

  //Define default path generator
  let path = d3.geoPath()
              .projection(projection);

  // Create the SVG for the map            
  let svg = d3.select(`#${id}`)
              .append("svg")
              .attr("id", "chart")
              .attr("width", w)
              .attr("height", h)
              .append("g")
              .attr("tranform", `translate(${margin.left}, ${margin.top})`);


  // Make the number easier to read
  let commaSeparate = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  let date = Date.now();
  let APIurl = `https://kawal-c1.appspot.com/api/c/-99?${date}`;

  let lengthOfData;
  let jsonFeatures;

  // Winning in ..... countrys
  let jokomarufWins = 0;
  let prabowosandiWins = 0;

  // Scale the color using vote percentage as range for Jokowi Maruf
  let candidateOneColor = d3.scaleLinear()
                            .domain([.5, .6, .7, .8, .9])
                            .range(["#E05F6B", "#DD4F5D", "#C94855", "#B5414D", "#A13A44"])

  // Scale the color using vote percentage as range for Prabowo Sandi
  let candidateTwoColor = d3.scaleLinear()
                            .domain([.5, .6, .7, .8, .9])
                            .range(["#85B4DF", "#79ADDC", "#6E9EC8", "#648EB5", "#597EA1"])

  d3.json(APIurl, (error, data) => {
    
    lengthOfData = data["children"].length;

    let countryData = {}

    d3.json(filename, (error, id) => {

      if (error) {
        return console.log(error);
      }

      for (let i = 0; i< lengthOfData; i++) {
        // the key to GET the election result data
        let countryID = data["children"][i][0];
        let countryName = data["children"][i][1];

        // ELECTION RESULT DATA STARTS HERE

        // The amount of votes that the 1st candidate received
        let candidateOne = data["data"][countryID]["sum"]["pas1"];

        // The amount of votes that the 2nd candidate received
        let candidateTwo = data["data"][countryID]["sum"]["pas2"];

        let exceptions = ["sabah"];


        if (!(countryName in countryData)) {
          countryData[countryName] = {};
          countryData[countryName]["candidateOne"] = candidateOne;
          countryData[countryName]["candidateTwo"] = candidateTwo;
        } else {
          countryData[countryName]["candidateOne"] += candidateOne;
          countryData[countryName]["candidateTwo"] += candidateTwo;
        }

        // Both Kaltara and Luar Negeri don't have any location in the TOPOjson file (needs a better way to handle this)
        if (!(exceptions.includes(countryName.toLowerCase()))) {
          jsonFeatures = topojson.feature(id, id.objects.regions).features;


          for (let j = 0; i < jsonFeatures.length; j++) {

            let countryNameJSON;

            if (jsonFeatures[j]["properties"]["NAME"] == null) {
                continue;
            } else {
                countryNameJSON = jsonFeatures[j]["properties"]["NAME"];
            }

            if (countryNameJSON.toLowerCase() == countryName.toLowerCase()) {

              jsonFeatures[j]["properties"]["countryID"] = countryID;

              jsonFeatures[j]["properties"]["candidateOne"] = countryData[countryName]["candidateOne"];

              jsonFeatures[j]["properties"]["candidateTwo"] = countryData[countryName]["candidateTwo"];

              // jsonFeatures[j]["properties"]["totalVotes"] = totalVotes;

              break;
            }
          }

        }
      }

      svg.selectAll(".country")
      .data(jsonFeatures)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "country")
      .attr("id", d => {
        // Create specific ID for each paths, so it will be easier for the on mouseover event
        return d["properties"]["postal"];
      })
      .style("fill", d => {

        // Check if the total votes for candidate one is greater than candidate two for each province
        if (d["properties"]["candidateOne"] > d["properties"]["candidateTwo"]) {
          jokomarufWins += 1;
          return candidateOneColor(d["properties"]["candidateOne"]/ (d["properties"]["candidateOne"] + d["properties"]["candidateTwo"]));
        } else if (d["properties"]["candidateOne"] < d["properties"]["candidateTwo"]) {
          prabowosandiWins += 1;
          return candidateTwoColor(d["properties"]["candidateTwo"]/ (d["properties"]["candidateOne"] + d["properties"]["candidateTwo"]))
        } else {
          return "none";
        }
      })
      .style('stroke', 'black')
      .on("mouseover", d => {

        let tempTotal = d["properties"]["candidateOne"] + d["properties"]["candidateTwo"]
        let tempCandidateOnePercentage = ((d["properties"]["candidateOne"] / tempTotal) * 100).toFixed(2)
        let tempCandidateTwoPercentage = ((d["properties"]["candidateTwo"] / tempTotal) * 100).toFixed(2)

        // Tooltip will appear on mouseover
        if (d["properties"]["candidateOne"] != undefined) {
          tooltip.html(`
            <div class="tooltip">
              <p style="text-align: center; font-weight: bold; font-size: 14px; padding: 0 0 3px 0;">${d["properties"]["NAME"].toUpperCase()}</p>
              <p><span style="font-size: 18px; font-weight: bold; float: left; color: #AC0B13;">${tempCandidateOnePercentage}%</span> <span style="font-size: 18px; font-weight: bold; float: right; color: #597EA1;">${tempCandidateTwoPercentage}%</span></p>
              <br/>
              <p style="padding: 0 2px 3px 2px; clear: both;"><span style="float: left; color: #AC0B13;">${commaSeparate(d["properties"]["candidateOne"])}</span> <span style="float: right; color: #597EA1;">${commaSeparate(d["properties"]["candidateTwo"])}</span></p><br/>
            </div>
          `)

          tooltip.style("visibility", "visible");
        }
      })
      .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
      })
      .on("mousemove", (d) => {
          if (d["properties"]["candidateOne"] != undefined) {
            tooltip.style("top", `${d3.event.clientY - 100}px`)
                  .style("left", `${d3.event.clientX - 80}px`);    
          }
          
      })
      
      d3.select("#foreign-election")
        .on("click", () => {

          // Winning in ..... countries
          d3.select("#jokomaruf-wins")
          .text(`${jokomarufWins} Negara`);
      
          d3.select("#prabowosandi-wins")
          .text(`${prabowosandiWins} Negara`);


          d3.select("#foreign-election")
            .style("background-color", "#B3A395");

          d3.select("#presidential-election")
            .style("background-color", "#DAC6B5");

          d3.select("#legislative-election")
            .style("background-color", "#DAC6B5");
  
          d3.select("#president")
            .style("display", "block");

          d3.select("#legislative")
            .style("display", "none");

          d3.select("#indonesia-choropleth")
            .style("display", "none");

          d3.select("#world-choropleth")
            .style("display", "block");
            
          d3.select("#color-by")
            .style("display", "none");
  
        })
        
    })

    
  })
  

}