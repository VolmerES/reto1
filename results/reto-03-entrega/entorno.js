window.foldState={mode:'cerrado',width:360,height:740,hinge:null};
const experience=document.getElementById('experience');
document.querySelectorAll('[data-set]').forEach(button=>button.addEventListener('click',()=>{
 const mode=button.dataset.set;
 window.foldState={mode,width:mode==='cerrado'?360:720,height:740,hinge:mode==='flex'?{top:358,height:24}:null};
 experience.dataset.mode=mode;
 document.querySelectorAll('[data-set]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.getElementById('dimensions').textContent=`${foldState.width} × 740 px`;
 window.dispatchEvent(new CustomEvent('foldchange',{detail:window.foldState}));
}));
document.getElementById('source-image').addEventListener('dragstart',e=>{e.dataTransfer.setData('text/uri-list',e.target.src);e.dataTransfer.setData('text/plain',e.target.src);e.dataTransfer.effectAllowed='copy';});
