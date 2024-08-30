export function loadContent(pageName) {
  $("#content")
    .empty()
    .load(pageName + ".html");
}

export function generateBlogPostsTable(
  dataJson,
  filter = { topic: null, tag: null }
) {
  fetch(dataJson)
    .then((response) => response.json())
    .then((data) => {
      // Filter data if topic is provided
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
      // Process the data to combine tags
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
      const existingTable = document.querySelector(".medium-posts-table");
      if (existingTable) {
        existingTable.remove();
      }
      // Create table
      let table = document.createElement("table");
      table.className =
        "medium-posts-table table table-striped table-bordered table-hover table-sm table-responsive";

      // Create table header
      let thead = table.createTHead();
      let headerRow = thead.insertRow();
      for (let key in processedData[0]) {
        if (key !== "URL") {
          let th = document.createElement("th");
          th.textContent = key;
          headerRow.appendChild(th);
        }
      }

      // Create table body
      let tbody = table.createTBody();
      processedData.forEach((post) => {
        let row = tbody.insertRow();
        row.className = "align-middle";
        for (let key in post) {
          if (key !== "URL") {
            let cell = row.insertCell();
            if (key === "Title") {
              let a = document.createElement("a");
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

      // Add table to the document
      document.getElementById("content").appendChild(table);
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

      // Create a parent div to hold all the cards
      const cardsContainer = document.createElement("div");
      cardsContainer.className = "cards-container";

      // Filter data based on cardType if provided
      const filteredData = cardType
        ? data.filter(
            (item) => item.type.toLowerCase() === cardType.toLowerCase()
          )
        : data;

      // Generate cards for the filtered data
      filteredData.forEach((item) => {
        // Create card container
        const card = document.createElement("div");
        card.className = "card mb-3";

        // Card header
        const cardHeader = document.createElement("h3");
        cardHeader.className = "card-header";
        cardHeader.textContent = item.type;
        card.appendChild(cardHeader);

        // Card body with title and subtitle
        const cardBody1 = document.createElement("div");
        cardBody1.className = "card-body";
        const cardTitle = document.createElement("h5");
        cardTitle.className = "card-title";
        cardTitle.textContent = item.title;
        const cardSubtitle = document.createElement("h6");
        cardSubtitle.className = "card-subtitle text-muted";
        cardSubtitle.textContent = item.support;
        cardBody1.appendChild(cardTitle);
        cardBody1.appendChild(cardSubtitle);
        card.appendChild(cardBody1);

        // Card body with description
        const cardBody2 = document.createElement("div");
        cardBody2.className = "card-body";
        const cardText = document.createElement("p");
        cardText.className = "card-text";
        cardText.textContent = item.description;
        cardBody2.appendChild(cardText);
        card.appendChild(cardBody2);

        // List group with tech stack
        const listGroup = document.createElement("ul");
        listGroup.className = "list-group list-group-flush";
        const listGroupItem = document.createElement("li");
        listGroupItem.className = "list-group-item";
        listGroupItem.textContent = item.tech;
        listGroup.appendChild(listGroupItem);
        card.appendChild(listGroup);

        // Card body with links or plain text
        const cardBody3 = document.createElement("div");
        cardBody3.className = "card-body";
        Object.entries(item.links).forEach(([key, value]) => {
          if (key === "_") {
            const textElement = document.createElement("p");
            textElement.className = "card-text";
            textElement.textContent = value;
            cardBody3.appendChild(textElement);
          } else {
            const link = document.createElement("a");
            link.href = value !== "Under Development" ? value : "#";
            link.className = "card-link";
            link.textContent = key;
            link.target = "_blank"; // Open the link in a new tab
            cardBody3.appendChild(link);
          }
        });
        card.appendChild(cardBody3);

        // Append the card to the cards container
        cardsContainer.appendChild(card);
      });

      // Append the cards container to the content div
      contentDiv.appendChild(cardsContainer);

      // If no data matches the filter, display a message
      if (filteredData.length === 0) {
        const noDataMessage = document.createElement("p");
        noDataMessage.textContent = `No ${cardType} cards found.`;
        contentDiv.appendChild(noDataMessage);
      }
    })
    .catch((error) => console.error("Error loading JSON file:", error));
}
