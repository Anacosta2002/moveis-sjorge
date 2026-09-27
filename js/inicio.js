/* Comportamento específico: cartões de projetos que expandem ao passar o rato */
(function(){
  const track = document.getElementById('exp-track');
  if(!track) return;
  const cards = Array.from(track.querySelectorAll('.exp-card'));
  const isMobile = ()=> window.innerWidth <= 760;

  function activate(card){
    cards.forEach(c=>c.classList.remove('exp-card--active'));
    card.classList.add('exp-card--active');
    if(isMobile()){
      cards.forEach(c=>{ c.style.height='160px'; });
      card.style.height='340px';
    } else {
      const gap=6, collapsedW=140, n=cards.length;
      const full = track.offsetWidth - collapsedW*(n-1) - gap*n;
      const activeW = Math.round(full * 0.8);
      const bonus = Math.round((full - activeW) / (n-1));
      cards.forEach(c=>{ c.style.width=(collapsedW+bonus)+'px'; });
      card.style.width=activeW+'px';
    }
  }

  cards.forEach(card=>{
    card.addEventListener('mouseenter', ()=>activate(card));
    card.addEventListener('click', ()=>{
      const href=card.dataset.href;
      if(href) window.location.href=href;
    });
  });

  function init(){
    cards.forEach(c=>{ c.style.width=''; c.style.height=''; });
    activate(cards[0]);
  }
  init();
  window.addEventListener('resize', init);
})();
