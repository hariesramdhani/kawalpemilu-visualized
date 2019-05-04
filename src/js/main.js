import {worldChoropleth} from "./worldChoropleth.js";
import {indonesiaChoropleth} from "./indonesiaChoropleth.js";

const dataPath = "src/assets/"
const jsonDataPath = `${dataPath}/json`

worldChoropleth("world-choropleth", `${jsonDataPath}/world.json`);
indonesiaChoropleth("indonesia-choropleth", `${jsonDataPath}/indonesia.json`);

console.log("Please let me know if the site isn't working properly thank you! - H");