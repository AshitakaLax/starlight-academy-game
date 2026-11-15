import test from "node:test";
import assert from "node:assert/strict";
import { createCanvasRenderer } from "../src/rendering/canvas/createCanvasRenderer.js";
import { createMaskedTexture } from "../src/rendering/canvas/createMaskedTexture.js";

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, fn) { const set = this.listeners.get(type) ?? new Set(); set.add(fn); this.listeners.set(type,set); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  emit(type) { for (const fn of [...(this.listeners.get(type) ?? [])]) fn(); }
  count(type) { return this.listeners.get(type)?.size ?? 0; }
}

function harness({ width=120, height=70, dpr=2, visibility="visible" }={}) {
  const calls=[];
  const ctx={
    setTransform:(...a)=>calls.push(["transform",...a]), clearRect:()=>calls.push(["clear"]),
    save:()=>calls.push(["save"]), restore:()=>calls.push(["restore"]),
    createLinearGradient:()=>({addColorStop(){}}),
    fillRect(){}, beginPath(){}, fill(){}, stroke(){}, moveTo(){}, lineTo(){},
    bezierCurveTo(){}, quadraticCurveTo(){}, closePath(){}, arc(){}, ellipse(){}
  };
  const canvas={width:0,height:0,clientWidth:width,clientHeight:height,parentElement:{},
    getContext:()=>ctx,getBoundingClientRect:()=>({width,height})};
  const windowRef=new Events(); windowRef.devicePixelRatio=dpr; windowRef.performance={now:()=>10};
  const documentRef=new Events(); documentRef.visibilityState=visibility;
  let id=0; const queued=new Map();
  const requestFrame=(fn)=>{const next=++id;queued.set(next,fn);return next;};
  const cancelFrame=(next)=>queued.delete(next);
  function step(time) { const first=queued.entries().next().value; if(!first)return false; queued.delete(first[0]);first[1](time);return true; }
  let observed;
  class Observer {
    constructor(fn){this.fn=fn;observed=this;this.disconnected=false;}
    observe(target){this.target=target;}
    disconnect(){this.disconnected=true;}
    trigger(){this.fn();}
  }
  const renderer=createCanvasRenderer({canvas,windowRef,documentRef,ResizeObserverCtor:Observer,requestFrame,cancelFrame});
  return {renderer,canvas,ctx,calls,windowRef,documentRef,queued,step,get observer(){return observed;}};
}

test("renderer creates a high-DPI backing surface using CSS dimensions",()=>{
  const app=harness(); app.renderer.start();
  assert.equal(app.canvas.width,240); assert.equal(app.canvas.height,140);
  assert.ok(app.calls.some((call)=>call[0]==="transform"&&call[1]===2));
  assert.equal(app.renderer.getDiagnostics().width,120);
  app.renderer.destroy();
});

test("layers draw in stable order and animation deltas are capped at 50ms",()=>{
  const app=harness({dpr:1}); const seen=[];
  app.renderer.addLayer({id:"later",order:20,draw:(_ctx,frame)=>seen.push(["later",frame.deltaMs])});
  app.renderer.addLayer({id:"first",order:0,draw:(_ctx,frame)=>seen.push(["first",frame.deltaMs])});
  app.renderer.start(); seen.length=0;
  assert.equal(app.step(100),true);
  assert.deepEqual(seen.slice(0,2).map((item)=>item[0]),["first","later"]);
  assert.equal(app.step(500),true);
  assert.equal(seen[2][1],50);
  app.renderer.destroy();
});

test("inactive and hidden scenes cancel scheduled frames and resume cleanly",()=>{
  const app=harness(); app.renderer.start(); assert.equal(app.queued.size,1);
  app.renderer.setActive(false); assert.equal(app.queued.size,0);
  app.renderer.setActive(true); assert.equal(app.queued.size,1);
  app.documentRef.visibilityState="hidden"; app.documentRef.emit("visibilitychange");
  assert.equal(app.queued.size,0);
  app.documentRef.visibilityState="visible"; app.documentRef.emit("visibilitychange");
  assert.equal(app.queued.size,1);
  app.renderer.destroy();
});

test("reduced-motion mode draws a static frame without an animation loop",()=>{
  const app=harness(); app.renderer.start(); app.renderer.setReducedMotion(true);
  assert.equal(app.queued.size,0); assert.equal(app.renderer.getDiagnostics().reducedMotion,true);
  app.renderer.setReducedMotion(false); assert.equal(app.queued.size,1);
  app.renderer.destroy();
});

test("stop and destroy disconnect observers and listeners",()=>{
  const app=harness(); app.renderer.start();
  assert.equal(app.observer.target,app.canvas.parentElement);
  app.renderer.stop(); assert.equal(app.queued.size,0);
  assert.equal(app.observer.disconnected,true);
  assert.equal(app.documentRef.count("visibilitychange"),0);
  app.renderer.destroy(); assert.equal(app.renderer.getDiagnostics().destroyed,true);
});

test("a failed layer does not block sibling layers and reports its own error",()=>{
  const app=harness(); const errors=[]; let healthy=0;
  app.renderer.destroy();
  const next=harness();
  const renderer=createCanvasRenderer({
    canvas:next.canvas,windowRef:next.windowRef,documentRef:next.documentRef,
    ResizeObserverCtor:null,requestFrame:(fn)=>{next.queued.set(1,fn);return 1;},
    cancelFrame:(id)=>next.queued.delete(id),onError:(error,source)=>errors.push([error.message,source])
  });
  renderer.addLayer({id:"broken",draw(){throw new Error("draw failed");}});
  renderer.addLayer({id:"healthy",draw(){healthy+=1;}});
  renderer.start(); assert.equal(healthy,1); assert.deepEqual(errors,[["draw failed","layer:broken"]]);
  renderer.destroy();
});

test("masked textures apply destination-in masking and restore the context",()=>{
  const calls=[];
  class Offscreen {
    constructor(width,height){this.width=width;this.height=height;this.context={
      globalCompositeOperation:"source-over",clearRect:()=>calls.push("clear"),
      save:()=>calls.push("save"),restore:()=>{calls.push("restore");this.context.globalCompositeOperation="source-over";}
    };}
    getContext(){return this.context;}
  }
  const surface=createMaskedTexture({width:40,height:20,OffscreenCanvasCtor:Offscreen,
    drawTexture:(ctx)=>calls.push("texture:"+ctx.globalCompositeOperation),
    drawMask:(ctx)=>calls.push("mask:"+ctx.globalCompositeOperation)});
  assert.equal(surface.width,40);
  assert.deepEqual(calls,["clear","texture:source-over","save","mask:destination-in","restore"]);
});

test("masked textures support document-canvas fallback and reject unsafe dimensions",()=>{
  let created;
  const documentRef={createElement(tag){created={tagName:tag,width:0,height:0,getContext:()=>({
    clearRect(){},save(){},restore(){},globalCompositeOperation:"source-over"
  })};return created;}};
  createMaskedTexture({width:12,height:8,OffscreenCanvasCtor:null,documentRef,drawTexture(){},drawMask(){}});
  assert.equal(created.tagName,"canvas");
  assert.throws(()=>createMaskedTexture({width:5000,height:5000,OffscreenCanvasCtor:class{},drawTexture(){},drawMask(){}}),/dimensions/);
  assert.throws(()=>createMaskedTexture({width:0,height:1,drawTexture(){},drawMask(){}}),/dimensions/);
});
