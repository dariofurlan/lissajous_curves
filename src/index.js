const p5 = require('p5');
import './style.css';

class Circle {
    constructor(x, y, edge, factor) {
        this.circle_x = x + edge / 2;
        this.circle_y = y + edge / 2;
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
        if (Circle.drawCircle) {
            ctx.beginPath();
            ctx.arc(this.circle_x, this.circle_y, this.edge / 2, -Math.PI, ((alpha / this.factor) % (2 * Math.PI)) - Math.PI);
            ctx.stroke();
        }

        alpha -= (Math.PI) * this.factor;
        let x = this.circle_x + this.cos(alpha);
        let y = this.circle_y + this.sin(alpha);
        this._x = Math.round(x * 100) / 100;
        this._y = Math.round(y * 100) / 100;

        if (Circle.drawDot) {
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, 2 * Math.PI);
            ctx.fill();
        }

        if (Circle.drawLine) {
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
}

class TableData {
    constructor(x, y, edge) {
        this.padding = 15;
        this.x = x;
        this.y = y;
        this.edge = edge;
    }

    draw(ctx, rad) {
        // ctx.strokeRect(this.x, this.y, this.edge, this.edge);
        if (!this.circle)
            return;
        this.circle.draw(ctx, rad);
    }

    setCircle(factor) {
        this.circle = new Circle(this.x + this.padding, this.y + this.padding, this.edge - 2 * this.padding, factor);
    }
}

class Table {
    constructor(size, factors) {
        this.padding = Math.floor(size * 0.03);
        this.factors = factors;
        this.x = this.padding;
        this.y = this.padding;
        this.padded_size = size - 2 * this.padding;
        this.num_circles = factors.length;
        this.l = this.num_circles + 1;

        this.grid = [];
        this.trails = [];

        let edge = this.padded_size / this.l;
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

    draw(ctx, rad) {
        // ctx.strokeRect(this.x, this.y, this.padded_size, this.padded_size);
        this.grid.forEach(row => row.forEach(data => data.draw(ctx, rad)));

        let trails_loop = () => {
            this.reduced = true;
            for (let y = 1; y < this.trails.length; y++) {
                for (let x = 1; x < this.trails[y].length; x++) {
                    let trail = this.trails[y][x];

                    console.log("before: " + trail.length);
                    console.log(JSON.stringify(trail));
                    for (let i = 0; i < trail.length - 1; i++) {
                        for (let j = i + 1; j < trail.length; j++) {
                            if (trail[j][0] === trail[i][0] && trail[j][1] === trail[i][1]) {
                                // console.log("duplicated: "+JSON.stringify([trail[j],trail[i]],null, 4));
                                trail.splice(j, 1);
                            }
                        }
                    }
                    console.log(JSON.stringify(trail));
                    console.log("after: " + trail.length);
                    break;
                }
            }
            // setTimeout(trails_loop, 2000)
        };

        if (this.trails[1][1].length >= 750 || this.reduced) {
            for (let y = 1; y <= this.num_circles; y++) {
                for (let x = 1; x <= this.num_circles; x++) {
                    let c_x = this.grid[0][x].circle._x;
                    let c_y = this.grid[y][0].circle._y;

                    ctx.beginPath();
                    ctx.arc(c_x, c_y, 4, 0, 2 * Math.PI);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(...this.trails[y][x][0]);
                    this.trails[y][x].forEach(point => ctx.lineTo(...point));
                    ctx.stroke();
                }
            }
        } else {
            for (let y = 1; y <= this.num_circles; y++) {
                for (let x = 1; x <= this.num_circles; x++) {
                    let c_x = this.grid[0][x].circle._x;
                    let c_y = this.grid[y][0].circle._y;
                    this.trails[y][x].push([c_x, c_y]);

                    ctx.beginPath();
                    ctx.arc(c_x, c_y, 4, 0, 2 * Math.PI);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(...this.trails[y][x][0]);
                    this.trails[y][x].forEach(point => ctx.lineTo(...point));
                    ctx.stroke();
                }
            }
            if (this.trails[1][1].length === 749) setTimeout(trails_loop);
        }
        //throw new Error("AAA");
    }
}

function Animation(factors) {
    let settings = () => {
        this.circle_line = document.getElementById('circle_line');
        Circle.drawLine = this.circle_line.checked = true;
        this.circle_line.onchange = (event) => {
            Circle.drawLine = event.target.checked;
        };

        this.circle_circle = document.getElementById('circle_circle');
        Circle.drawCircle = this.circle_circle.checked = true;
        this.circle_circle.onchange = (event) => {
            Circle.drawCircle = event.target.checked;
        };

        this.circle_dot = document.getElementById('circle_dot');
        Circle.drawDot = this.circle_dot.checked = true;
        this.circle_dot.onchange = (event) => {
            Circle.drawDot = event.target.checked;
        };

        this.fps = document.getElementById('fps');
        Animation.drawFPS = this.fps.checked = true;
        this.fps.onchange = (event) => {
            Animation.drawFPS = event.target.checked;
        };

        this.animation_stop = document.getElementById('animation_stop');
        this.running = false;
        this.animation_stop.innerText = "START";
        this.animation_stop.onclick = () => {
            if (this.running) {
                this.running = false;
                this.animation_stop.innerText = "START";
            } else {
                this.running = true;
                this.start();
                this.animation_stop.innerText = "PAUSE";
            }
        };

        this.animation_forward = document.getElementById('animation_forward');
        this.animation_forward.innerHTML = ">";
        this.animation_forward.onclick = () => {
            animation_step();
        };

        this.animation_backward = document.getElementById('animation_backward');
        this.animation_backward.innerText = "<";
        this.animation_backward.onclick = () => {
            animation_backward();
        };

        this.radians_indicator = document.getElementById('radians_indicator');
        this.radians_indicator.innerHTML = "0&pi;";

        this.steps_indicator = document.getElementById('steps_indicator');
        this.steps_indicator.innerText = "";
    };
    settings();

    let size = 900;
    const table = new Table(size, factors);

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
    };

    let frames = 0;
    let sec = 0;
    let fps = 0;
    let rad = 0;
    let steps_counter = 0;
    const N_STEPS = 80;
    let step = 2 * Math.PI / N_STEPS;

    let animation_step = (timestamp) => {
        calc_radians(rad);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        table.draw(ctx, rad);
        steps_counter++;
        rad += step;
    };

    let animation_backward = () => {
        rad -= step;
        steps_counter--;
        calc_radians(rad);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        table.draw(ctx, rad);
    };

    let animation_loop = (timestamp) => {
        animation_step();
        frames++;
        if (Animation.drawFPS) {
            ctx.font = '1.2em Courier New';
            if (fps <= 50)
                ctx.fillStyle = "red";
            else if (fps <= 55)
                ctx.fillStyle = "orange";
            else
                ctx.fillStyle = "green";
            ctx.fillText(fps, 5, 20);
            ctx.fillStyle = "black";
        }
        let now = Math.floor(timestamp / 1000);
        if (now !== sec) {
            console.log("sec: " + sec + " fps: " + frames);
            fps = frames;
            frames = 0;
            sec = now;
        }
        if (this.running)
            window.requestAnimationFrame(animation_loop);
    };
    let calc_radians = (r) => {
        let pi = Math.floor(r / Math.PI);
        let pi_half = Math.floor((r - Math.PI * pi) / (Math.PI / 2));
        let pi_third = Math.floor((r - Math.PI * pi) / (Math.PI / 3));
        let pi_fourth = Math.floor((r - Math.PI * pi) / (Math.PI / 4));
        let pi_sixth = Math.floor((r - Math.PI * pi) / (Math.PI / 3));
        let pi_tenth = Math.floor((r - Math.PI * pi) / (Math.PI / 10));
        const simbol = "&pi;";
        this.radians_indicator.innerHTML = pi + simbol + " " + pi_tenth + "/" + 10 + simbol;
        this.steps_indicator.innerText = steps_counter;
    };

    let trails_loop = () => {

        for (let y = 1; y < table.trails.length; y++) {
            for (let x = 1; x < table.trails[y].length; x++) {
                let trail = table.trails[y][x];

                // trail.forEach((value, index, array) => array.forEach(()))
                console.log("before: " + trail.length);
                for (let i = 0; i < trail.length; i++) {
                    for (let j = i + 1; j < trail.length; j++) {
                        if (trail[i] === undefined || trail[j] === undefined)
                            continue;
                        if (trail[j][0] === trail[i][0] && trail[j][1] === trail[i][1]) {
                            trail.splice(j, 1);
                        }
                    }
                }
                console.log("after: " + trail.length);
            }
        }
        setTimeout(trails_loop, 2000)
    };

    this.start = () => {
        animation_loop();
    };
}

// TODO alongside animation do a process that every second or prefixed period, cleans the path generated by te lines
// TODO  the trails loop with this approach is just a bodge, calculate the length of each trail and then stop pushing after that
new Animation([1, 2, 3, 4]);
