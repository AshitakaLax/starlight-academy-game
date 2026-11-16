import { createCanvasRenderer } from "../canvas/createCanvasRenderer.js";

function star(ctx, x, y, radius, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = rotation - Math.PI / 2 + i * Math.PI / 5;
    const distance = i % 2 === 0 ? radius : radius * 0.38;
    const px = x + Math.cos(angle) * distance, py = y + Math.sin(angle) * distance;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
}

function drawBackground(ctx, frame) {
  const { width: w, height: h, elapsedMs } = frame;
  const sky = ctx.createLinearGradient(0, 0, w, h);
  sky.addColorStop(0, "rgba(111,79,151,.14)");
  sky.addColorStop(.52, "rgba(202,165,208,.12)");
  sky.addColorStop(1, "rgba(248,216,207,.42)");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  const points = [[.12,.22,2.2],[.25,.13,1.6],[.39,.29,1.7],[.62,.14,2],[.78,.25,1.8],[.91,.13,1.6],[.14,.55,1.5],[.85,.58,1.7]];
  points.forEach(([x,y,r],i) => {
    ctx.globalAlpha = .28 + .22 * (1 + Math.sin(elapsedMs / 850 + i * 1.7));
    ctx.fillStyle = "#fffaf0"; star(ctx, x*w, y*h, r, i*.19);
  });
  ctx.globalAlpha = 1;
}

function drawStudent(ctx, frame) {
  const scale = Math.max(.7, Math.min(frame.width / 210, frame.height / 145, 1.15));
  const animationTime = frame.deltaMs > 0 ? frame.elapsedMs : 0;
  const bob = Math.sin(animationTime / 900) * 2.2;
  ctx.save(); ctx.translate(frame.width*.17, frame.height*.98 - bob); ctx.scale(scale, scale);
  ctx.fillStyle = "#76549a"; ctx.beginPath(); ctx.moveTo(-11,-63);
  ctx.bezierCurveTo(-24,-46,-33,-20,-34,0); ctx.quadraticCurveTo(0,7,33,0);
  ctx.bezierCurveTo(28,-25,20,-49,10,-63); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#d9b5d9"; ctx.beginPath(); ctx.moveTo(-8,-60); ctx.lineTo(0,-50);
  ctx.lineTo(8,-60); ctx.lineTo(4,-24); ctx.lineTo(-4,-24); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#edc6b2"; ctx.lineWidth = 7; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-10,-57); ctx.quadraticCurveTo(-26,-62,-27,-79); ctx.stroke();
  ctx.save(); ctx.translate(10,-57); ctx.rotate(Math.sin(animationTime / 1100) * .045);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(15,-8,17,-21); ctx.stroke(); ctx.restore();
  ctx.fillStyle = "#edc6b2"; ctx.fillRect(-4,-75,8,13);
  ctx.beginPath(); ctx.ellipse(0,-87,14,17,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#523755"; ctx.beginPath(); ctx.moveTo(-14,-89);
  ctx.quadraticCurveTo(-15,-110,2,-105); ctx.quadraticCurveTo(18,-103,14,-84);
  ctx.quadraticCurveTo(8,-93,3,-95); ctx.quadraticCurveTo(-4,-82,-14,-82); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff0ce"; ctx.fillRect(-14,-17,10,17); ctx.fillRect(4,-17,10,17);
  ctx.fillStyle = "#e7c36f"; ctx.beginPath(); ctx.arc(0,-57,5,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawMagic(ctx, frame) {
  const { width:w, height:h, elapsedMs } = frame;
  const points = [[.29,.62,4],[.69,.48,4],[.93,.73,3],[.08,.77,3],[.47,.2,2.5]];
  points.forEach(([x,y,r],i) => {
    const pulse = .5 + .5*Math.sin(elapsedMs/470 + i*1.9);
    ctx.globalAlpha = .25 + pulse*.55;
    ctx.fillStyle = i%2===0 ? "#fff4ce" : "#e4c9f0";
    star(ctx,x*w,y*h+Math.sin(elapsedMs/900+i)*2,r*(.7+pulse*.3),elapsedMs/5000);
  });
  ctx.globalAlpha = 1;
}

/** Decorative student-and-Pegasus scene. It never reads or mutates gameplay state. */
export function createAcademyScene({ canvas, windowRef = globalThis.window,
  documentRef = globalThis.document, ResizeObserverCtor = globalThis.ResizeObserver,
  onError = () => {} } = {}) {
  const renderer = createCanvasRenderer({ canvas, windowRef, documentRef, ResizeObserverCtor, onError });
  renderer.addLayer({ id:"background", order:0, draw:drawBackground });
  renderer.addLayer({ id:"student-character", order:20, draw:drawStudent });
  renderer.addLayer({ id:"starlight-effects", order:40, draw:drawMagic });
  return Object.freeze({
    start:() => renderer.start(), stop:() => renderer.stop(), destroy:() => renderer.destroy(),
    setActive:(value) => renderer.setActive(value),
    setReducedMotion:(value) => renderer.setReducedMotion(value),
    getDiagnostics:() => renderer.getDiagnostics()
  });
}
