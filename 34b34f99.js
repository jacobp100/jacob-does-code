import"https://unpkg.com/mathjax@3.1.0/es5/mml-svg.js";import"/8cf62245.js";export default({container:e,worker:t})=>{const{Elements:r,Value:l,Work:o}=Client,n=e=>null!=e?{type:"ok",value:e}:{type:"error",error:null},s=e.querySelector(".O"),i=(e,t)=>r=>{if(null==r)return;if(e.classList.remove("J"),"error"===r.type)return void(e.innerHTML="Error");const l=new FormData(s),o={style:l.get("style"),precision:Number(l.get("precision")),digitGrouping:null!=l.get("digitGrouping"),base:Number(l.get("base"))},n=t(r.value,o);e.innerHTML=n,MathJax.typeset()},u=i(e.querySelector(".I"),r.toMml),a=i(e.querySelector(".K"),l.toMml),c=window.location.search.slice("?".length);e.querySelector(".X").setAttribute("href",`technicalc://editor?${c}`);const d=n(0!==c.length?r.decode(c):void 0);u(d);let p=null;const[g,m]="ok"===d.type?r.parse(d.value):[null,null];if(null==g&&null!=m){const e=o.calculate(m);t.postMessage(e)}else p=n(void 0),a(p);t.onmessage=e=>{const t=e.data;p=n(!0!==t.didError?l.decode(t.results[0]):void 0),a(p)},s.addEventListener("change",(()=>{u(d),a(p)}))};