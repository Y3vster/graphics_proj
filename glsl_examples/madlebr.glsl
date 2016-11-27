#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

#define ITERATIONS 50

vec3 hsvtorgb (vec3 hsv){
	float i = hsv.x * 6.;
	float ff = fract(i);
	int ii = int(i);
	
	vec4 d = hsv.z * vec4(1., 1. - hsv.y, 1. - hsv.y * ff, 1. - hsv.y * (1. - ff));
	
	if (ii == 0){
		return d.xwy;
	}else if (ii == 1){
		return d.zxy;
	}else if (ii == 2){
		return d.yxw;
	}else if (ii == 3){
		return d.yzx;
	}else if (ii == 4){
		return d.wyx;
	}else{
		return d.xyz;
	}
}

void main( void ) {
	vec2 pos = gl_FragCoord.xy / resolution * 4. - 2.;
	pos.y *= resolution.y / resolution.x;
	
	
	int maxiters = int(float(ITERATIONS) * fract(time / 5.));
	int ii = 0;
	float stop = 0.;
	vec2 p = pos;
	
	for (int i = 0; i < ITERATIONS; i++){
		if (i >= maxiters){
			break;
		}
		
		if (dot(p, p) >= 4.){
			ii = i;
			stop = 1.;
			
			break;	
		}
		
		p = vec2(p.x * p.x - p.y * p.y, 2. * p.x * p.y) + pos;
	}
	
	gl_FragColor = vec4(hsvtorgb(vec3(float(ii) / float(maxiters), 1., stop)), 1.);
}