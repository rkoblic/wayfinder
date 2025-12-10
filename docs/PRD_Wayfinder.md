# Wayfinder PRD (Wandering Generalist Edition)

## 1. Overview

**Product name:** Wayfinder  
**Version:** MVP v0.1  
**Owner:** Learning & Product

Wayfinder is a curiosity-first learning product for “wandering generalists” who enjoy exploring ideas without predefined goals. The product generates lateral (sideways) connections from any starting concept, offers small interactive prompts (“micro-discoveries”), and maintains a personal “curiosity map” that reflects the user’s evolving interests and thinking patterns.

The MVP focuses on:
- Creating idea seeds
- Generating lateral connections
- Capturing micro-discoveries and reflections
- Storing and visualizing a simple curiosity graph
- Generating simple self-narratives from the user’s activity

Wayfinder is not a course platform and does not issue credentials or track mastery.

---

## 2. Problem Statement

Most learning tools assume clear goals: complete a course, pass an exam, qualify for a job. Some learners, however, are primarily motivated by open-ended exploration. They want to follow their curiosity across domains and discover topics, patterns, and identities they could not have anticipated.

Current tools either:
- Force predefined learning paths, or
- Offer unstructured content consumption (e.g., feeds) without guidance or reflection.

There is a gap for a tool that:
- Accepts goal-less exploration as valid
- Generates structured but open-ended pathways
- Reflects back who the learner is becoming through their curiosity

---

## 3. Goals and Non-Goals

### 3.1 Goals

- Enable users to start from any idea and explore surprising lateral connections.
- Encourage small, low-friction interactions (micro-discoveries) instead of long lessons.
- Build and persist a curiosity map per user (nodes and edges representing their exploration).
- Provide simple, text-based self-narratives summarizing how the user tends to explore.
- Maintain a lightweight, low-friction UX suitable for short daily sessions.

### 3.2 Non-Goals

- No formal courses, curricula, or learning objectives.
- No skills certification, grades, or exams.
- No career or job recommendations.
- No complex social features in the MVP (no following other users, no public profiles).
- No requirement for long-form content creation from the user.

---

## 4. Target Users

- Adults who enjoy learning and reading across multiple topics.
- “Wandering generalists” or polymath-leaning users who resist narrow specialization.
- Creatives, researchers, and knowledge workers who want structured serendipity.
- Users who already use note-taking or PKM tools but want a more generative, playful exploration layer.

---

## 5. User Experience (MVP)

### 5.1 Primary Flow

1. User lands on the home screen and either:
   - Enters a new idea seed (short text), or
   - Selects a previous idea seed from history, or
   - Requests a random idea seed.

2. System generates 3–6 lateral connections (“sideways ideas”) from the chosen seed/node.

3. User selects one lateral connection to explore.

4. System generates a micro-discovery prompt:
   - A short text prompt that invites the user to reflect, explain, compare, imagine, or design something in 1–5 minutes.

5. User responds to the micro-discovery prompt (short text, bullet points, or similar).

6. System requests a brief reflection:
   - “What surprised you, if anything? (optional)”
   - “Tag this node with a word or phrase (e.g., ‘systems’, ‘aesthetics’, ‘paradox’).”

7. System stores:
   - The chosen concepts and relationships
   - The micro-discovery prompt and response
   - The reflection text and tag

8. User can view their curiosity map:
   - Graph of nodes (concepts) and edges (lateral connections) they have explored.
   - Basic analytics such as recurring tags, common themes, or thinking styles.

9. User can request a self-narrative:
   - System generates a short paragraph describing the user’s exploration style based on their map and reflections.

### 5.2 Secondary Flows (Optional for MVP)

- Browse past nodes and micro-discoveries.
- Filter curiosity map by tag or time range.
- Mark certain nodes as “favorites” or “anchors.”

---

## 6. Core Features

1. **Idea Seed Input and Management**
   - Create, list, and reuse idea seeds.
   - Store seed text per user.

2. **Lateral Connection Generation**
   - Given a node (concept), generate multiple sideways connections.
   - Provide a short justification or explanation for each connection.

3. **Micro-Discovery Prompts**
   - Generate short, focused prompts that relate the lateral connection back to the user.
   - Prompts should be answerable in 1–5 minutes.

4. **Reflections and Tags**
   - Lightweight reflection after each micro-discovery.
   - One required tag field, optional free-text reflection.

5. **Curiosity Map Visualization**
   - Display nodes and edges for the user’s history.
   - Allow clicking nodes to inspect their content (seed, connections, responses).

6. **Self-Narrative Generation**
   - Summarize the user’s exploration patterns (e.g., frequent tags, recurring domains).
   - Output a short, plain-language narrative.

---

## 7. Success Metrics (MVP)

- ≥ 60% of active users complete 3 or more micro-discoveries per week.
- ≥ 50% of active users request at least one self-narrative within the first month.
- Average branching factor (number of connections explored per node) > 1.5.
- Positive qualitative feedback on ease of use and sense of discovery.

---

## 8. Constraints and Assumptions

- The system depends on an external LLM for generating lateral connections, prompts, and narratives.
- Initial implementation will use a generic database with simple relational models.
- Graph operations in the MVP can be implemented via adjacency lists in a relational database; a dedicated graph database is not required initially.
- The UI should be optimized for web and tablet; mobile web experience must be usable but can be simplified.

---

## 9. Risks

- Lateral connections may be trivial or uninteresting.
- Prompts may be too complex or too simple.
- Some users may expect goal tracking or progress metrics that the product intentionally does not provide.
- Overly complicated UI for the curiosity map may overwhelm users.

Mitigations:
- Iterate on prompt templates for the LLM.
- Use small pilot tests to adjust complexity of micro-discovery prompts.
- Provide a simple, clean visualization with minimal controls in the MVP.
- Clearly position the product as exploration-first in onboarding.

---

## 10. Out of Scope (MVP)

- Social features (sharing maps, following other users).
- Integration with external note-taking tools.
- Multimedia content (audio, video) beyond simple text-based prompts and responses.
- Advanced analytics or recommendation engines beyond basic summarization.
