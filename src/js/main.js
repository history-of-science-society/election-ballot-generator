let previousSelected = null;
function setActiveClass(entries, observer) {
  entries.forEach(item => {
    const itemToSetActive = document.getElementById(`target-${item.target.id}`);
    if (item.isIntersecting) {
      console.log(previousSelected);
      previousSelected === null
        ? ""
        : previousSelected.classList.remove("is-active");
      itemToSetActive.classList.add("is-active");
      previousSelected = itemToSetActive;
    } else {
      itemToSetActive.classList.remove("is-active");
    }
  });
}

function createObserver() {
  let observer;
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.25
  };
  observer = new IntersectionObserver(setActiveClass, options);
  nomineeCards.forEach(card => {
    observer.observe(card);
  });
}
let nomineeCards;

window.addEventListener(
  "load",
  event => {
    nomineeCards = document.querySelectorAll(".nominee__card");

    createObserver();
  },
  false
);

// Menu Toggle
const hamburger = document.querySelector("span[data-target=navbarMenuHeroA]");
const menu = document.getElementById("navbarMenuHeroA");
const toggleMenu = el => {
  el.currentTarget.classList.toggle("is-active");
  menu.classList.toggle("is-active");
};
hamburger.addEventListener("click", toggleMenu);
