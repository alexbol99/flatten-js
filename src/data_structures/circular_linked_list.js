import LinkedList from './linked_list';

/**
 * Class implements circular bidirectional linked list
 */
class CircularLinkedList extends LinkedList {
    constructor(first, last) {
        super(first, last);
        this.setCircularLinks();
    }

    setCircularLinks() {
        if (this.isEmpty()) return;
        this.last.next = this.first;
        this.first.prev = this.last;
    }

    [Symbol.iterator]() {
        let element = undefined;
        return {
            next: () => {
                let value = element ? element : this.first;
                let done = this.first ? (element ? element === this.first : false) : true;
                element = value ? value.next : undefined;
                return {value: value, done: done};
            }
        };
    };

    /**
     * Append new element to the end of the list
     * @param element
     * @returns {CircularLinkedList}
     */
    append(element) {
        super.append(element);
        this.setCircularLinks();
        return this;
    }

    /**
     * Insert new element to the list after elementBefore
     * @param newElement
     * @param elementBefore
     * @returns {CircularLinkedList}
     */
    insert(newElement, elementBefore) {
        super.insert(newElement, elementBefore);
        this.setCircularLinks();
        return this;
    }

    /**
     * Remove element from the list
     * @param element
     * @returns {CircularLinkedList}
     */
    remove(element) {
        super.remove(element);
        // this.setCircularLinks();
        return this;
    }
}

export default CircularLinkedList;
