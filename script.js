

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const contactForm = document.querySelector(".contact-form");
const formNote = document.querySelector(".form-note");
const wishForm = document.querySelector(".wish-form");
const wishFormNote = document.querySelector(".wish-form-note");
const wishBoard = document.querySelector(".wish-board");
const wishStorageKey = "portfolio-wishes";

const getStoredWishes = () => {
  try {
    const savedWishes = localStorage.getItem(wishStorageKey);
    if (!savedWishes) {
      return [];
    }

    const parsed = JSON.parse(savedWishes);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read saved wishes:", error);
    return [];
  }
};

const saveStoredWishes = (wishes) => {
  try {
    localStorage.setItem(wishStorageKey, JSON.stringify(wishes));
  } catch (error) {
    console.error("Could not save wishes locally:", error);
  }
};

let currentRemoteWishes = [];

const normalizeWishes = (wishes) => {
  if (Array.isArray(wishes)) {
    return wishes
      .filter(Boolean)
      .map((wish) => ({ id: wish.id || `wish-${Math.random().toString(36).slice(2, 9)}`, ...wish }))
      .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
  }

  return Object.entries(wishes || {})
    .map(([id, wish]) => ({ id, ...(wish || {}) }))
    .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
};

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navItems.forEach((item) => {
        item.classList.toggle("active", item.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  {
    rootMargin: "-45% 0px -45% 0px"
  }
);

sections.forEach((section) => sectionObserver.observe(section));

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const params = {
    name: document.querySelector("#name").value,
    email: document.querySelector("#email").value,
    message: document.querySelector("#message").value
  };

  formNote.textContent = "Sending...";

  try {
    await emailjs.send("service_dsbe046", "template_nwowa9n", params);
    await firebase.database().ref("contactMessages").push({
      ...params,
      createdAt: new Date().toISOString()
    });
    formNote.textContent = "Thanks! Your message has been sent.";
    contactForm.reset();
  } catch (error) {
    console.error("Message send error:", error);
    formNote.textContent = "Sorry, the message could not be sent. Please try again.";
  }
});

const renderWishCards = (wishes) => {
  if (!wishBoard) {
    return;
  }

  wishBoard.querySelectorAll(".wish-frame").forEach((card) => card.remove());

  const wishesList = normalizeWishes(wishes);

  if (!wishesList.length) {
    wishBoard.innerHTML = '<p class="wish-empty-state">No wishes yet. Be the first to share one.</p>';
    return;
  }

  wishBoard.innerHTML = "";

  wishesList.forEach((wish) => {
    const colors = ["#fff8b0", "#dff7da", "#ffd9e5", "#d9ecff", "#f7d7ff", "#ffe0b2"];
    const card = document.createElement("figure");
    card.className = "wish-frame wish-frame-small";
    card.innerHTML = `
      <article class="wish-card" style="background:${colors[Math.floor(Math.random() * colors.length)]};">
        <h3>${wish.message}</h3>
        <p></p>
        <span>— ${wish.name || "friend"}</span>
      </article>
    `;
    wishBoard.appendChild(card);
  });
};

wishForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.querySelector("#wish-name")?.value.trim() || "friend";
  const message = document.querySelector("#wish-message")?.value.trim();

  if (!message) {
    wishFormNote.textContent = "Please write your wish before sending.";
    return;
  }

  wishFormNote.textContent = "Saving your wish...";

  try {
    await firebase.database().ref("wishes").push({
      name,
      message,
      createdAt: new Date().toISOString()
    });

    wishFormNote.textContent = `Thanks, ${name}! Your wish has been saved.`;
    wishForm.reset();
  } catch (error) {
    console.error("Firebase save error:", error);
    wishFormNote.textContent = `Error: Could not save wish. Please check your connection and try again.`;
  }
});
const campusNotes = document.querySelectorAll(".campus-note");
const campusModal = document.querySelector(".campus-modal");
const campusModalTitle = document.querySelector("#campus-modal-title");
const campusModalCaption = document.querySelector(".campus-modal-caption");
const campusModalGallery = document.querySelector(".campus-modal-gallery");
const campusModalClose = document.querySelector(".campus-modal-close");

const openCampusModal = (note) => {
  if (!campusModal) {
    return;
  }

  campusModalTitle.textContent = note.dataset.title;
  campusModalCaption.textContent = note.dataset.caption;
  const images = note.dataset.images.split(",").map((image) => image.trim()).filter(Boolean);
  campusModalGallery.innerHTML = images
    .map((image, index) => `<img src="${image}" alt="${note.dataset.title} image ${index + 1}">`)
    .join("");
  campusModal.classList.add("open");
  campusModal.setAttribute("aria-hidden", "false");
  campusModalClose.focus();
};

const closeCampusModal = () => {
  if (!campusModal) {
    return;
  }

  campusModal.classList.remove("open");
  campusModal.setAttribute("aria-hidden", "true");
};

campusNotes.forEach((note) => {
  note.addEventListener("click", () => openCampusModal(note));
  note.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCampusModal(note);
    }
  });
});

campusModalClose?.addEventListener("click", closeCampusModal);

campusModal?.addEventListener("click", (event) => {
  if (event.target === campusModal) {
    closeCampusModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && campusModal?.classList.contains("open")) {
    closeCampusModal();
  }
});

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initial render with empty state
renderWishCards([]);

// Set up real-time listener for wishes
firebase.database().ref("wishes").on("value", (snapshot) => {
  const remoteWishes = snapshot.val();
  
  if (remoteWishes) {
    // Convert Firebase object format to array format
    currentRemoteWishes = normalizeWishes(remoteWishes);
    // Save to localStorage as backup
    saveStoredWishes(currentRemoteWishes);
  } else {
    currentRemoteWishes = [];
    saveStoredWishes([]);
  }
  
  // Always render the remote wishes (source of truth)
  renderWishCards(currentRemoteWishes);
}, (error) => {
  console.error("Firebase listener error:", error);
  // Fallback to showing stored wishes if listener fails
  renderWishCards(getStoredWishes());
});
