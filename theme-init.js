// Runs before first paint so the saved theme never flashes.
(function () {
  try {
    var v = localStorage.getItem("chord-theme");
    if (v === "light" || v === "dark") document.documentElement.setAttribute("data-theme", v);
  } catch (e) {}
})();
