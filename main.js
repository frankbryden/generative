let canvas = document.querySelector("#mycanvas");
let ctx = canvas.getContext("2d");

function getRandFloat(min, max){
    return Math.floor(Math.random() * (max - 100) + min) / 100;
} 

class Root {
    constructor(angleSpread, lengthLossSpread){
        this.angleSpread = angleSpread;
        this.lengthLossSpread = lengthLossSpread;
        this.large = 1;
        this.medium = 0.6;
        this.small = 0.1;
        this.deadBranchDepth = 3;
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
        this.angle = Math.atan2(this.y2 - this.y, this.x2 - this.x);
        this.length = Math.sqrt((this.x2 - this.x)*(this.x2 - this.x) + (this.y2 - this.y)*(this.y2 - this.y));
    }

    birth() {
        if (this.branchDepth >= this.root.deadBranchDepth) {
            return [];
        }
        let seed = Math.random();
        let offsprings = [];
        //60% chance to grow large branch
        //40% chance to grow small branch
        //20% chance to grow medium branch
        let angle = getRandFloat(this.angle - this.root.angleSpread/2, this.angle + this.root.angleSpread/2);
        if (seed < 0.6) {
            let length = this.length * this.root.large;
            let x2 = this.x2 + Math.cos(angle) * length;
            let y2 = this.y2 + Math.sin(angle) * length;
            offsprings.push(new Line(this.root, this.x2, this.y2, x2, y2, 1));
        }

        if (seed < 0.1) {
            let length = this.length * this.root.small;
            let x2 = this.x2 + Math.cos(angle) * length;
            let y2 = this.y2 + Math.sin(angle) * length;
            offsprings.push(new Line(this.root, this.x2, this.y2, x2, y2, 2));
        }

        if (seed < 0.05) {
            let length = this.length * this.root.medium;
            let x2 = this.x2 + Math.cos(angle) * length;
            let y2 = this.y2 + Math.sin(angle) * length;
            offsprings.push(new Line(this.root, this.x2, this.y2, x2, y2, 3));
        }

        return offsprings;
    }

    render(){
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
}

let root = new Root(2*Math.PI, 0.1);
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


gameLoop();