'use client';
import { useEffect, useRef, useState } from 'react';
import { useMotion } from '@/components/motion-provider';

// Animate the supplied photograph locally; architecture and people remain anchored.
const fragment = `
uniform sampler2D photo;
uniform float time;
uniform vec2 crop;
uniform vec2 align;
varying vec2 vUv;
float zone(vec2 p, vec2 centre, vec2 radius) {
  return 1.0-smoothstep(.35,1.0,length((p-centre)/radius));
}
void main() {
  vec2 uv=vUv*crop+(1.0-crop)*align;
  vec2 p=vec2(uv.x,1.0-uv.y);
  vec3 source=texture2D(photo,uv).rgb;
  // Small floral regions only: no fabric, ground or architecture displacement.
  float flowers=zone(p,vec2(.518,.270),vec2(.052,.15));
  flowers=max(flowers,zone(p,vec2(.805,.229),vec2(.040,.060)));
  flowers=max(flowers,zone(p,vec2(.921,.489),vec2(.041,.16)));
  flowers=max(flowers,zone(p,vec2(.49,.778),vec2(.045,.034)));
  vec2 offset=vec2(sin(time*.85+p.y*14.0)*.0026,cos(time*.72+p.x*12.0)*.0012)*flowers;
  // Work in displayed colour space: the photo texture is sampled in linear light.
  // Lock only burgundy pixels, not neighbouring cream blossoms.
  vec3 colour=pow(max(source,vec3(0.0)),vec3(1.0/2.2));
  float burgundy=smoothstep(.06,.16,colour.r-colour.g)*(1.0-smoothstep(.25,.48,colour.g));
  float blossom=smoothstep(.30,.58,min(colour.r,colour.g));
  offset*=blossom*(1.0-smoothstep(.2,.7,burgundy));
  // Extend motion along the hanging silk, protecting adjacent burgundy structure.
  float hangingSilk=zone(p,vec2(.642,.153),vec2(.085,.053));
  hangingSilk=max(hangingSilk,zone(p,vec2(.574,.346),vec2(.024,.15)));
  hangingSilk=max(hangingSilk,zone(p,vec2(.538,.537),vec2(.034,.12)));
  hangingSilk=max(hangingSilk,zone(p,vec2(.451,.678),vec2(.082,.077)));
  hangingSilk=max(hangingSilk,zone(p,vec2(.824,.348),vec2(.021,.077)));
  hangingSilk=max(hangingSilk,zone(p,vec2(.922,.670),vec2(.023,.09)));
  hangingSilk=max(hangingSilk,zone(p,vec2(.947,.765),vec2(.037,.049)));
  vec2 silkOffset=vec2(sin(time*.72+p.y*8.0)*.0025,sin(time*.85+p.x*12.0)*.0009)*hangingSilk;
  vec3 silkDestination=pow(max(texture2D(photo,uv+silkOffset).rgb,vec3(0.0)),vec3(1.0/2.2));
  float destinationBurgundy=smoothstep(.06,.16,silkDestination.r-silkDestination.g)*(1.0-smoothstep(.25,.48,silkDestination.g));
  offset+=silkOffset*blossom*(1.0-smoothstep(.15,.6,max(burgundy,destinationBurgundy)));
  // Preserve the existing pooled-fabric and floor-petal movement.
  float floorSilk=zone(p,vec2(.327,.813),vec2(.21,.060));
  floorSilk=max(floorSilk,zone(p,vec2(.432,.920),vec2(.125,.082)));
  floorSilk=max(floorSilk,zone(p,vec2(.175,.844),vec2(.15,.028)));
  float floorPetals=zone(p,vec2(.712,.833),vec2(.019,.017));
  floorPetals=max(floorPetals,zone(p,vec2(.861,.946),vec2(.028,.019)));
  floorPetals=max(floorPetals,zone(p,vec2(.925,.895),vec2(.032,.021)));
  floorPetals=max(floorPetals,zone(p,vec2(.192,.895),vec2(.024,.017)));
  floorPetals=max(floorPetals,zone(p,vec2(.659,.802),vec2(.018,.011)));
  float floorBreeze=sin(time*.72+p.y*8.0);
  offset+=vec2(floorBreeze*.0028,sin(time*.85+p.x*12.0)*.0011)*floorSilk;
  offset+=vec2(sin(time*.72+p.x*18.0)*.0026,abs(sin(time*.72+p.x*18.0))*.0011)*floorPetals;
  gl_FragColor=texture2D(photo,clamp(uv+offset,vec2(.001),vec2(.999)));
  #include <colorspace_fragment>
}`;

export default function WindPortal() {
  const host = useRef<HTMLDivElement>(null);
  const { calm } = useMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!host.current || calm) return;
    const container = host.current;
    let disposed = false;
    let cleanup = () => {};
    import('three').then(THREE => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }); } catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
      const geometry = new THREE.PlaneGeometry(2,2);
      let loaded = false, visible = false, frame = 0, elapsed = 0, last = 0;
      const texture = new THREE.TextureLoader().load('/images/portal.webp', () => { loaded = true; schedule(); }, undefined, () => { setReady(false); });
      texture.colorSpace = THREE.SRGBColorSpace;
      const uniforms = { photo: { value: texture }, time: { value: 0 }, crop: { value: new THREE.Vector2(1,1) }, align: { value: new THREE.Vector2(.56,.52) } };
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}', fragmentShader: fragment, depthTest: false, depthWrite: false });
      scene.add(new THREE.Mesh(geometry,material));
      function paint(now: number) {
        frame = 0; if (disposed || !visible || document.hidden || !loaded) { last = 0; return; }
        if (last) elapsed += Math.min((now-last)/1000,.05); last=now;
        uniforms.time.value = elapsed; renderer.render(scene,camera); setReady(true);
        frame=requestAnimationFrame(paint);
      }
      function schedule() { if (!disposed && !frame && visible && !document.hidden && loaded) frame=requestAnimationFrame(paint); }
      function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame=0; last=0; } else schedule(); }
      const resize = new ResizeObserver(() => {
        const width=container.clientWidth, height=container.clientHeight; if (!width || !height) return;
        renderer.setSize(width,height); const aspect=width/height, imageAspect=1.5;
        uniforms.crop.value.set(Math.min(1,aspect/imageAspect),Math.min(1,imageAspect/aspect));
        uniforms.align.value.set(innerWidth<=700 ? .68 : .56, innerWidth<=700 ? .5 : .52); schedule();
      }); resize.observe(container);
      const observer = new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; if (visible) schedule(); else { cancelAnimationFrame(frame); frame=0; last=0; } }); observer.observe(container);
      document.addEventListener('visibilitychange',visibility);
      cleanup=() => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); document.removeEventListener('visibilitychange',visibility); texture.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove(); };
    }).catch(() => {});
    return () => { disposed=true; cleanup(); setReady(false); };
  },[calm]);
  return <div className={`portal-art wind-portal ${ready && !calm ? 'wind-ready' : ''}`}><img src="/images/portal.webp" alt="Burgundy arches, gently moving ivory silk and white flowers frame a wedding couple at sunset" width="1536" height="1024" fetchPriority="high"/><div className="wind-canvas" ref={host} aria-hidden="true"/></div>;
}
