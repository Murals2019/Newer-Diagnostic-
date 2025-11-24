const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { data } = JSON.parse(event.body);

    if (!data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No data provided' })
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: `You are a professional AI diagnostic system. Analyze input data in detail and generate a structured report with the following sections:

1. **Data Separation & Categorization**
   - Symptomatic/Objective Data (measurements, labs, events)
   - Environmental/Contextual Data (history, lifestyle, environment)

2. **Two-Stage Analysis Summary**
   - Initial hypotheses from objective data
   - Adjusted analysis incorporating contextual factors

3. **Confidence Assessment**
   - AI Confidence Score (percentage)
   - Rationale for confidence level

4. **Ranked Differential Diagnoses**
   - List top 3-5 potential diagnoses
   - For each: likelihood (High/Medium/Low) and reasoning

5. **Plan & Recommendations**
   - Immediate actions
   - Follow-up steps
   - Monitoring requirements

6. **Essential Data Needed**
   - List any missing information that would improve diagnosis

Format your response in clean Markdown with clear headers and bullet points.` 
          },
          { role: "user", content: data }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const result = await response.json();

    if (!result.choices || !result.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    const report = result.choices[0].message.content;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ report })
    };

  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'AI analysis failed', 
        details: err.message 
      })
    };
  }
};