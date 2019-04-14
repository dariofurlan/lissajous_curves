import './style.css';
import * as EventEmitter from 'events';

const VALID_FACTORS = {
    "1/10": 1 / 10,
    "1/9": 1 / 9,
    "1/8": 1 / 8,
    "1/7": 1 / 7,
    "1/6": 1 / 6,
    "1/5": 1 / 5,
    "1/4": 1 / 4,
    "1/3": 1 / 3,
    "1/2": 1 / 2,
    "0.1": .1,
    "0.2": .2,
    "0.3": .3,
    "0.4": .4,
    "0.5": .5,
    "0.6": .6,
    "0.7": .7,
    "0.8": .8,
    "0.9": .9,
    "1": 1,
    "1.1": 1.1,
    "1.2": 1.2,
    "1.3": 1.3,
    "1.4": 1.4,
    "1.5": 1.5,
    "1.6": 1.6,
    "1.7": 1.7,
    "1.8": 1.8,
    "1.9": 1.9,
};
const MONDRIAN_COLORS = ["#fac901", "#225095", "#dd0100"];

function choose_factor(x, y, id) {
    function createOption(key, value) {
        const option = document.createElement('option');
        option.value = value;
        option.innerText = key;
        return option;
    }

    const select = document.createElement('select');
    let canvas = document.getElementById('canvas');
    let offsetLeft = canvas.offsetLeft;
    let offsetTop = canvas.offsetTop;
    select.id = id;
    select.className = "select_factor";
    select.style.position = "absolute";
    console.log(select);
    select.style.zIndex = "2";
    document.getElementById('overlay_select').appendChild(select);
    for (let key in VALID_FACTORS) {
        select.appendChild(createOption(key, VALID_FACTORS[key]));
    }
    select.style.top = (offsetTop + y - select.clientHeight/2) + "px";
    select.style.left = (offsetLeft + x - select.clientWidth/2) + "px";
    return select;
}

function lcm_two_numbers(x, y) {
    if ((typeof x !== 'number') || (typeof y !== 'number'))
        return false;
    let n = 0;
    // console.log(x, y);
    while ((x % 1 !== 0 || y % 1 !== 0) && n < 2) {
        x *= 10;
        y *= 10;
        n++;
    }
    x = Math.floor(x);
    y = Math.floor(y);
    /*console.log(x, y);
    console.log(gcd_two_numbers(x, y));
    console.log(Math.pow(10, n));*/
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

function round_radians(rad) {
    let pi = Math.floor(rad / Math.PI);
    let pi_tenth = Math.floor((rad - Math.PI * pi) / (Math.PI / 10));
    const simbol = "π";
    return ((pi !== 0) ? pi + simbol : '') + ((pi_tenth !== 0) ? ((pi_tenth !== 1) ? pi_tenth : '') + '/' + 10 + simbol : '');
}

function random_mondrian_color() {
    return MONDRIAN_COLORS[Math.floor(Math.random() * MONDRIAN_COLORS.length)];
}

class Curve {
    constructor(x, y, edge) {
        this.padding = Math.floor(edge * 0.1);
        this.original_edge = edge;
        this.edge = edge - 2 * this.padding;
        this.start_x = x + (edge / 2);
        this.start_y = y + (edge / 2);
        this.start_z = 0; // TODO 3d implementation
        this.header = false;
        this.predrawn = false;
        this.keep_trace = true;
        this.color = "white";

        this.Ax = this.edge / 2;
        this.Ay = this.edge / 2;
        this.Az = this.edge / 2;

        this.Wx = 1;
        this.Wy = 1;
        this.Wz = 1;

        this.PHx = (Math.PI / 2);
        this.PHy = 0;
        this.PHz = 0;

        this.reset();
    }

    set_select_factor(id) {
        this.select = choose_factor(this.start_x, this.start_y, id);
    }

    set_eq_x(a, w, phase) {
        this.Ax = a || this.Ax;
        this.Wx = w || this.Wx;
        this.PHx = phase || this.PHx;
        this.reset();
    }

    set_eq_y(a, w, phase) {
        this.Ay = a || this.Ay;
        this.Wy = w || this.Wy;
        this.PHy = phase || this.PHy;
        this.reset();
    }

    set_eq_z(a, w, phase) {
        this.Az = a || this.Az;
        this.Wz = w || this.Wz;
        this.PHz = phase || this.PHz;
        this.reset();
    }

    reset() {
        this.period_x = 2 / this.Wx;
        this.period_y = 2 / this.Wy;
        // this.period_z = 2 / this.Wz;
        this.curve_period = lcm_two_numbers(this.period_x, this.period_y) * Math.PI + Math.PI / 30;
        this.period_x *= Math.PI;
        this.period_y *= Math.PI;
        // this.period_z *= Math.PI;

        this.curve_shape = [];

        this.predrawn = false;
        this.resetted = true;
        // console.log("eq: " + this.get_equation_string());
    }

    x(x) {
        return this.Ax * Math.sin((x * this.Wx) + this.PHx);
    }

    y(x) {
        return this.Ay * Math.sin((x * this.Wy) + this.PHy)
    }

    z(x) {
        return this.Az * Math.sin((x * this.Wz) + this.PHz)
    }

    draw(ctx, rad, step) {
        // if step is rad is under the period it means that the animation just started
        let x = this.start_x + this.x(rad);
        let y = this.start_y + this.y(rad);
        // let z = this.start_z + this.z(t);

        x = Math.round(x * 100) / 100;
        y = Math.round(y * 100) / 100;
        this._x = Math.round(x * 100) / 100;
        this._y = Math.round(y * 100) / 100;

        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 2;

        if (Curve.drawDot) {
            ctx.beginPath();
            if (this.header)
                ctx.arc(x, y, 7, 0, 2 * Math.PI);
            else
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }

        if (this.header && Curve.drawLine) {
            let tmp = ctx.lineWidth;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.setLineDash([2]);
            if (this.header === "y") {
                ctx.moveTo(x, y);
                ctx.lineTo(x + 1000, y);
            } else {
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 1000);
            }
            ctx.stroke();
            ctx.setLineDash([0]);
            ctx.lineWidth = tmp;
        }

        this.draw_trail(ctx, rad, step);
    }

    draw_mondrian(ctx, rad) {
        if (!this.header)
            return;
        let x = this.start_x + this.x(rad);
        let y = this.start_y + this.y(rad);
        // let z = this.start_z + this.z(t);

        x = Math.round(x * 100) / 100;
        y = Math.round(y * 100) / 100;
        this._x = x;
        this._y = y;

        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.lineWidth = "2";
        if (this.header === "y") {
            ctx.beginPath();
            ctx.arc(this.start_x, this.start_y, this.edge / 2, 0, (rad % this.period_y * 2 * Math.PI) / this.period_y);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(this.start_x, this.start_y, this.edge / 2, 0, (rad % this.period_x * 2 * Math.PI) / this.period_x);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.setLineDash([2]);
        if (this.header === "y") {
            ctx.moveTo(x, y);
            ctx.lineTo(this.original_edge, y);
        } else {
            ctx.moveTo(x, y);
            ctx.lineTo(x, this.original_edge);
        }
        ctx.stroke();

        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.setLineDash([0]);
        if (this.header === "y") {
            ctx.moveTo(this.original_edge, y);
            ctx.lineTo(1000, y);
        } else {
            ctx.moveTo(x, this.original_edge);
            ctx.lineTo(x, 1000);
        }
        ctx.stroke();
    }

    draw_trail(ctx, t, step) {
        if (t > this.curve_period) {
            // redraw all the circle
            ctx.beginPath();
            ctx.moveTo(...this.curve_shape[0]);
            this.curve_shape.forEach(point => ctx.lineTo(...point));
            ctx.stroke();
            this.predrawn = true;
            return;
        }

        if (!this.predrawn) {
            this.curve_shape.push([this._x, this._y]);
            ctx.beginPath();
            ctx.moveTo(...this.curve_shape[0]);
            this.curve_shape.forEach(point => ctx.lineTo(...point));
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(...this.curve_shape[0]);
            for (let i = 1; i < step; i++)
                ctx.lineTo(...this.curve_shape[i]);
            ctx.stroke();
        }
    }

    get_equation_string() {
        let x_eq = "x = " + Math.round(this.Ax * 1000) / 1000 + "*sin(" + Math.round(this.Wx * 1000) / 1000 + "t" + round_radians(this.PHx) + ")";
        let y_eq = "y = " + Math.round(this.Ay * 1000) / 1000 + "*sin(" + Math.round(this.Wy * 1000) / 1000 + "t" + round_radians(this.PHy) + ")";
        // let z_eq = "z = " + this.Az + "*sin(" + this.Wz + "t" + calc(this.PHz) + ")";

        return x_eq + " " + y_eq + " period: " + round_radians(this.curve_period);
    }
}

class Table extends EventEmitter {
    constructor(size, factors) {
        super();
        this.factors = factors;
        this.colors = ['#ffee58', '#f06292', '#ff7043', '#9ccc65', '#4fc3f7'];
        this.size = size;
        this.num_circles = factors.length;
        this.l = this.num_circles + 1;

        this.grid = [];

        let edge = this.size / this.l;
        this.grid_edge_size = edge;
        for (let y = 0, yy = 0; y < this.size; y += edge, yy++) {
            this.grid[yy] = [];
            for (let x = 0, xx = 0; x < this.size; x += edge, xx++) {
                if (xx === 0 && yy === 0)
                    continue;
                this.grid[yy][xx] = new Curve(x, y, edge);
                this.grid[yy][xx].color = this.colors[Math.floor(Math.random() * this.colors.length)];
            }
        }

        for (let i = 1; i <= this.num_circles; i++) {
            let factor = factors[i - 1];

            let circ_x = this.grid[0][i];
            circ_x.header = "x";
            circ_x.set_select_factor("x" + "-" + i);
            circ_x.color = "#FFFFFF";
            circ_x.set_eq_x(null, factor);
            circ_x.set_eq_y(null, factor);
            circ_x.select.onchange = (evt) => {
                circ_x.set_eq_x(null, evt.target.value);
                circ_x.set_eq_y(null, evt.target.value);
                // aggiornare verticalmente
                for (let y = 1; y <= this.num_circles; y++) {
                    this.grid[y][i].set_eq_x(null, evt.target.value);
                }
                this.emit("hard_reset");
            };

            let circ_y = this.grid[i][0];
            circ_y.header = "y";
            circ_y.set_select_factor("y" + "-" + i);
            circ_y.color = "#FFFFFF";
            circ_y.set_eq_x(null, factor);
            circ_y.set_eq_y(null, factor);
            circ_y.select.onchange = (evt) => {
                circ_y.set_eq_x(null, evt.target.value);
                circ_y.set_eq_y(null, evt.target.value);
                // aggiornare orizzontalmente
                for (let x = 1; x <= this.num_circles; x++) {
                    this.grid[i][x].set_eq_y(null, evt.target.value);
                }
                this.emit("hard_reset");
            };
        }

        for (let y = 1; y <= factors.length; y++) {
            for (let x = 1; x <= factors.length; x++) {
                let circ_x = this.grid[0][x];
                let circ_y = this.grid[y][0];
                this.grid[y][x].set_eq_x(circ_x.Ax, circ_x.Wx, circ_x.PHx);
                this.grid[y][x].set_eq_y(circ_y.Ay, circ_y.Wy, circ_y.PHy)
            }
        }

        // MONDIRAN PART
        this.num_mondrian_squares = Math.round(Math.pow(this.num_circles, 2) / 1.8);
        this.generate_mondrian();
    }

    generate_mondrian() {
        this.mondrian_squares = [];
        for (let i = 0; i < this.num_mondrian_squares; i++) {
            let sq = {
                x: Math.floor(Math.random() * (this.num_circles + 1)),
                y: Math.floor(Math.random() * (this.num_circles + 1)),
                start: {},
                end: {}
            };
            sq.color = random_mondrian_color();
            if (sq.y === 0) {
                sq.start.y = () => this.grid_edge_size;
                sq.end.y = () => this.grid[sq.y + 1][0]._y;
            } else if (sq.y >= this.num_circles) {
                sq.start.y = () => this.grid[sq.y][0]._y;
                sq.end.y = () => this.size;
            } else {
                sq.start.y = () => this.grid[sq.y][0]._y;
                sq.end.y = () => this.grid[sq.y + 1][0]._y;
            }
            if (sq.x === 0) {
                sq.start.x = () => this.grid_edge_size;
                sq.end.x = () => this.grid[0][sq.x + 1]._x;
            } else if (sq.x >= this.num_circles) {
                sq.start.x = () => this.grid[0][sq.x]._x;
                sq.end.x = () => this.size;
            } else {
                sq.start.x = () => this.grid[0][sq.x]._x;
                sq.end.x = () => this.grid[0][sq.x + 1]._x;
            }
            this.mondrian_squares.push(sq);
        }
    }

    draw(ctx, rad, step) {
        // ctx.strokeRect(this.x, this.y, this.padded_size, this.padded_size);
        this.grid.forEach(row => row.forEach(data => data.draw(ctx, rad, step)));
    }

    draw_mondrian(ctx, rad, step) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.grid_edge_size, this.grid_edge_size, this.size, this.size);

        this.mondrian_squares.forEach(sq => {
            ctx.fillStyle = sq.color;
            ctx.fillRect(sq.start.x(), sq.start.y(), sq.end.x() - sq.start.x(), sq.end.y() - sq.start.y());
        });

        for (let n = 1; n <= this.num_circles; n++) {
            this.grid[n][0].draw_mondrian(ctx, rad);
            this.grid[0][n].draw_mondrian(ctx, rad);
        }


    }

    get_maximum_period() {
        let max = 0;
        this.grid.forEach(row => row.forEach(circle => {
            if (circle.curve_period > max)
                max = circle.curve_period;
        }));
        return max;
    }

    hard_reset() {
        this.grid.forEach(row => row.forEach(circle => {
            if (circle)
                circle.reset();
        }));
    }
}

function Settings() {
    this.mondrian = document.getElementById('btn-mondrian');

    this.overlay = document.getElementById('overlay');
    this.overlay.show = () => {
        this.overlay.style.display = "block";
    };
    this.overlay.hide = () => {
        this.overlay.style.display = "none";
    };

    this.eq = document.getElementById('equation');
    this.eq.setEquation = (axis, amplitude, angle_velocity, phase) => {
        this.eq.children.axis.innerText = axis;
        this.eq.children.A.value = amplitude;
        this.eq.children.W.value = angle_velocity;
        this.eq.children.PH.value = phase;
    };

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
    Curve.drawLine = this.circle_line.checked = true;
    this.circle_line.onchange = (event) => {
        Curve.drawLine = event.target.checked;
    };

    this.circle_circle = document.getElementById('circle_circle');
    Curve.drawCircle = this.circle_circle.checked = true;
    this.circle_circle.onchange = (event) => {
        Curve.drawCircle = event.target.checked;
    };

    this.circle_dot = document.getElementById('circle_dot');
    Curve.drawDot = this.circle_dot.checked = true;
    this.circle_dot.onchange = (event) => {
        Curve.drawDot = event.target.checked;
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

        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext('2d');
        window.onload /*= window.onresize*/ = () => {
            let canvas_bounds = this.canvas.getBoundingClientRect();
            let w = window.innerWidth - canvas_bounds.x;
            let h = window.innerHeight - canvas_bounds.y;
            let THRESHOLD = 870;
            if (w > THRESHOLD && h > THRESHOLD)
                this.size = THRESHOLD;
            else {
                this.size = Math.min(w, h);
            }
            this.canvas.width = this.canvas.height = this.size;
            console.log({w, h});

            this.table = new Table(this.size, this.factors);
            this.table.on('hard_reset', () => {
                this.hard_reset();
            });
            this.MAX_LIMIT = this.table.get_maximum_period();
        };

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

        this.NUM_STEPS = 80;
        this.STEP_SIZE = 2 * Math.PI / this.NUM_STEPS;

        this.mondrian = false;
        this.settings.mondrian.onclick = () => {
            if (this.mondrian) {
                this.settings.mondrian.innerText = "Mondrian";
                this.mondrian = false;
            } else {
                this.settings.mondrian.innerText = "Lissajous";
                this.table.generate_mondrian();
                this.mondrian = true;
            }
            this.hard_reset();
        }
        // console.log(this.table.grid[0][1].get_equation_string());
    }

    animation_step() {
        this.step_counter++;
        this.rad_counter += this.STEP_SIZE;
        this.calc_radians();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";
        if (this.mondrian)
            this.table.draw_mondrian(this.ctx, this.rad_counter, this.step_counter);
        else
            this.table.draw(this.ctx, this.rad_counter, this.step_counter);
        if (this.rad_counter >= this.MAX_LIMIT) {
            // let image = this.canvas.toDataURL("image/png");
            let canvasToImage = (canvas, context, backgroundColor) => {
                let w = canvas.width;
                let h = canvas.height;
                let data;
                let compositeOperation;
                if (backgroundColor) {
                    data = context.getImageData(0, 0, w, h);
                    compositeOperation = context.globalCompositeOperation;
                    context.globalCompositeOperation = "destination-over";
                    context.fillStyle = backgroundColor;
                    context.fillRect(0, 0, w, h);
                }
                let imageData = this.canvas.toDataURL("image/png");
                if (backgroundColor) {
                    context.clearRect(0, 0, w, h);
                    context.putImageData(data, 0, 0);
                    context.globalCompositeOperation = compositeOperation;
                }
                return imageData;
            };
            let image = canvasToImage(this.canvas, this.ctx, "black");
            // console.log(image); TODO download image
            image = image.replace("image/png", "image/octet-stream");
            // window.location.href = image;
            this.soft_reset();
        }
    }

    animation_backward() {
        this.rad_counter -= this.STEP_SIZE;
        this.step_counter--;
        this.calc_radians();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.table.draw(this.ctx, this.rad_counter);
    }

    animation_loop(timestamp) {
        this.animation_step();
        this.frames++;
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

    calc_radians() { // todo use the function used above
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

    stop(cb) {
        this.running = false;
        if (cb)
            window.requestAnimationFrame(cb);
    }

    soft_reset() {
        console.log("Animation Started");
        this.frames = 0;
        this.sec = 0;
        this.fps = 0;
        this.rad_counter = 0;
        this.step_counter = 0;
    };

    hard_reset() {
        this.soft_reset();
        this.table.hard_reset();
        this.MAX_LIMIT = this.table.get_maximum_period();
        console.info("Maximum period: " + round_radians(this.MAX_LIMIT));
    }
}

// TODO user customization?
// TODO explaination thorugh animations
// TODO make it start from the right position: "0 rad"
// TODO choose the number from a list

const animation = new Animation([1, 1 / 2, 1 / 3, 1 / 4]);

setTimeout(animation.start.bind(animation));
// setTimeout(animation.stop.bind(animation), 5000, () => console.info("terminated"));
