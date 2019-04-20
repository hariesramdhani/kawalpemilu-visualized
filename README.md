# KawalPemilu Visualized
![KawalPemilu Visualized](https://raw.githubusercontent.com/hariesramdhani/kawalpemilu-visualized/master/src/assets/img/docs/visualization.png)
KawalPemilu Visualized is a data visualization of the result of Indonesia's recent election built with D3.js and KawalPemilu API. KawalPemilu Visualized is a static web page and the data visualizations are rendered on the client-side. (For more information about KawalPemilu please visit kawalpemilu.org).

#### KawalPemilu API Information
KawalPemilu API can be accessed via
```
https://kawal-c1.appspot.com/api/c/[REGION CODE]?[TIME]/
```
- `REGION CODE` is a number ranging from 1~... that denotes the location of the place where the votes is collected
- `TIME` is pretty much self explnatory, to generate time in Javascript use `Date.now()`

Example of request:
```
https://kawal-c1.appspot.com/api/c/0?1555803179480/
```
This will request votes data in JSON format for all provinces at Sunday, 21st April 6:333 AM GMT+7.

#### JSON file
The JSON file consists of two bigger parts, the first one is the value of `"children"`. It consists an array of array of the information about the provinces (if the `REGION CODE` is 0). 
Example:
```
[1,"ACEH",15610,1734674,1789100]
```
The first element is the code number to access the data from the API so if the `REGION CODE` that is being used is 1 it will give the votes data for the REGENCY and CITY in ACEH province.
The second element corresponds to the total number of voting places in the region.

The second part is the one that consists the voting data. To access this part use the `REGION CODE` obtained from the first element of the former part. The objects returned is pretty much self explanatory, please crosscheck to KawalPemilu tabular data columns in case of doubt.

