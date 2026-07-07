(function(){
  "use strict";
  var root = document.querySelector(".mm-root");
  if(!root) return;

  // Mobile nav toggle
  var burger = document.getElementById("mm-burger");
  var links  = document.getElementById("mm-links");
  if(burger && links){
    burger.addEventListener("click", function(){
      var open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function(e){
      if(e.target.closest("a")){
        links.classList.remove("is-open");
        burger.setAttribute("aria-expanded","false");
      }
    });
  }

  // Nav shadow on scroll
  var nav = document.getElementById("mm-nav");
  function onScroll(){
    if(nav) nav.classList.toggle("is-stuck", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive:true });

  // Scroll reveal
  var reveals = root.querySelectorAll(".mm-reveal");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce || !("IntersectionObserver" in window)){
    reveals.forEach(function(el){ el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function(el){ io.observe(el); });
  }
})();
