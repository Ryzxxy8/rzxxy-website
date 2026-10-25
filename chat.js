export default async function handler&#40;req, res&#41; \{
if &#40;req\.method \!== “POST”&#41; \{
return res\.status&#40;405&#41;\.json&#40;\{
error: “Method not allowed”
\}&#41;;
\}

const apiKey = process\.env\.GROQ\_API\_KEY;

if &#40;\!apiKey&#41; \{
return res\.status&#40;500&#41;\.json&#40;\{
error: “AI service is not configured”
\}&#41;;
\}

const message = req\.body?\.message;

if &#40;typeof message \!== “string” \|\| \!message\.trim&#40;&#41;&#41; \{
return res\.status&#40;400&#41;\.json&#40;\{
error: “Please enter a message”
\}&#41;;
\}

try \{
const response = await fetch&#40;
“https://api\.groq\.com/openai/v1/chat/completions”,
\{
method: “POST”,
headers: \{
Authorization: `Bearer ${apiKey}`,
“Content\-Type”: “application/json”
\},
body: JSON\.stringify&#40;\{
model: “llama\-3\.3\-70b\-versatile”,
messages: &#91;
\{
role: “system”,
content: “You are RZXXY AI\. Reply in Burmese when the user speaks Burmese\. Be helpful and friendly\.”
\},
\{
role: “user”,
content: message\.trim&#40;&#41;\.slice&#40;0, 4000&#41;
\}
&#93;,
max\_tokens: 800
\}&#41;
\}
&#41;;

```
if (!response.ok) {
  console.error("Groq request failed:", response.status);

  return res.status(502).json({
    error: "AI could not respond right now. Please try again."
  });
}

const data = await response.json();
const reply = data.choices?.[0]?.message?.content;

return res.status(200).json({
  reply: reply || "အဖြေမရရှိပါ။"
});
```

\} catch &#40;error&#41; \{
console\.error&#40;“Chat API error:”, error\.message&#41;;

```
return res.status(500).json({
  error: "Something went wrong. Please try again."
});
```

\}
\}
