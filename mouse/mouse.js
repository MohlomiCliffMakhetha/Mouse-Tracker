"use strict";
const canvas = document.getElementById('Canvas');
const gl = canvas.getContext('webgl');

var m3 = {
    dotProduct: function (mat1, mat2) {
        return [
            mat1[0] * mat2[0] + mat1[1] * mat2[3] + mat1[2] * mat2[6], mat1[0] * mat2[1] + mat1[1] * mat2[4] + mat1[2] * mat2[7], mat1[0] * mat2[2] + mat1[1] * mat2[5] + mat1[2] * mat2[8],
            mat1[3] * mat2[0] + mat1[4] * mat2[3] + mat1[5] * mat2[6], mat1[3] * mat2[1] + mat1[4] * mat2[4] + mat1[5] * mat2[7], mat1[3] * mat2[2] + mat1[4] * mat2[5] + mat1[5] * mat2[8],
            mat1[6] * mat2[0] + mat1[7] * mat2[3] + mat1[8] * mat2[6], mat1[6] * mat2[1] + mat1[7] * mat2[4] + mat1[8] * mat2[7], mat1[6] * mat2[2] + mat1[7] * mat2[5] + mat1[8] * mat2[8]
        ];
    },
    rotationAboutZ: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ];
    },

    rotationAboutX: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            1, 0, 0,
            0, c, -s,
            0, s, c
        ];
    },

    rotationAboutY: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c, 0, s,
            0, 1, 0,
            -s, 0, c
        ];
    },

    scaling: function (sx, sy, sz) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, sz,
        ];
    },
};

var m4 = {

    perspective: function (fieldOfViewInRadians, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },

    translation: function (tx, ty, tz) {
        return [
            1, 0, 0, tx,
            0, 1, 0, ty,
            0, 0, 1, tz,
            0, 0, 0, 1
        ];
    },
};

var vertices = circleSectorDepth(0, 0, 0, 90, 0, 360, 60, 0);

const vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

/*const color_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colour), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);*/

const vertCode = `
attribute vec3 a_position;
attribute vec4 color;
uniform vec3 u_resolution;
uniform mat3 u_matrix;
uniform mat4 u_trans;
varying vec4 vcolor;

void main() {
  vec3 position =  a_position * u_matrix ;
  vec3 zeroToOne = position / u_resolution;
  vec4 coords = vec4(zeroToOne, 1.0) * u_trans ;
  float zToDivideBy = 1.0 - coords.z;
  gl_Position =   coords ;
  vcolor = color;
}
`;

const vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);

const fragCode = `
precision mediump float;

uniform vec4 u_color;
varying vec4 vcolor;
void main() {
   gl_FragColor = u_color;
}
`;

const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);

var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertShader);
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
var coord = gl.getAttribLocation(shaderProgram, "a_position");
gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coord);

/*gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
var color = gl.getAttribLocation(shaderProgram, "color");
gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(color);*/


var resolutionLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
gl.uniform3f(resolutionLocation, gl.canvas.width, gl.canvas.height, gl.canvas.width);

draw();
var ang = 0;
var xloc;
var yloc;
function draw() {
    gl.clearColor(102 / 255, 178 / 255, 1, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.4]);
    hex(-0.8, 0.9, 30, 90);
    hex(-0.6, 0.9, 90, 90);
    hex(-0.4, 0.9, 150, 90);
    hex(-0.2, 0.9, 210, 90);
    hex(-0.0, 0.9, 270, 90);
    hex(0.2, 0.9, 330, 90);
    hex(0.4, 0.9, 390, 90);
    hex(0.6, 0.9, 450, 90);
    hex(0.8, 0.9, 510, 90);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.5]);
    hex(-0.9, 0.75, 20, 120);
    hex(-0.7, 0.75, 80, 120);
    hex(-0.5, 0.75, 140, 120);
    hex(-0.3, 0.75, 200, 120);
    hex(-0.1, 0.75, 260, 120);
    hex(0.1, 0.75, 320, 120);
    hex(0.3, 0.75, 380, 120);
    hex(0.5, 0.75, 440, 120);
    hex(0.7, 0.75, 500, 120);
    hex(0.9, 0.75, 560, 120);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.6]);
    hex(-0.8, 0.6, 30, 150);
    hex(-0.6, 0.6, 90, 150);
    hex(-0.4, 0.6, 150, 150);
    hex(-0.2, 0.6, 210, 150);
    hex(-0.0, 0.6, 270, 150);
    hex(0.2, 0.6, 330, 150);
    hex(0.4, 0.6, 390, 150);
    hex(0.6, 0.6, 450, 150);
    hex(0.8, 0.6, 510, 150);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.7]);
    hex(-0.9, 0.45, 20, 180);
    hex(-0.7, 0.45, 80, 180);
    hex(-0.5, 0.45, 140, 180);
    hex(-0.3, 0.45, 200, 180);
    hex(-0.1, 0.45, 260, 180);
    hex(0.1, 0.45, 320, 180);
    hex(0.3, 0.45, 380, 180);
    hex(0.5, 0.45, 440, 180);
    hex(0.7, 0.45, 500, 180);
    hex(0.9, 0.45, 560, 180);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.8]);
    hex(-0.8, 0.3, 30, 210);
    hex(-0.6, 0.3, 90, 210);
    hex(-0.4, 0.3, 150, 210);
    hex(-0.2, 0.3, 210, 210);
    hex(-0.0, 0.3, 270, 210);
    hex(0.2, 0.3, 330, 210);
    hex(0.4, 0.3, 390, 210);
    hex(0.6, 0.3, 450, 210);
    hex(0.8, 0.3, 510, 210);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.9]);
    hex(-0.9, 0.15, 20, 240);
    hex(-0.7, 0.15, 80, 240);
    hex(-0.5, 0.15, 140, 240);
    hex(-0.3, 0.15, 200, 240);
    hex(-0.1, 0.15, 260, 240);
    hex(0.1, 0.15, 320, 240);
    hex(0.3, 0.15, 380, 240);
    hex(0.5, 0.15, 440, 240);
    hex(0.7, 0.15, 500, 240);
    hex(0.9, 0.15, 560, 240);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 1]);
    hex(-0.8, 0, 30, 270);
    hex(-0.6, 0, 90, 270);
    hex(-0.4, 0, 150, 270);
    hex(-0.2, 0, 210, 270);
    hex(-0.0, 0, 270, 270);
    hex(0.2, 0, 330, 270);
    hex(0.4, 0, 390, 270);
    hex(0.6, 0, 450, 270);
    hex(0.8, 0, 510, 270);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.9]);
    hex(-0.9, -0.15, 20, 300);
    hex(-0.7, -0.15, 80, 300);
    hex(-0.5, -0.15, 140, 300);
    hex(-0.3, -0.15, 200, 300);
    hex(-0.1, -0.15, 260, 300);
    hex(0.1, -0.15, 320, 300);
    hex(0.3, -0.15, 380, 300);
    hex(0.5, -0.15, 440, 300);
    hex(0.7, -0.15, 500, 300);
    hex(0.9, -0.15, 560, 300);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.8]);
    hex(-0.8, -0.3, 30, 330);
    hex(-0.6, -0.3, 90, 330);
    hex(-0.4, -0.3, 150, 330);
    hex(-0.2, -0.3, 210, 330);
    hex(-0.0, -0.3, 270, 330);
    hex(0.2, -0.3, 330, 330);
    hex(0.4, -0.3, 390, 330);
    hex(0.6, -0.3, 450, 330);
    hex(0.8, -0.3, 510, 330);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.7]);
    hex(-0.9, -0.45, 20, 360);
    hex(-0.7, -0.45, 80, 360);
    hex(-0.5, -0.45, 140, 360);
    hex(-0.3, -0.45, 200, 360);
    hex(-0.1, -0.45, 260, 360);
    hex(0.1, -0.45, 320, 360);
    hex(0.3, -0.45, 380, 360);
    hex(0.5, -0.45, 440, 360);
    hex(0.7, -0.45, 500, 360);
    hex(0.9, -0.45, 560, 360);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.6]);
    hex(-0.8, -0.6, 30, 390);
    hex(-0.6, -0.6, 90, 390);
    hex(-0.4, -0.6, 150, 390);
    hex(-0.2, -0.6, 210, 390);
    hex(-0.0, -0.6, 270, 390);
    hex(0.2, -0.6, 330, 390);
    hex(0.4, -0.6, 390, 390);
    hex(0.6, -0.6, 450, 390);
    hex(0.8, -0.6, 510, 390);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.5]);
    hex(-0.9, -0.75, 20, 420);
    hex(-0.7, -0.75, 80, 420);
    hex(-0.5, -0.75, 140, 420);
    hex(-0.3, -0.75, 200, 420);
    hex(-0.1, -0.75, 260, 420);
    hex(0.1, -0.75, 320, 420);
    hex(0.3, -0.75, 380, 420);
    hex(0.5, -0.75, 440, 420);
    hex(0.7, -0.75, 500, 420);
    hex(0.9, -0.75, 560, 420);
    var colorLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorLocation, [153 / 255, 51 / 255, 1, 0.4]);
    hex(-0.8, -0.9, 30, 450);
    hex(-0.6, -0.9, 90, 450);
    hex(-0.4,-0.9, 150, 450);
    hex(-0.2, -0.9, 210, 450);
    hex(-0.0, -0.9, 270, 450);
    hex(0.2, -0.9, 330, 450);
    hex(0.4, -0.9, 390, 450);
    hex(0.6, -0.9, 450, 450);
    hex(0.8, -0.9, 510, 450);
    requestAnimationFrame(draw);
}

function hex(x, y, xlim_i, ylim_i) {
    xlim_i*=2.25;
    if (xloc > xlim_i && xloc < xlim_i + 130 && yloc > ylim_i && yloc < ylim_i + 115) {
        var matrix = m3.rotationAboutY(ang * Math.PI / 180);
        ang = (ang + 1) % 360;
        var matrixLocation = gl.getUniformLocation(shaderProgram, "u_matrix");
        gl.uniformMatrix3fv(matrixLocation, false, matrix);

        var trans = m4.translation(x, y, 0);
        var transLocation = gl.getUniformLocation(shaderProgram, "u_trans");
        gl.uniformMatrix4fv(transLocation, false, trans);

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    }
}

function mousemove(event) {
    if (event.clientX < 1350 && event.clientY < 750) {
        xloc = event.clientX;
        yloc = event.clientY;
        //document.getElementById("xlocation").innerHTML = "x: " + xloc
       // document.getElementById("ylocation").innerHTML = "y: " + yloc;
    }

}

window.addEventListener('mousemove', mousemove);

function circleSectorDepth(x0, y0, z0, rad, degAng_i, degAng_f, degAngStep, depth) {
    var vecPoints = [];
    vecPoints.push(x0, y0, z0);
    for (var thita = degAng_i; thita <= degAng_f; thita += degAngStep) {
        vecPoints.push(rad * Math.cos(thita * Math.PI / 180) + x0, rad * Math.sin(thita * Math.PI / 180) + y0, z0);
        if (thita - degAng_i >= degAngStep) {
            vecPoints.push(vecPoints[vecPoints.length - 2 * 3], vecPoints[vecPoints.length - 2 * 3 + 1], vecPoints[vecPoints.length - 2 * 3 + 2],
                vecPoints[vecPoints.length - 1 * 3], vecPoints[vecPoints.length - 1 * 3 + 1], vecPoints[vecPoints.length - 1 * 3 + 2],
                vecPoints[vecPoints.length - 1 * 3], vecPoints[vecPoints.length - 1 * 3 + 1], vecPoints[vecPoints.length - 1 * 3 + 2] + depth,
                vecPoints[vecPoints.length - 2 * 3], vecPoints[vecPoints.length - 2 * 3 + 1], vecPoints[vecPoints.length - 2 * 3 + 2],
                vecPoints[vecPoints.length - 1 * 3], vecPoints[vecPoints.length - 1 * 3 + 1], vecPoints[vecPoints.length - 1 * 3 + 2] + depth,
                vecPoints[vecPoints.length - 2 * 3], vecPoints[vecPoints.length - 2 * 3 + 1], vecPoints[vecPoints.length - 2 * 3 + 2] + depth);

        }
        if (degAng_i <= thita - degAngStep && thita < degAng_f) {
            vecPoints.push(x0, y0, z0, rad * Math.cos(thita * Math.PI / 180) + x0, rad * Math.sin(thita * Math.PI / 180) + y0, z0);
        }
    }
    return vecPoints;
}