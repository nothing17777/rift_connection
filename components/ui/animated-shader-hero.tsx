'use client';

import React, { useRef, useEffect } from 'react';

interface HeroProps {
  trustBadge?: { text: string; icons?: React.ReactNode[] };
  headline: { line1: string; line2: string };
  subtitle: string;
  buttons?: {
    primary?: { text: string; onClick?: () => void };
    secondary?: { text: string; onClick?: () => void };
  };
  className?: string;
}

function useShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2');
    if (!gl) return;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const vsSrc = `#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){ gl_Position = position; }`;
    const fsSrc = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(in vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+1.);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;mat2 m=mat2(1.,-.5,.2,1.2);for(int i=0;i<5;i++){t+=a*noise(p);p*=2.*m;a*=.5;}return t;}
float clouds(vec2 p){float d=1.,t=.0;for(float i=.0;i<3.;i++){float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);t=mix(t,d,a);d=a;p*=2./(i+1.);}return t;}
void main(void){
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0.039,0.055,0.102);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for(float i=1.;i<12.;i++){
    uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;float d=length(p);
    col+=.00125/d*(vec3(0.784*sin(i)+0.5,0.659*cos(i*0.7)+0.4,0.294)+0.3);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*0.15,bg*0.1,bg*0.05),d*0.5);
  }
  O=vec4(col,1);
}`;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'resolution');
    const uTime = gl.getUniformLocation(prog, 'time');
    let raf: number;
    const loop = (now: number) => {
      gl.clearColor(0.039, 0.055, 0.102, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return canvasRef;
}

const AnimatedShaderHero: React.FC<HeroProps> = ({ trustBadge, headline, subtitle, buttons, className = '' }) => {
  const canvasRef = useShaderBackground();
  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`} style={{ background: '#0a0e1a' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.01) 0,rgba(255,255,255,0.01) 1px,transparent 1px,transparent 4px)', opacity: 0.4, zIndex: 1 }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4" style={{ zIndex: 10 }}>
        {trustBadge && (
          <div className="mb-8" style={{ animation: 'riftFadeDown 0.8s ease-out forwards' }}>
            <div className="flex items-center gap-3 px-6 py-2.5 rounded font-rajdhani text-sm font-semibold tracking-widest uppercase" style={{ background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.35)', color: '#c8a84b', backdropFilter: 'blur(8px)' }}>
              <span>{trustBadge.text}</span>
            </div>
          </div>
        )}
        <div className="text-center space-y-5 max-w-5xl mx-auto">
          <h1 className="font-cinzel text-5xl md:text-7xl lg:text-8xl font-bold" style={{ background: 'linear-gradient(180deg,#f0d080 0%,#c8a84b 50%,rgba(200,168,75,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: '0 0 60px rgba(200,168,75,0.4)', animation: 'riftFadeUp 0.8s ease-out 0.2s both' }}>
            {headline.line1}
          </h1>
          <h2 className="font-cinzel text-2xl md:text-4xl lg:text-5xl font-bold" style={{ color: '#e8e0cc', letterSpacing: '0.2em', animation: 'riftFadeUp 0.8s ease-out 0.4s both' }}>
            {headline.line2}
          </h2>
          <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#c8a84b,transparent)', maxWidth: '320px', margin: '0 auto', animation: 'riftFadeUp 0.8s ease-out 0.5s both' }} />
          <p className="font-rajdhani text-lg md:text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: 'rgba(232,224,204,0.8)', animation: 'riftFadeUp 0.8s ease-out 0.6s both' }}>
            {subtitle}
          </p>
          {buttons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8" style={{ animation: 'riftFadeUp 0.8s ease-out 0.8s both' }}>
              {buttons.primary && (
                <button onClick={buttons.primary.onClick} className="font-rajdhani font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5" style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#c8a84b,#f0d080)', color: '#0a0e1a', borderRadius: '4px', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: '0 0 20px rgba(200,168,75,0.3)', border: 'none' }}>
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button onClick={buttons.secondary.onClick} className="font-rajdhani font-semibold cursor-pointer transition-all duration-200 hover:bg-[rgba(200,168,75,0.1)] hover:-translate-y-0.5" style={{ padding: '14px 36px', background: 'transparent', color: '#c8a84b', borderRadius: '4px', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid rgba(200,168,75,0.4)', backdropFilter: 'blur(8px)' }}>
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes riftFadeDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes riftFadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default AnimatedShaderHero;
