
(function(){
var io=new IntersectionObserver(function(es){es.forEach(function(e){
 if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},
 {threshold:.14,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
var mBtn=document.getElementById('menuBtn'),mPan=document.getElementById('menu'),mX=document.getElementById('menuX');
if(mBtn){
 mBtn.addEventListener('click',function(){mPan.hidden=false;mBtn.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';mX.focus()});
 function close(){mPan.hidden=true;mBtn.setAttribute('aria-expanded','false');document.body.style.overflow='';mBtn.focus()}
 mX.addEventListener('click',close);
 mPan.addEventListener('click',function(e){if(e.target===mPan)close()});
 mPan.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close)});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!mPan.hidden)close()});
}
})();
