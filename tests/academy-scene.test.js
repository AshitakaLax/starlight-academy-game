import test from "node:test";
import assert from "node:assert/strict";
import { createAcademyScene } from "../src/rendering/scenes/createAcademyScene.js";

test("academy scene registers its ordered background, student, companion and effects layers",()=>{
  const ctx={setTransform(){},clearRect(){},save(){},restore(){},fillRect(){},
    translate(){},scale(){},createLinearGradient:()=>({addColorStop(){}}),beginPath(){},moveTo(){},lineTo(){},
    closePath(){},fill(){},stroke(){},bezierCurveTo(){},quadraticCurveTo(){},arc(){},ellipse(){}};
  const canvas={width:0,height:0,clientWidth:320,clientHeight:210,
    getBoundingClientRect:()=>({width:320,height:210}),getContext:()=>ctx};
  let next=0;const frames=new Map();
  const windowRef={devicePixelRatio:1,performance:{now:()=>10},
    requestAnimationFrame:(fn)=>{frames.set(++next,fn);return next;},
    cancelAnimationFrame:(id)=>frames.delete(id)};
  const documentRef={visibilityState:"visible"};
  const scene=createAcademyScene({canvas,windowRef,documentRef,ResizeObserverCtor:null});
  assert.deepEqual(scene.getDiagnostics().layerIds,[
    "background","student-character","pegasus-companion","starlight-effects"
  ]);
  scene.setReducedMotion(true);scene.start();
  assert.equal(frames.size,0);
  assert.equal(scene.getDiagnostics().frameCount>0,true);
  scene.setActive(false);scene.destroy();
  assert.equal(scene.getDiagnostics().destroyed,true);
});
