const p5 = require('p5');
import './style.css';

class Circle {
    constructor(x, y, edge, factor) {
        console.log("circle _  x: " + x + " y: " + y + " edge: " + edge);
        this.x = x + edge / 2;
        this.y = y + edge / 2;
        this.edge = edge;
        this.factor = factor;
        this.horiz = true;
    }

    sin(x) {
        return (this.edge / 2) * Math.sin(x / this.factor)
    }

    cos(x) {
        return (this.edge / 2) * Math.cos(x / this.factor);
    }

    draw(ctx, alpha) {
        alpha -= (Math.PI) * this.factor;
        let x = this.x + this.cos(alpha);
        let y = this.y + this.sin(alpha);
        this._x = x;
        this._y = y;

        /*
        ctx.strokeWeight(3);
        ctx.arc(this.x, this.y, this.edge, this.edge, -Math.PI, alpha / this.factor);
        */

        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        if (this.horiz) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 1000);
        } else {
            ctx.moveTo(x, y);
            ctx.lineTo(x + 1000, y);
        }
        ctx.stroke();
    }
}

class TableData {
    constructor(x, y, edge) {
        this.padding = 10;
        this.x = x;
        this.y = y;
        this.edge = edge;
        console.log("x: " + x + " y: " + y + " edge: " + edge);
    }

    draw(ctx, TEST) {
        // ctx.strokeRect(this.x, this.y, this.edge, this.edge);
        if (!this.circle)
            return;
        this.circle.draw(ctx, TEST);
    }

    setCircle(factor) {
        this.circle = new Circle(this.x + this.padding, this.y + this.padding, this.edge - 2 * this.padding, factor);
    }
}

class Table {
    constructor(size, l) {
        this.padding = size * 0.05;
        this.factors = [1, 1.25, 1 + 1 / 3, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5]; // these changes the speed of the circle
        this.x = this.padding;
        this.y = this.padding;
        this.padded_size = size - 2 * this.padding;
        this.l = l;

        this.grid = [];
        this.trails = [];


        let edge = this.padded_size / l;
        this.num_circles = l - 1;
        for (let y = 1; y <= this.num_circles; y++) {
            this.trails[y] = [];
            for (let x = 1; x <= this.num_circles; x++) {
                this.trails[y][x] = [];
            }
        }
        for (let y = this.padding, yy = 0; y < this.padded_size; y += edge, yy++) {
            this.grid[yy] = [];
            for (let x = this.padding, xx = 0; x < this.padded_size; x += edge, xx++) {
                this.grid[yy][xx] = new TableData(x, y, edge);
            }
        }
        for (let i = 1; i <= this.num_circles; i++) {
            this.grid[0][i].setCircle(this.factors[i - 1]);
            this.grid[0][i].circle.horiz = true;
            this.grid[i][0].setCircle(this.factors[i - 1]);
            this.grid[i][0].circle.horiz = false;
        }
    }

    draw(ctx, TEST) {
        ctx.strokeRect(this.x, this.y, this.padded_size, this.padded_size);
        this.grid.forEach(row => row.forEach(data => data.draw(ctx, TEST)));

        for (let y = 1; y <= this.num_circles; y++) {
            for (let x = 1; x <= this.num_circles; x++) {
                let {a, b} = this.intersection(this.grid[0][x].circle, this.grid[y][0].circle);
                this.trails[y][x].push([a, b]);
                if (this.trails[y][x].length > 400) {
                    this.trails[y][x].shift();
                }
                //ctx.moveTo(...this.trails[y][x][0]);
                for (let n  in this.trails[y][x]) {
                    ctx.beginPath();
                    ctx.arc(this.trails[y][x][n].x, this.trails[y][x][n].y, 2, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
        //throw new Error("AAA");
    }

    intersection(vert, horiz) {
        let a = vert._x;
        let b = horiz._y;
        return {a, b};
    }

    update(size) {
        this.grid.forEach(row => row.forEach(data=>data.update(size)))
    }
}

function Animation() {
    let size = 900;
    const l = 5;
    const table = new Table(size, l);

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    canvas.width = 900;
    canvas.height = 900;

    let updateSize = () => {
        let bounds = canvas.getBoundingClientRect();
        let winh = window.innerHeight - 2 * bounds.y;
        let winw = window.innerWidth - 2 * bounds.x;
        size = Math.min(winh, winw);
        canvas.width = size;
        canvas.height = size;
        table.update(size);
    };
    window.onresize = window.onload = updateSize;

    let frames = 0;
    let sec = 0;
    let fps = 0;
    let rad = 0;
    const N_STEPS = 80;
    let step = 2 * Math.PI / N_STEPS;
    let loop = (timestamp) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        table.draw(ctx, rad);


        frames++;
        rad+=step;

        let now = Math.floor(timestamp / 1000);
        ctx.font = '1em Arial';
        ctx.fillStyle = "grey";
        ctx.fillText(fps, 5, 20);
        ctx.fillStyle = "black";
        if (now !== sec) {
            // console.log("sec: "+sec+" fps: "+frames);
            fps = frames;
            frames = 0;
            sec = now;
        }
        window.requestAnimationFrame(loop);
    };

    this.start = () => {
        loop()
    };
}

new Animation().start();

let sketch = (sk) => {
    let size = 900;
    let c = 0;
    const l = 5;
    const table = new Table(size, l);

    sk.setup = () => {
        sk.createCanvas(size, size);
        sk.frameRate(60);
    };

    sk.draw = () => {
        sk.clear();
        table.draw(sk);

    };

    //table.draw(sk);
};

// new p5(sketch);
