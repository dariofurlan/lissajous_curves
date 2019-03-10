const p5 = require('p5');
import './style.css';

class Circle {
    constructor(x, y, edge, factor) {
        this.x = x + edge / 2;
        this.y = y + edge / 2;
        this.edge = edge;
        this.factor = factor;
        this.rad = 0;
        this.steps = 60;
        this.inc = ((2 * Math.PI) / this.factor) / this.steps;
        this.horiz = true;
    }

    sin(x) {
        return (this.edge / 2) * Math.sin(x / this.factor)
    }

    cos(x) {
        return (this.edge / 2) * Math.cos(x / this.factor);
    }

    draw(sk) {
        let alpha = this.rad - (Math.PI);
        sk.strokeWeight(3);
        sk.arc(this.x, this.y, this.edge, this.edge, -Math.PI, alpha / this.factor);

        sk.strokeWeight(10);
        sk.point(this.x + this.cos(alpha), this.y + this.sin(alpha));

        sk.strokeWeight(1);
        let x = this.cos(alpha);
        let y = this.sin(alpha);
        if (this.horiz)
            sk.line(this.x + x, this.y + y, this.x + x, this.y + y + 1000);
        else
            sk.line(this.x + x, this.y + y, this.x + x + 1000, this.y + y);

        this.rad += this.inc;
        if (this.rad > 2 * Math.PI * this.factor) {
            this.rad = 0;
        }
    }
}

class TableData {
    constructor(x, y, edge) {
        this.padding = 10;
        this.x = x + this.padding;
        this.y = y + this.padding;
        this.edge = edge - 2 * this.padding;
    }

    draw(sk) {
        //sk.noFill();
        sk.rect(this.x - this.padding, this.y - this.padding, this.x + 2 * this.padding + this.edge, this.y + 2 * this.padding + this.edge);
        if (!this.circle)
            return;
        this.circle.draw(sk);
    }

    setCircle(factor) {
        this.circle = new Circle(this.x, this.y, this.edge, factor);
    }
}

class Table {
    constructor(size, l) {
        this.padding = 50;
        size -= 2 * this.padding;
        this.grid = [];
        let edge = size / l;
        for (let y = this.padding, yy = 0; y < size; y += edge, yy++) {
            this.grid[yy] = [];
            for (let x = this.padding, xx = 0; x < size; x += edge, xx++) {
                this.grid[yy][xx] = new TableData(x, y, edge)
            }
        }
    }

    draw(sk) {
        this.grid.forEach(row => row.forEach(data => data.draw(sk)));
        // todo calculate collisions with all the lines and make a sort of a trace
    }
}


let sketch = (sk) => {
    let size = 900;
    let c = 0;
    const l = 8;
    const table = new Table(size, l);

    sk.setup = () => {
        sk.createCanvas(size, size);
        sk.frameRate(30);
        let aaa = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5];
        for (let i = 1; i < l; i += 1) {
            table.grid[0][i].setCircle(aaa[i - 1]);
            table.grid[0][i].circle.horiz = true;
            table.grid[i][0].setCircle(aaa[i - 1]);
            table.grid[i][0].circle.horiz = false;
        }
    };

    sk.draw = () => {
        sk.clear();
        table.draw(sk);

    };

    //table.draw(sk);
};

new p5(sketch);
