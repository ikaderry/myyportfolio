const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const contactForm = document.querySelector(".contact-form");
const formNote = document.querySelector(".form-note");

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

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const params = {
    name: document.querySelector("#name").value,
    email: document.querySelector("#email").value,
    message: document.querySelector("#message").value
  };

  formNote.textContent = "Sending...";

  try {
    await emailjs.send("service_dsbe046", "template_nwowa9n", params);
    formNote.textContent = "Thanks! Your message has been sent.";
    contactForm.reset();
  } catch (error) {
    console.error("EmailJS error:", error);
    formNote.textContent = "Sorry, the message could not be sent. Please check the EmailJS settings.";
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


