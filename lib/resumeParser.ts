export interface ParsedResume {
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  qualification?: string;
  course?: string;
  courseType?: string;
  specialization?: string;
  college?: string;
  startingYear?: string;
  passingYear?: string;
  gradingSystem?: number;
  gpa?: string;
  skills?: string[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  website?: string;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const { extractText } = await import("unpdf");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { text } = await extractText(buffer, { mergePages: true });
  return text;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const GRADING_SYSTEM_PROMPT = `
Map the grading/marks system to one of these integer values:
- 0 → "CGPA out of 10" / "10-point scale"
- 1 → "CGPA out of 4" / "4-point scale"
- 2 → "Percentage" / "% marks"
- 3 → "Pass/Fail" / no numeric grade
If unclear or not found, omit the field.
`.trim();

export async function parseResumeWithGroq(
  resumeText: string,
): Promise<ParsedResume> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_GROQ_API_KEY is not set in .env");

  const systemPrompt = `You are a resume parser. Extract structured information from the resume text provided by the user.
Return ONLY a valid JSON object — no markdown, no explanation, no code fences.

The JSON must follow this exact shape (omit fields you cannot find):
{
  "name": string,
  "phone": string (10-digit Indian mobile, digits only, no country code),
  "location": string (City, State),
  "bio": string (1-2 sentence professional summary, max 300 chars),
  "qualification": one of ["10th / Matriculation","12th / Intermediate","Graduation/Diploma","Post Graduation","PhD / Doctorate"],
  "course": one of ["B.Tech / B.E.","B.Sc","B.Com","B.A.","M.Tech / M.E.","MBA","MCA","BCA","BBA","Other"],
  "courseType": one of ["Full Time","Part Time","Distance Learning","Online"],
  "specialization": one of ["Computer Science and Engineering","Electronics & Communication","Mechanical Engineering","Civil Engineering","Information Technology","Data Science","MBA Finance","MBA Marketing","Other"],
  "college": string (university/institute name),
  "startingYear": string (4-digit year),
  "passingYear": string (4-digit year),
  "gradingSystem": integer (${GRADING_SYSTEM_PROMPT}),
  "gpa": string (numeric value only, e.g. "8.5" or "82.5"),
  "skills": string[] (list of technical and soft skills found),
  "linkedin": string (full URL),
  "github": string (full URL),
  "portfolio": string (full URL),
  "twitter": string (full URL),
  "website": string (full URL)
}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Parse this resume:\n\n${resumeText.slice(0, 12000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned) as ParsedResume;
  } catch {
    console.error("Failed to parse Groq response:", cleaned);
    return {};
  }
}
