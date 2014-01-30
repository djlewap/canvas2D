var cube, c, f, a, animation,
    center     = [100, 100],
    fridge     = 100,
    radius     = 100,
    sides      = 5,
    currAngle  = 0,
    currFigure = 0,
    fps        = 60;
var figures = [];

// ===================================================
//               описание класса Figure
// ===================================================

function Figure(type, sides, r){ 
    this.type = type;
    //  Типы фигур: 0 - правильный многоугольник 
    //              1 - окружность
    //              2 - фигура заданная последовательностью точек
    this.sidesNum = sides;
    this.dots = [];
    this.currAngle = 0;
    this.currRotationSpeed = 1;
    this.scaleFactor = 1;
    this.currPos = [center[0], center[1]];
    this.radius = r;
}
Figure.prototype.rebuildCircleFigure = function() { //old method
    var stepAngle = dtr(360/this.sidesNum);
    this.dots = [];
    recalc();
    for (var i = 0; i < this.sidesNum; i++) {
        var oneDot = [];
        oneDot[0] = r * Math.cos(i*stepAngle);
        oneDot[1] = r * Math.sin(i*stepAngle);
        this.dots.push(oneDot);
    };
    this.toCenter();
    this.rotate(this.currAngle, true);
}
Figure.prototype.draw = function() {
    ctx.beginPath("figure");
    ctx.moveTo(this.dots[0][0], this.dots[0][1]);
    for (var i = 1; i < this.dots.length; i++) {
        ctx.lineTo(this.dots[i][0], this.dots[i][1]);
    };
    ctx.lineTo(this.dots[0][0],this.dots[0][1]);
    ctx.stroke();
    ctx.closePath();
}
Figure.prototype.drawDots = function() {
    ctx.beginPath("figure");
    for (var i = 0; i < this.dots.length; i++) {
        ctx.fillRect(this.dots[i][0], this.dots[i][1], 2, 2);
    };
    ctx.closePath();
}
Figure.prototype.toCenter = function() {
    for (var i = 0; i < this.dots.length; i++) {
        this.dots[i][0] = this.dots[i][0] + center[0];
        this.dots[i][1] = this.dots[i][1] + center[1];
    };
}
Figure.prototype.toZero = function() {
    for (var i = 0; i < this.dots.length; i++) {
        this.dots[i][0] = this.dots[i][0] - this.currPos[0];
        this.dots[i][1] = this.dots[i][1] - this.currPos[1];
    };
}
Figure.prototype.toCurrPos = function() {
    for (var i = 0; i < this.dots.length; i++) {
        this.dots[i][0] = this.dots[i][0] + this.currPos[0];
        this.dots[i][1] = this.dots[i][1] + this.currPos[1];
    };
}
Figure.prototype.rotate = function(alpha, skip) { //if skip - currAngle doesnt change 
    for (var i = 0; i < this.dots.length; i++) {
        var temp = [], 
            al, M = [[],[]];
        
        al = dtr(alpha);
        M = [[Math.cos(al), -Math.sin(al)],[Math.sin(al), Math.cos(al)]];
        this.dots[i][0] = this.dots[i][0]-this.currPos[0];
        this.dots[i][1] = this.dots[i][1]-this.currPos[1];
        temp[0] = this.dots[i][0]*M[0][0] + this.dots[i][1]*M[0][1];
        temp[1] = this.dots[i][0]*M[1][0] + this.dots[i][1]*M[1][1];
        this.dots[i][0] = temp[0]+this.currPos[0];
        this.dots[i][1] = temp[1]+this.currPos[1];
    };
    if (!skip) this.currAngle = this.currAngle + alpha;
    if (this.currAngle>360) this.currAngle = this.currAngle - 360;
}
Figure.prototype.scale = function(x) {
    this.toZero();
    scale(this.dots, 1/this.scaleFactor*x);
    this.scaleFactor = x;
    this.toCurrPos();
}
Figure.prototype.shift = function(x, d) {
    shift(this.dots, x-this.currPos[d], d);
    this.currPos[d] = x;
}

// ===================================================
//                   функции вычислений
// ===================================================

function dtr(degrees){ //перевод градусов в радианы
    return degrees*Math.PI/180;
}

function scale(e, k){
    for (var i = 0; i < e.length; i++) {
        for (var j = 0; j < e[i].length; j++) {
            e[i][j] = e[i][j]*k;
        };
    };
}

function shift(e, x, o){ //массив точек, сдвиг, направление сдвига (0=x|1=y|2=z|...)
    for (var i = 0; i < e.length; i++) {
        e[i][o] = e[i][o] + x;
    };
}

function recalc(){
    c = center; //center
    f = fridge/2;
    r = radius;
    s = sides;
}

function buildCircleFigure(sidesNum, r){
    var stepAngle = dtr(360/sidesNum);
    var figure = new Figure(0, sidesNum, r);
    for (var i = 0; i < sidesNum; i++) {
        var oneDot = [];
        oneDot[0] = r * Math.cos(i*stepAngle);
        oneDot[1] = r * Math.sin(i*stepAngle);
        figure.dots.push(oneDot);
    };
    figure.toCenter();
    figures.push(figure);
}

function createM(z, scaling){ // 1/z - угол прохождения
    var figure = new Figure();
    for (var t = 0; t < Math.PI*2; t=t+Math.PI/z) {
        var r;
        r = (1+Math.sin(t))*(1-0.9*Math.abs(Math.sin(4*t)))*(0.9+0.05*Math.cos(200*t));
        var dot = [];
        dot[0] = scaling * r * Math.cos(t);
        dot[1] = scaling * r * Math.sin(t);
        figure.dots.push(dot);
    }
    figure.toCenter();
    figure.rotate(180);
    shift(figure.dots, 50, 1);
    figures.push(figure);
}

function addRandomFigure(){
    var sides = getRandomInt(3,7),
        r     = getRandomInt(50,200);
    buildCircleFigure(sides, r);
    figures[figures.length-1].currRotationSpeed = getRandomArbitary(-5, 5);
    figures[figures.length-1].shift(getRandomArbitary(0, a.width), 0);
    figures[figures.length-1].shift(getRandomArbitary(0, a.height), 1);
    addElementsSelect();
}

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitary(min, max){
    return Math.random() * (max - min) + min;
}

// ===================================================
//                   функции контроля
// ===================================================

function setSpeed(){
    clearInterval(a);
    figures[currFigure].currRotationSpeed = Number(document.getElementById('speed').value);
    launchAnimation();
}

function setScale(){
    var temp = Number(document.getElementById('scale').value);
    figures[currFigure].scale(temp);
    launchAnimation();
}

function setShift(d){ //direction
    if (d==0) {
        var temp = Number(document.getElementById('shiftX').value);
    } else if (d==1) {
        var temp = Number(document.getElementById('shiftY').value);
    };
    
    figures[currFigure].shift(temp, d);
    launchAnimation();                
}

function setSidesNum(){
    // ...
}

function selectElement(i){
    currFigure = i;
}

// ===================================================
//                   функции анимации
// ===================================================
function clearCanvas(){
    a.height=a.height;
}

function draw(){//глобальная отрисовка
    clearCanvas();
    for (var i = 0; i < figures.length; i++) {
        figures[i].draw();
    };
}

function stopAnimation(){
    clearInterval(animation);
}

function launchAnimation(){
    clearInterval(animation);
    animation = setInterval(function(){
        draw();
        for (var i = 0; i < figures.length; i++) {
            figures[i].rotate(figures[i].currRotationSpeed);
        };
    },1000/fps);
}

function addElementsSelect(){
    document.getElementById('elements').innerHTML = '';
    for (var i = 0; i < figures.length; i++) {
        var el = document.createElement('li');
        if (figures[i].type == 0) {
            el.innerText = figures[i].sidesNum+'угольник. №'+i;
        } else {
            el.innerText = 'Фигура. №'+i;
        };
        el.onclick = (function(i){
            return function(){
                selectElement(i);
            } 
        })(i);
        document.getElementById('elements').appendChild(el);                    
    };
}

function initialize(){
    a=document.getElementById("example"),ctx=a.getContext("2d");
    a.height=window.innerHeight;
    a.width=window.innerWidth; 
    center[0] = a.width/2;
    center[1] = a.height/2;
    document.getElementById('shiftX').min = 0;
    document.getElementById('shiftX').max = a.width;
    document.getElementById('shiftX').value = a.width/2;
    document.getElementById('shiftY').min = 0;
    document.getElementById('shiftY').max = a.height;
    document.getElementById('shiftY').value = a.height/2;
    recalc();
    var boom = window.location.hash.substr(1) || 3;
    if (boom == 'bonus') {
        createM(1000, 100);
    } else {
        buildCircleFigure(boom, r);
        buildCircleFigure(5, 140);
        figures[1].shift(200, 0);
        figures[1].shift(300, 1);
    };
    launchAnimation();
    addElementsSelect();
}

