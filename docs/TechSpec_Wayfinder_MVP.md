# Wayfinder Technical Specification (MVP v0.1)

This document specifies the minimal technical requirements for implementing the Wayfinder MVP described in the PRD. It is stack-neutral and focuses on data models, core services, and key flows. Implementers can choose their preferred web framework, database, and client technologies.

---

## 1. Scope

The MVP implements:
- User management (assumes basic auth/session already available).
- Idea seeds (per user).
- Nodes (concepts) and lateral links between nodes.
- Micro-discovery prompts and user responses.
- Reflections and tags.
- A simple curiosity map service that returns nodes and edges.
- A self-narrative service that aggregates user activity and calls an LLM.

---

## 2. High-Level Architecture

- **Client (Web UI):**
  - Idea seed entry and selection.
  - Display of lateral connections and micro-discovery prompts.
  - Forms for responses and reflections.
  - Basic curiosity map visualization.
  - Display of self-narrative.

- **Backend (API):**
  - REST or GraphQL endpoints for managing seeds, nodes, links, micro-discoveries, reflections.
  - Integration with an LLM for:
    - Lateral connection generation
    - Micro-discovery prompt generation
    - Self-narrative generation

- **Database:**
  - Relational database with tables for users, seeds, nodes, links, micro-discoveries, reflections, and narratives.
  - Simple indexing on user_id and created_at for efficient querying.

---

## 3. Core Data Entities

See `DataModels_Wayfinder.md` for detailed schemas. At a high level, the entities are:

- **User**: Existing or provided by authentication layer.
- **IdeaSeed**: Initial idea text entered or chosen by the user.
- **Node**: A concept in the user’s curiosity map.
- **LateralLink**: A directed relation between two nodes.
- **MicroDiscovery**: A generated prompt and the user’s response.
- **Reflection**: User’s brief reflection and tag for a node.
- **SelfNarrative**: Cached narrative text for a user.

---

## 4. Key Services

### 4.1 Lateral Connection Service

**Input:** node_id, node concept text  
**Process:**
- Fetch node concept text from the database.
- Call LLM with a prompt that requests lateral (non-trivial, non-hierarchical) connections.
- Parse result into a list of new candidate concepts and short explanations.
- For each accepted concept (once user selects one), create a new Node and a LateralLink.

**Output:** list of candidate connections with concept text and short explanation.

### 4.2 Micro-Discovery Service

**Input:** node_id, concept text, optionally the originating seed/concept.  
**Process:**
- Call LLM to generate a short activity/prompt that can be completed in 1–5 minutes.
- Persist the generated prompt in a MicroDiscovery object when the user responds.
- Store the user’s response in the MicroDiscovery record.

**Output:** micro-discovery prompt text.

### 4.3 Reflection Service

**Input:** node_id, user-provided reflection text, tag string.  
**Process:**
- Store reflection and tag in a Reflection record.
- Optionally, future versions may call LLM to classify the reflection into standard tag categories.

**Output:** confirmation and stored reflection record.

### 4.4 Curiosity Map Service

**Input:** user_id.  
**Process:**
- Fetch all nodes and lateral links for the user.
- Serialize into a graph structure (nodes with ids and labels; edges with source, target, and relation).

**Output:** JSON representing a graph suitable for visualization.

### 4.5 Self-Narrative Service

**Input:** user_id.  
**Process:**
- Aggregate user data:
  - Frequently used tags
  - Most visited nodes
  - Variety and density of connections
  - Example reflections
- Call LLM with a structured summary of these data points.
- Receive a short narrative text.
- Store narrative in SelfNarrative table for caching.

**Output:** narrative text.

---

## 5. API Endpoints (Summary)

See `APIs_Wayfinder.md` for detailed request/response specs.

- POST `/api/seeds`
- GET `/api/seeds`
- GET `/api/nodes/:id/sideways`
- POST `/api/micro-discoveries`
- POST `/api/reflections`
- GET `/api/curiosity-map`
- POST `/api/self-narrative`

Authentication is assumed to be handled via an existing mechanism (e.g., session, token). All endpoints operate in the context of the current authenticated user.

---

## 6. Non-Functional Requirements

- **Performance:** Responses for lateral connections and narrative generation depend on LLM latency; all other endpoints should respond within typical web API timeframes.
- **Security:** Endpoints must scope all read/write operations to the authenticated user.
- **Privacy:** User data, including reflections and narratives, should be treated as personal and not shared across users.
- **Reliability:** LLM failures should be handled gracefully with user-facing error messages and logging for later review.

---

## 7. Future Extensions (Not in MVP)

- Tag clustering and visualization.
- Topic/domain clustering based on external knowledge graphs.
- Integration with personal knowledge management tools.
- Support for multimedia prompts and responses.
- Social features (discoverability of others’ curiosity maps).
