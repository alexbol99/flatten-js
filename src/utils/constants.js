/**
 * Global constant CCW defines counter clockwise direction of arc
 * @type {boolean}
 */
export const CCW = true;

/**
 * Global constant CW defines clockwise direction of arc
 * @type {boolean}
 */
export const CW = false;

/**
 * Defines orientation for face of the polygon: clockwise, counter clockwise
 * or not orientable in the case of self-intersection
 * @type {{CW: number, CCW: number, NOT_ORIENTABLE: number}}
 */
export const ORIENTATION = {CCW:-1, CW:1, NOT_ORIENTABLE: 0};

export const PIx2 = 2 * Math.PI;

export const INSIDE = 1;
export const OUTSIDE = 0;
export const BOUNDARY = 2;
export const CONTAINS = 3;
export const INTERLACE = 4;

export const OVERLAP_SAME = 1;
export const OVERLAP_OPPOSITE = 2;

export const NOT_VERTEX = 0;
export const START_VERTEX = 1;
export const END_VERTEX = 2;

