// Strips of screenshots that move on by themselves (home page and /projets/).
// One screenshot every 3.5 s, back to the first at the end. The strip stops
// while a finger, the mouse or the keyboard is on it, when it is off screen
// or the tab hidden, and never moves for people who asked for less motion.
// The pause button stops it for good; arrows (mouse only) step through it.
(() => {
  const calme = matchMedia("(prefers-reduced-motion: reduce)");
  const souris = matchMedia("(hover: hover) and (pointer: fine)");
  const PAS = 3500;

  for (const boite of document.querySelectorAll(".carousel")) {
    const rail = boite.querySelector(".rail");
    const pause = boite.querySelector(".rb-pause");
    const avant = boite.querySelector(".rb-back");
    const apres = boite.querySelector(".rb-next");
    boite.querySelector(".rail-buttons").hidden = false;
    let joue = !calme.matches;
    let visible = false;
    let main = false;
    let repos = 0;

    const debut = () => parseFloat(getComputedStyle(rail).paddingLeft) || 0;
    const aLaFin = () => rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    const aller = (sens) => {
      const x = rail.scrollLeft + debut();
      const items = [...rail.children];
      let cible;
      if (sens > 0) {
        cible = aLaFin() ? items[0] : items.find((li) => li.offsetLeft > x + 4);
      } else {
        cible = [...items].reverse().find((li) => li.offsetLeft < x - 4) || items[0];
      }
      if (!cible) cible = items[0];
      rail.scrollTo({ left: cible.offsetLeft - debut(), behavior: calme.matches ? "auto" : "smooth" });
    };

    const majBoutons = () => {
      const deborde = rail.scrollWidth > rail.clientWidth + 4;
      boite.classList.toggle("still", !deborde);
      avant.hidden = apres.hidden = !souris.matches || !deborde;
      pause.hidden = !deborde;
      avant.disabled = rail.scrollLeft < 4;
      apres.disabled = aLaFin();
      pause.setAttribute("aria-pressed", String(!joue));
      pause.textContent = joue ? "❚❚" : "▶";
      pause.setAttribute("aria-label", joue ? boite.dataset.pause : boite.dataset.play);
    };

    pause.addEventListener("click", () => {
      joue = !joue;
      majBoutons();
    });
    avant.addEventListener("click", () => aller(-1));
    apres.addEventListener("click", () => aller(1));

    // Someone is looking closely: let them be, then carry on a while later.
    const tenir = () => { main = true; };
    const lacher = () => { main = false; repos = Date.now(); };
    rail.addEventListener("pointerenter", tenir);
    rail.addEventListener("pointerleave", lacher);
    rail.addEventListener("touchstart", () => { repos = Date.now() + 4000; }, { passive: true });
    rail.addEventListener("focusin", tenir);
    rail.addEventListener("focusout", lacher);

    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.4 }).observe(rail);
    rail.addEventListener("scroll", majBoutons, { passive: true });
    addEventListener("resize", majBoutons);
    majBoutons();

    setInterval(() => {
      if (!joue || calme.matches || !visible || main || document.hidden) return;
      if (Date.now() - repos < 6000) return;
      if (rail.scrollWidth <= rail.clientWidth + 4) return;
      aller(1);
    }, PAS);
  }
})();
