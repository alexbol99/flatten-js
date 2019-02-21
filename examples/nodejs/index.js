// Just hit "node index.js" in the terminal while you are in the directory of this project


// In the real app you will need to install @flatten-js/core
let Flatten = require('../../dist/main.umd');
let {point, segment, circle} = Flatten;

// make some construction
let s1 = segment(10,10,200,200);
let s2 = segment(10,160,200,30);
let c = circle(point(200, 110), 50);
let ip = s1.intersect(s2);
console.log(ip);

