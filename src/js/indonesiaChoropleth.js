export const indonesiaChoropleth = (id, filename) => {
  let w = 1200,
      h = 400;

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
                    .translate([-1900, 150])
                    .scale([1200]);

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
  let APIurl = `https://kawal-c1.appspot.com/api/c/0?${date}`;

  let lengthOfData;
  let jsonFeatures;

  // Store all of the total here
  let candidateOneTotal = 0; 
  let candidateTwoTotal = 0;
  let validTotal = 0;
  let invalidTotal = 0;
  let TPSTotal = 0;
  let receivedTPSTotal = 0;
  let unprocessedTPSTotal = 0;
  let errorTPSTotal = 0;

  // Store MIN MAX DATA
  let minTPS = 0;
  let maxTPS = 0;

  // Winning in ..... provinces
  let jokomarufWins = 0;
  let prabowosandiWins = 0;

  // Store objects for looping through the different buttons
  let colorByButtons = [
    {
      "domainMin": 100,
      "domainMax": 0,
      "rangeMin": "#DBDDEA",
      "rangeMax": "#57596C",
      "id": "jumlah-TPS-diterima",
      "numerator": "receivedTPS",
      "denominator": "provinceTPSNo"
    }, {
      "domainMin": 100,
      "domainMax": 0,
      "rangeMin": "#BED0C3",
      "rangeMax": "#477554",
      "id": "jumlah-suara-sah",
      "numerator": "valid",
      "denominator": "totalVotes"
    }, {
      "domainMin": 1,
      "domainMax": 0,
      "rangeMin": "#FBCBC3",
      "rangeMax": "#9D493A",
      "id": "jumlah-suara-tidak-sah",
      "numerator": "invalid",
      "denominator": "totalVotes"
    }
  ]

  let parties = ["PKB", "GER", "PDI", "GOL", "NAS", "GAR", "BER", "PKS", "PER", "PPP", "PSI", "PAN", "HAN", "DEM", "PBB", "PKP"];
  let legislativeTotal = {

  }

  // Initialize the object to store legislative vote counts
  parties.forEach(party => {
    legislativeTotal[party] = 0;
  })

  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  // Scale the color using vote percentage as range for Jokowi Maruf
  let candidateOneColor = d3.scaleLinear()
                            .domain([.5, .6, .7, .8, .9])
                            .range(["#E05F6B", "#DD4F5D", "#C94855", "#B5414D", "#A13A44"])

  // Scale the color using vote percentage as range for Prabowo Sandi
  let candidateTwoColor = d3.scaleLinear()
                            .domain([.5, .6, .7, .8, .9])
                            .range(["#85B4DF", "#79ADDC", "#6E9EC8", "#648EB5", "#597EA1"])


  d3.select("#last-update")
    .text(() => {
      let lastUpdateTime = new Date();
      let time = `${lastUpdateTime.toLocaleDateString('id-ID', options)} ${lastUpdateTime.toLocaleTimeString()}`;
      return time;
    })

  d3.json(APIurl, (error, data) => {
    
    lengthOfData = data["children"].length;

    d3.json(filename, (error, id) => {

      if (error) {
        return console.log(error);
      }

      for (let i = 0; i< lengthOfData; i++) {
        // the key to GET the election result data
        let provinceID = data["children"][i][0];
        let provinceName = data["children"][i][1];

        // Number of TPS all over the provinces (according to KPU)
        let provinceTPSNo = data["children"][i][2];
        TPSTotal += provinceTPSNo;

        if (provinceTPSNo > maxTPS) {
          maxTPS = provinceTPSNo;
        } else if (provinceTPSNo < minTPS) {
          minTPS = provinceTPSNo;
        }

        // ELECTION RESULT DATA STARTS HERE

        // Received TPS data including the number of unprocessed ones
        let receivedTPS = data["data"][provinceID]["sum"]["cakupan"];
        receivedTPSTotal += receivedTPS;



        // Find max min for scaling
        let receivedTPSPercentage = receivedTPS/provinceTPSNo * 100;

        if (receivedTPSPercentage > colorByButtons[0]["domainMax"]) {
          colorByButtons[0]["domainMax"] = receivedTPSPercentage;
        } else if (receivedTPSPercentage < colorByButtons[0]["domainMin"]) {
          colorByButtons[0]["domainMin"] = receivedTPSPercentage;
        }

        // Unprocessed TPS
        let unprocessedTPS = data["data"][provinceID]["sum"]["pending"];
        unprocessedTPSTotal += unprocessedTPS;

        // Error TPS
        let errorTPS = data["data"][provinceID]["sum"]["error"];
        errorTPSTotal += errorTPS;

        // The amount of votes that the 1st candidate received
        let candidateOne = data["data"][provinceID]["sum"]["pas1"];
        candidateOneTotal += candidateOne;

        // The amount of votes that the 2nd candidate received
        let candidateTwo = data["data"][provinceID]["sum"]["pas2"];
        candidateTwoTotal += candidateTwo;

        // The amount of votes that is considered valid
        let valid = data["data"][provinceID]["sum"]["sah"];
        validTotal += valid;

        // The amount of votes that is considered invalid
        let invalid = data["data"][provinceID]["sum"]["tSah"];
        invalidTotal += invalid;

        let totalVotes = valid + invalid;

        let validPercentage = valid/totalVotes * 100;


        // Find Max Min for scaling
        if (validPercentage > colorByButtons[1]["domainMax"]) {
          colorByButtons[1]["domainMax"] = validPercentage;
        } else if (validPercentage < colorByButtons[1]["domainMin"]) {
          colorByButtons[1]["domainMin"] = validPercentage;
        }

        let invalidPercentage = invalid/totalVotes * 100;

        if (invalidPercentage > colorByButtons[2]["domainMax"]) {
          colorByButtons[2]["domainMax"] = invalidPercentage;
        } else if (invalidPercentage < colorByButtons[2]["domainMin"]) {
          colorByButtons[2]["domainMin"] = invalidPercentage;
        }

        // LEGISLATIVE DATA STARTS HERE

        let legislative = {

        }

        parties.forEach(party => {

          // PKS key in the API is 'sej' that's why
          if (party == "PKS") {
            legislative[party] = data["data"][provinceID]["sum"]["sej"];  
          } else {
            legislative[party] = data["data"][provinceID]["sum"][party.toLowerCase()];
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


        // Luar Negeri doesn't have any location in the TOPOjson file (needs a better way to handle this)
        if (i < lengthOfData - 1) {
          jsonFeatures = topojson.feature(id, id.objects.regions).features;

          for (let j = 0; i < jsonFeatures.length; j++) {

            let provinceNameJSON;

            if (jsonFeatures[j]["properties"]["name"] == null) {
                continue;
            } else {
                provinceNameJSON = jsonFeatures[j]["properties"]["name"];
            }

            if (provinceNameJSON.toLowerCase() == provinceName.toLowerCase()) {

              jsonFeatures[j]["properties"]["provinceID"] = provinceID;

              jsonFeatures[j]["properties"]["provinceTPSNo"] = provinceTPSNo;

              jsonFeatures[j]["properties"]["receivedTPS"] = receivedTPS;

              jsonFeatures[j]["properties"]["unprocessedTPS"] = unprocessedTPS;

              jsonFeatures[j]["properties"]["errorTPS"] = errorTPS;

              jsonFeatures[j]["properties"]["candidateOne"] = candidateOne;

              jsonFeatures[j]["properties"]["candidateTwo"] = candidateTwo;

              jsonFeatures[j]["properties"]["valid"] = valid;

              jsonFeatures[j]["properties"]["invalid"] = invalid;

              jsonFeatures[j]["properties"]["totalVotes"] = totalVotes;

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


      /* GENERATE THIS (PKB is used as an example) */

      /*
      <div class="partai-container">
         <img id="PKB-icon" class="partai-icon" src="src/assets/img/partai/PKB.png" style="width: 53.5097px;">
         <div class="vote-description">
           <h3>PKB</h3>
           <h1 id="PKB-vote">4,688</h1>
           <h3 id="PKB-vote-percentage">8.68%</h3>
         </div>
      </div>
      */
     
      parties.forEach(party => {
        let partyContainer = d3.select("#legislative")
                              .append("div")
                              .attr("class", "partai-container")
        
        partyContainer.append("img")
          .attr("id", `${party}-icon`)
          .attr("class", "partai-icon")
          .attr("src", `src/assets/img/partai/${party}.png`)
          .style("width", () => {
            return legVotePowScale(legislativeTotal[party]) + "px";
          })
        
        let partyVoteDescription = partyContainer.append("div")
                                    .attr("class", "vote-description")
        
        partyVoteDescription.append("h3")
          .text(`${party}`)
        
        partyVoteDescription.append("h1")
          .attr("id", `${party}-vote`)
          .text(() => {
            return commaSeparate(legislativeTotal[party]);
          })
        
        partyVoteDescription.append("h3")
          .attr("id", `${party}-vote-percentage`)
          .text(() => {
            return `${(legislativeTotal[party]/legislativeTotalSum * 100).toFixed(2)}%`;
          })

      });            
      
      // Controls the total votes
      d3.select("#total-votes")
        .text(() => {
          return commaSeparate(validTotal + invalidTotal);
        })
      
      // Controls the number of valid votes
      d3.select("#valid-votes")
        .text(() => {
          return commaSeparate(validTotal);
        })

      // Controls the number of invalid votes
      d3.select("#invalid-votes")
        .text(() => {
          return commaSeparate(invalidTotal);
        })

      // Controls the number of valid votes percentage
      d3.select("#valid-votes-percentage")
        .text(() => {
          return `${(validTotal / (validTotal + invalidTotal) * 100).toFixed(2)}%`;
        })

      // Controls the number of invalid votes percentage
      d3.select("#invalid-votes-percentage")
        .text(() => {
          return `${(invalidTotal / (validTotal + invalidTotal) * 100).toFixed(2)}%`;
        })

      d3.select("#jokomaruf-vote")
        .text(commaSeparate(candidateOneTotal));
      
      d3.select("#prabowosandi-vote")
        .text(commaSeparate(candidateTwoTotal));

      d3.select("#jokomaruf-vote-percentage")
        .text(() => {
          return `${(candidateOneTotal / (candidateOneTotal + candidateTwoTotal) * 100).toFixed(2)}%`;
        })
      
      d3.select("#prabowosandi-vote-percentage")
        .text(() => {
          return `${(candidateTwoTotal / (candidateOneTotal + candidateTwoTotal) * 100).toFixed(2)}%`;
        })

      d3.select("#received-TPS")
        .text(() => {
          return `${commaSeparate(receivedTPSTotal)} (${(receivedTPSTotal/TPSTotal * 100).toFixed(2)}%)`;
        })

      d3.select("#unprocessed-TPS")
      .text(() => {
        return commaSeparate(unprocessedTPSTotal);
      })

      d3.select("#error-TPS")
      .text(() => {
        return commaSeparate(errorTPSTotal);
      })


      svg.selectAll(".province")
          .data(jsonFeatures)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "province")
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
            }
          })
          .style('stroke', 'black')
          .on("mouseover", d => {

            let tempTotal = d["properties"]["candidateOne"] + d["properties"]["candidateTwo"]
            let tempCandidateOnePercentage = ((d["properties"]["candidateOne"] / tempTotal) * 100).toFixed(2)
            let tempCandidateTwoPercentage = ((d["properties"]["candidateTwo"] / tempTotal) * 100).toFixed(2)

            // Tooltip will appear on mouseover
            tooltip.html(`
              <div class="tooltip">
                <p style="text-align: center; font-weight: bold; font-size: 14px; padding: 0 0 3px 0;">${d["properties"]["name"].toUpperCase()}</p>
                <p><span style="font-size: 18px; font-weight: bold; float: left; color: #AC0B13;">${tempCandidateOnePercentage}%</span> <span style="font-size: 18px; font-weight: bold; float: right; color: #597EA1;">${tempCandidateTwoPercentage}%</span></p><br/>
                <p style=" clear: both; padding: 0 2px 3px 2px;"><span style="float: left; color: #AC0B13;">${commaSeparate(d["properties"]["candidateOne"])}</span> <span style="float: right; color: #597EA1;">${commaSeparate(d["properties"]["candidateTwo"])}</span></p><br/>
              </div>
            `)

            tooltip.style("visibility", "visible");
          })
          .on("mouseout", () => {
              tooltip.style("visibility", "hidden");
          })
          .on("mousemove", () => {
              tooltip.style("top", `${d3.event.clientY - 100}px`)
                      .style("left", `${d3.event.clientX - 80}px`);    
          })

        // Winning in ..... provinces
        d3.select("#jokomaruf-wins")
          .text(`${jokomarufWins} Provinsi`);
        
        d3.select("#prabowosandi-wins")
          .text(`${prabowosandiWins} Provinsi`);
          

        // THE CODE THAT CONTROLS THE "LEGISLATIF" BUTTON STARTS HERE
        d3.select("#legislative-election-dom")
          .on("click", () => {

            d3.select("#legislative-election-dom")
              .style("background-color", "#AEAE8C");

            d3.select("#legislative-election-overseas")
              .style("background-color", "#D4D4AA");

            d3.select("#presidential-election-dom")
              .style("background-color", "#BAD4AA");

            d3.select("#presidential-election-overseas")
              .style("background-color", "#BAD4AA");
    
            d3.select("#president")
              .style("display", "none");

            d3.select("#world-choropleth")
              .style("display", "none");
            
            d3.select("#indonesia-choropleth")
              .style("display", "block");
              
            d3.select("#color-by")
              .style("display", "none");
    
            d3.select("#legislative")
              .style("display", "block");
    
            svg.selectAll(".province")
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

            svg.selectAll(".province")
              .style("cursor", "pointer")
              .on("click", d=> {
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

              })
              .on("mouseover", d => {
                tooltip.html(`
                  <div class="tooltip">
                    <p style="text-align: center; font-weight: bold; font-size: 14px;">${d["properties"]["name"].toUpperCase()}</p>
                  </div>
                `);

                tooltip.style("visibility", "visible");
              })
              .on("mousemove", () => {
                tooltip.style("top", `${d3.event.clientY - 60}px`)
                        .style("left", `${d3.event.clientX - 80}px`);    
              });
        
          })

        // THE CODE THAT CONTROLS THE "PRESIDEN" BUTTON STARTS HERE
        d3.select("#presidential-election-dom")
          .on("click", () => {

            // Winning in ..... provinces
            d3.select("#jokomaruf-wins")
            .text(`${jokomarufWins} Provinsi`);
          
            d3.select("#prabowosandi-wins")
            .text(`${prabowosandiWins} Provinsi`);

            d3.select("#legislative-election-dom")
              .style("background-color", "#D4D4AA");

            d3.select("#legislative-election-overseas")
              .style("background-color", "#D4D4AA");

            d3.select("#presidential-election-dom")
              .style("background-color", "#99AE8C");

              d3.select("#presidential-election-overseas")
              .style("background-color", "#BAD4AA");
    
            d3.select("#president")
              .style("display", "block");

            d3.select("#world-choropleth")
              .style("display", "none");

            d3.select("#indonesia-choropleth")
              .style("display", "block");
            
            d3.select("#color-by")
              .style("display", "block");
    
            d3.select("#legislative")
              .style("display", "none");


            svg.selectAll(".province")
              .transition()
              .duration(1000)
              .style("fill", d => {
                if (d["properties"]["candidateOne"] > d["properties"]["candidateTwo"]) {
                  return candidateOneColor(d["properties"]["candidateOne"]/ (d["properties"]["candidateOne"] + d["properties"]["candidateTwo"]));
                } else {
                  return candidateTwoColor(d["properties"]["candidateTwo"]/ (d["properties"]["candidateOne"] + d["properties"]["candidateTwo"]))
                }
              })

            svg.selectAll(".province")
              .style("cursor", "default")
              .on("mouseover", d => {

                let tempTotal = d["properties"]["candidateOne"] + d["properties"]["candidateTwo"]
                let tempCandidateOnePercentage = ((d["properties"]["candidateOne"] / tempTotal) * 100).toFixed(2)
                let tempCandidateTwoPercentage = ((d["properties"]["candidateTwo"] / tempTotal) * 100).toFixed(2)
      
                tooltip.html(`
                  <div class="tooltip">
                    <p style="text-align: center; font-weight: bold; font-size: 14px; padding: 0 0 3px 0;">${d["properties"]["name"].toUpperCase()}</p>
                    <p><span style="font-size: 18px; font-weight: bold; float: left; color: #AC0B13;">${tempCandidateOnePercentage}%</span> <span style="font-size: 18px; font-weight: bold; float: right; color: #597EA1;">${tempCandidateTwoPercentage}%</span></p><br/>
                    <p style="padding: 0 2px 3px 2px;"><span style="float: left; color: #AC0B13;">${commaSeparate(d["properties"]["candidateOne"])}</span> <span style="float: right; color: #597EA1;">${commaSeparate(d["properties"]["candidateTwo"])}</span></p><br/>
                  </div>
                `)
      
                tooltip.style("visibility", "visible");
              })
              .on("mousemove", () => {
                tooltip.style("top", `${d3.event.clientY - 100}px`)
                        .style("left", `${d3.event.clientX - 80}px`);    
              })
            
          })
        

        let TPSColorScale = d3.scalePow()
                              .domain([minTPS,maxTPS])
                              .interpolate(d3.interpolateCubehelix)
                              .range([d3.rgb("#CDCFCE"), d3.rgb('#787C7A')]);
        
        d3.select("#jumlah-TPS")
          .on("click", () => {
            svg.selectAll(".province")
              .transition()
              .style("fill", d => {
                return TPSColorScale(d["properties"]["provinceTPSNo"]);
              })
            
            svg.selectAll(".province")
            .on("mouseover", d => {
    
              tooltip.html(`
                <div class="tooltip">
                  <p style="text-align: center; font-weight: bold; font-size: 14px;">${d["properties"]["name"].toUpperCase()}</p>
                  <p style="text-align: center; font-size: 14px; padding: 5px;">${commaSeparate(d["properties"]["provinceTPSNo"])}</p>
                </div>
              `)
    
              tooltip.style("visibility", "visible");
            })
              
          })

          // Loop over the array to apply the same configs
          colorByButtons.forEach(button => {
            let colorScale = d3.scaleLinear()
                          .domain([button["domainMin"], button["domainMax"]])
                          .interpolate(d3.interpolateCubehelix)
                          .range([d3.rgb(button["rangeMin"]), d3.rgb(button["rangeMax"])]);

            d3.select(`#${button["id"]}`)
              .on("click", () => {
                svg.selectAll(".province")
                  .transition(1000)
                  .style("fill", d => {
                    return colorScale(d["properties"][button["numerator"]]/d["properties"][button["denominator"]] * 100);
                  })

                svg.selectAll(".province")
                  .on("mouseover", d => {
                    tooltip.html(`
                      <div class="tooltip">
                        <p style="text-align: center; font-weight: bold; font-size: 14px;">${d["properties"]["name"].toUpperCase()}</p>
                        <p style="text-align: center; font-size: 20px; padding: 5px;">${(d["properties"][button["numerator"]]/d["properties"][button["denominator"]] * 100).toFixed(2)}%</p>
                        <p style="text-align: center;">${commaSeparate(d["properties"][button["numerator"]])}</p>
                      </div>
                    `)
                    tooltip.style("visibility", "visible");
                  })
                  .on("mousemove", () => {
                    tooltip.style("top", `${d3.event.clientY - 110}px`)
                            .style("left", `${d3.event.clientX - 80}px`);    
                  });
      

              })
          })      
        
        
    })
  })

  

}