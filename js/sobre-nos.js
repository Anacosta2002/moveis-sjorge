(function(){
  var car=document.getElementById('lojas-car');if(!car)return;
  var slides=[].slice.call(car.querySelectorAll('.scar-slide')),
      dots=[].slice.call(car.querySelectorAll('.scar-dot')),
      cnt=document.getElementById('scar-i'),i=0;
  function go(n){
    i=(n+slides.length)%slides.length;
    slides.forEach(function(s,k){s.classList.toggle('is-on',k===i);s.setAttribute('aria-hidden',k===i?'false':'true')});
    dots.forEach(function(d,k){d.classList.toggle('is-on',k===i);d.setAttribute('aria-selected',k===i?'true':'false')});
    cnt.textContent='0'+(i+1);
  }
  car.addEventListener('click',function(e){
    var a=e.target.closest('[data-dir]');if(a)return go(i+ +a.dataset.dir);
    var d=e.target.closest('[data-go]');if(d)go(+d.dataset.go);
  });
  car.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight')go(i+1);if(e.key==='ArrowLeft')go(i-1);
  });
  car.setAttribute('tabindex','0');
})();
