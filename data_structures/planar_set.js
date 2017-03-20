/**
 * Created by Alex Bol on 3/12/2017.
 */

/**
 * Class representing a planar set - a generic container with ability to contain shapes and perform spatial queries
 */
class PlanarSet extends Set {
    /**
     *
     * @param Index
     */
    constructor(Index) {
        super();
        this.index = null;
        if (Index) {
            this.index = new Index();
        }
    }

    add(element) {
        super.add(element);
        if (this.index) {
            this.index.add(element);
        }
    }

    delete(element) {
        super.delete(element);
        if (this.index) {
            this.index.delete(element);
        }
    }

    find(box) {
        let resp = [];
        if (this.index) {
            resp = this.index.find(box);
        }
        else {
            for (let element of this) {
                if (element.box.intersect(box)) {
                    resp.push(element);
                }
            }
        }
        return resp;
    }

    hit(point) {
        let resp = [];
        if (this.index) {
            let box = new Flatten.Box(point.x, point.y, point.x, point.y);
            resp = this.index.find(box);
            if (resp.length > 0) {
                resp = resp.slice(0,1);
            }
        }
        else {
            for (let element of this) {
                if (point.on.element.shape) {
                    resp.push(element);
                    break;
                }
            }
        }
        return resp;
    }
}

module.exports = PlanarSet;