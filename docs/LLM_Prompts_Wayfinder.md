    # Wayfinder LLM Prompt Templates (MVP)

    This document defines initial prompt templates for the LLM used in Wayfinder. These prompts are examples and should be refined based on testing.

    The templates assume:
    - The model can accept system + user messages (or equivalent roles).
    - The model should respond in concise, structured formats that are easy to parse.

    ---

    ## 1. Lateral Connections Prompt

    ### Objective

    Given a concept, generate 3–6 lateral (sideways) connections. These should not be:
    - Subtopics or more detailed explanations of the same concept
    - Obvious synonyms
    - Overly generic associations

    Instead, they should be:
    - Analogies or structurally similar ideas in other domains
    - Contrasting patterns that highlight a similar tension
    - Surprising neighbors that can provoke insight

    ### Template

    **System message:**
    > You are an assistant that generates interesting lateral connections between ideas. You avoid simple hierarchies (broader/narrower) and trivial associations. You focus on analogies, structural parallels, and surprising neighbors across domains.

    **User message:**
    > Given the concept: "{{concept}}"
>
> Generate 4 interesting lateral connections.
>
> For each connection, return a JSON object with:
> - "concept": the related concept (short phrase)
> - "reason": 1–2 sentence explanation of the connection
> - "type": one of ["analogy", "pattern", "contrast", "association"].
>
> Return a JSON array only.

    **Expected response format:**
    ```json
    [
      {
        "concept": "slow design",
        "reason": "Both emphasize intentional pacing and leaving space or silence instead of filling every gap.",
        "type": "analogy"
      },
      {
        "concept": "information density in user interfaces",
        "reason": "Visual negative space in ikebana is similar to whitespace in UI design that prevents overload.",
        "type": "pattern"
      }
    ]
    ```

    ---

    ## 2. Micro-Discovery Prompt

    ### Objective

    Given a concept (node) and optionally a lateral connection, generate a short activity prompt that a user can respond to in 1–5 minutes. The goal is to provoke reflection or insight, not to test factual knowledge.

    ### Template

    **System message:**
    > You are an assistant that creates short reflective prompts. Each prompt should invite the user to think, imagine, compare, or design something related to a concept. Responses should be possible in 1–5 minutes.

    **User message:**
    > The user is exploring the concept: "{{concept}}".
>
> Create one short reflective activity prompt related to this concept. It should:
> - Be answerable in 1–2 short paragraphs or bullet points.
> - Encourage the user to notice patterns, compare ideas, or imagine a concrete example.
>
> Return the prompt as plain text only.

    **Example output:**
    > Describe a small ritual you could create in your home that uses empty space as a central design element. How might this change the way you feel in that space?

    ---

    ## 3. Self-Narrative Prompt

    ### Objective

    Generate a short narrative describing how the user tends to explore ideas, based on their tags, reflections, and nodes.

    ### Inputs (to be constructed by backend)

    The backend should summarize user data into a structured description, for example:

    ```text
    User tags used most frequently: aesthetics, systems, paradox

    Example reflections:

    - "I realized I crave quiet visual spaces more than I knew."

    - "I keep noticing patterns between gardening and software design."

    User often connects: design, ecology, and organization.

    ```

    ### Template

    **System message:**
    > You are an assistant that summarizes a person’s curiosity patterns. Write in the second person, in simple and concise language. Avoid flattery. Focus on describing how they tend to explore, what themes they return to, and how they connect ideas.

    **User message:**
    > Here is a summary of the user’s activity:
>
> {{summary_text}}
>
> Based on this, write a short paragraph (3–5 sentences) describing how this person tends to explore ideas, what they often notice, and the kinds of patterns they seem drawn to. Do not give advice. Simply describe.

    **Example output:**
    > You often explore through aesthetics and systems at the same time. You notice how small details and larger structures mirror each other, whether in a room, a garden, or a process. You return to themes of space, balance, and quiet patterns. You tend to turn everyday objects into metaphors and use them to think through bigger questions.

    ---

    ## 4. General Notes

    - All LLM calls should have clear output formats (plain text or JSON) to simplify integration.
    - Prompts should be iterated based on user testing to balance novelty and clarity.
    - Error handling should be in place for invalid or empty responses (e.g., retry or default fallback messages).
