const modal=document.querySelector(".H"),video=document.querySelector(".J"),toggleModal=e=>{e?modal.removeAttribute("hidden"):modal.setAttribute("hidden",""),document.documentElement.classList.toggle("F",e)};let scrollX=0,scrollY=0;document.querySelector(".G").addEventListener("click",(()=>{scrollX=window.scrollX,scrollY=window.scrollY,toggleModal(!0),window.scrollTo(0,0)})),document.querySelector(".I").addEventListener("click",(()=>{toggleModal(!1),video.pause(),window.scrollTo(scrollX,scrollY)}));