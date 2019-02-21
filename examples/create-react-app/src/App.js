import React, {Component} from 'react';
import {point, circle, segment} from "@flatten-js/core";

class App extends Component {

    componentDidMount() {
        let s1 = segment(10,10,200,200);
        let s2 = segment(10,160,200,30);
        let c = circle(point(200, 110), 50);
        let ip = s1.intersect(s2);

        document.getElementById("stage").innerHTML = s1.svg() + s2.svg() + c.svg() + ip[0].svg();
    }

    render() {
        return <h1>Hello Flatten World!</h1>;
    }
}

export default App;
