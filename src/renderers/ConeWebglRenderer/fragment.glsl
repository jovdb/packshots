precision highp float;

varying vec2 texcoord;
uniform sampler2D texture;
uniform vec3 eyePos; 
uniform mat3 eyeMat;
uniform vec4 shapeDim;
/**
 * Texture properties
 * imgProj: [x: number, y: number, scale: number, isDragging: 0 | 1];
 */
uniform vec4 imgProj; 

const float M_PI = 3.1415926535897932384626433832795;

// atan(y,x), sigh
// posArcLength returns a number between 0 and 2PI, the angle of the unit vector
// u and the x-axis
float posArcLength(vec2 u) {
    vec2 a = abs(u);

    // To workaround numerical imprecision (ugly seem when sampling)
    // we need to pick either acos or asin (these have high precision for small numbers)
    float r = a.x < a.y
        ? acos(a.x) 
        : asin(a.y);

    return u.x < 0.0
        ? u.y < 0.0
            ? M_PI + r
            : M_PI - r
        : u.y < 0.0
            ? 2.0 * M_PI - r
            : r;
}


// Cone at world origin with radi R1, R2 and height H
// dim = (R1, R2, H, 1/H)
// ray defined q = ro + t * rd
//
// outputs 3 floats:
// uv texture coordinates
// front-hit: 1, no-hit: 0
vec3 coneIntersect(in vec3 ro, in vec3 rd, vec4 dim) {
    float R1 = dim.x;
    float R2 = dim.y;
    float H = dim.z;
    float invH = dim.w;
    float dR = R2 - R1;

    /*
    Point q on ray is defined as
    q = ro + t * rd

    Point q is on cone if

    |q.xy| = (q.z * invH + 0.5) * dR + R1
    and
    |q.z| <= hH

    Let (rox,roy,roz) = ro
    (rdx,rdy,rdz) = rd

    Then
    |q.xy| = sqrt(qx^2 + qy^2) = sqrt((rox+t*rdx)^2 + (roy+t*rdy)^2)

    must be equal to

    ((roz+t*rdz) * invH + 0.5) * dR + R1

    Expanding this gives

    dR*invH*rdz * t + dR*invH*roz + 0.5*dR + R1

    Let A = dR*invH*rdz
    B = dR*invH*roz + 0.5*dR + R1

    We now have to solve for t

    sqrt((rox+t*rdx)^2 + (roy+t*rdy)^2) = A*t + B

    Squaring both sides gives

    (rox+t*rdx)^2 + (roy+t*rdy)^2 = (A*t + B)^2

    This becomes a simple quadratic equation:

    (rox+t*rdx)^2 + (roy+t*rdy)^2 - (A*t + B)^2 = 0

    a*t^2 + b*t + c = 0

    with

    a = rdx*rdx + rdy*rdy - A*A
    b = 2*(rdx*rox + rdy*roy - A*B)
    c = rox*rox + roy*roy - B*B
    */

    float dRiH = dR * invH;
    float A = dRiH * rd.z;
    float B = dRiH * ro.z + 0.5 * dR + R1;

    float a = dot(vec3(rd.xy, -A), vec3(rd.xy, A));
    float b = dot(vec3(rd.xy, A), vec3(ro.xy, -B)) * 2.0;
    float c = dot(vec3(ro.xy, B), vec3(ro.xy, -B));

    // Solution of quadratic equation is (-b ± sqrt(b*b - 4*a*c))/(2*a)
    float d = b * b - 4.0 * a * c;
    if (d < 0.0) return vec3(0, 0, 0);

    float hh = H * 0.5;

    // we have two solutions, -sqrt(d) and +sqrt(d)
    // we take the one closest to the camera (pointing in the negative Y
    // direction)
    float t = (-b + sqrt(d)) / (2.0 * a);
    vec3 q = ro + t * rd;
    float y = q.z;

    float side = 1.0;

    // Only needed for double-sided debugging, comment out otherwise.
    /*
    if (abs(y) > hh) {
    t = (-b - sqrt(d))/(2.0*a);
    q = ro + t * rd;
    // y = dot(q - co, cd);
    y = q.z;
    side = -1.0;
    }
    */

    if (abs(y) > hh)
        return vec3(0, 0, 0);

    float R = mix(R1, R2, y * invH + 0.5);

    // compute local normalized coordinates on base.
    float rad = posArcLength(q.xy / vec2(-R, R));
    // float rad = 4.0;
    return vec3(rad * R1, y + hh, side);
}

void main() {

    int debug = 2;

    if (debug == 1) {
        // Show image over screen
        vec4 spreadColor = texture2D(texture, texcoord.xy);
        gl_FragColor = spreadColor;

    } else if (debug == 2) {
        // Output red when ray hits cone
        vec3 rayDir = vec3(texcoord.xy, 1.0) * eyeMat;
        vec3 hit = coneIntersect(eyePos, rayDir, shapeDim);
        vec4 redColor = vec4(1.0, 0.0, 0.0, 1.0);
        gl_FragColor = hit.z * redColor;

    } else {

        vec3 rayDir = vec3(texcoord.xy, 1.0) * eyeMat;
        vec3 hit = coneIntersect(eyePos, rayDir, shapeDim);

        // Overlay checkerboard pattern to help placement of transparent texture area
        vec2 uv = hit.xy * imgProj.z + imgProj.xy;
        vec2 ixy = floor(uv / 5.0);
        int mx = mod(ixy.x, 10.0) >= 5.0 ? 1 : 0;
        int my = mod(ixy.y, 10.0) >= 5.0 ? 1 : 0;
        float m = mx + my == 1 ? 0.75 : 0.5; // (mx ^ my) * 0.25 + 0.5; XOR not suppored on numbers

        vec4 spreadColor = texture2D(texture, uv);
        vec4 patternColor = vec4(m, m, m, imgProj.w);
        vec4 combinedColor = mix(patternColor, spreadColor, spreadColor.a);

        // z is 1 for intersection, 0 otherwise.
        gl_FragColor = hit.z * combinedColor;
        
    }
}