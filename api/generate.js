module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY in environment variables."
      });
    }

    const body = req.body || {};
    const {
      fullName = "",
      jobTitle = "",
      email = "",
      phone = "",
      location = "",
      linkedin = "",
      portfolio = "",
      currentSummary = "",
      skills = "",
      education = "",
      experience = "",
      projects = "",
      certifications = "",
      jobDescription = "",
      experienceLevel = "fresher"
    } = body;

    const prompt = `
You are an expert resume writer and ATS resume optimizer.

Create a highly professional, concise, ATS-friendly resume in JSON only.
Do not include markdown.
Do not include code fences.
Do not include explanations outside JSON.

Rules:
- Improve grammar and wording.
- Keep the output honest and based on user input.
- Do not invent fake companies, fake years, or fake achievements.
- If details are missing, keep them brief and generic without making false claims.
- Tailor the resume for the target job role and job description if provided.
- Use impactful but realistic language.
- Keep summary to 2-4 lines.
- Skills should be short and relevant.
- Experience and projects should sound professional.
- Education should be structured.
- Certifications should be simple strings.
- Return valid JSON matching this exact shape:

{
  "fullName": "string",
  "jobTitle": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string",
  "portfolio": "string",
  "summary": "string",
  "skills": ["string", "string"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "tech": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institute": "string",
      "year": "string"
    }
  ],
  "certifications": ["string", "string"]
}

Candidate Data:
Full Name: ${fullName}
Target Job Role: ${jobTitle}
Email: ${email}
Phone: ${phone}
Location: ${location}
LinkedIn: ${linkedin}
Portfolio: ${portfolio}
Experience Level: ${experienceLevel}

Current Summary:
${currentSummary}

Skills:
${skills}

Education:
${education}

Experience:
${experience}

Projects:
${projects}

Certifications:
${certifications}

Job Description:
${jobDescription}
`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.6,
            topP: 0.9,
            maxOutputTokens: 2200
          }
        })
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const apiError =
        data?.error?.message || "Gemini API request failed.";
      return res.status(500).json({ error: apiError });
    }

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText) {
      return res.status(500).json({ error: "Empty response from Gemini." });
    }

    const cleanedText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Gemini response JSON parse nahi hua. Try again."
      });
    }

    const safeResume = {
      fullName: parsed.fullName || fullName,
      jobTitle: parsed.jobTitle || jobTitle,
      email: parsed.email || email,
      phone: parsed.phone || phone,
      location: parsed.location || location,
      linkedin: parsed.linkedin || linkedin,
      portfolio: parsed.portfolio || portfolio,
      summary: parsed.summary || currentSummary || "",
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : []
    };

    return res.status(200).json({ resume: safeResume });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      error: "Internal server error."
    });
  }
};