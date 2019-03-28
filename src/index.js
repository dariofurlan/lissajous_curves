import './style.css';

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

class Curve {
    constructor(x, y, edge) {
        this.padding = Math.floor(edge * 0.1);
        this.edge = edge - 2 * this.padding;
        this.start_x = (x) + edge / 2;
        this.start_y = (y) + edge / 2;
        this.start_z = 0; // TODO 3d implementation
        this.factor = null;
        this.header = false;
        this.is_y = true;
        this.color = "white";

        // TODO calculate the length of the shape given all the params (A, W, Phase) for the functions
        // TODO store the trace and then don't ricalculate it, reuse it
        // TODO do something to distinguish the "header" circle to the others

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
        this.curve_period = lcm_two_numbers(this.Wx, this.Wy) * 2 * Math.PI;
        this.curve_shape = [];
        this.factor = this.Wx / this.Wy;
        console.log("eq: " + this.get_equation_string() + " period: " + Math.floor(this.curve_period * 10 / Math.PI) / 10);
        // TODO  reset the figure_shape array and recalculate the end of the drawn figure
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

    draw(ctx, t) {
        let x = this.start_x + this.x(t);
        let y = this.start_y + this.y(t);
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

        this.draw_trail(ctx, t);
    }

    draw_trail(ctx, t) {
        if (t > this.curve_period) {
            ctx.beginPath();
            ctx.moveTo(...this.curve_shape[0]);
            this.curve_shape.forEach(point => ctx.lineTo(...point));
            ctx.stroke();
            return;
        }

        this.curve_shape.push([this._x, this._y]);

        ctx.beginPath();
        ctx.moveTo(...this.curve_shape[0]);
        this.curve_shape.forEach(point => ctx.lineTo(...point));
        ctx.stroke();
    }

    get_equation_string() {
        let calc = (rad) => {
            let pi = Math.floor(rad / Math.PI);
            let pi_fourth = Math.floor((rad - Math.PI * pi) / (Math.PI / 2));
            const simbol = "π";
            return ((pi !== 0) ? '+' + pi : '') + ((pi_fourth !== 0) ? '+' + ((pi_fourth !== 1) ? pi_fourth : '') + simbol + '/' + 2 : '');
        };

        let x_eq = "x = " + this.Ax + "*sin(" + this.Wx + "t" + calc(this.PHx) + ")";
        let y_eq = "y = " + this.Ay + "*sin(" + this.Wy + "t" + calc(this.PHy) + ")";
        // let z_eq = "z = " + this.Az + "*sin(" + this.Wz + "t" + calc(this.PHz) + ")";

        return x_eq + " " + y_eq;
    }
}

class Table {
    constructor(size, factors) {
        this.factors = factors;
        this.colors = ['#ffee58', '#f06292', '#ff7043', '#9ccc65', '#4fc3f7'];
        this.size = size;
        this.num_circles = factors.length;
        this.l = this.num_circles + 1;

        this.grid = [];
        this.trails = [];

        let edge = this.size / this.l;
        this.grid_edge_size = edge;
        for (let y = 1; y <= this.num_circles; y++) {
            this.trails[y] = [];
            for (let x = 1; x <= this.num_circles; x++) {
                this.trails[y][x] = [];
            }
        }
        for (let y = 0, yy = 0; y < this.size; y += edge, yy++) {
            this.grid[yy] = [];
            for (let x = 0, xx = 0; x < this.size; x += edge, xx++) {
                if (xx === 0 && yy === 0)
                    continue;
                this.grid[yy][xx] = new Curve(x, y, edge);
                this.grid[yy][xx].color = this.colors[Math.floor(Math.random() * this.colors.length)];
            }
        }

        // TODO set the "header" circles and then propagate to rows and columns
        for (let i = 1; i <= this.num_circles; i++) {
            let circ_x = this.grid[0][i];
            circ_x.header = "x";
            circ_x.color = "#FFFFFF";
            circ_x.set_eq_x(null, factors[i - 1]);
            circ_x.set_eq_y(null, factors[i - 1]);

            let circ_y = this.grid[i][0];
            circ_y.header = "y";
            circ_y.color = "#FFFFFF";
            circ_y.set_eq_x(null, factors[i - 1]);
            circ_y.set_eq_y(null, factors[i - 1]);
        }

        for (let y = 1; y < factors.length; y++) {
            for (let x = 1; x < factors.length; x++) {
                let circ_x = this.grid[0][x];
                let circ_y = this.grid[y][0];
                this.grid[y][x].set_eq_x(circ_x.Ax, circ_x.Wx, circ_x.PHx);
                this.grid[y][x].set_eq_y(circ_y.Ay, circ_y.Wy, circ_y.PHy)
            }
        }
    }

    draw(ctx, rad) {
        // ctx.strokeRect(this.x, this.y, this.padded_size, this.padded_size);
        this.grid.forEach(row => row.forEach(data => data.draw(ctx, rad)));
    }

    get_maximum_period() {
        let max = 0;
        this.grid.forEach(row => row.forEach(circle => {
            if (circle.curve_period > max)
                max = circle.curve_period;
        }));
        return max;
    }
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
        this.size = 800;
        this.table = new Table(this.size, this.factors);
        console.log(this.table.get_maximum_period());

        this.canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext('2d');
        let margin = Math.floor(this.size * 0.03);
        this.canvas.style.margin = margin + "px";
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        window.onload = window.onresize = () => {
            let canvas_bounds = this.canvas.getBoundingClientRect();
            let w = window.innerWidth - canvas_bounds.x;
            let h = window.innerHeight - canvas_bounds.y;
            let THRESHOLD = 800;
            if (w > THRESHOLD && h > THRESHOLD)
                this.size = THRESHOLD;
            else {
                let tmp = Math.min(w, h);
                this.size = tmp * 0.9;
            }
            this.canvas.width = this.canvas.heigth = this.size;
            // TODO update size of the tables and rest...
            console.log({w, h});
        };
        this.canvas.onclick = (evt) => {
            let canvas_bounds = this.canvas.getBoundingClientRect();
            let x = evt.clientX - canvas_bounds.x;
            let y = evt.clientY - canvas_bounds.y;

            let grid_y = Math.floor(y / this.table.grid_edge_size);
            let grid_x = Math.floor(x / this.table.grid_edge_size);

            if ((grid_y === 0 && grid_x > 0) || (grid_x === 0 && grid_y > 0)) {
                // TODO do this at the beginning or recalculate all lengths, basically do a RESTART animation
                this.stop(() => {
                    let circle = this.table.grid[grid_y][grid_x];

                    let new_factor = 1;
                    circle.factor = new_factor;

                    if (circle.is_y) {
                        for (let y = 1; y <= this.factors.length; y++) {
                            this.trails[y][grid_x] = [];
                            this.f_trails[y][grid_x] = false;
                            let new_limit = lcm_two_numbers(new_factor, this.table.grid[y][0].factor);
                            this.limits[y][grid_x] = new_limit;
                            if (new_limit > this.MAX_LIMIT)
                                this.MAX_LIMIT = new_limit;
                        }
                    } else {
                        for (let x = 1; x <= this.factors.length; x++) {
                            this.trails[grid_y][x] = [];
                            this.f_trails[grid_y][x] = false;
                            let new_limit = lcm_two_numbers(new_factor, this.table.grid[0][x].factor);
                            this.limits[grid_y][x] = new_limit;
                            if (new_limit > this.MAX_LIMIT)
                                this.MAX_LIMIT = new_limit;
                        }
                    }

                    Animation.finished_once = false;
                    console.log(circle);
                });
            }
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

        // console.log("LIMITS: \n "+ JSON.stringify(limits));
        // console.log("Simulation Restarts at: " + (max / (Math.PI)));

        this.MAX_LIMIT = this.table.get_maximum_period();//todo
        this.NUM_STEPS = 80;
        this.STEP_SIZE = 2 * Math.PI / this.NUM_STEPS;

        console.log(this.table.grid[0][1].get_equation_string());
    }

    animation_step() {
        this.step_counter++;
        this.rad_counter += this.STEP_SIZE;
        this.calc_radians();

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";
        this.table.draw(this.ctx, this.rad_counter);

        if (this.rad_counter >= this.MAX_LIMIT) {
            this.soft_reset();
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
        /*if (Animation.finished_once) {
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
        } else {*/
        for (let y = 1; y <= this.factors.length; y++) {
            for (let x = 1; x <= this.factors.length; x++) {
                let c_x = this.table.grid[0][x]._x;
                let c_y = this.table.grid[y][0]._y;

                if (!this.f_trails[y][x])
                    if (!(this.trails[y][x].length > ((this.limits[y][x] * this.NUM_STEPS) / (2 * Math.PI)) + 1)) // TODO change this control so that only checks thelength of the trail arrayyy
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
        // }
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

    }
}

// TODO user customization?
// TODO explaination thorugh animations
// TODO BIG change the whole approach, every circle keeps it's own trace even the "intestaion"
const valid_factors = [1, 1.1, 1.2, 1.25, 1.3, 1.4, 1.5, 1.6, 1.7, 1.9, 1.9, 2];
const animation = new Animation([1, 1.2, 1.3, 1.4]);
setTimeout(animation.start.bind(animation));
setTimeout(animation.stop.bind(animation), 5000, () => console.info("terminated"));
