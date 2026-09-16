'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw, MoveHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { Group } from 'three';

export default function CameraExperience({ calm }: { calm: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const settings = useRef({ spread: .32, x: .32, y: -1.08 });
  const redraw = useRef<() => void>(() => {});
  const [loadScene, setLoadScene] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [spread, setSpread] = useState(0);

  useEffect(() => {
    const scene = host.current?.closest<HTMLElement>('.chapter');
    if (!scene) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoadScene(true); observer.disconnect(); }
    }, { rootMargin: '65% 0px' });
    observer.observe(scene);
    let frame = 0;
    const sync = () => {
      frame = 0;
      const rect = scene.getBoundingClientRect();
      const phase = Math.max(0, Math.min(1, (innerHeight * .9 - rect.top) / (innerHeight * .5 + rect.height * .5)));
      const eased = phase * phase * (3 - 2 * phase);
      setSpread(calm ? 95 : Math.round(18 + eased * 82));
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(sync); };
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', scroll);
    sync();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); removeEventListener('scroll', scroll); removeEventListener('resize', scroll); };
  }, [calm]);

  useEffect(() => {
    settings.current.spread = spread / 100;
    redraw.current();
  }, [spread]);

  useEffect(() => {
    if (!loadScene || !host.current) return;
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
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      container.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-5.55, 5.55, 3.1, -3.1, .1, 100);
      camera.position.set(0, 0, 14);
      const room = new RoomEnvironment();
      const pmrem = new T.PMREMGenerator(renderer);
      const environment = pmrem.fromScene(room, .06);
      scene.environment = environment.texture;
      room.dispose();
      pmrem.dispose();
      const root = new T.Group();
      root.position.set(.4, -.12, 0);
      root.rotation.set(.32, -1.08, .02);
      root.scale.setScalar(1.35);
      scene.add(root);
      const black = new T.MeshStandardMaterial({ color: 0x181819, metalness: .82, roughness: .27 });
      const grainData=new Uint8Array(128*128*4);
      let grainSeed=43;
      for(let i=0;i<128*128;i++){grainSeed=(grainSeed*1664525+1013904223)>>>0;const value=90+(grainSeed%140);grainData.set([value,value,value,255],i*4);}
      const grain=new T.DataTexture(grainData,128,128);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(10,6);grain.needsUpdate=true;
      const leather = new T.MeshStandardMaterial({ color: 0x151314, metalness: .08, roughness: .78, bumpMap:grain, bumpScale:.026 });
      const metal = new T.MeshStandardMaterial({ color: 0xa39781, metalness: 1, roughness: .22 });
      const gold = new T.MeshStandardMaterial({ color: 0xd5a87b, metalness: .94, roughness: .25 });
      const sensor = new T.MeshPhysicalMaterial({ color: 0x8162a9, metalness: .85, roughness: .06, clearcoat: 1 });
      const glass = new T.MeshPhysicalMaterial({ color: 0xefdfd0, metalness: .25, roughness: .035, transparent: true, opacity: .42, clearcoat: 1, iridescence:.35, side: T.DoubleSide });
      const glassPurple = new T.MeshPhysicalMaterial({ color: 0x786390, metalness: .5, roughness: .07, transparent: true, opacity: .65, clearcoat: 1, iridescence:.6, side: T.DoubleSide });
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

      const makeMark=(text:string,width:number,height:number)=>{
        const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
        const ctx=canvas.getContext('2d');if(!ctx)return;
        ctx.fillStyle='#e2d4c2';ctx.font='500 52px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);
        const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
        const mark=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
        mark.position.set(-.71,.47,-.286);root.add(mark);return texture;
      };
      const brandTexture=makeMark('KAATHAL',.49,.123);

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
          for(let tick=0;tick<16;tick++){
            const angle=tick*Math.PI/8;
            const line=new T.Mesh(new T.BoxGeometry(.012,tick%4===0?.055:.026,.009),gold);
            line.position.set(Math.sin(angle)*(radius-.047),Math.cos(angle)*(radius-.047),depth/2+.018);line.rotation.z=-angle;piece.add(line);
          }
          const ridges = new T.InstancedMesh(new T.BoxGeometry(.014,.025,depth*.77), black, 64);
          const placement = new T.Object3D();
          for(let rib=0;rib<64;rib++) {
            const angle = rib*Math.PI/32;
            placement.position.set(Math.cos(angle)*(radius+.013),Math.sin(angle)*(radius+.013),0);
            placement.rotation.z=angle+Math.PI/2;placement.updateMatrix();ridges.setMatrixAt(rib,placement.matrix);
          }
          piece.add(ridges);
          if(i===6){
            const optic=new T.Mesh(new T.SphereGeometry(radius*.87,48,24),glassPurple);optic.scale.z=.13;optic.position.z=.07;piece.add(optic);
          }
          if(i===2){
            for(let blade=0;blade<9;blade++){
              const shape=new T.Shape();shape.moveTo(.11,.15);shape.lineTo(.39,.47);shape.lineTo(.58,.24);shape.lineTo(.32,-.04);shape.closePath();
              const iris=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshStandardMaterial({color:0x32302d,metalness:.7,roughness:.4,side:T.DoubleSide}));
              iris.position.z=.04+blade*.001;iris.rotation.z=blade*Math.PI*2/9;piece.add(iris);
            }
          }
        }
        root.add(piece); pieces.push(piece);
      }
      const key = new T.DirectionalLight(0xffe3c2,3.4); key.position.set(-4,5,6); scene.add(key);
      key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.0008;
      root.traverse(object=>{if(object instanceof T.Mesh){object.castShadow=true;object.receiveShadow=true;}});
      const floor=new T.Mesh(new T.PlaneGeometry(30,30),new T.ShadowMaterial({color:0x060003,opacity:.36}));
      floor.rotation.x=-Math.PI/2;floor.position.y=-1.72;floor.receiveShadow=true;scene.add(floor);
      const rim = new T.DirectionalLight(0xd98dba,2.3); rim.position.set(5,1,-3); scene.add(rim);
      const fill = new T.DirectionalLight(0xffe8ca,1.6); fill.position.set(-3,-1,4); scene.add(fill);
      const silkGeometry=new T.PlaneGeometry(1,1,22,90);
      const silkPosition=silkGeometry.attributes.position;
      for(let i=0;i<silkPosition.count;i++){
        const across=silkPosition.getX(i),t=silkPosition.getY(i)+.5;
        const width=.36+.23*Math.sin(t*Math.PI);
        silkPosition.setXYZ(i,-.8+t*2.5+Math.sin(t*6.28)*.11+across*width,3.72-t*2.28+Math.sin(across*8+t*12)*.025,-.2+Math.sin(t*8)*.18+Math.sin(across*9+t*14)*.07);
      }
      silkGeometry.computeVertexNormals();
      const silk=new T.Mesh(silkGeometry,new T.MeshPhysicalMaterial({color:0xf5e3ce,roughness:.56,metalness:.07,sheen:1,sheenColor:new T.Color(0xfff4df),side:T.DoubleSide}));
      silk.castShadow=true;silk.receiveShadow=true;scene.add(silk);
      let frame=0, visible=true, currentSpread=settings.current.spread, narrow=false;
      const render = () => {
        frame=0;
        if(cancelled || !visible || document.hidden) return;
        const s=settings.current;
        const ease=calm?1:.11;
        currentSpread+=(s.spread-currentSpread)*ease;
        root.rotation.x+=(s.x-root.rotation.x)*ease;
        root.rotation.y+=(s.y-root.rotation.y)*ease;
        pieces.forEach((piece,i)=>{piece.position.z = -.04+i*.19 + currentSpread*i*.63;piece.rotation.z=currentSpread*i*.03;});
        root.position.x=narrow?1.25:2.04;
        root.position.y=narrow?-1.1:.08;
        root.rotation.z=.02;
        root.scale.setScalar(narrow?1:1.35);
        silk.visible=!narrow;
        renderer.render(scene,camera);
        if(Math.abs(currentSpread-s.spread)+Math.abs(root.rotation.x-s.x)+Math.abs(root.rotation.y-s.y)>.001) frame=requestAnimationFrame(render);
      };
      const schedule=()=>{if(!frame && visible && !document.hidden)frame=requestAnimationFrame(render);};
      redraw.current=schedule;
      const resize=()=>{
        const w=container.clientWidth,h=container.clientHeight;
        if(!w||!h)return;
        narrow=w<650;
        renderer.setSize(w,h);
        const halfHeight=narrow?4.1/(w/h):3.1;
        camera.left=-halfHeight*w/h;camera.right=halfHeight*w/h;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();schedule();
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
        grain.dispose();brandTexture?.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();redraw.current=()=>{};
      };
    }
    start().catch(()=>{if(!cancelled){setFailed(true);setReady(false);}});
    return ()=>{cancelled=true;dispose();};
  }, [loadScene, calm]);

  const drag = useRef<{ x:number; y:number; rotationX:number; rotationY:number } | null>(null);
  const reset=()=>{settings.current.x=.32;settings.current.y=-1.08;redraw.current();};
  return <>
    <div className={`camera-stage live-scene ${ready?'scene-ready':''}`}>
      {failed&&<img src="/images/camera.webp" alt="Static fallback: a cinema camera with separated optical lens elements" width="1672" height="941" loading="lazy" />}
      <div ref={host} className="camera-canvas" tabIndex={ready?0:-1} role="group" aria-label="Live 3D camera background. Scroll to separate the optical elements. Drag horizontally to rotate, or use arrow keys. The slider also controls lens separation."
        onPointerDown={event=>{if(!ready)return;drag.current={x:event.clientX,y:event.clientY,rotationX:settings.current.x,rotationY:settings.current.y};event.currentTarget.setPointerCapture(event.pointerId);}}
        onPointerMove={event=>{if(!drag.current)return;settings.current.y=drag.current.rotationY+(event.clientX-drag.current.x)*.008;settings.current.x=Math.max(-.7,Math.min(.7,drag.current.rotationX+(event.clientY-drag.current.y)*.003));redraw.current();}}
        onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}
        onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;event.preventDefault();if(event.key==='Home')reset();else{settings.current.y+=event.key==='ArrowLeft'?-.15:event.key==='ArrowRight'?.15:0;settings.current.x=Math.max(-.7,Math.min(.7,settings.current.x+(event.key==='ArrowUp'?-.1:event.key==='ArrowDown'?.1:0)));redraw.current();}}}
      />
    </div>
    <div className="camera-controls dark">
        {ready&&!failed?<><div className="camera-slider"><label id="spread-label">ASSEMBLED</label><Slider aria-labelledby="spread-label" aria-label="Lens separation" value={[spread]} min={0} max={100} onValueChange={value=>setSpread(Array.isArray(value)?value[0]:value)}/><span>EXPLODED</span></div><Button variant="ghost" size="icon" className="camera-icon" onClick={reset} aria-label="Reset camera view"><RotateCcw size={16}/></Button></>:<p role="status">{failed?'3D is unavailable on this device. Enjoy the cinematic view.':'Preparing your camera…'}</p>}
    </div>
    {ready&&!failed&&<span className="camera-drag-hint">DRAG TO EXPLORE <MoveHorizontal size={15}/></span>}
  </>;
}
