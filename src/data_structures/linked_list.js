import Flatten from "../flatten";

/**
 * Class implements bidirectional non-circular linked list. <br/>
 * LinkedListElement - object of any type that has properties next and prev.
 */
class LinkedList {
    constructor(first, last) {
        this.first = first;
        this.last = last || this.first;
    }

    [Symbol.iterator]() {
        let value = undefined;
        return {
            next: () => {
                value = value ? value.next : this.first;
                return {value: value, done: value === undefined};
            }
        };
    };

    /**
     * Return number of elements in the list
     * @returns {number}
     */
    get size() {
        let counter = 0;
        for (let edge of this) {
            counter++;
        }
        return counter;
    }

    /**
     * Return array of elements from start to end,
     * If start or end not defined, take first as start, last as end
     * @returns {Array}
     */
    toArray(start=undefined, end=undefined) {
        let elements = [];
        let from = start || this.first;
        let to = end || this.last;
        let element = from;
        if (element === undefined) return elements;
        do {
            elements.push(element);
            element = element.next;
        } while (element !== to.next);
        return elements;
    }


    /**
     * Append new element to the end of the list
     * @param {LinkedListElement} element
     * @returns {LinkedList}
     */
    append(element) {
        if (this.isEmpty()) {
            this.first = element;
        } else {
            element.prev = this.last;
            this.last.next = element;
        }

        // update edge to be last
        this.last = element;

        // nullify non-circular links
        this.last.next = undefined;
        this.first.prev = undefined;
        return this;
    }

    /**
     * Insert new element to the list after elementBefore
     * @param {LinkedListElement} newElement
     * @param {LinkedListElement} elementBefore
     * @returns {LinkedList}
     */
    insert(newElement, elementBefore) {
        if (this.isEmpty()) {
            this.first = newElement;
            this.last = newElement;
        }
        else if (elementBefore === null || elementBefore === undefined) {
            newElement.next = this.first;
            this.first.prev = newElement;
            this.first = newElement;
        }
        else {
            /* set links to new element */
            let elementAfter = elementBefore.next;
            elementBefore.next = newElement;
            if (elementAfter) elementAfter.prev = newElement;

            /* set links from new element */
            newElement.prev = elementBefore;
            newElement.next = elementAfter;

            /* extend list if new element added after the last element */
            if (this.last === elementBefore)
                this.last = newElement;
        }
        // nullify non-circular links
        this.last.next = undefined;
        this.first.prev = undefined;
        return this;
    }

    /**
     * Remove element from the list
     * @param {LinkedListElement} element
     * @returns {LinkedList}
     */
    remove(element) {
        // special case if last edge removed
        if (element === this.first && element === this.last) {
            this.first = undefined;
            this.last = undefined;
        } else {
            // update linked list
            if (element.prev) element.prev.next = element.next;
            if (element.next) element.next.prev = element.prev;
            // update first if need
            if (element === this.first) {
                this.first = element.next;
            }
            // update last if need
            if (element === this.last) {
                this.last = element.prev;
            }
        }
        return this;
    }

    /**
     * Return true if list is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.first === undefined;
    }

    /**
     * Throw an error if circular loop detected in the linked list
     * @param {LinkedListElement} first element to start iteration
     * @throws {Flatten.Errors.INFINITE_LOOP}
     */
    static testInfiniteLoop(first) {
        let edge = first;
        let controlEdge = first;
        do {
            if (edge != first && edge === controlEdge) {
                throw Flatten.Errors.INFINITE_LOOP;  // new Error("Infinite loop")
            }
            edge = edge.next;
            controlEdge = controlEdge.next.next;
        } while (edge != first)
    }
}

export default LinkedList;
