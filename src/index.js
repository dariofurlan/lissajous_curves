const p5 = require('p5');
import './style.css';

class Circle {
    constructor(x, y, edge) {
        this.x = x + edge / 2;
        this.y = y + edge / 2;
        this.edge = edge;
        this.factor = 1;
        this.rad = 0;
        this.steps = 100;
        this.inc = (2 * Math.PI * this.factor) / this.steps;
    }

    _y(x) {
        return (x <= 2 * Math.PI / this.factor) ? (this.edge / 2) * Math.sin(x / this.factor) : (2 * Math.PI) / this.factor + (this.edge / 2) * Math.sin(x / this.factor);
    }

    draw(sk) {
        let x = this.rad;
        let y = this._y(x+ (Math.PI / 2));
        sk.strokeWeight(3);
        sk.arc(this.x, this.y, this.edge, this.edge, -Math.PI / 2, x + (Math.PI / 2));
        sk.strokeWeight(10);
        x = 100 * x;
        //sk.point(this.x+x, this.y+y, 1);
        //console.log(x, y);
        this.rad += this.inc;
        if (this.rad > 2 * Math.PI * this.factor) {
            this.rad = 0
        }
    }


}

class TableData {
    constructor(x, y, edge) {
        this.padding = 10;
        x += this.padding;
        y += this.padding;
        edge -= 2 * this.padding;
        console.log({y, x});
        this.circle = new Circle(x, y, edge)
    }

    draw(sk) {
        this.circle.draw(sk)
    }
}

class TableRow {
    constructor(size, y, edge) {
        this.padding = 50;
        this.table_datas = [];
        for (let x = this.padding; x < size; x += edge) {
            this.table_datas.push(new TableData(x, y, edge));
        }
    }

    draw(sk) {
        this.table_datas.forEach(data => data.draw(sk));
    }
}

class Table {
    constructor(size, l) {
        this.padding = 50;
        size -= 2 * this.padding;
        this.rows = [];
        let edge = size / l;
        for (let y = this.padding; y < size; y += edge) {
            this.rows.push(new TableRow(size, y, edge));
        }
    }

    draw(sk) {
        this.rows.forEach(row => row.draw(sk));
    }
}


let sketch = (sk) => {
    let size = 900;
    let c = 0;
    const table = new Table(size, 2);

    sk.setup = () => {
        sk.createCanvas(size, size);
        sk.frameRate(30);
    };

    let done = false;

    sk.draw = () => {
        sk.clear();
        table.draw(sk)
    };

    //table.draw(sk);
};

new p5(sketch);
