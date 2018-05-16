'use strict';
/**
 * @file diff.js
 * @owner: Kehr<kehr.china@gmail.com>
 */


/**
 * json diff
 * @param {string} id1 textarea id
 * @param {string} id2 textarea id
 */

var Diff = function (options) {
    this.utils.must(options, ['left', 'right', 'targetId']);
    this.options = this.utils.extend({
        resultsClass: 'json',
        resultsId: 'json-view-results',
        resultsLeftId: 'json-view-results-left',
        resultsRightId: 'json-view-results-right',
        filter: {
            added: [],
            removed: [],
            changed: []
        }
    }, options);

    this.area1 = document.getElementById(options.left);
    this.area2 = document.getElementById(options.right);

    this.initialize();
    return this;
};

/**
 * initialize all event listener
 */
Diff.prototype.initialize = function () {
    document.addEventListener('click', function (e) {
        var e = e || window.event;
        var tagName = e.target.nodeName.toLowerCase();
        if (tagName === 'ul') {
            if (e.target.getAttribute('collapsed') === 'off'
                || null === e.target.getAttribute('collapsed')
                || undefined === e.target.getAttribute('collapsed')) {
                e.target.setAttribute('collapsed', 'on');
            }
            else {
                e.target.setAttribute('collapsed', 'off');
            }
        }
    }, false);
};


/**
 * Swap the two textarea content
 */
Diff.prototype.swap = function () {
    var tmp = this.area1.value;
    this.area1.value = this.area2.value;
    this.area2.value = tmp;
};

/**
 * Clear the two textarea content
 */
Diff.prototype.clear = function () {
    this.area1.value = '';
    this.area2.value = '';
};

/**
 * Remove all children node
 * @param {Object} node The tree node of json node
 */
Diff.prototype.remove = function (node) {
    var child;
    while (child = node.lastChild) {
        node.removeChild(child);
    }
};

/**
 * Utils
 */

Diff.prototype.utils = {};

/**
 * Add class to target
 * @param {Object} target target
 * ...
 * @return {Object} target Object
 */
Diff.prototype.utils.addClass = function () {
    var target = arguments[0];
    var oldClass = target.getAttribute('class').trim().split(' ');
    for (var i = 1; i < arguments.length; ++i) {
        if (-1 === oldClass.indexOf(arguments[i])) {
            oldClass.push(arguments[i]);
        }
    }
    target.setAttribute('class', oldClass.join(' '));
    return target;
};

/**
 * Remove target class
 * @param {Object} target target
 * ...
 * @return {Object} target Object
 */
Diff.prototype.utils.removeClass = function () {
    var target = arguments[0];
    var oldClass = target.getAttribute('class').trim().split(' ');

    var needRemovedClass = [];
    for (var i = 1; i < arguments.length; ++i) {
        needRemovedClass.push(arguments[i]);
    }

    var targetClass = [];
    for (var i = 0; i < oldClass.length; ++i) {
        if (-1 === needRemovedClass.indexOf(oldClass[i])) {
            targetClass.push(oldClass[i]);
        }
    }

    target.setAttribute('class', targetClass.join(' '));
    return target;
};

/**
 * options 中是否存在必要的 key
 * @param {Object} options A dict Object
 * @param {Array} keys The needed key list
 */
Diff.prototype.utils.must = function (options, keys) {
    if (!this.isArray(keys)) {
        throw new Error('The parameter [keys] must is array, but ' + this.type(keys));
    }

    for (var i = keys.length - 1; i >= 0; i--) {
        if (!options[keys[i]]) {
            throw new Error(keys[i] + ' is missing!');
        }
    }
};

/**
 * Deep copy
 * @param  {Object} target other attr will be deep copied into target
 * @param  {Object} obj    Addition ojbect
 * @return {Object}        target
 */
Diff.prototype.utils.extend = function (target, obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var type = this.type(key);
            if ('string' === type || 'number' === type || 'boolean' === type) {
                target[key] = obj[key];
            }
            else {
                this.extend(target[key], obj[key]);
            }
        }
    }
    return target;
};

/**
 * 判断是否为数组
 * @param  {Object}  obj 待判断的对象
 * @return {boolean}     true/false
 */
Diff.prototype.utils.isArray = function (obj) {
    return obj && 'object' === typeof obj && Array === obj.constructor;
};

/**
 * 获取对象类型
 * @param  {Object} obj object
 * @return {string}
 */
Diff.prototype.utils.type = function (obj) {
    return this.isArray(obj) ? 'array' : typeof obj;
};

/**
 * 隐藏非diff内容
 */
Diff.prototype.fadeOut = function () {
    this.utils.addClass(document.getElementById(this.options.resultsId), 'j-fade');
};

/**
 * 显示非diff内容
 */
Diff.prototype.fadeIn = function () {
    this.utils.removeClass(document.getElementById(this.options.resultsId), 'j-fade');
};

/**
 * Expand all node
 * @param  {Object} root  the root element Object
 */
Diff.prototype.expandAll = function (root) {
    var root = root || document.getElementById(this.options.resultsId);
    // 广度优先
    var children = root.children;
    for (var i = 0; i < children.length; ++i) {
        if (children[i].tagName.toLowerCase() === 'ul') {
            children[i].setAttribute('collapsed', 'off');
        }
        this.expandAll(children[i]);
    }
};

/**
 * 收起Json树
 * @param  {Object} root  the root element Object
 */
Diff.prototype.collapseAll = function (root) {
    var root = root || document.getElementById(this.options.resultsId);
    // 深度优先
    var children = root.children;
    for (var i = 0; i < children.length; ++i) {
        this.collapseAll(children[i]);
        if (children[i].tagName.toLowerCase() === 'ul') {
            children[i].setAttribute('collapsed', 'on');
        }
    }
};

/**
 * 收起非diff部分的JSON树
 * @param  {Object} root  the root element Object
 */
Diff.prototype.collapse = function (root) {
    var root = root || document.getElementById(this.options.resultsId);
    var children = root.children;
    for (var i = 0; i < children.length; ++i) {
        var tageName = children[i].tagName.toLowerCase();
        var show = children[i].getAttribute('show');
        if (tageName === 'span' && show) {
            if (show === 'on') {
                var parent = root.parentNode;
                var parentTagName = parent.tagName.toLowerCase();
                while (parentTagName !== 'body') {
                    if (parentTagName === 'ul') {
                        parent.setAttribute('collapsed', 'off');
                    }
                    parent = parent.parentNode;
                    parentTagName = parent.tagName.toLowerCase();
                }
            }
            else if (show === 'off') {
                var parent = children[i].parentNode;
                if (parent.tagName.toLowerCase() === 'ul') {
                    parent.setAttribute('collapsed', 'on');
                }
                this.collapse(children[i]);
            }
        }
        else {
            this.collapse(children[i]);
        }
    }
};

/**
 * Compare the two textarea json content
 * @return {undefined} undefined
 */
Diff.prototype.compare = function () {
    try {
        var leftObj = JSON.parse(this.area1.value);
        this.area1.style.backgroundColor = '';
    }
    catch (e) {
        this.area1.style.backgroundColor = 'rgba(255,0,0,0.5)';
        console.error(e);
        return false;
    }

    try {
        var rightObj = JSON.parse(this.area2.value);
        this.area2.style.backgroundColor = '';
    }
    catch (e) {
        this.area2.style.backgroundColor = 'rgba(255,0,0,0.5)';
        console.error(e);
        return false;
    }

    var results = document.getElementById(this.options.targetId);

    // Clear results content
    this.remove(results);

    var div = document.createElement('div');
    div.setAttribute('id', this.options.resultsId);
    div.setAttribute('class', this.options.resultsClass);
    results.appendChild(div);

    // compare two json Object
    this.compareTree(leftObj, rightObj, 'root', div);

};

/**
 * Compare two json Object
 * @param  {Object} leftObj    json Object
 * @param  {Object} rightObj    json Object
 * @param  {string} name    node name
 * @param  {string} results the results container
 */
Diff.prototype.compareTree = function (leftObj, rightObj, name, results) {
    var leftObjType = this.utils.type(leftObj);
    var rightObjType = this.utils.type(rightObj);

    var str1 = (leftObjType === 'object' || leftObjType === 'array') ? '' : String(leftObj) + ' ';
    var str2 = (rightObjType === 'object' || rightObjType === 'array') ? '' : String(rightObj) + ' ';

    var leafNode = document.createElement('span');

    var key = document.createElement('span');
    key.setAttribute('class', 'key');
    key.appendChild(document.createTextNode(name + ': '));

    var value = document.createElement('span');
    value.setAttribute('class', 'value');

    leafNode.appendChild(key);

    var added = 0;
    var removed = 0;
    var changed = 0;

    // Set diff value
    if (leftObj === undefined) {
        if (this.options.filter.added && -1 !== this.options.filter.added.indexOf(name)) {
            leafNode.setAttribute('class', 'iadded');
            leafNode.setAttribute('show', 'off');
        }
        else {
            leafNode.setAttribute('class', 'added');
            leafNode.setAttribute('show', 'on');
        }
        value.appendChild(document.createTextNode(str2));
        added += 1;
    }
    else if (rightObj === undefined) {
        if (this.options.filter.removed && -1 !== this.options.filter.removed.indexOf(name)) {
            leafNode.setAttribute('class', 'iremoved');
            leafNode.setAttribute('show', 'off');
        }
        else {
            leafNode.setAttribute('class', 'removed');
            leafNode.setAttribute('show', 'on');
        }
        value.appendChild(document.createTextNode(str1));
        removed += 1;
    }
    else if (leftObjType !== rightObjType
        || (leftObjType !== 'object' && leftObjType !== 'array' && leftObj !== rightObj)) {
        if (this.options.filter.changed && -1 !== this.options.filter.changed.indexOf(name)) {
            leafNode.setAttribute('class', 'ichanged');
            leafNode.setAttribute('show', 'off');
        }
        else {
            leafNode.setAttribute('class', 'changed');
            leafNode.setAttribute('show', 'on');
        }
        value.appendChild(document.createTextNode(str1 + '=> ' + str2));
        changed += 1;
    }
    else {
        leafNode.setAttribute('show', 'off');
        value.appendChild(document.createTextNode(str1));
    }
    leafNode.appendChild(value);

    if (leftObjType === 'object' || leftObjType === 'array'
        || rightObjType === 'object' || rightObjType === 'array') {
        var keys = [];

        // Collect al of the keys of leftObj and rightObj
        for (var i in leftObj) {
            if (leftObj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }

        for (var i in rightObj) {
            if (rightObj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }

        // the index of array must convert into integer
        if ('array' === this.utils.type(leftObj)) {
            for (var i = 0; i < keys.length; ++i) {
                keys[i] = parseInt(keys[i], 10);
            }
            keys.sort(function (a, b) {
                return a - b;
            });
        }
        else {
            keys.sort();
        }

        var listNode = document.createElement('ul');
        listNode.appendChild(leafNode);

        for (var i = 0; i < keys.length; i++) {
            // unique key filter
            if (keys[i] === keys[i - 1]) {
                continue;
            }

            var li = document.createElement('li');
            listNode.appendChild(li);

            this.compareTree(leftObj && leftObj[keys[i]],
                            rightObj && rightObj[keys[i]], keys[i], li);

        }
        if (added > 0 || removed > 0 || changed > 0) {
            listNode.setAttribute('class', 'collapsed');
        }

        results.appendChild(listNode);
    }
    else {
        results.appendChild(leafNode);
    }
};

/**
 * Add Plugin to jQuery
 */
// (function($){
//     $.fn.diff = function(id1, id2, resId) {
//         return new Diff(id1, id2, resId);
//     };
// }(jQuery));
