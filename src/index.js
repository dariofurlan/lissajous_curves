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
            //ctx.arc(this.circle_x, this.circle_y, this.edge / 2, 0, ((alpha / this.factor) % (2 * Math.PI)));
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
            let tmp = ctx.lineWidth;
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (this.horiz) {
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 1000);
            } else {
                ctx.moveTo(x, y);
                ctx.lineTo(x + 1000, y);
            }
            ctx.stroke();
            ctx.lineWidth = tmp;
        }
    }
}

class TableData {
    constructor(x, y, edge) {
        this.padding = Math.floor(edge * 0.1);
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
        this.factors = factors;
        this.colors = ['#ffee58', '#f06292', '#ff7043', '#9ccc65', '#4fc3f7'];
        this.padded_size = size;
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
        for (let y = 0, yy = 0; y < this.padded_size; y += edge, yy++) {
            this.grid[yy] = [];
            for (let x = 0, xx = 0; x < this.padded_size; x += edge, xx++) {
                this.grid[yy][xx] = new TableData(x, y, edge);
                this.grid[yy][xx].color = this.colors[Math.floor(Math.random() * this.colors.length)];
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
    }
}

function lcm_two_numbers(x, y) {
    if ((typeof x !== 'number') || (typeof y !== 'number'))
        return false;
    let n = 0;
    while (x % 1 !== 0 || y % 1 !== 0) {
        x *= 10;
        y *= 10;
        n++;
    }
    return (!x || !y) ? 0 : ((x * y) / gcd_two_numbers(x, y)) / Math.pow(10, n);
}

function gcd_two_numbers(x, y) {
    let t;
    while (y) {
        t = y;
        y = x % y;
        x = t;
    }
    return x;
}

function Settings() {
    this.show_settings = document.getElementById('show_settings');
    this.show_settings.onclick = () => {
        if (this.div_settings.style.display === 'block') {
            this.show_settings.innerText = "show settings";
            this.div_settings.style.display = "none";
        } else {
            this.show_settings.innerText = "hide settings";
            this.div_settings.style.display = "block";
        }
    };

    this.div_settings = document.getElementById('div_settings');

    this.circle_line = document.getElementById('circle_line');
    Circle.drawLine = this.circle_line.checked = false;
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
    Animation.drawFPS = this.fps.checked = false;
    this.fps.onchange = (event) => {
        Animation.drawFPS = event.target.checked;
    };

    this.animation_stop = document.getElementById('animation_stop');
    this.animation_stop.innerText = "PAUSE";

    this.animation_forward = document.getElementById('animation_forward');
    this.animation_forward.innerHTML = ">";

    this.animation_backward = document.getElementById('animation_backward');
    this.animation_backward.innerText = "<";

    this.radians_indicator = document.getElementById('radians_indicator');
    this.radians_indicator.innerHTML = "0&pi;";

    this.steps_indicator = document.getElementById('steps_indicator');
    this.steps_indicator.innerText = "";
}

class Animation {
    constructor(factors) {
        this.settings = new Settings();
        this.factors = factors;
        this.size = 800;
        this.table = new Table(this.size, this.factors);

        this.canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext('2d');
        let margin = Math.floor(this.size * 0.03);
        this.canvas.style.margin = margin + "px";
        this.canvas.width = this.size;
        this.canvas.height = this.size;

        this.settings.animation_forward.onclick = () => {
            this.animation_step();
        };
        this.settings.animation_backward.onclick = () => {
            this.animation_backward();
        };
        this.settings.animation_stop.onclick = () => {
            if (this.running) {
                this.stop();
                this.settings.animation_stop.innerText = "START";
            } else {
                this.start();
                this.settings.animation_stop.innerText = "PAUSE";
            }
        };

        this.frames = 0, this.sec = 0, this.fps = 0, this.rad_counter = 0, this.step_counter = 0;

        this.limits = [];
        let max = 0;
        for (let y = 1; y <= this.factors.length; y++) {
            this.limits[y] = [];
            for (let x = 1; x <= this.factors.length; x++) {
                let fx = this.table.grid[0][x].circle.factor * 2;
                let fy = this.table.grid[y][0].circle.factor * 2;
                let mcm = lcm_two_numbers(fx, fy);
                mcm *= Math.PI;
                if (mcm > max)
                    max = mcm;
                this.limits[y][x] = mcm;
            }
        }

        this.trails = [];
        this.f_trails = [];
        for (let y = 1; y <= this.factors.length; y++) {
            this.trails[y] = [];
            this.f_trails[y] = [];
            for (let x = 1; x <= this.factors.length; x++) {
                this.trails[y][x] = [];
                this.f_trails[y][x] = false;
            }
        }

        // console.log("LIMITS: \n "+ JSON.stringify(limits));
        console.log("Simulation Restarts at: " + (max / (Math.PI)));

        this.MAX_LIMIT = max;//todo
        this.NUM_STEPS = 80;
        this.STEP_SIZE = 2 * Math.PI / this.NUM_STEPS;
    }

    animation_step() {
        this.step_counter++;
        this.rad_counter += this.STEP_SIZE;
        this.calc_radians();

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";
        this.table.draw(this.ctx, this.rad_counter);

        this.draw_trail(this.ctx);
        if (this.rad_counter >= this.MAX_LIMIT) {
            this.reset();
            Animation.finished_once = true;
        }
    }

    animation_backward() {
        this.rad_counter -= this.STEP_SIZE;
        this.step_counter--;
        this.calc_radians();

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.table.draw(this.ctx, this.rad_counter);
    }

    animation_loop(timestamp) {
        this.animation_step();
        this.frames++;
        let ctx = this.ctx;
        if (Animation.drawFPS) { // TODO draw fps only if different from previous
            this.ctx.font = '1.2em Courier New';
            if (this.fps <= 50)
                this.ctx.fillStyle = "red";
            else if (this.fps <= 55)
                this.ctx.fillStyle = "orange";
            else
                this.ctx.fillStyle = "white";
            this.ctx.fillText(this.fps, 5, 20);
            this.ctx.fillStyle = "black";
        }
        let now = Math.floor(timestamp / 1000);
        if (now !== this.sec) {
            console.log("sec: " + this.sec + " fps: " + this.frames);
            this.fps = this.frames;
            this.frames = 0;
            this.sec = now;
        }
        if (this.running)
            window.requestAnimationFrame(this.animation_loop.bind(this));
    }

    draw_trail() {
        if (Animation.finished_once) {
            for (let y = 1; y <= this.factors.length; y++) {
                for (let x = 1; x <= this.factors.length; x++) {
                    let st = this.step_counter % this.trails[y][x].length;

                    let now = this.trails[y][x][st];
                    let c_x = now[0];
                    let c_y = now[1];

                    this.ctx.strokeStyle = this.table.grid[y][x].color;
                    this.ctx.fillStyle = this.table.grid[y][x].color;
                    this.ctx.lineWidth = 2;

                    this.ctx.beginPath();
                    this.ctx.arc(c_x, c_y, 4, 0, 2 * Math.PI);
                    this.ctx.fill();

                    this.ctx.beginPath();
                    this.ctx.moveTo(...this.trails[y][x][0]);
                    for (let i = 1; i < ((this.step_counter > st) ? this.trails[y][x].length : st); i++) {
                        this.ctx.lineTo(...this.trails[y][x][i]);
                    }
                    this.ctx.stroke();
                }
            }
        } else {
            for (let y = 1; y <= this.factors.length; y++) {
                for (let x = 1; x <= this.factors.length; x++) {
                    let c_x = this.table.grid[0][x].circle._x;
                    let c_y = this.table.grid[y][0].circle._y;
                    // console.log(x,y,limits[y-1][x-1]);
                    if (!this.f_trails[y][x])
                        if (!(this.trails[y][x].length > ((this.limits[y][x] * this.NUM_STEPS) / (2 * Math.PI)) + 1))
                            this.trails[y][x].push([c_x, c_y]);
                        else
                            this.f_trails[y][x] = true;

                    this.ctx.strokeStyle = this.table.grid[y][x].color;
                    this.ctx.fillStyle = this.table.grid[y][x].color;
                    this.ctx.lineWidth = 2;


                    this.ctx.beginPath();
                    this.ctx.arc(c_x, c_y, 4, 0, 2 * Math.PI);
                    this.ctx.fill();

                    this.ctx.beginPath();
                    this.ctx.moveTo(...this.trails[y][x][0]);
                    this.trails[y][x].forEach(point => this.ctx.lineTo(...point));
                    this.ctx.stroke();
                }
            }
        }
    }

    calc_radians() {
        let pi = Math.floor(this.rad_counter / Math.PI);
        let pi_tenth = Math.floor((this.rad_counter - Math.PI * pi) / (Math.PI / 10));
        const simbol = "&pi;";
        this.settings.radians_indicator.innerHTML = pi + simbol + "+" + pi_tenth + "/" + 10 + simbol;
        this.settings.steps_indicator.innerText = this.step_counter;
    }

    start() {
        this.running = true;
        this.animation_loop();
    }

    stop() {
        this.running = false;
    }

    reset() {
        console.log("Animation Started");
        this.frames = 0;
        this.sec = 0;
        this.fps = 0;
        this.rad_counter = 0;
        this.step_counter = 0;
    };
}

// TODO user customization?
// TODO explaination thorugh animations

const valid_factors = [1, 1.1, 1.2, 1.25, 1.3, 1.4, 1.5, 1.6, 1.7, 1.9, 1.9, 2];
new Animation([1, 2, 3, 4]).start();
