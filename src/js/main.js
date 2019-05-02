import {indonesiaChoropleth} from "./indonesiaChoropleth.js";
import {worldChoropleth} from "./worldChoropleth.js";

const dataPath = "src/assets/"
const jsonDataPath = `${dataPath}/json`

indonesiaChoropleth("indonesia-choropleth", `${jsonDataPath}/indonesia.json`);
worldChoropleth("world-choropleth", `${jsonDataPath}/world.json`);

console.log("Please let me know if the site isn't working properly thank you! - H")