export function loadContent(pageName) {
  $("#content")
    .empty()
    .load(pageName + ".html");
}

export function generateBlogPostsTable(
  dataJson,
  filter = { topic: null, tag: null },
  rowsPerPage = 10
) {
  fetch(dataJson)
    .then((response) => response.json())
    .then((data) => {
      // Filter data
      let filteredData = data;
      if (filter.topic) {
        filteredData = filteredData.filter(
          (post) => post.Topic.toLowerCase() === filter.topic.toLowerCase()
        );
      }
      if (filter.tag) {
        filteredData = filteredData.filter(
          (post) =>
            post.Tag1 === filter.tag ||
            post.Tag2 === filter.tag ||
            post.Tag3 === filter.tag ||
            post.Tag4 === filter.tag ||
            post.Tag5 === filter.tag
        );
      }

      // Process data to combine tags
      const processedData = filteredData.map((post) => {
        const tags = [post.Tag1, post.Tag2, post.Tag3, post.Tag4, post.Tag5]
          .filter((tag) => tag) // Remove empty tags
          .join(", ");
        return {
          Title: post.Title,
          Subtitle: post.Subtitle,
          Topic: post.Topic,
          Tags: tags,
          URL: post.URL,
        };
      });

      let currentPage = 1;
      const totalPages = Math.ceil(processedData.length / rowsPerPage);

      // Helper function to render the table
      const renderTable = (page) => {
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = Math.min(
          startIndex + rowsPerPage,
          processedData.length
        );
        const pageData = processedData.slice(startIndex, endIndex);

        // Clear any existing table
        const existingTable = document.querySelector(".medium-posts-table");
        if (existingTable) {
          existingTable.remove();
        }

        // Create table
        const table = document.createElement("table");
        table.className =
          "medium-posts-table table table-striped table-bordered table-hover table-sm table-responsive";

        // Create table header
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        for (const key in pageData[0]) {
          if (key !== "URL") {
            const th = document.createElement("th");
            th.textContent = key;
            headerRow.appendChild(th);
          }
        }

        // Create table body
        const tbody = table.createTBody();
        pageData.forEach((post) => {
          const row = tbody.insertRow();
          row.className = "align-middle";
          for (const key in post) {
            if (key !== "URL") {
              const cell = row.insertCell();
              if (key === "Title") {
                const a = document.createElement("a");
                a.href = post.URL;
                a.textContent = post[key];
                a.target = "_blank";
                cell.appendChild(a);
              } else {
                cell.textContent = post[key];
              }
            }
          }
        });

        // Add the table to the document
        document.getElementById("content").appendChild(table);
      };

      // Helper function to create pagination controls
      const renderPaginationControls = () => {
        // Clear existing controls
        const existingControls = document.querySelector(".pagination-controls");
        if (existingControls) {
          existingControls.remove();
        }

        // Create pagination controls
        const paginationDiv = document.createElement("div");
        paginationDiv.className = "pagination-controls";

        const createButton = (text, enabled, callback) => {
          const button = document.createElement("button");
          button.textContent = text;
          button.disabled = !enabled;
          button.className = "btn btn-outline-primary btn-sm m-1";
          button.addEventListener("click", callback);
          return button;
        };

        // Add Previous button
        paginationDiv.appendChild(
          createButton("Previous", currentPage > 1, () => {
            currentPage -= 1;
            renderTable(currentPage);
            renderPaginationControls();
          })
        );

        // Add page numbers
        for (let i = 1; i <= totalPages; i++) {
          paginationDiv.appendChild(
            createButton(i.toString(), i !== currentPage, () => {
              currentPage = i;
              renderTable(currentPage);
              renderPaginationControls();
            })
          );
        }

        // Add Next button
        paginationDiv.appendChild(
          createButton("Next", currentPage < totalPages, () => {
            currentPage += 1;
            renderTable(currentPage);
            renderPaginationControls();
          })
        );

        // Add controls to the document
        document.getElementById("content").appendChild(paginationDiv);
      };

      // Render initial table and controls
      renderTable(currentPage);
      renderPaginationControls();
    })
    .catch((error) => console.error("Error:", error));
}

export function generateTopicBadges(dataJson) {
  fetch(dataJson)
    .then((response) => response.json())
    .then((data) => {
      // Count occurrences of each topic
      const topicCounts = data.reduce((acc, post) => {
        acc[post.Topic] = (acc[post.Topic] || 0) + 1;
        return acc;
      }, {});

      // Convert to array and sort by count (descending)
      const sortedTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([topic]) => topic);

      // Create a div to hold the badges
      const badgeContainer = document.createElement("div");
      badgeContainer.className = "topic-tags";

      // Create a badge for each topic
      sortedTopics.forEach((topic) => {
        const badge = document.createElement("span");
        badge.className = "badge bg-primary";
        badge.textContent = `${topic} (${topicCounts[topic]})`;

        // Add click event to filter the table
        badge.addEventListener("click", () => {
          handleTopicSelection(dataJson, topic);
        });

        badgeContainer.appendChild(badge);
      });

      // Add the badge container to the document
      const contentDiv = document.getElementById("content");
      contentDiv.insertBefore(badgeContainer, contentDiv.firstChild);
    })
    .catch((error) => console.error("Error:", error));
}

export function generateTagBadges(dataJson) {
  fetch(dataJson)
    .then((response) => response.json())
    .then((data) => {
      // Collect all tags and count occurrences
      const tagCounts = data.reduce((acc, post) => {
        ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"].forEach((tagField) => {
          if (post[tagField]) {
            acc[post[tagField]] = (acc[post[tagField]] || 0) + 1;
          }
        });
        return acc;
      }, {});

      // Convert to array and sort by count (descending)
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag);

      // Create a div to hold the badges
      const badgeContainer = document.createElement("div");
      badgeContainer.className = "tag-badges";

      // Create a badge for each tag
      sortedTags.forEach((tag) => {
        const badge = document.createElement("span");
        badge.className = "badge rounded-pill bg-secondary";
        badge.textContent = `${tag} (${tagCounts[tag]})`;

        // Add click event to filter the table
        badge.addEventListener("click", () => {
          handleTagSelection(dataJson, tag);
        });

        badgeContainer.appendChild(badge);
      });

      // Create the collapsible container
      const collapsibleContainer = document.createElement("div");
      collapsibleContainer.className = "collapsible-container";

      // Create the toggle button
      const toggleButton = document.createElement("button");
      toggleButton.className = "btn btn-outline-primary btn-sm toggle-button";
      toggleButton.textContent = "Show Tags";

      // Initially hide the badgeContainer
      badgeContainer.style.display = "none";

      // Add click event to toggle visibility
      toggleButton.addEventListener("click", () => {
        if (badgeContainer.style.display === "none") {
          badgeContainer.style.display = "block";
          toggleButton.textContent = "Hide Tags";
        } else {
          badgeContainer.style.display = "none";
          toggleButton.textContent = "Show Tags";
        }
      });

      // Add the toggle button and badge container to the collapsible container
      collapsibleContainer.appendChild(toggleButton);
      collapsibleContainer.appendChild(badgeContainer);

      // Add the collapsible container to the document
      const contentDiv = document.getElementById("content");
      const topicTagsDiv = document.querySelector(".topic-tags");
      contentDiv.insertBefore(collapsibleContainer, topicTagsDiv.nextSibling);
    })
    .catch((error) => console.error("Error:", error));
}

export function handleTopicSelection(dataJson, topic) {
  // Clear the current table and regenerate it with the selected topic
  generateBlogPostsTable(dataJson, { topic: topic });
}

export function handleTagSelection(dataJson, tag) {
  // Generate a new table with the selected tag
  generateBlogPostsTable(dataJson, { tag: tag });
}

export function generateCardsFromJson(jsonFileName, cardType = null) {
  fetch(jsonFileName)
    .then((response) => response.json())
    .then((data) => {
      const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = ""; // Clear any existing content

      // Create a container to hold the project list
      const listContainer = document.createElement("div");
      listContainer.className = "projects-list";

      // Filter data based on cardType if provided
      const filteredData = cardType
        ? data.filter(
            (item) => item.type.toLowerCase() === cardType.toLowerCase()
          )
        : data;

      // Generate the list view for the filtered data
      filteredData.forEach((item) => {
        // Create a project row
        const projectRow = document.createElement("div");
        projectRow.className = "project-row";

        // Project header (always visible)
        const projectHeader = document.createElement("div");
        projectHeader.className = "project-header";
        projectHeader.innerHTML = `
          <span class="project-title">${item.title}</span>
          <span class="project-type">${item.type}</span>
          <button class="toggle-details btn btn-outline-primary btn-sm">Details</button>
        `;

        // Project details (hidden by default)
        const projectDetails = document.createElement("div");
        projectDetails.className = "project-details";
        projectDetails.style.display = "none"; // Initially hidden
        projectDetails.innerHTML = `
          <p class="project-description">${item.description}</p>
          <ul class="project-tech">Tech: ${item.tech}</ul>
          <div class="project-links">
            ${Object.entries(item.links)
              .map(
                ([key, value]) =>
                  `<a href="${value}" class="project-link" target="_blank">${key}</a>`
              )
              .join(" ")}
          </div>
        `;

        // Toggle visibility of details on button click
        const toggleButton = projectHeader.querySelector(".toggle-details");
        toggleButton.addEventListener("click", () => {
          const isVisible = projectDetails.style.display === "block";
          projectDetails.style.display = isVisible ? "none" : "block";
          toggleButton.textContent = isVisible ? "Details" : "Hide Details";
        });

        // Append header and details to the project row
        projectRow.appendChild(projectHeader);
        projectRow.appendChild(projectDetails);

        // Append the project row to the list container
        listContainer.appendChild(projectRow);
      });

      // Append the list container to the content div
      contentDiv.appendChild(listContainer);

      // If no data matches the filter, display a message
      if (filteredData.length === 0) {
        const noDataMessage = document.createElement("p");
        noDataMessage.textContent = `No ${cardType} projects found.`;
        contentDiv.appendChild(noDataMessage);
      }
    })
    .catch((error) => console.error("Error loading JSON file:", error));
}
