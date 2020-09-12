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

let root = new Root({
    small: 2 * Math.PI,
    medium: Math.PI,
    large: Math.PI / 4
}, 0.1);

canvas.addEventListener('click', () => {
    console.log("click");
    root.step();
});

function render() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    //background
    ctx.fillStyle = "white";//"#edd5a1";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    root.render();
}

function update() {


}

function gameLoop() {
    requestAnimationFrame(gameLoop);

    update();
    render();

}

for (let i = 0; i < 10; i++) {
    console.log(getRandFloat(-0.197 - 6.28/2, -0.197 + 6.28/2));
}


gameLoop();