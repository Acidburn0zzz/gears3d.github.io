/* Gears. Draw them. In 3D.
 *
 * Jordan Justen : gears3d is public domain
 */

var gl;

function init_webgl()
{
    var canvas = document.getElementById("gears3d");
    try {
        gl = canvas.getContext("webgl");
    } catch (e) {
        try {
            gl = canvas.getContext("experimental-webgl");
        } catch (e) {
        }
    }
    if (gl) {
        gl.canvas_width = canvas.width;
        gl.canvas_height = canvas.height;
    } else {
        alert("No WebGL!");
    }
}

var drawer = webgl10;
var angle_per_dt = 70.0 / 180.0 * Math.PI / 1000.0;
var angle = 0.0;
var t0 = -1.0;
var frame_count = 0;
function draw_gears()
{
    requestAnimFrame(draw_gears);
    var t = Date.now();
    if (t0 < 0.0)
        t0 = t;
    var dt = t - t0;
    t0 = t;

    angle += angle_per_dt * dt;
    if (angle > 2 * Math.PI) {
        angle -= 2 * Math.PI; /* prevents eventual overflow */
    }

    drawer.update_angle(angle);
    drawer.draw();

    if (frame_count % 3600 == 0) {
        console.log("drew gears " + frame_count + " times!");
        if (gl.getError() != gl.NO_ERROR) {
            console.log("There was a WebGL error!");
        }
    }
    frame_count += 1;
}

function gears3d_start()
{
    init_webgl();
    if (gl) {
        drawer.set_global_state();
        if (gl.getError() != gl.NO_ERROR) {
            console.log("There was a WebGL error!");
        }
        start_time = Date.now();
        draw_gears();
    }
}
