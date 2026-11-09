/* Paradigm Boxers — site behaviour (mobile menu, photo lightbox, application form) */

// Where the application form is sent. Leave empty to fall back to opening the
// visitor's email app. To receive submissions directly, paste a form endpoint
// here (for example a Formspree URL such as https://formspree.io/f/xxxxxxx).
var FORM_ENDPOINT = "";
var FORM_EMAIL = "crystal@paradigmboxers.com";

(function () {
  // ----- mobile menu -----
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // ----- lightbox -----
  document.querySelectorAll(".gallery").forEach(function (gallery) {
    var links = Array.prototype.slice.call(gallery.querySelectorAll("a"));
    if (!links.length) return;
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<button class="lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-prev" aria-label="Previous">&#8249;</button>' +
      '<img alt="">' +
      '<button class="lb-next" aria-label="Next">&#8250;</button>' +
      '<div class="lb-count"></div>';
    document.body.appendChild(box);
    var img = box.querySelector("img");
    var count = box.querySelector(".lb-count");
    var i = 0;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function show(n) {
      i = (n + links.length) % links.length;
      img.src = links[i].getAttribute("href");
      var cap = links[i].getAttribute("data-caption") || "";
      img.alt = cap || links[i].querySelector("img").alt || "";
      count.textContent = pad(i + 1) + " / " + pad(links.length) + (cap ? " — " + cap : "");
    }
    function close() { box.classList.remove("open"); }
    links.forEach(function (a, n) {
      a.addEventListener("click", function (e) { e.preventDefault(); show(n); box.classList.add("open"); });
    });
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(i - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(i + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
  });

  // ----- application form -----
  var form = document.getElementById("application-form");
  if (form) {
    var note = document.getElementById("form-note");
    function collect() {
      var lines = [];
      var seen = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || seen[el.name]) return;
        seen[el.name] = true;
        var label = el.getAttribute("data-label") || el.name;
        var value;
        if (el.type === "radio" || el.type === "checkbox") {
          value = Array.prototype.filter.call(form.querySelectorAll('[name="' + el.name + '"]'), function (x) { return x.checked; })
            .map(function (x) { return x.value; }).join(", ");
        } else {
          value = el.value;
        }
        lines.push(label + "\n" + (value || "-"));
      });
      return lines.join("\n\n");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      function done(msg) { note.textContent = msg; note.classList.add("show"); note.scrollIntoView({ block: "center" }); }
      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error("bad response");
            form.reset();
            done("Thank you! Your application has been submitted.");
          })
          .catch(function () {
            done("Sorry, something went wrong sending your application. Please email it to " + FORM_EMAIL + ".");
          });
      } else {
        window.location.href = "mailto:" + FORM_EMAIL + "?subject=" + encodeURIComponent("Puppy Application from Website") +
          "&body=" + encodeURIComponent(collect());
        done("Your email app should now open with your answers filled in — press send to submit your application. If nothing opened, please email " + FORM_EMAIL + ".");
      }
    });
  }
})();
