#extension GL_OES_standard_derivatives : enable

#define GRID_SPACING vec2(1.0)
#define DC_SATUR 0.7
#define DC_GRID_STR 0.1
#define DC_MAG_STR 0.2
#define DC_LINE_PWR 5.0

#ifdef GL_ES
precision mediump float;
#endif

#define M_PI 3.1415926535897932384626433832795
#define M_SQRT3 1.732050807568877

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform int m_vals[10];
uniform int n_vals[10];
uniform int r_vals[10];
uniform int a_vals[10];
uniform int num_terms;

vec2 posn;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float hypot (vec2 z) {
  float t;
  float x = abs(z.x);
  float y = abs(z.y);
  t = min(x, y);
  x = max(x, y);
  t = t / x;
  return (z.x == 0.0 && z.y == 0.0) ? 0.0 : x * sqrt(1.0 + t * t);
}

vec4 domainColoring (vec2 z, vec2 gridSpacing, float saturation, float gridStrength, float magStrength, float linePower) {
  float carg = atan(z.y, z.x);
  float cmod = hypot(z);

  float rebrt = (fract(z.x / gridSpacing.x) - 0.5) * 2.0;
  rebrt *= rebrt;

  float imbrt = (fract(z.y / gridSpacing.y) - 0.5) * 2.0;
  imbrt *= imbrt;

  float grid = 1.0 - (1.0 - rebrt) * (1.0 - imbrt);
  grid = pow(abs(grid), linePower);

  float circ = (fract(log2(cmod)) - 0.5) * 2.0;
  circ = pow(abs(circ), linePower);

  circ *= magStrength;

  vec3 rgb = hsv2rgb(vec3(carg * 0.5 / M_PI, saturation, 0.5 + 0.5 * saturation - gridStrength * grid));
  rgb *= (1.0 - circ);
  rgb += circ * vec3(1.0);
  return vec4(rgb, 1.0);
}


float xhex(){
    return 2.0 * M_PI * posn.x + 2.0 * M_PI * posn.y / M_SQRT3;
}

float yhex(){
    return 4.0 * M_PI * posn.y / M_SQRT3;
}

vec2 unit_complex_fm_angle(float a){
    return vec2(cos(a), sin(a));
}

vec2 polar_to_complex(float r, float a){
    return unit_complex_fm_angle(a) * r;
}

vec2 complex_multiplication(vec2 s, vec2 t) {
    float real      = s.x * t.x - s.y * t.y;
    float imaginary = s.x * t.y + s.y * t.x;
    return vec2(real, imaginary);
}

vec2 hex3_fn() {
    vec2 ans = vec2(0, 0);
    for (int k = 0; k < 10; k++) {
        if (k == num_terms) break;	// workaround to loops being limited to constant expressions
        float m = float(m_vals[k]);
        float n = float(n_vals[k]);

        vec2 p1 = unit_complex_fm_angle(  n      * xhex() +      m  * yhex());
        vec2 p2 = unit_complex_fm_angle(      m  * xhex() - (n + m) * yhex());
        vec2 p3 = unit_complex_fm_angle(-(n + m) * xhex() +  n      * yhex());
        vec2 thisterm = (p1 + p2 + p3) / 3.0;

        thisterm = complex_multiplication(thisterm, polar_to_complex(float(r_vals[k]), float(a_vals[k])));
        ans.x += thisterm.x;
        ans.y += thisterm.y;
    }
    return ans;
}


void main () {
	posn = gl_FragCoord.xy / resolution.xy;
	posn = posn * 2.0 - 1.0;
	posn.x *= resolution.x / resolution.y;

    /* complex */
    vec2 z = hex3_fn();

    gl_FragColor = domainColoring(z, GRID_SPACING, DC_SATUR, DC_GRID_STR, DC_MAG_STR, DC_LINE_PWR);
}


