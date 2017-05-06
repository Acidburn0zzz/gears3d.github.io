/* Gears. Draw them. In 3D.
 *
 * Jordan Justen : gears3d is public domain
 */

var webgl10 = {};

webgl10.gears = [
    {
        teeth: 20, inner_radius: 1.0, outer_radius: 4.0, width: 1.0,
        tooth_depth: 0.7,
        angle_rate: 1.0, angle_adjust: 0.0,
        translate: [ -3.0, -2.0 ],
        color: [ 0.8, 0.1, 0.0, 1.0 ],
    },
    {
        teeth: 10, inner_radius: 0.5, outer_radius: 2.0, width: 2.0,
        tooth_depth: 0.7,
        angle_rate: -2.0, angle_adjust: (Math.PI * -9.0 / 180.0),
        translate: [ 3.1, -2.0 ],
        color: [ 0.0, 0.8, 0.2, 1.0 ],
    },
    {
        teeth: 10, inner_radius: 1.3, outer_radius: 2.0, width: 0.5,
        tooth_depth: 0.7,
        angle_rate: -2.0, angle_adjust: (Math.PI * -25.0 / 180.0),
        translate: [ -3.1, 4.2 ],
        color: [ 0.2, 0.2, 1.0, 1.0 ],
    },
];

webgl10.gl_program_vf_str = function(vs_src, fs_src)
{
    var vs_shader = gl.createShader(gl.VERTEX_SHADER);
    var fs_shader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vs_shader, vs_src);
    gl.shaderSource(fs_shader, fs_src);

    gl.compileShader(vs_shader);
    if (!gl.getShaderParameter(vs_shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vs_shader));
        return null;
    }

    gl.compileShader(fs_shader);
    if (!gl.getShaderParameter(fs_shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fs_shader));
        return null;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vs_shader);
    gl.attachShader(program, fs_shader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Shader program link failed!");
    }

    return program;
}

webgl10.init_program = function()
{

    var vs_src =
        ['#version 100',
         '',
         'uniform mat4 model;',
         'uniform mat4 view;',
         'uniform mat4 projection;',
         '',
         'uniform float gear_angle;',
         '',
         'attribute vec3 vertex;',
         'attribute vec3 rel_norm;',
         'varying vec3 norm;',
         'varying vec3 light_dir;',
         '',
         'const vec3 light_pos = vec3(5.0, 5.0, 10.0);',
         '',
         'void main()',
         '{',
         '    float ang = gear_angle;',
         '    mat2 rotz = mat2(vec2(cos(ang), sin(ang)),',
         '                     vec2(-sin(ang), cos(ang)));',
         '',
         '    vec3 pos = vec3(rotz * vertex.xy, vertex.z);',
         '    vec4 m_pos = model * vec4(pos, 1.0);',
         '    m_pos = vec4(m_pos.xyz / m_pos.w, 1.0);',
         '    gl_Position = projection * view * m_pos;',
         '',
         '    light_dir = normalize(light_pos - m_pos.xyz);',
         '',
         '    vec3 n_pos = vertex + rel_norm;',
         '    n_pos = vec3(rotz * n_pos.xy, n_pos.z);',
         '    vec4 m_norm = model * vec4(n_pos, 1.0);',
         '    norm = normalize((m_norm.xyz / m_norm.w) - m_pos.xyz);',
         '}'
        ].join('\n');

    var fs_src =
        ['#version 100',
         'precision highp float;',
         '',
         'varying vec3 norm;',
         'varying vec3 light_dir;',
         '',
         'uniform vec4 gear_color;',
         '',
         'void main()',
         '{',
         '    float light_ref = clamp(0.0+dot(norm, light_dir), -0.0, 1.0);',
         '    float light = clamp(0.2+light_ref, 0.1, 1.0);',
         '    gl_FragColor = vec4(light * gear_color.xyz, 1.0);',
         '}'
        ].join('\n');

    var program = this.gl_program_vf_str(vs_src, fs_src);
    program.vertex_loc = gl.getAttribLocation(program, "vertex");
    program.rel_norm_loc = gl.getAttribLocation(program, "rel_norm");
    program.model_loc = gl.getUniformLocation(program, "model");
    program.view_loc = gl.getUniformLocation(program, "view");
    program.projection_loc = gl.getUniformLocation(program, "projection");
    program.gear_angle_loc = gl.getUniformLocation(program, "gear_angle");
    program.gear_color_loc = gl.getUniformLocation(program, "gear_color");
    gl.useProgram(program);
    return program;
}

webgl10.init_buffers = function(program)
{
    //var vao = gl.createVertexArray();
    //gl.bindVertexArray(vao);

    var verts = [];
    var i;
    var total_vertex_count = 0;
    for (i = 0; i < this.gears.length; i++) {
        var gear = this.gears[i];
        gear.vertex_buf_offset = total_vertex_count;
        gear.num_vertices = vert_buf.gear_vertex_count(gear.teeth);
        total_vertex_count += gear.num_vertices;
        vert_buf.fill_gear_vertices(verts, gear.inner_radius,
                                    gear.outer_radius, gear.width, gear.teeth,
                                    gear.tooth_depth);
    }
    program.vert_buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.vert_buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(program.vertex_loc);
    gl.vertexAttribPointer(program.vertex_loc, 3, gl.FLOAT, false, 6 * 4, 0);

    gl.enableVertexAttribArray(program.rel_norm_loc);
    gl.vertexAttribPointer(program.rel_norm_loc, 3, gl.FLOAT, false, 6 * 4,
                           3 * 4);

    gl.bindBuffer(gl.ARRAY_BUFFER, program.vert_buf);
}

var program;

webgl10.rotate_gears = function(x, y, z)
{
    var i;

    for (i = 0; i < this.gears.length; i++) {
        var model = mat4.create();
        if (x != 0.0) {
            mat4.rotateX(model, model, x);
        }
        if (y != 0.0) {
            mat4.rotateY(model, model, y);
        }
        if (z != 0.0) {
            mat4.rotateZ(model, model, z);
        }
        var gear = this.gears[i];
        mat4.translate(model, model,
                       [ gear.translate[0], gear.translate[1], 0.0 ]);
        gear.model = model;
    }
}

webgl10.reshape = function(width, height)
{
    gl.viewport(0, 0, width, height);

    this.rotate_gears(20.0 / 180.0 * Math.PI, 30.0 / 180.0 * Math.PI, 0.0);
    var view = mat4.create();
    mat4.translate(view, view, [ 0.0, 0.0, -40.0 ]);
    var projection = mat4.create();
    var h = height / width;
    mat4.frustum(projection, -1.0, 1.0, -h, h, 5.0, 200.0);
    // gl.uniformMatrix4fv(program.model_loc, false, model);
    gl.uniformMatrix4fv(program.view_loc, false, view);
    gl.uniformMatrix4fv(program.projection_loc, false, projection);
}

webgl10.set_global_state = function()
{
    gl.depthRange(0.0, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    program = this.init_program();
    this.reshape(gl.canvas_width, gl.canvas_height);

    var green = new Float32Array([ 0.0, 1.0, 0.0, 1.0 ]);
    gl.uniform4fv(program.gear_color_loc, green);
    gl.uniform1f(program.gear_angle_loc, 0.0);
    this.init_buffers(program);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.enable(gl.DEPTH_TEST);
}

webgl10.update_angle = function(angle)
{
    var i;
    for (i = 0; i < this.gears.length; i++) {
        var gear = this.gears[i];
        gear.angle = angle * gear.angle_rate + gear.angle_adjust;
    }
}

webgl10.draw = function()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var i;
    for (i = 0; i < this.gears.length; i++) {
        var gear = this.gears[i];
        gl.uniform1f(program.gear_angle_loc, gear.angle);
        gl.uniform4fv(program.gear_color_loc, gear.color);
        gl.uniformMatrix4fv(program.model_loc, false, gear.model);
        gl.drawArrays(gl.TRIANGLE_STRIP, gear.vertex_buf_offset,
                      gear.num_vertices);
    }
}
