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


// Cone with following dimentions
// shapeDimentions = vec4(topRadius, bottomRadius, coneHeight, 1/coneHeight)
//
// output:
// vec3(
//   u: texture coordinates x
//   v: texture coordinates y
//   hit: 0.0 (no-hit) or 1.0 (hit)
// )
vec3 coneIntersect(in vec3 rayOri, in vec3 rayDir, vec4 shapeDimentions) {
    float topRadius = shapeDimentions.x;
    float bottomRadius = shapeDimentions.y;
    float coneHeight = shapeDimentions.z;
    float invConeHeight = shapeDimentions.w;
    float dRadius = bottomRadius - topRadius; // Positive if bottom radius is larger

    /*
    A point on the ray can be defined as:
    pointOnRay = rayOrigin + rayDirection * rayDistance

    Point pointOnRay is on cone if

    Side view:           | z
                     ____|____
                     \   |   / Cone
    [cam]<------------\--|--/ ------ x (ray)
                       \_|_/
                         |

    Top view:
                       __|__ 
                      /  |  \
    [cam]<-----------|---°---|---- x (ray)
                      \__|_ /
                         |
                         | y

    To intersect:
    -------------
    * The height must be between -coneHeight/2 and coneHeight/2 (center of cone is on origin)
    |pointOnRay.z| <= coneHeight / 2

    * The intersection of the ray must be on a circle around the origin:
    rayDistanceFormOrigin = sqrt(pointOnRay.x ^ 2 + pointOnRay.y ^2)
    rayDistanceFormOrigin = sqrt((rayOrigin.x + rayDirection.x * rayDistance)^2 + (rayOrigin.y + rayDirection.y * rayDistance)^2)

    * The ray must be at the distance of the radius at that height (we can interpolate from top to bottom radius)
    radiusAtZ = (pointOnRay.z / coneHeight + 0.5) * deltaRadius + topRadius 
   
    When we replace pointOnRay with ray formula:
    > radiusAzZ = ((rayOrigin.z + rayDirection.z * rayDistance) / coneHeight + 0.5) * deltaRadius + topRadius
    > radiusAzZ = (rayOrigin.z / coneHeight + rayDirection.z * rayDistance / coneHeight + 0.5) * deltaRadius + topRadius
    > radiusAzZ = rayOrigin.z * deltaRadius / coneHeight + rayDirection.z * rayDistance * deltaRadius / coneHeight + 0.5 * deltaRadius + topRadius

    Groep parts to A en B

    > radiusAzZ = (
        rayOrigin.z * deltaRadius / coneHeight +                    > B
        rayDirection.z * rayDistance * deltaRadius / coneHeight +   > A - rayDistance
        0.5 * deltaRadius +                                         > B
        topRadius                                                   > B
    )

    A = rayDirection.z * deltaRadius / coneHeight
    B = rayOrigin.z * deltaRadius / coneHeight + 0.5 * deltaRadius + topRadius
    radiusAzZ = A*t + B

    We now have to solve for rayDistance
    rayDistanceFormOrigin = radiusAzZ
    sqrt((rayOrigin.x + rayDirection.x * rayDistance)^2 + (rayOrigin.y + rayDirection.y * rayDistance)^2) = A * rayDistance + B

    Squaring both sides gives
    (rayOrigin.x + rayDirection.x * rayDistance)^2 + (rayOrigin.y + rayDirection.y * rayDistance)^2 = (A * rayDistance + B)^2

    This becomes a simple quadratic equation:
    (rayOrigin.x + rayDirection.x * rayDistance)^2 + (rayOrigin.y + rayDirection.y * rayDistance)^2 - (A * rayDistance + B)^2 = 0

    (a * rayDistance)^2 + b * rayDistance + c = 0
    with
        a = rayDirection.x ^2 + rayDirection.y ^2 - A ^2
        b = 2 * (rayDirection.x * rayOrigin.x + rayDirection.y * rayOrigin.y - A * B)
        c = rayOrigin.x ^2 + rayOrigin.y ^2 - B^2
    */
 
    vec3 rayOrigin = vec3(-rayOri.z, -rayOri.x, rayOri.y);
    vec3 rayDirection = vec3(-rayDir.z, -rayDir.x, rayDir.y);
    // vec3 rayOrigin = rayOri;
    // vec3 rayDirection = rayDir;

    float A = rayDirection.z * dRadius * invConeHeight;
    float B = rayOrigin.z * dRadius * invConeHeight + 0.5 * dRadius + topRadius;

    // dot => v0.x * v1.x + v0.y * v1.y + v0.z
    float a = dot(vec3(rayDirection.xy, -A), vec3(rayDirection.xy, A));
    float b = dot(vec3(rayDirection.xy, A), vec3(rayOrigin.xy, -B)) * 2.0;
    float c = dot(vec3(rayOrigin.xy, B), vec3(rayOrigin.xy, -B));

    // Solution of quadratic equation is (-b ± sqrt(b*b - 4*a*c))/(2*a)
    float d = b * b - 4.0 * a * c;
    if (d < 0.0) return vec3(0, 0, 0); // prevent the SQRT of a negative number

    // we have two solutions, -sqrt(d) and +sqrt(d)
    // we take the one closest to the camera (pointing in the negative Y
    // direction)
    float hitDistance = (-b + sqrt(d)) / (2.0 * a);
    vec3 rayConeIntersection = rayOrigin + hitDistance * rayDirection;
    float y = rayConeIntersection.z;

    float side = 1.0;
    float halfConeHeight = coneHeight * 0.5;

    // Only needed for double-sided debugging, comment out otherwise.
    /*
    if (abs(y) > halfConeHeight) {
        hitDistance = (-b - sqrt(d))/(2.0*a);
        rayConeIntersection = rayOrigin + rayDirection * hitDistance;
        // y = dot(rayConeIntersection - co, cd);
        y = rayConeIntersection.z;
        side = -1.0;
    }
    */

// CURRENTLY THE RETURN IS HERE!--------------------------------------------------------------------
    // y must be between +coneHeight / 2 and coneHeight / 2
    if (abs(y) > halfConeHeight)
        return vec3(0, 0, 0);

    float R = mix(topRadius, bottomRadius, y * invConeHeight + 0.5);

    // compute local normalized coordinates on base.
    float rad = posArcLength(rayConeIntersection.xy / vec2(-R, R));
    // float rad = 4.0;
    return vec3(rad * topRadius, y + halfConeHeight, side);
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