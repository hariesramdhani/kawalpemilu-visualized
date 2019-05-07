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

  let parties = ["PKB", "GER", "PDI", "GOL", "NAS", "GAR", "BER", "PKS", "PER", "PPP", "PSI", "PAN", "HAN", "DEM", "PBB", "PKP"];

  let legislativeTotal = {

  }

  // Initialize the object to store legislative vote counts
  parties.forEach(party => {
    legislativeTotal[party] = 0;
  })

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
          if (candidateOne != undefined) {
            countryData[countryName]["candidateOne"] += candidateOne;
            countryData[countryName]["candidateTwo"] += candidateTwo;
          }
        }

        // Exception, add the sum to Malaysia;
        if (countryName == "Sabah") {
          if (candidateOne != undefined) {
            countryData["Malaysia"]["candidateOne"] += candidateOne;
            countryData["Malaysia"]["candidateTwo"] += candidateTwo;
          }
        }

        // LEGISLATIVE DATA STARTS HERE

        let legislative = {

        }

        parties.forEach(party => {

          // PKS key in the API is 'sej' that's why
          if (party == "PKS") {
            legislative[party] = data["data"][countryID]["sum"]["sej"];  
          } else {
            legislative[party] = data["data"][countryID]["sum"][party.toLowerCase()];
          }

          if (legislative[party] != undefined) {
            legislativeTotal[party] += legislative[party];  
          } else {
            legislative[party] = 0;
          }

          
        })

        let legMax = Object.keys(legislative).reduce((a, b) => legislative[a] > legislative[b] ? a : b);
        
        // Without this the map color will look like the color of the last party in the list
        if (legislative[legMax] == 0) {
          legMax = "NONE";
        }

        // Both Kaltara and Luar Negeri doesn't have any location in the TOPOjson file (needs a better way to handle this)
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

              // LEGISLATIVE VOTES

              parties.forEach(party => {
                jsonFeatures[j]["properties"][party] = legislative[party];
              });

              jsonFeatures[j]["properties"]["legMax"] = legMax;

              break;
            }
          }

        }
      }

      // Create a power scale for the size of the icons
      let legVoteMax = Object.keys(legislativeTotal).reduce((m, k) => { return legislativeTotal[k] > m ? legislativeTotal[k] : m }, -Infinity); 
      let legVoteMin = Object.keys(legislativeTotal).reduce((m, k) => { return legislativeTotal[k] < m ? legislativeTotal[k] : m }, Infinity); 

      let legVotePowScale = d3.scalePow()
                              .domain([legVoteMin, legVoteMax])
                              .range([40, 80]);

      let legislativeTotalSum = Object.values(legislativeTotal).reduce((a, b) => a + b);

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
      
      d3.select("#presidential-election-overseas")
        .on("click", () => {

          // Winning in ..... countries
          d3.select("#jokomaruf-wins")
          .text(`${jokomarufWins} Negara`);
      
          d3.select("#prabowosandi-wins")
          .text(`${prabowosandiWins} Negara`);


          d3.select("#presidential-election-overseas")
            .style("background-color", "#99AE8C");

          d3.select("#presidential-election-dom")
            .style("background-color", "#BAD4AA");

          d3.select("#legislative-election-dom")
            .style("background-color", "#D4D4AA");

          d3.select("#legislative-election-overseas")
            .style("background-color", "#D4D4AA");
  
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

          svg.selectAll(".country")
            .transition()
            .duration(1000)
            .style("fill", d => {

              // Check if the total votes for candidate one is greater than candidate two for each province
              if (d["properties"]["candidateOne"] > d["properties"]["candidateTwo"]) {
                return candidateOneColor(d["properties"]["candidateOne"]/ (d["properties"]["candidateOne"] + d["properties"]["candidateTwo"]));
              } else if (d["properties"]["candidateOne"] < d["properties"]["candidateTwo"]) {
                return candidateTwoColor(d["properties"]["candidateTwo"]/ (d["properties"]["candidateOne"] + d["properties"]["candidateTwo"]))
              } else {
                return "none";
              }

            });

          svg.selectAll(".country")
            .style("cursor", "default")
            .on("mouseover", d => {

              let tempTotal = d["properties"]["candidateOne"] + d["properties"]["candidateTwo"];
              let tempCandidateOnePercentage = ((d["properties"]["candidateOne"] / tempTotal) * 100).toFixed(2);
              let tempCandidateTwoPercentage = ((d["properties"]["candidateTwo"] / tempTotal) * 100).toFixed(2);

              // Tooltip will appear on mouseover
              if (d["properties"]["candidateOne"] != undefined) {
                tooltip.html(`
                  <div class="tooltip">
                    <p style="text-align: center; font-weight: bold; font-size: 14px; padding: 0 0 3px 0;">${d["properties"]["NAME"].toUpperCase()}</p>
                    <p><span style="font-size: 18px; font-weight: bold; float: left; color: #AC0B13;">${tempCandidateOnePercentage}%</span> <span style="font-size: 18px; font-weight: bold; float: right; color: #597EA1;">${tempCandidateTwoPercentage}%</span></p>
                    <br/>
                    <p style="padding: 0 2px 3px 2px; clear: both;"><span style="float: left; color: #AC0B13;">${commaSeparate(d["properties"]["candidateOne"])}</span> <span style="float: right; color: #597EA1;">${commaSeparate(d["properties"]["candidateTwo"])}</span></p><br/>
                  </div>
                `);

                tooltip.style("visibility", "visible");
              }
            })
            .on("mousemove", (d) => {
              if (d["properties"]["candidateOne"] != undefined) {
                tooltip.style("top", `${d3.event.clientY - 100}px`)
                      .style("left", `${d3.event.clientX - 80}px`);    
              }
            })
  
        })

      // THE CODE THAT CONTROLS THE "LEGISLATIF" BUTTON STARTS HERE
      d3.select("#legislative-election-overseas")
        .on("click", () => {

          d3.select("#legislative-election-overseas")
            .style("background-color", "#AEAE8C");

          d3.select("#legislative-election-dom")
            .style("background-color", "#D4D4AA");

          d3.select("#presidential-election-dom")
            .style("background-color", "#BAD4AA");

          d3.select("#presidential-election-overseas")
            .style("background-color", "#BAD4AA");

          d3.select("#president")
            .style("display", "none");

          d3.select("#world-choropleth")
            .style("display", "block");
          
          d3.select("#indonesia-choropleth")
            .style("display", "none");
            
          d3.select("#color-by")
            .style("display", "none");

          d3.select("#legislative")
            .style("display", "block");

          svg.selectAll(".country")
            .transition()
            .duration(1000)
            .style("fill", d => {

              // Color each province depending on the winning party
              if (d["properties"]["legMax"] == "PKB") {
                return "#358469";
              } else if (d["properties"]["legMax"] == "GER") {
                return "#CB6055";
              } else if (d["properties"]["legMax"] == "PDI") {
                return "#AF2A2D";
              } else if (d["properties"]["legMax"] == "GOL") {
                return "#FAD555";
              } else if (d["properties"]["legMax"] == "NAS") {
                return "#DF8842";
              } else if (d["properties"]["legMax"] == "GAR") {
                return "#C68E25";
              } else if (d["properties"]["legMax"] == "BER") {
                return "#A4C479";
              } else if (d["properties"]["legMax"] == "PKS") {
                return "#9B9B9B";
              } else if (d["properties"]["legMax"] == "PER") {
                return "#825DBE";
              } else if (d["properties"]["legMax"] == "PPP") {
                return "#45563F";
              } else if (d["properties"]["legMax"] == "PSI") {
                return "#CA879F";
              } else if (d["properties"]["legMax"] == "PAN") {
                return "#9AB6DF";
              } else if (d["properties"]["legMax"] == "HAN") {
                return "#A37A86";
              } else if (d["properties"]["legMax"] == "DEM") {
                return "#354199";
              } else if (d["properties"]["legMax"] == "PKP") {
                return "#7A100F";
              } else if (d["properties"]["legMax"] == "PBB") {
                return "#8BAEA1";
              } else {
                return "None";
              }
            })

          svg.selectAll(".country")
            .style("cursor", d => {
              if (d["properties"]["legMax"] != "NONE" && d["properties"]["legMax"] != undefined) {
                return "pointer"
              } else {
                return "default"
              }
            })
            .on("click", d=> {
              if (d["properties"]["legMax"] != "NONE" && d["properties"]["legMax"] != undefined) {
                legVoteMax = d["properties"][parties[0]];
                legVoteMin = d["properties"][parties[0]];

                legislativeTotalSum = d["properties"][parties[0]];
                
                for (let i = 1; i < parties.length; i++) {
                  if (d["properties"][parties[i]] != undefined) {
                    legislativeTotalSum += d["properties"][parties[i]];
                  }

                  if (d["properties"][parties[i]] > legVoteMax) {
                    legVoteMax = d["properties"][parties[i]];
                  } else if (d["properties"][parties[i]] < legVoteMin) {
                    legVoteMin = d["properties"][parties[i]];
                  }
                }


                legVotePowScale = d3.scalePow()
                                    .domain([legVoteMin, legVoteMax])
                                    .range([40, 80]);

                parties.forEach(party => {
                  d3.select(`#${party}-vote`)
                    .transition(1000)
                    .text(() => {
                    
                      if (d["properties"][party] != undefined) {
                        return commaSeparate(d["properties"][party]);
                      } else {
                        return 0;
                      }
                    })

                  d3.select(`#${party}-icon`)
                    .transition(2000)
                    .style("width", () => {
                      return legVotePowScale(d["properties"][party]) + "px";
                    })

                  d3.select(`#${party}-vote-percentage`)
                    .text(() => {
                      if (d["properties"][party] != undefined) {
                        return `${(d["properties"][party]/legislativeTotalSum * 100).toFixed(2)}%`;
                      } else {
                        return 0;
                      }
                    })
                });
              }
            })
            .on("mouseover", d => {
              if (d["properties"]["legMax"] != "NONE" && d["properties"]["legMax"] != undefined) {
                tooltip.html(`
                  <div class="tooltip">
                    <p style="text-align: center; font-weight: bold; font-size: 14px;">${d["properties"]["NAME"].toUpperCase()}</p>
                  </div>
                `);

                tooltip.style("visibility", "visible");
              }

            })
            .on("mousemove", () => {
              tooltip.style("top", `${d3.event.clientY - 60}px`)
                      .style("left", `${d3.event.clientX - 80}px`);    
            });
      
        })
    })

    
  })
  

}