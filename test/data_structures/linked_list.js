'use strict';

import {expect} from 'chai';
import Flatten from '../../index';
import LinkedList from '../../src/data_structures/linked_list';

describe('#LinkedList', function () {
    it('May create new instance of LinkedList', function () {
        let list = new LinkedList();
        expect(list).to.be.an.instanceof(LinkedList);
        expect(list.isEmpty()).to.be.true;
    });
    it('May return size of empty linked list', function () {
        let list = new LinkedList();
        expect(list.size).to.be.equal(0);
    });
    it('May append element to empty linked list', function () {
        let list = new LinkedList();
        let element = {val: "one", next: undefined, prev: undefined};
        list.append(element);
        expect(list.size).to.be.equal(1);
        expect(list.first).to.be.equal(element);
        expect(list.last).to.be.equal(element);
    });
    it('May append 5 elements to linked list', function () {
        let list = new LinkedList();
        let element1 = {val: "one", next: undefined, prev: undefined};
        let element2 = {val: "two", next: undefined, prev: undefined};
        let element3 = {val: "three", next: undefined, prev: undefined};
        let element4 = {val: "four", next: undefined, prev: undefined};
        let element5 = {val: "five", next: undefined, prev: undefined};
        list.append(element1);
        list.append(element2);
        list.append(element3);
        list.append(element4);
        list.append(element5);
        expect(list.size).to.be.equal(5);
        expect(list.first).to.be.equal(element1);
        expect(list.last).to.be.equal(element5);
    });
    it('May insert element to the middle of linked list', function () {
        let list = new LinkedList();
        let element1 = {val: "one", next: undefined, prev: undefined};
        let element2 = {val: "two", next: undefined, prev: undefined};
        let element3 = {val: "three", next: undefined, prev: undefined};
        let element4 = {val: "four", next: undefined, prev: undefined};
        let element5 = {val: "five", next: undefined, prev: undefined};
        let element10 = {val: "ten", next: undefined, prev: undefined};
        list.append(element1);
        list.append(element2);
        list.append(element3);
        list.append(element4);
        list.append(element5);
        list.insert(element10, element2);
        expect(list.size).to.be.equal(6);
        expect(element2.next).to.be.equal(element10);
        expect(element10.next).to.be.equal(element3);
        expect(element3.prev).to.be.equal(element10);
        expect(element10.prev).to.be.equal(element2);
    });
    it('May insert element to the end of linked list', function () {
        let list = new LinkedList();
        let element1 = {val: "one", next: undefined, prev: undefined};
        let element2 = {val: "two", next: undefined, prev: undefined};
        let element3 = {val: "three", next: undefined, prev: undefined};
        let element4 = {val: "four", next: undefined, prev: undefined};
        let element5 = {val: "five", next: undefined, prev: undefined};
        let element10 = {val: "ten", next: undefined, prev: undefined};
        list.append(element1);
        list.append(element2);
        list.append(element3);
        list.append(element4);
        list.append(element5);
        list.insert(element10, element5);
        expect(list.size).to.be.equal(6);
        expect(element5.next).to.be.equal(element10);
        expect(element10.prev).to.be.equal(element5);
        expect(list.last).to.be.equal(element10);
    });
    it('May insert element to the beginning of linked list if elementBefore is null', function () {
        let list = new LinkedList();
        let element1 = {val: "one", next: undefined, prev: undefined};
        let element2 = {val: "two", next: undefined, prev: undefined};
        let element3 = {val: "three", next: undefined, prev: undefined};
        let element4 = {val: "four", next: undefined, prev: undefined};
        let element5 = {val: "five", next: undefined, prev: undefined};
        let element10 = {val: "ten", next: undefined, prev: undefined};
        list.append(element1);
        list.append(element2);
        list.append(element3);
        list.append(element4);
        list.append(element5);
        list.insert(element10, null);
        expect(list.size).to.be.equal(6);
        expect(element1.prev).to.be.equal(element10);
        expect(element10.next).to.be.equal(element1);
        expect(list.first).to.be.equal(element10);
    });
    it('May insert element to the empty list', function () {
        let list = new LinkedList();
        let element1 = {val: "one", next: undefined, prev: undefined};
        list.insert(element1);
        expect(list.size).to.be.equal(1);
        expect(list.first).to.be.equal(element1);
        expect(list.last).to.be.equal(element1);
    });
    it('May remove element from the linked list', function () {
        let list = new LinkedList();
        let element1 = {val: "one", next: undefined, prev: undefined};
        let element2 = {val: "two", next: undefined, prev: undefined};
        let element3 = {val: "three", next: undefined, prev: undefined};
        let element4 = {val: "four", next: undefined, prev: undefined};
        let element5 = {val: "five", next: undefined, prev: undefined};
        list.append(element1);
        list.append(element2);
        list.append(element3);
        list.append(element4);
        list.append(element5);

        expect(list.size).to.be.equal(5);

        list.remove(element3);
        expect(list.size).to.be.equal(4);
    });
    it('May remove all elements', function () {
        let list = new LinkedList();
        let element1 = {val: "one", next: undefined, prev: undefined};
        let element2 = {val: "two", next: undefined, prev: undefined};
        let element3 = {val: "three", next: undefined, prev: undefined};
        let element4 = {val: "four", next: undefined, prev: undefined};
        let element5 = {val: "five", next: undefined, prev: undefined};
        list.append(element1);
        list.append(element2);
        list.append(element3);
        list.append(element4);
        list.append(element5);

        expect(list.size).to.be.equal(5);

        list.remove(element1);
        list.remove(element2);
        list.remove(element3);
        list.remove(element4);
        list.remove(element5);
        expect(list.isEmpty()).to.be.true;
        expect(list.size).to.be.equal(0);
    });
    it('May return array of all elements', function () {
        let list = new LinkedList();
        let element1 = {val: "one", next: undefined, prev: undefined};
        let element2 = {val: "two", next: undefined, prev: undefined};
        let element3 = {val: "three", next: undefined, prev: undefined};
        let element4 = {val: "four", next: undefined, prev: undefined};
        let element5 = {val: "five", next: undefined, prev: undefined};
        list.append(element1);
        list.append(element2);
        list.append(element3);
        list.append(element4);
        list.append(element5);

        let arr = list.toArray().map( elm => elm.val);
        expect(arr).to.be.deep.equal(["one","two","three","four","five"])
    });
    it('May construct linked list by first and last', function () {
        let element1 = {val: "one", next: undefined, prev: undefined};
        let element2 = {val: "two", next: undefined, prev: undefined};
        let element3 = {val: "three", next: undefined, prev: undefined};
        let element4 = {val: "four", next: undefined, prev: undefined};
        let element5 = {val: "five", next: undefined, prev: undefined};

        element1.next = element2;
        element2.next = element3; element2.prev = element1;
        element3.next = element4; element3.prev = element2;
        element4.next = element5; element4.prev = element3;
                                  element5.prev = element4;

        let list = new LinkedList(element1, element5);
        expect(list.size).to.be.equal(5);
        expect(list.first).to.be.equal(element1);
        expect(list.last).to.be.equal(element5);
        let arr = list.toArray().map( elm => elm.val);
        expect(arr).to.be.deep.equal(["one","two","three","four","five"])
    });
    it('May throw error when infinite loop detected', function () {
        let element1 = {val: "one", next: undefined, prev: undefined};
        let element2 = {val: "two", next: undefined, prev: undefined};
        let element3 = {val: "three", next: undefined, prev: undefined};
        let element4 = {val: "four", next: undefined, prev: undefined};
        let element5 = {val: "five", next: undefined, prev: undefined};

        element1.next = element2;
        element2.next = element3; element2.prev = element1;
        element3.next = element4; element3.prev = element2;
        element4.next = element5; element4.prev = element3;
        element5.prev = element4;
        element5.next = element3;       // create circular link

        let list = new LinkedList(element1, element5);
        expect( () => LinkedList.testInfiniteLoop(element1)).to.throw(Flatten.Errors.INFINITE_LOOP.message)
    });
});
