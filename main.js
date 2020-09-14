let canvas = document.querySelector("#mycanvas");
let ctx = canvas.getContext("2d");

function getRandFloat(min, max){
    return Math.random() * (max - min) + min;
} 

class Root {
    constructor(angleSpread, lengthLossSpread){
        this.angleSpread = angleSpread;
        this.lengthLossSpread = lengthLossSpread;
        this.large = 1;
        this.medium = 0.6;
        this.small = 0.1;
        this.deadBranchDepth = 2;
        this.lines = [new Line(this, 100, 500, 150, 490, 1)];
    }

    step() {
        let start = new Date();
        let offsprings = [];
        this.lines.forEach(line => offsprings.push(...line.birth()));
        this.lines = this.lines.concat(offsprings);
        console.log(`Took ${(new Date()) - start}ms`);
    }

    render() {
        this.lines.forEach(line => line.render());
    }
}

class Line {
    constructor(root, x, y, x2, y2, branchDepth) {
        this.root = root;
        this.x = x;
        this.y = y;
        this.x2 = x2;
        this.y2 = y2;
        this.branchDepth = branchDepth;
        this.dead = false;
        this.angle = Math.atan2(this.y2 - this.y, this.x2 - this.x);
        console.log(`Starting angle is ${this.angle}, spread is ${this.root.angleSpread}`);
        this.length = Math.sqrt((this.x2 - this.x)*(this.x2 - this.x) + (this.y2 - this.y)*(this.y2 - this.y));
    }

    birth() {
        console.log("Branch");
        if (this.dead) {
            console.log("Abortion");
            return [];
        }
        let seed = Math.random();
        let offsprings = [];
        //60% chance to grow large branch
        //40% chance to grow small branch
        //20% chance to grow medium branch
        
        if (seed < 0.6) {
            console.log("large");
            offsprings.push(this.createBranch(2));
            this.dead = true;
        }

        if (seed < 0.1) {
            offsprings.push(this.createBranch(0));
        }

        if (seed < 0.05) {
            this.dead = true;
            offsprings.push(this.createBranch(1));
        }

        return offsprings;
    }

    createBranch(size){
        //size: 2 for large, 1 for medium, 0 for small
        let ratio;
        let angleSpread;
        if (size == 0){
            ratio = this.root.small;
            angleSpread = this.root.angleSpread.small;
        } else if (size == 1){
            ratio = this.root.medium;
            angleSpread = this.root.angleSpread.small;
        } else if (size == 2){
            ratio = this.root.large;
            angleSpread = this.root.angleSpread.small;
        } else {
            console.error("Error with size " + size);
            return;
        }
        let angle = getRandFloat(this.angle - angleSpread/2, this.angle + angleSpread/2);
        let length = this.length * ratio;
        let x2 = this.x2 + Math.cos(angle) * length;
        let y2 = this.y2 + Math.sin(angle) * length;
        return new Line(this.root, this.x2, this.y2, x2, y2, size)
    }

    render(){
        if (this.dead) {
            ctx.strokeStyle = "red";
        } else {
            ctx.strokeStyle = "black";
        }
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
}

class Tracer {
    constructor(ball, bufferSize, sampling) {
        this.ball = ball;
        this.bufferSize = bufferSize;
        this.buffer = [];
        this.samplingRate = sampling;
        this.sampleCount = 0;
    }

    update() {
        this.sampleCount++;
        if (this.sampleCount >= this.samplingRate) {
            this.sampleCount = 0;
            this.takeSample();
        }
    }

    takeSample() {
        this.buffer.push({x: this.ball.x, y: this.ball.y});
        if (this.buffer.length >= this.bufferSize) {
            this.buffer.shift();
        }
    }

    render() {
        for (let i = 1; i < this.buffer.length; i++) {
            ctx.beginPath();
            let prevPoint = this.buffer[i - 1];
            let currPoint = this.buffer[i];
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(currPoint.x, currPoint.y);
            ctx.stroke();
        }
        /*
        this.buffer.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2*Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
        });*/
    }

    
}

class GravBall {
    constructor(x, y, vel) {
        this.x = x;
        this.y = y;
        this.vel = vel;
        this.dir = {x: this.vel.x > 0 ? -1 : 1, y: this.vel.y > 0 ? -1 : 1};
    }

    accelFuncWidth(x) {
        return Math.max(-1*(x-2)*(x-3)*(x-canvas.clientWidth - 1)*(x-canvas.clientWidth)/10000000000+10, 0);
    }

    accelFuncHeight(y) {
        return Math.max(-1*(y+2)*(y+3)*(y-canvas.clientHeight+50 - 1)*(y-canvas.clientHeight+50)/10000000000+10, 0);
    }

    update() {
        this.vel.x += this.accelFuncWidth(this.x)*this.dir.x/10;
        this.vel.y += this.accelFuncHeight(this.y)*this.dir.y/10;
        this.x += this.vel.x;
        this.y += this.vel.y;

        if (this.x > canvas.clientWidth/2 && this.dir.x == 1){
            this.dir.x = -1;
        }

        if (this.x < canvas.clientWidth/2 && this.dir.x == -1){
            this.dir.x = 1;
        }

        if (this.y > canvas.clientHeight/2 && this.dir.y == 1){
            this.dir.y = -1;
        }

        if (this.y < canvas.clientHeight/2 && this.dir.y == -1){
            this.dir.y = 1;
        }
    }

    render() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, 2*Math.PI);

        ctx.fillStyle = "cyan";
        ctx.fill();
    }
}

let root = new Root({
    small: 2 * Math.PI,
    medium: Math.PI,
    large: Math.PI / 4
}, 0.1);

canvas.addEventListener('click', () => {
    console.log("click");
    root.step();
});

let ball = new GravBall(100, 200, {x: -1, y: -6.2});
let tracer = new Tracer(ball, 100, 5);

let ball2 = new GravBall(200, 100, {x: 1, y: 9.2});
let tracer2 = new Tracer(ball2, 100, 5);

function render() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    //background
    ctx.fillStyle = "white";//"#edd5a1";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ctx.strokeRect(2, 2, canvas.clientWidth - 2, canvas.clientHeight - 2);

    tracer.render();
    ball.render();

    tracer2.render();
    ball2.render();
}

function update() {
    ball.update();
    tracer.update();

    ball2.update();
    tracer2.update();
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
    //setTimeout(gameLoop, 100);

    update();
    render();

}

gameLoop();