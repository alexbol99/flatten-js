import Flatten = require("../../index");

declare const segment: Flatten.Segment;
declare const arc: Flatten.Arc;

const overlap: Flatten.EdgeOverlappingType | undefined = Flatten.Edge.getOverlap(segment, arc);
void overlap;
