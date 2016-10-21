#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

#define MAX_ITERATIONS 100

uniform float time;
uniform vec2 resolution;

vec2 complexPower(vec2 z, float power) {
	float r = sqrt(z.x * z.x + z.y * z.y);
	float theta = atan(z.y, z.x);
	
	return vec2(pow(r, power) * cos(power * theta), pow(r, power) * sin(power * theta));
}

void main() {
	vec2 position = vec2(0, 0);
	float zoom = 1.0;
	float pwr = 2.0;
	
	vec2 normalizedPos = gl_FragCoord.xy / resolution.xy;
	
	float cRe = (normalizedPos.x * 3.0 - 2.0) + position.x;
	float cIm = (normalizedPos.y * 2.0 - 1.0) + position.y;
	
	cRe /= zoom;
	cIm /= zoom;
	
	float re = 0.0;
	float im = 0.0;
	
	int iterations = MAX_ITERATIONS;
	for (int i = 0; i < MAX_ITERATIONS; ++i) {
		vec2 new = complexPower(vec2(re, im), pwr);
		float newRe = new.x + cRe;
		float newIm = new.y + cIm;
		
		re = newRe;
		im = newIm;
		
		if (re * re + im * im >= 4.0) {
			iterations = i;
			break;
		}
	}
	
	gl_FragColor = vec4(float(iterations) / float(MAX_ITERATIONS), 0.0, 0.0, 1.0);
}