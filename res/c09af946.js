const e=document.querySelector(".C"),t=document.querySelector(".D"),o=o=>{o?(t.setAttribute("preload","auto"),e.removeAttribute("hidden")):e.setAttribute("hidden",""),document.documentElement.classList.toggle("E",o)};let c=0,d=0;document.querySelector(".F").addEventListener("click",(()=>{c=window.scrollX,d=window.scrollY,o(!0),window.scrollTo(0,0)})),document.querySelector(".G").addEventListener("click",(()=>{o(!1),t.pause(),window.scrollTo(c,d)}));