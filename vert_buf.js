/* Gears. Draw them. In 3D.
 *
 * Jordan Justen : gears3d is public domain
 */

var vert_buf = {};

vert_buf.add_vert = function(verts, x, y, z, normal)
{
    verts.push(x);
    verts.push(y);
    verts.push(z);

    verts.push(normal[0]);
    verts.push(normal[1]);
    verts.push(normal[2]);
}

vert_buf.add_vert_mnorm = function(verts, x, y, z, mult)
{
    var norm_tmp = [ mult * x - x, mult * y - y, 0.0 ];
    this.add_vert(verts, x, y, z, norm_tmp);
}

vert_buf.TOOTH_VERTS = 40;

vert_buf.tooth = function(verts, inner_radius, outer_radius, width, teeth,
                          tooth_depth, tooth_num)
{
    var r0 = inner_radius;
    var r1 = outer_radius - tooth_depth / 2.0;
    var r2 = outer_radius + tooth_depth / 2.0;
    var da = Math.PI / teeth / 2.0;
    var pta = 2.0 * Math.PI / teeth;
    var ta = tooth_num * pta;
    var half_width = 0.5 * width;
    var dcos = [ Math.cos(ta), Math.cos(ta + da), Math.cos(ta + 2 * da),
                 Math.cos(ta + 3 * da), Math.cos(ta + 4 * da) ];
    var dsin = [ Math.sin(ta), Math.sin(ta + da), Math.sin(ta + 2 * da),
                 Math.sin(ta + 3 * da), Math.sin(ta + 4 * da) ];
    var last_tooth = tooth_num < 0 || tooth_num == teeth - 1;
    if (tooth_num < -1 || tooth_num >= teeth) {
        console.log("tooth_num out of range [-1, " + teeth + "): " +
                    tooth_num);
    }

    var pos_z = [ 0.0, 0.0, 1.0 ];
    var neg_z = [ 0.0, 0.0, -1.0 ];
    var norm_tmp = [];

    /* front face of tooth */
    this.add_vert(verts, dcos[1] * r2, dsin[1] * r2, half_width, pos_z);
    this.add_vert(verts, dcos[2] * r2, dsin[2] * r2, half_width, pos_z);
    this.add_vert(verts, dcos[0] * r1, dsin[0] * r1, half_width, pos_z);
    this.add_vert(verts, dcos[3] * r1, dsin[3] * r1, half_width, pos_z);

    /* front face of gear */
    this.add_vert(verts, dcos[4] * r1, dsin[4] * r1, half_width, pos_z);
    this.add_vert(verts, dcos[4] * r1, dsin[4] * r1, half_width, pos_z);
    this.add_vert(verts, dcos[0] * r1, dsin[0] * r1, half_width, pos_z);
    this.add_vert(verts, dcos[4] * r0, dsin[4] * r0, half_width, pos_z);
    this.add_vert(verts, dcos[0] * r0, dsin[0] * r0, half_width, pos_z);

    /* inner cylinder */
    this.add_vert_mnorm(verts, dcos[4] * r0, dsin[4] * r0, half_width, 0.5);
    this.add_vert_mnorm(verts, dcos[0] * r0, dsin[0] * r0, half_width, 0.5);
    this.add_vert_mnorm(verts, dcos[4] * r0, dsin[4] * r0, -half_width, 0.5);
    this.add_vert_mnorm(verts, dcos[0] * r0, dsin[0] * r0, -half_width, 0.5);

    /* back face of gear (first 2 are degenerate to reset normal) */
    this.add_vert(verts, dcos[4] * r0, dsin[4] * r0, -half_width, neg_z);
    this.add_vert(verts, dcos[0] * r0, dsin[0] * r0, -half_width, neg_z);
    this.add_vert(verts, dcos[4] * r1, dsin[4] * r1, -half_width, neg_z);
    this.add_vert(verts, dcos[0] * r1, dsin[0] * r1, -half_width, neg_z);
    this.add_vert(verts, dcos[3] * r1, dsin[3] * r1, -half_width, neg_z);

    /* back face of tooth */
    this.add_vert(verts, dcos[1] * r2, dsin[1] * r2, -half_width, neg_z);
    this.add_vert(verts, dcos[2] * r2, dsin[2] * r2, -half_width, neg_z);

    /* two degenerate triangles to jump to drawing the outer edge of gear */
    this.add_vert_mnorm(verts, dcos[2] * r2, dsin[2] * r2, -half_width, 2.0);
    this.add_vert_mnorm(verts, dcos[4] * r1, dsin[4] * r1, -half_width, 2.0);

    /* tooth recess outer edge */
    this.add_vert_mnorm(verts, dcos[4] * r1, dsin[4] * r1, -half_width, 2.0);
    this.add_vert_mnorm(verts, dcos[4] * r1, dsin[4] * r1, half_width, 2.0);
    this.add_vert_mnorm(verts, dcos[3] * r1, dsin[3] * r1, -half_width, 2.0);
    this.add_vert_mnorm(verts, dcos[3] * r1, dsin[3] * r1, half_width, 2.0);

    /* tooth leading edge (first 2 are degenerate to reset normal) */
    norm_tmp[0] = dsin[3] * r1 - dsin[2] * r2;
    norm_tmp[1] = -dcos[3] * r1 + dcos[2] * r2;
    norm_tmp[2] = 0.0;
    this.add_vert(verts, dcos[3] * r1, dsin[3] * r1, -half_width, norm_tmp);
    this.add_vert(verts, dcos[3] * r1, dsin[3] * r1, half_width, norm_tmp);
    this.add_vert(verts, dcos[2] * r2, dsin[2] * r2, -half_width, norm_tmp);
    this.add_vert(verts, dcos[2] * r2, dsin[2] * r2, half_width, norm_tmp);

    /* tooth top edge (first 2 are degenerate to reset normal) */
    this.add_vert_mnorm(verts, dcos[2] * r2, dsin[2] * r2, -half_width, 2.0);
    this.add_vert_mnorm(verts, dcos[2] * r2, dsin[2] * r2, half_width, 2.0);
    this.add_vert_mnorm(verts, dcos[1] * r2, dsin[1] * r2, -half_width, 2.0);
    this.add_vert_mnorm(verts, dcos[1] * r2, dsin[1] * r2, half_width, 2.0);

    /* tooth trailing edge (first 2 are degenerate to reset normal) */
    norm_tmp[0] = -dsin[0] * r1 + dsin[1] * r2;
    norm_tmp[1] =  dcos[0] * r1 - dcos[1] * r2;
    norm_tmp[2] = 0.0;
    this.add_vert(verts, dcos[1] * r2, dsin[1] * r2, -half_width, norm_tmp);
    this.add_vert(verts, dcos[1] * r2, dsin[1] * r2, half_width, norm_tmp);
    this.add_vert(verts, dcos[0] * r1, dsin[0] * r1, -half_width, norm_tmp);
    this.add_vert(verts, dcos[0] * r1, dsin[0] * r1, half_width, norm_tmp);

    if (!last_tooth) {
        /* two degenerate triangles to jump to drawing the next tooth */
        this.add_vert(verts, dcos[0] * r1, dsin[0] * r1, half_width, pos_z);
        this.add_vert(verts, Math.cos(ta + da + pta) * r2,
                      Math.sin(ta + da + pta) * r2, half_width, pos_z);
    }
}

vert_buf.tooth_vertex_count = function()
{
    return this.TOOTH_VERTS - 2;
}

vert_buf.fill_tooth_vertices = function(buf, inner_radius, outer_radius, width,
                                        teeth, tooth_depth)
{
    this.tooth(buf, inner_radius, outer_radius, width, teeth, tooth_depth, -1);
}

vert_buf.gear_vertex_count = function(teeth)
{
    return (this.TOOTH_VERTS * teeth) - 2;
}

vert_buf.fill_gear_vertices = function(buf, inner_radius, outer_radius, width,
                                       teeth, tooth_depth)
{
    var i;
    for (i = 0; i < teeth; i++) {
        this.tooth(buf, inner_radius, outer_radius, width, teeth, tooth_depth,
                   i);
    }
}
