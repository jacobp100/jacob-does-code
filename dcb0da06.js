const modal=document.querySelector(".F"),video=document.querySelector(".I"),toggleModal=l=>{modal.classList.toggle("G",l),document.documentElement.classList.toggle("D",l)};let scrollX=0,scrollY=0;document.querySelector(".E").addEventListener("click",(()=>{scrollX=window.scrollX,scrollY=window.scrollY,toggleModal(!0),window.scrollTo(0,0)})),document.querySelector(".H").addEventListener("click",(()=>{toggleModal(!1),video.pause(),window.scrollTo(scrollX,scrollY)}));