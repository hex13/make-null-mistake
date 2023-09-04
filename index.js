// promise helpers 

function defer() {
    let resolve;
    const promise = new Promise(r => {
        resolve = r;
    });
    return { promise, resolve };
}

function subject() {
    let deferred = defer();
    return {
        then: (...args) => deferred.promise.then(...args),
        emit: (value) => {
            deferred.resolve(value);
            deferred = defer();
        }
    }
}

// DOM event helpers 

function bindEvent(el, eventName) {
    const s = subject();
    el.addEventListener(eventName, e => {
        s.emit(e);
    });
    return s;
}

const xyFromEvent = e => {
    const rect = e.target.getBoundingClientRect();
    return {
        x: e.clientX - rect.x,
        y: e.clientY - rect.y,
    };
}

// our example

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function drawLine(from, to) {
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}

async function drawingEditor() {
    const down = bindEvent(document, 'mousedown');
    const up = bindEvent(document, 'mouseup');
    const move = bindEvent(document, 'mousemove');
    while (true) {
        let from = xyFromEvent(await down);
        let e;
        do {
            e = await Promise.race([move, up]);
            to = xyFromEvent(e);
            drawLine(from, to);
            from = to;
        } while (e.type != 'mouseup')
    }
}

drawingEditor();

