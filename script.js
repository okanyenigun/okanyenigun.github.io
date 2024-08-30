import {
  loadContent,
  generateTopicBadges,
  generateTagBadges,
  generateBlogPostsTable,
  generateCardsFromJson,
} from "./funcs.js";

function comingSoon() {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = "";

  const comingSoonMessage = document.createElement("p");
  comingSoonMessage.className = "coming-soon";
  comingSoonMessage.innerText = "Coming Soon";

  contentDiv.appendChild(comingSoonMessage);
}

$(document).ready(function () {
  // Load default content
  loadContent("welcome");

  document
    .getElementById("load-cv")
    .addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default link behavior

      // Fetch the cv.html content
      fetch("cv.html")
        .then((response) => response.text())
        .then((html) => {
          // Load the HTML content into the #content div
          document.getElementById("content").innerHTML = html;
        })
        .catch((error) => console.error("Error loading cv.html:", error));
    });

  document.getElementById("ask-me").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default link behavior
    comingSoon();
  });

  document
    .getElementById("contact")
    .addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default link behavior
      loadContent("welcome");
    });

  // Event delegation for all clickable elements
  $(".child-menu").on("click", "a", function (e) {
    e.preventDefault();
    var id = $(this).attr("id");
    var content = document.getElementById("content");
    content.innerHTML = "";

    if (id == "blog-medium") {
      generateTopicBadges("medium.json");
      generateTagBadges("medium.json");
      generateBlogPostsTable("medium.json");
    } else if (id == "blog-builtin") {
      generateTopicBadges("builtin.json");
      generateTagBadges("builtin.json");
      generateBlogPostsTable("builtin.json");
    } else if (id == "blog-originals") {
      comingSoon();
    } else if (id == "sp-library") {
      generateCardsFromJson("projects.json", "package");
    } else if (id == "sp-app") {
      generateCardsFromJson("projects.json", "app");
    } else if (id == "sp-model") {
      generateCardsFromJson("projects.json", "model");
    }
  });

  // Special handling for non-link elements if needed
  $(".child-menu").on("click", ".slide:not(a)", function () {
    var name = $(this).find(".name").text().toLowerCase().replace(/\s+/g, "-");
    loadContent(name);
  });
});
