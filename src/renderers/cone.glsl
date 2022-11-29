uniform shader spread;

// The center of the cone is always at (0,0,0) with world Z-axis its height
// axis, and world X, Y axis for the base.
uniform vec3 eyePos; // position of camera
uniform mat3 eyeMat; // how to convert fragment (x,y,0) canvas points to camera ray directions
uniform vec4 shapeDim; // top radius, bottom radius, shape height, 1/shape height
uniform vec4 imgProj; // texture coordinate scaling factor, offset, dragging?

const float M_PI = 3.1415926535897932384626433832795;

// SkiaSharp 2.88 is missing atan(y,x), sigh
// posArcLength returns a number between 0 and 2PI, the angle of the unit vector
// u and the x-axis
float posArcLength(vec2 u) {
  vec2 a = abs(u);

  // To workaround numerical imprecision (ugly seem when sampling)
  // we need to pick either acos or asin (these have high precision for small
  // numbers)
  float r = a.x < a.y ? acos(a.x) : asin(a.y);

  return u.x < 0 ? u.y < 0 ? M_PI + r : M_PI - r : u.y < 0 ? 2 * M_PI - r : r;
}

// cone at world origin with radii R1, R2 and height H
//
// dim = (R1, R2, H, 1/H)
//
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
  float b = dot(vec3(rd.xy, A), vec3(ro.xy, -B)) * 2;
  float c = dot(vec3(ro.xy, B), vec3(ro.xy, -B));

  // Solution of quadratic equation is (-b ± sqrt(b*b - 4*a*c))/(2*a)
  float d = b * b - 4 * a * c;
  if (d < 0)
    return vec3(0);
    
  float hh = H * 0.5;

  // we have two solutions, -sqrt(d) and +sqrt(d)
  // we take the one closest to the camera (pointing in the negative Y
  // direction)
  float t = (-b + sqrt(d)) / (2 * a);
  vec3 q = ro + t * rd;
  float y = q.z;

   float side = 1;

  // Only needed for double-sided debugging, comment out otherwise.
  /*
  if (abs(y) > hh) {
    t = (-b - sqrt(d))/(2*a);
    q = ro + t * rd;
    // y = dot(q - co, cd);
    y = q.z;
    side = -1;
  }
  */

  if (abs(y) > hh)
    return vec3(0);
    
  float R = mix(R1, R2, y * invH + 0.5);
    
  // compute local normalized coordinates on base.
  float rad = posArcLength(q.xy / vec2(-R, R));
  return vec3(rad * R1, y + hh, side);
}

vec3 sphereIntersect(in vec3 ro, in vec3 rd, float r) {
    float a = dot(rd,rd);
    float b = 2*dot(ro, rd);
    float c = dot(ro, ro) - r*r;
    float d = b * b - 4 * a * c;
    return vec3(d > 0 ? 1 : 0);
}

half4 main(vec2 screenPos) {
  vec3 rayDir = eyeMat * vec3(screenPos, 1);
  
  // vec3 hit = sphereIntersect(eyePos, rayDir, 141);
  vec3 hit = coneIntersect(eyePos, rayDir, shapeDim);
  
    // Overlay checkerboard pattern to help placement of transparent texture area
    vec2 uv = hit.xy * imgProj.z + imgProj.xy;
    int2 ixy = floor(uv / 5);
    int mx = ixy.x % 10 >= 5 ? 1 : 0;
    int my = ixy.y % 10 >= 5 ? 1 : 0;
    float m = (mx ^ my) * 0.25 + 0.5;
    
    vec4 spreadColor = sample(spread, uv);
    vec4 patternColor = vec4(m, m, m, imgProj.w);
    vec4 combinedColor = mix(patternColor, spreadColor, spreadColor.a);

  // z is 1 for intersection, 0 otherwise.
  return hit.z * combinedColor;
}

