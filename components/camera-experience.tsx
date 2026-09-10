'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, RotateCcw, MoveHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { Group } from 'three';

export default function CameraExperience({ calm }: { calm: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const settings = useRef({ spread: .7, x: .12, y: -.96 });
  const redraw = useRef<() => void>(() => {});
  const [interactive, setInteractive] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [spread, setSpread] = useState(70);

  useEffect(() => {
    settings.current.spread = spread / 100;
    redraw.current();
  }, [spread]);

  useEffect(() => {
    if (!interactive || !host.current) return;
    let cancelled = false;
    let dispose = () => {};
    setReady(false);
    setFailed(false);
    async function start() {
      const [T, { RoundedBoxGeometry }, { RoomEnvironment }] = await Promise.all([
        import('three'),
        import('three/addons/geometries/RoundedBoxGeometry.js'),
        import('three/addons/environments/RoomEnvironment.js'),
      ]);
      if (cancelled || !host.current) return;
      const container = host.current;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      renderer.setClearColor(0x20060e, 0);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.55;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      container.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(32, 1, .1, 100);
      camera.position.set(0, .12, 10.3);
      const room = new RoomEnvironment();
      const pmrem = new T.PMREMGenerator(renderer);
      const environment = pmrem.fromScene(room, .06);
      scene.environment = environment.texture;
      room.dispose();
      pmrem.dispose();
      const root = new T.Group();
      root.position.set(.4, -.12, 0);
      root.rotation.set(.12, -.96, -.08);
      scene.add(root);
      const black = new T.MeshStandardMaterial({ color: 0x202023, metalness: .78, roughness: .3 });
      const leather = new T.MeshStandardMaterial({ color: 0x111114, metalness: .12, roughness: .88 });
      const metal = new T.MeshStandardMaterial({ color: 0xa39781, metalness: 1, roughness: .22 });
      const gold = new T.MeshStandardMaterial({ color: 0xd5a87b, metalness: .94, roughness: .25 });
      const sensor = new T.MeshPhysicalMaterial({ color: 0x8162a9, metalness: .85, roughness: .06, clearcoat: 1 });
      const glass = new T.MeshPhysicalMaterial({ color: 0xbcc5ec, metalness: .15, roughness: .04, transparent: true, opacity: .36, clearcoat: 1, side: T.DoubleSide });
      const glassPurple = new T.MeshPhysicalMaterial({ color: 0xa86ed5, metalness: .35, roughness: .09, transparent: true, opacity: .53, clearcoat: 1, side: T.DoubleSide });
      const box = (w: number, h: number, d: number, material: typeof black, x: number, y: number, z: number, radius = .08) => {
        const mesh = new T.Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), material);
        mesh.position.set(x, y, z); root.add(mesh); return mesh;
      };
      box(2.25, 1.4, .66, black, .18, 0, -.65, .14);
      box(2.2, .92, .69, leather, .18, -.08, -.64, .09);
      box(.53, 1.4, .87, leather, 1.13, -.02, -.5, .16);
      box(.73, .36, .57, black, -.08, .78, -.64, .09);
      box(.4, .19, .12, metal, -.08, .95, -.64, .025);
      box(.55, .21, .13, leather, -.08, .8, -.96, .02);
      box(1.21, .8, .04, sensor, -.05, -.07, -1.005, .04);
      box(.52, .37, .025, sensor, -.13, -.05, -.284, .01);

      const ring = (radius: number, tube: number, material: typeof black, parent: Group, z: number) => {
        const mesh = new T.Mesh(new T.TorusGeometry(radius, tube, 10, 72), material);
        mesh.position.z = z; parent.add(mesh); return mesh;
      };
      const mount = new T.Group(); mount.position.set(-.13, -.05, -.26); root.add(mount);
      ring(.61, .065, metal, mount, 0); ring(.7, .015, black, mount, 0);
      for (let i = 0; i < 8; i++) {
        const screw = new T.Mesh(new T.CylinderGeometry(.026, .026, .012, 12), gold);
        screw.rotation.x = Math.PI / 2; screw.position.set(Math.cos(i * Math.PI / 4) * .66, Math.sin(i * Math.PI / 4) * .66, .04); mount.add(screw);
      }
      for (const [x, radius] of [[.72,.19],[-.75,.22]] as const) {
        const dial = new T.Mesh(new T.CylinderGeometry(radius, radius, .13, 48), black);
        dial.position.set(x,.78,-.63); root.add(dial);
        const rim = new T.Mesh(new T.TorusGeometry(radius,.016,8,48),metal);
        rim.rotation.x = Math.PI / 2; rim.position.set(x,.85,-.63); root.add(rim);
      }
      box(.14,.055,.2,gold,.69,.88,-.39,.025);
      for (let i=0; i<3; i++) box(.11,.1,.04,black,.89,.27-i*.23,-1.01,.03);

      const pieces: Group[] = [];
      for (let i=0; i<7; i++) {
        const piece = new T.Group(); piece.position.x = -.13; piece.position.y = -.05;
        const radius = .59 + i*.017;
        if (i===1 || i===3 || i===5) {
          const optic = new T.Mesh(new T.SphereGeometry(radius, 48, 24), i===3 ? glassPurple : glass);
          optic.scale.z=.14; piece.add(optic); ring(radius,.017,metal,piece,0);
        } else {
          const depth = i===6 ? .4 : .19;
          const barrel = new T.Mesh(new T.CylinderGeometry(radius,radius,depth,72,1,true),black);
          barrel.rotation.x=Math.PI/2; piece.add(barrel);
          ring(radius,.018,metal,piece,depth/2); ring(radius,.018,metal,piece,-depth/2);
          ring(radius+.007,.009,gold,piece,depth/2-.035);
          for(let rib=0;rib<64;rib++) {
            const angle = rib*Math.PI/32;
            const ridge = new T.Mesh(new T.BoxGeometry(.014,.025,depth*.77), black);
            ridge.position.set(Math.cos(angle)*(radius+.013),Math.sin(angle)*(radius+.013),0);
            ridge.rotation.z=angle+Math.PI/2;piece.add(ridge);
          }
          if(i===6){
            const optic=new T.Mesh(new T.SphereGeometry(radius*.87,48,24),glassPurple);optic.scale.z=.13;optic.position.z=.07;piece.add(optic);
          }
        }
        root.add(piece); pieces.push(piece);
      }
      const key = new T.DirectionalLight(0xffe3c2,5); key.position.set(-4,5,6); scene.add(key);
      const rim = new T.DirectionalLight(0xd98dba,3); rim.position.set(5,1,-3); scene.add(rim);
      const fill = new T.DirectionalLight(0xd8e7ff,2); fill.position.set(-3,-1,4); scene.add(fill);
      let frame=0, visible=true, currentSpread=settings.current.spread;
      const render = () => {
        frame=0;
        if(cancelled || !visible || document.hidden) return;
        const s=settings.current;
        const ease=calm?1:.11;
        currentSpread+=(s.spread-currentSpread)*ease;
        root.rotation.x+=(s.x-root.rotation.x)*ease;
        root.rotation.y+=(s.y-root.rotation.y)*ease;
        pieces.forEach((piece,i)=>{piece.position.z = -.04+i*.19 + currentSpread*i*.33;piece.rotation.z=currentSpread*i*.03;});
        root.position.x=.4+currentSpread*.48;
        renderer.render(scene,camera);
        if(Math.abs(currentSpread-s.spread)+Math.abs(root.rotation.x-s.x)+Math.abs(root.rotation.y-s.y)>.001) frame=requestAnimationFrame(render);
      };
      const schedule=()=>{if(!frame && visible && !document.hidden)frame=requestAnimationFrame(render);};
      redraw.current=schedule;
      const resize=()=>{
        const w=container.clientWidth,h=container.clientHeight;
        if(!w||!h)return;
        renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w/h<1.25?12.2:10.3;camera.updateProjectionMatrix();schedule();
      };
      const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(container);
      const viewObserver=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;}},{threshold:0});viewObserver.observe(container);
      const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();};
      document.addEventListener('visibilitychange',visibility);
      const lost=(event:Event)=>{event.preventDefault();setFailed(true);setReady(false);};
      renderer.domElement.addEventListener('webglcontextlost',lost);
      resize();render();setReady(true);
      dispose=()=>{
        cancelAnimationFrame(frame);sizeObserver.disconnect();viewObserver.disconnect();document.removeEventListener('visibilitychange',visibility);
        renderer.domElement.removeEventListener('webglcontextlost',lost);
        scene.traverse(obj=>{if(obj instanceof T.Mesh){obj.geometry.dispose();const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(m=>m.dispose());}});
        environment.dispose();renderer.dispose();renderer.domElement.remove();redraw.current=()=>{};
      };
    }
    start().catch(()=>{if(!cancelled){setFailed(true);setReady(false);}});
    return ()=>{cancelled=true;dispose();};
  }, [interactive, calm]);

  const drag = useRef<{ x:number; y:number; rotationX:number; rotationY:number } | null>(null);
  const reset=()=>{settings.current={spread:.7,x:.12,y:-.96};setSpread(70);redraw.current();};
  return <>
    <div className={`camera-stage ${interactive&&ready?'is-exploring':''}`}>
      <img src="/images/camera.webp" alt="A cinema camera with its optical lens elements suspended in an exploded view" width="1672" height="941" loading="lazy" />
      {interactive&&<div ref={host} className="camera-canvas" tabIndex={ready?0:-1} role="group" aria-label="Interactive 3D camera. Drag horizontally to rotate, or use arrow keys. Use the slider below to separate the lens."
        onPointerDown={event=>{if(!ready)return;drag.current={x:event.clientX,y:event.clientY,rotationX:settings.current.x,rotationY:settings.current.y};event.currentTarget.setPointerCapture(event.pointerId);}}
        onPointerMove={event=>{if(!drag.current)return;settings.current.y=drag.current.rotationY+(event.clientX-drag.current.x)*.008;settings.current.x=Math.max(-.7,Math.min(.7,drag.current.rotationX+(event.clientY-drag.current.y)*.003));redraw.current();}}
        onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}
        onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;event.preventDefault();if(event.key==='Home')reset();else{settings.current.y+=event.key==='ArrowLeft'?-.15:event.key==='ArrowRight'?.15:0;settings.current.x=Math.max(-.7,Math.min(.7,settings.current.x+(event.key==='ArrowUp'?-.1:event.key==='ArrowDown'?.1:0)));redraw.current();}}}
      />}
    </div>
    <div className="camera-controls dark">
      {!interactive?<Button className="explore-button" variant="outline" onClick={()=>setInteractive(true)}><Box size={17}/> Explore in 3D <span>↗</span></Button>:<>
        {ready&&!failed?<><div className="camera-slider"><label id="spread-label">ASSEMBLED</label><Slider aria-labelledby="spread-label" aria-label="Lens separation" value={[spread]} min={0} max={100} onValueChange={value=>setSpread(Array.isArray(value)?value[0]:value)}/><span>EXPLODED</span></div><Button variant="ghost" size="icon" className="camera-icon" onClick={reset} aria-label="Reset camera view"><RotateCcw size={16}/></Button></>:<p role="status">{failed?'3D is unavailable on this device. Enjoy the cinematic view.':'Preparing your camera…'}</p>}
        <Button variant="ghost" size="icon" className="camera-icon" onClick={()=>{setInteractive(false);setReady(false);}} aria-label="Return to cinematic camera view"><X size={17}/></Button>
      </>}
    </div>
    {interactive&&ready&&!failed&&<span className="camera-drag-hint"><MoveHorizontal size={15}/> DRAG TO EXPLORE · ARROW KEYS TO ROTATE</span>}
  </>;
}
