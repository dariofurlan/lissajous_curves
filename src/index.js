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

    draw(ctx) {
        let alpha = this.rad - (Math.PI) * this.factor;
        let x = this.x + this.cos(alpha);
        let y = this.y + this.sin(alpha);
        this._x = x;
        this._y = y;

/*        ctx.strokeWeight(3);
        ctx.arc(this.x, this.y, this.edge, this.edge, -Math.PI, alpha / this.factor);*/

        // ctx.strokeWeight(10);
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2*Math.PI);
        ctx.fill();

        // ctx.strokeWeight(1);

        ctx.beginPath();
        if (this.horiz) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 1000);
        } else {
            ctx.moveTo(x, y);
            ctx.lineTo(x + 1000, y);
        }
        ctx.stroke();

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

    draw(ctx) {
        //sk.noFill();
        // TODO draw a sort of a grid to display better
        if (!this.circle)
            return;
        this.circle.draw(ctx);
    }

    setCircle(factor) {
        this.circle = new Circle(this.x, this.y, this.edge, factor);
    }
}

class Table {
    constructor(size, l) {
        this.padding = 50;
        this.factors = [1, 1.25, 1+1/3,1.5,1.75 , 2, 2.5, 3, 3.5, 4, 4.5]; // these changes the speed of the circle
        size -= 2 * this.padding;
        this.grid = [];
        this.trails = [];
        let edge = size / l;
        this.num_circles = l - 1;
        for (let y=1; y<=this.num_circles; y++) {
            this.trails[y] = [];
            for (let x=1; x<=this.num_circles; x++) {
                this.trails[y][x] = [];
            }
        }
        for (let y = this.padding, yy = 0; y < size; y += edge, yy++) {
            this.grid[yy] = [];
            for (let x = this.padding, xx = 0; x < size; x += edge, xx++) {
                this.grid[yy][xx] = new TableData(x, y, edge)
            }
        }
        for (let i = 1; i <= this.num_circles; i++) {
            this.grid[0][i].setCircle(this.factors[i - 1]);
            this.grid[0][i].circle.horiz = true;
            this.grid[i][0].setCircle(this.factors[i - 1]);
            this.grid[i][0].circle.horiz = false;
        }
    }

    draw(ctx) {
        this.grid.forEach(row => row.forEach(data => data.draw(ctx)));
        // todo calculate collisions with all the lines and make a sort of a trace
        return;
        for (let y = 1; y <= this.num_circles; y++) {
            for (let x = 1; x <= this.num_circles; x++) {
                let {a, b} = this.intersection(this.grid[0][x].circle, this.grid[y][0].circle);
                this.trails[y][x].push([a, b]);
                if (this.trails[y][x].length>400) {
                    this.trails[y][x].shift();
                }
                ctx.beginPath();
                ctx.moveTo(...this.trails[y][x][0]);
                for (let n  in this.trails[y][x]) {
                    ctx.lineTo(this.trails[y][x][n].x, this.trails[y][x][n].y);
                }
                ctx.stroke();
            }
        }
        //throw new Error("AAA");
    }

    intersection(vert, horiz) {
        let a = vert._x;
        let b = horiz._y;
        return {a, b};
    }
}

function Animation() {
    let size = 900;
    const l = 5;
    const table = new Table(size, l);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    canvas.width = 900;
    canvas.height = 900;

    let updateSize = () => {
        let bounds = canvas.getBoundingClientRect();
        let winh = window.innerHeight-2*bounds.y;
        let winw = window.innerWidth-2*bounds.x;
        size = Math.min(winh, winw);
        canvas.width = size;
        canvas.height = size;
    };
    // window.onresize = window.onload = updateSize;

    let frames = 0;
    let sec = 0;
    let loop = (timestamp) => {
        // console.log(Math.floor(timestamp/1000));

        ctx.clearRect(0,0, canvas.width, canvas.height);
        table.draw(ctx);
        let now = Math.floor(timestamp/1000);
        frames++;
        if (now !== sec) {
            ctx.font = '48px serif';
            ctx.fillText("FPS: "+frames, 10, 50);
            console.log(frames);
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
