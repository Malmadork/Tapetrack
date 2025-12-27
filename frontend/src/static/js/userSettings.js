document.querySelectorAll(".setting[data-setting]").forEach(element => {
  element.addEventListener("click", (e) => {
    document.location = "/settings/" + element.getAttribute("data-setting");
  });
});