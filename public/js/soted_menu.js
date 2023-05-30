document.querySelector('#sort-asc').onclick = mySort;

function mySort() {
    korm = document.querySelector('cost');
    for (let i = 0; i < korm.children; i++) {
        for (let j = 0; j < korm.children.length; j++) {
            if (+korm.children[i].getAttribute('cost') > +korm.children[j].getAttribute('cost')) {
                replacedNode = nav.replacedChild(korm.children[i], korm.children[j]);
                insertAfter(replacedNode, korm.children[i]);
            }
        }                                                                                                      
    }
}

function insertAfter(elem, refElem) {
    return refElem.parentNode.insertBefore(elem, refElem.nextSibling)
}

