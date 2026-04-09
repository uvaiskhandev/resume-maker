const form = document.getElementById("resumeForm");
const preview = document.getElementById("resumePreview");
const statusBox = document.getElementById("statusBox");
const generateBtn = document.getElementById("generateBtn");
const printResumeBtn = document.getElementById("printResumeBtn");
const copyTextBtn = document.getElementById("copyTextBtn");
const themeToggle = document.getElementById("themeToggle");
const fillSampleBtn = document.getElementById("fillSampleBtn");
const clearBtn = document.getElementById("clearBtn");
const templateSelect = document.getElementById("template");

let latestResumeData = null;

function setStatus(message, type = "loading") {
  statusBox.className = `status-box ${type}`;
  statusBox.textContent = message;
}

function hideStatus() {
  statusBox.className = "status-box hidden";
  statusBox.textContent = "";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function splitTextToArray(text = "") {
  return text
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMultilineEntries(text = "") {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function collectFormData() {
  return {
    fullName: document.getElementById("fullName").value.trim(),
    jobTitle: document.getElementById("jobTitle").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    location: document.getElementById("location").value.trim(),
    linkedin: document.getElementById("linkedin").value.trim(),
    portfolio: document.getElementById("portfolio").value.trim(),
    currentSummary: document.getElementById("currentSummary").value.trim(),
    skills: document.getElementById("skills").value.trim(),
    education: document.getElementById("education").value.trim(),
    experience: document.getElementById("experience").value.trim(),
    projects: document.getElementById("projects").value.trim(),
    certifications: document.getElementById("certifications").value.trim(),
    jobDescription: document.getElementById("jobDescription").value.trim(),
    template: document.getElementById("template").value,
    experienceLevel: document.getElementById("experienceLevel").value
  };
}

function validateData(data) {
  if (!data.fullName) return "Full Name required hai.";
  if (!data.jobTitle) return "Target Job Role required hai.";
  if (!data.skills && !data.experience && !data.projects && !data.education) {
    return "Kam se kam Skills, Education, Experience ya Projects me se kuchh to bharo.";
  }
  return "";
}

function renderFallbackResume(data) {
  const skills = splitTextToArray(data.skills);
  const education = parseMultilineEntries(data.education);
  const experience = parseMultilineEntries(data.experience);
  const projects = parseMultilineEntries(data.projects);
  const certifications = parseMultilineEntries(data.certifications);

  const contactItems = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.portfolio
  ].filter(Boolean);

  preview.className = `resume ${data.template || "modern"}`;
  preview.innerHTML = `
    <div class="resume-header">
      <h2 class="resume-name">${escapeHtml(data.fullName)}</h2>
      <p class="resume-role">${escapeHtml(data.jobTitle)}</p>
      <div class="resume-contact">
        ${contactItems.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>

    <section class="resume-section">
      <h3>Professional Summary</h3>
      <p>${escapeHtml(data.currentSummary || "A motivated professional seeking opportunities to contribute skills and grow in a dynamic environment.")}</p>
    </section>

    ${
      skills.length
        ? `
      <section class="resume-section">
        <h3>Skills</h3>
        <ul class="resume-tags">
          ${skills.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `
        : ""
    }

    ${
      experience.length
        ? `
      <section class="resume-section">
        <h3>Experience</h3>
        <ul class="resume-list">
          ${experience.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `
        : ""
    }

    ${
      education.length
        ? `
      <section class="resume-section">
        <h3>Education</h3>
        <ul class="resume-list">
          ${education.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `
        : ""
    }

    ${
      projects.length
        ? `
      <section class="resume-section">
        <h3>Projects</h3>
        <ul class="resume-list">
          ${projects.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `
        : ""
    }

    ${
      certifications.length
        ? `
      <section class="resume-section">
        <h3>Certifications</h3>
        <ul class="resume-list">
          ${certifications.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `
        : ""
    }
  `;
}

function renderResume(aiData, selectedTemplate = "modern") {
  const contactItems = [
    aiData.email,
    aiData.phone,
    aiData.location,
    aiData.linkedin,
    aiData.portfolio
  ].filter(Boolean);

  preview.className = `resume ${selectedTemplate}`;
  preview.innerHTML = `
    <div class="resume-header">
      <h2 class="resume-name">${escapeHtml(aiData.fullName || "")}</h2>
      <p class="resume-role">${escapeHtml(aiData.jobTitle || "")}</p>
      <div class="resume-contact">
        ${contactItems.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>

    ${
      aiData.summary
        ? `
      <section class="resume-section">
        <h3>Professional Summary</h3>
        <p>${escapeHtml(aiData.summary)}</p>
      </section>
    `
        : ""
    }

    ${
      aiData.skills?.length
        ? `
      <section class="resume-section">
        <h3>Skills</h3>
        <ul class="resume-tags">
          ${aiData.skills.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `
        : ""
    }

    ${
      aiData.experience?.length
        ? `
      <section class="resume-section">
        <h3>Experience</h3>
        ${aiData.experience
          .map(
            (item) => `
          <div class="resume-item">
            <strong>${escapeHtml(item.title || "")}</strong>
            <span>${escapeHtml(item.company || "")}${item.duration ? " • " + escapeHtml(item.duration) : ""}</span>
            <p>${escapeHtml(item.description || "")}</p>
          </div>
        `
          )
          .join("")}
      </section>
    `
        : ""
    }

    ${
      aiData.projects?.length
        ? `
      <section class="resume-section">
        <h3>Projects</h3>
        ${aiData.projects
          .map(
            (item) => `
          <div class="resume-item">
            <strong>${escapeHtml(item.name || "")}</strong>
            <span>${escapeHtml(item.tech || "")}</span>
            <p>${escapeHtml(item.description || "")}</p>
          </div>
        `
          )
          .join("")}
      </section>
    `
        : ""
    }

    ${
      aiData.education?.length
        ? `
      <section class="resume-section">
        <h3>Education</h3>
        ${aiData.education
          .map(
            (item) => `
          <div class="resume-item">
            <strong>${escapeHtml(item.degree || "")}</strong>
            <span>${escapeHtml(item.institute || "")}${item.year ? " • " + escapeHtml(item.year) : ""}</span>
          </div>
        `
          )
          .join("")}
      </section>
    `
        : ""
    }

    ${
      aiData.certifications?.length
        ? `
      <section class="resume-section">
        <h3>Certifications</h3>
        <ul class="resume-list">
          ${aiData.certifications.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `
        : ""
    }
  `;
}

function getPlainResumeText() {
  return preview.innerText.trim();
}

async function copyResumeText() {
  const text = getPlainResumeText();
  if (!text) {
    setStatus("Copy karne ke liye pehle resume generate karo.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus("Resume text copied successfully.", "success");
  } catch (error) {
    setStatus("Copy failed. Browser permission issue ho sakti hai.", "error");
  }
}

function fillDemoData() {
  document.getElementById("fullName").value = "Uvais Khan";
  document.getElementById("jobTitle").value = "Front-End Developer";
  document.getElementById("email").value = "uvais@example.com";
  document.getElementById("phone").value = "+91 74530 82975";
  document.getElementById("location").value = "Bareilly, Uttar Pradesh";
  document.getElementById("linkedin").value = "linkedin.com/in/uvais-khan";
  document.getElementById("portfolio").value = "https://uvais.vercel.app";
  document.getElementById("currentSummary").value =
    "Motivated front-end developer with interest in modern web design, responsive UI, and user-friendly digital experiences.";
  document.getElementById("skills").value =
    "HTML, CSS, JavaScript, Responsive Design, UI Design, MS Office, Graphic Design, Data Entry";
  document.getElementById("education").value =
    "Diploma in Computer Application - ABC Institute - 2024\n12th - UP Board - 2025";
  document.getElementById("experience").value =
    "Freelance Designer - Fiverr - 2024 to Present\nCreated thumbnails, social media creatives, banners, and responsive web pages for clients.";
  document.getElementById("projects").value =
    "Personal Portfolio Website - HTML, CSS, JS - Built a responsive portfolio with modern animations.\nInstagram Caption Generator - JavaScript - Created a tool for caption and hashtag generation.";
  document.getElementById("certifications").value =
    "Diploma in Computer Application\nGraphic Design Practice Certificate";
  document.getElementById("jobDescription").value =
    "We are looking for a Front-End Developer with experience in HTML, CSS, JavaScript, responsive UI, teamwork, and clean code practices.";
  document.getElementById("template").value = "modern";
  document.getElementById("experienceLevel").value = "fresher";

  setStatus("Demo data filled.", "success");
}

function clearAll() {
  form.reset();
  latestResumeData = null;
  preview.className = "resume modern";
  preview.innerHTML = `
    <div class="resume-empty">
      <h3>Your resume preview will appear here</h3>
      <p>Form fill karo aur AI generate button dabao.</p>
    </div>
  `;
  hideStatus();
}

async function generateResume(event) {
  event.preventDefault();

  const data = collectFormData();
  const validationError = validateData(data);

  if (validationError) {
    setStatus(validationError, "error");
    return;
  }

  setStatus("AI resume generate ho raha hai... thoda wait karo.", "loading");
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Something went wrong.");
    }

    latestResumeData = result.resume;
    renderResume(result.resume, data.template);
    setStatus("AI resume successfully generate ho gaya.", "success");
  } catch (error) {
    console.error(error);
    renderFallbackResume(data);
    setStatus(
      `AI response me issue aaya, isliye fallback preview dikhaya gaya hai. Error: ${error.message}`,
      "error"
    );
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate AI Resume";
  }
}

function applyTheme() {
  const savedTheme = localStorage.getItem("resume-theme") || "dark";
  document.body.classList.toggle("light", savedTheme === "light");
  themeToggle.textContent = savedTheme === "light" ? "☀️ Theme" : "🌙 Theme";
}

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("resume-theme", isLight ? "dark" : "light");
  applyTheme();
});

templateSelect.addEventListener("change", () => {
  if (latestResumeData) {
    renderResume(latestResumeData, templateSelect.value);
  } else {
    preview.className = `resume ${templateSelect.value}`;
  }
});

form.addEventListener("submit", generateResume);
fillSampleBtn.addEventListener("click", fillDemoData);
clearBtn.addEventListener("click", clearAll);
copyTextBtn.addEventListener("click", copyResumeText);
printResumeBtn.addEventListener("click", () => window.print());

applyTheme();