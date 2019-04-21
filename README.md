# KawalPemilu Visualized
![KawalPemilu Visualized](https://raw.githubusercontent.com/hariesramdhani/kawalpemilu-visualized/master/src/assets/img/docs/visualization.png)
KawalPemilu Visualized is a data visualization of the result of Indonesia's recent election built with D3.js and KawalPemilu API. KawalPemilu Visualized is a static web page and the data visualizations are rendered on the client-side. (For more information about KawalPemilu please visit kawalpemilu.org).

#### KawalPemilu API Information
KawalPemilu API can be accessed via
```
https://kawal-c1.appspot.com/api/c/[REGION CODE]?[TIME]/
```
- `REGION CODE` is a number ranging from 1~... that denotes the location of the place where the votes is collected
- `TIME` is pretty much self explanatory, to generate time in Javascript use `Date.now()`

Example of request:
```
https://kawal-c1.appspot.com/api/c/0?1555803179480/
```
This will request votes data in JSON format for all provinces on Sunday, 21st April 6:333 AM GMT+7.

#### JSON file
The JSON file consists of two bigger parts, the first one is the value of `"children"`. It consists an array of array of the information about the provinces (if the `REGION CODE` is 0). 
Example:
```
[1,"ACEH",15610,1734674,1789100]
```
The first element is the code number to access the data from the API so if the `REGION CODE` that is being used is 1 it will give the votes data for the REGENCY and CITY in ACEH province.
The second element corresponds to the total number of voting places in the region.

The second part is the one that consists the voting data. To access this part use the `REGION CODE` obtained from the first element of the former part. The objects returned is pretty much self explanatory, please crosscheck to KawalPemilu tabular data columns in case of doubt.

#### Start the Development on your PC
You need to have Python3++ installed or any code editor with Live Preview extension will do (lie VS Code or Brackets)
```
git clone https://github.com/hariesramdhani/kawalpemilu-visualized.git && cd kawalpemilu-visualized

python -m http.server 5500
```
It can be accessed via `localhost:5500` on your browser

#### What to Implement/Do Next
- **Regencies/cities visualization**; when user clicks the province a pop up will appear showing the visualization of number of votes in cities/regencies of the provinces. (Additional information about the votes collected in that province would be nice).
- **Tweaks the CSS and Javascript codes**; right now there are tons of redundant lines of codes would be nice if it can be cleaned. Especially the CSS on `index.html`. Cleaning the inconsistency of ES6 and ES5 would also be nice.
- **Error Handling**; the page doesn't come with a clever error handling so when the API changed/is down the page will show nothing. A pop up message would be nice.
- **Add Kaltara to the main topojson file**; hadn't had the time to do so, the easiest way would be to use GEOjson.io to add it.
- **Clever way to translate the map**; at the moment I translate the map X, Y position manually. There must be a clever way to do this. Or there isn't.
- **Test, test, test** - No tests at the moment

New ideas and contributions are always welcome!