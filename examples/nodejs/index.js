// Just hit "node index.js" in the terminal while you are in the directory of this project
let {point, segment, circle} = require('@flatten-js/core');

// make some construction
let s1 = segment(10,10,200,200);
let s2 = segment(10,160,200,30);
let c = circle(point(200, 110), 50);
let ip = s1.intersect(s2);
console.log(ip);

