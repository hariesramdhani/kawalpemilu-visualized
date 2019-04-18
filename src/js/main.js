let w = 1200,
    h = 400;

var margin = {
  top: 60,
  bottom: 40,
  left: 70,
  right: 40
};

var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;

// define map projection
let projection = d3.geoMercator()
                  .translate([-1900, 150])
                  .scale([1200]);

//Define default path generator
let path = d3.geoPath()
            .projection(projection);
            
let svg = d3.select("#map")
            .append("svg")
            .attr("id", "chart")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("tranform", "translate(0" + margin.left + "," + margin.top + ")");

let date = Date.now();
let APIurl = "https://kawal-c1.appspot.com/api/c/0?" + date;
let lengthOfData;

d3.json(APIurl, function(error, data) {

  lengthOfData = data["children"].length;

  d3.json("src/assets/json/indonesia.json", function(error, json) {

    if (error) {
      return console.log(error);
    }

    for (let i = 0; i< lengthOfData; i++) {
      // the key to GET the election result data
      let provinceID = data["children"][i][0];
      let provinceName = data["children"][i][1];

      // Number of TPS all over the provinces
      let provinceTPSNo = data["children"][i][2];

      // ELECTION RESULT DATA STARTS HERE

      // The amount of votes that the 1st candidate received
      let candidateOne = data["data"][provinceID]["sum"]["pas1"];

      // The amount of votes that the 2nd candidate received
      let candidateTwo = data["data"][provinceID]["sum"]["pas2"];

      // The amount of votes that is considered valid
      let valid = data["data"][provinceID]["sum"]["sah"];

      // The amount of votes that is considered invalid
      let invalid = data["data"][provinceID]["sum"]["tSah"];

      console.log(json.features.length);

      for (let j = 0; i < json.features.length; j++) {
        let provinceNameJSON = json["features"][1]["properties"]["Propinsi"];

        if (provinceNameJSON == 
      }

    }
  
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
  })
})