import"https://unpkg.com/mathjax@3.1.0/es5/mml-svg.js";import"/res/f2c85a4c.js";export default({container:e,worker:t})=>{const{Elements:r,Value:o,Work:l}=Client,n=e=>null!=e?{ok:!0,value:e}:{ok:!1,error:null},s=e.querySelector(".U"),a=(e,t)=>r=>{if(null==r)return;if(e.classList.remove("O"),!r.ok)return void(e.innerHTML="Error");const o=new FormData(s),l={style:o.get("style"),precision:Number(o.get("precision")),digitGrouping:null!=o.get("digitGrouping"),base:Number(o.get("base"))},n=t(r.value,l);e.innerHTML=n,MathJax.typeset()},i=a(e.querySelector(".N"),r.toMml),c=a(e.querySelector(".P"),o.toMml),u=window.location.search.slice("?".length);e.querySelector(".-d").setAttribute("href",`technicalc://editor?${u}`);const d=n(0!==u.length?r.decode(u):void 0);i(d);let g=null;const m=d.ok?r.parse(d.value):{ok:!1,error:0};if(m.ok){const e=l.make({angleMode:"radian"},void 0,l.calculate(m.value));t.postMessage(e)}else c(g);t.onmessage=e=>{const t=e.data;g=n(!0!==t.didError?o.decode(t.results[0]):void 0),c(g)},s.addEventListener("change",(()=>{i(d),c(g)}))};