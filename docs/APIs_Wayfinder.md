# Wayfinder API Specifications (MVP)

This document defines suggested REST-style API endpoints for the Wayfinder MVP. These endpoints are designed to support the UX flows in the PRD. Authentication details are implementation-specific and omitted here; all endpoints assume an authenticated user context.

Base path is assumed to be `/api`.

---

## 1. Idea Seeds

### 1.1 Create Idea Seed

**POST** `/api/seeds`

**Request body (JSON):**
```json
{
  "text": "ikebana and negative space"
}
```

**Response (201 Created):**
```json
{
  "id": "seed-uuid",
  "text": "ikebana and negative space",
  "created_at": "2025-01-01T12:00:00Z"
}
```

---

### 1.2 List Idea Seeds

**GET** `/api/seeds`

**Query params (optional):**
- `limit` (integer)
- `offset` (integer)

**Response (200 OK):**
```json
[
  {
    "id": "seed-uuid-1",
    "text": "ikebana and negative space",
    "created_at": "2025-01-01T12:00:00Z"
  },
  {
    "id": "seed-uuid-2",
    "text": "entropy in daily life",
    "created_at": "2025-01-02T09:30:00Z"
  }
]
```

---

## 2. Nodes and Lateral Connections

### 2.1 Get Sideways Connections for a Node

**GET** `/api/nodes/:id/sideways`

**Path param:**
- `id`: Node ID

**Response (200 OK):**
```json
{
  "node": {
    "id": "node-uuid",
    "concept": "ikebana and negative space"
  },
  "connections": [
    {
      "concept": "slow design",
      "reason": "Both focus on intentional emptiness and pacing.",
      "type": "analogy"
    },
    {
      "concept": "information density in UI design",
      "reason": "Similar tension between crowded and sparse visuals.",
      "type": "pattern"
    }
  ]
}
```

In the MVP, new Nodes and LateralLinks can be created when the user selects one of these connections for further exploration (e.g., a separate endpoint or part of the micro-discovery creation flow).

---

## 3. Micro-Discoveries

### 3.1 Create Micro-Discovery (Generate Prompt and Store Response)

**POST** `/api/micro-discoveries`

**Request body (JSON):**
```json
{
  "node_id": "node-uuid",
  "response": "I notice how leaving space makes the focal point feel stronger."
}
```

**Behavior:**
- Backend may generate and return a micro-discovery prompt on a previous step or as part of this request flow.
- In a simple implementation, the prompt is generated before showing the input to the user; this endpoint then records the user’s response.

**Response (201 Created):**
```json
{
  "id": "micro-uuid",
  "node_id": "node-uuid",
  "prompt": "Describe a small ritual you could create at home that uses empty space as a design element.",
  "response": "I might clear a small table and only place one item there that I change weekly.",
  "created_at": "2025-01-03T10:00:00Z"
}
```

---

## 4. Reflections

### 4.1 Create Reflection

**POST** `/api/reflections`

**Request body (JSON):**
```json
{
  "node_id": "node-uuid",
  "surprise": "I realized I crave quiet visual spaces more than I knew.",
  "tag": "aesthetics",
  "metaphor": "Like pruning a garden of objects."
}
```

**Response (201 Created):**
```json
{
  "id": "reflection-uuid",
  "node_id": "node-uuid",
  "surprise": "I realized I crave quiet visual spaces more than I knew.",
  "tag": "aesthetics",
  "metaphor": "Like pruning a garden of objects.",
  "created_at": "2025-01-03T10:05:00Z"
}
```

---

## 5. Curiosity Map

### 5.1 Get Curiosity Map for Current User

**GET** `/api/curiosity-map`

**Response (200 OK):**
```json
{
  "nodes": [
    {
      "id": "node-uuid-1",
      "concept": "ikebana and negative space"
    },
    {
      "id": "node-uuid-2",
      "concept": "slow design"
    }
  ],
  "edges": [
    {
      "from_node": "node-uuid-1",
      "to_node": "node-uuid-2",
      "relation": "analogy"
    }
  ]
}
```

The client can use this structure to render a graph visualization.

---

## 6. Self-Narrative

### 6.1 Generate Self-Narrative

**POST** `/api/self-narrative`

**Request body:** none

**Behavior:**
- Backend aggregates user activity data (tags, nodes, reflections).
- Backend calls LLM to generate a narrative.
- Narrative is stored and returned.

**Response (200 OK):**
```json
{
  "id": "narrative-uuid",
  "narrative": "You often explore through aesthetics and systems, turning everyday objects into metaphors. You return to themes of space, balance, and quiet patterns.",
  "created_at": "2025-01-04T11:00:00Z"
}
```

Optionally, a GET endpoint such as `/api/self-narrative` can retrieve the latest narrative without generating a new one.

---

## 7. Error Handling

Common responses:
- `400 Bad Request` for invalid or missing parameters.
- `401 Unauthorized` when user is not authenticated.
- `404 Not Found` for missing entities (e.g., node not found).
- `500 Internal Server Error` for unhandled exceptions or LLM failures.

LLM failures should be logged, and responses should include a simple error message that encourages the user to retry later.

---

## 8. Rate Limiting and Quotas

Because LLM calls are a significant cost driver, it may be useful to:
- Limit the number of lateral connection generations per user per day.
- Limit the number of self-narrative generations per user per week.

These policies can be enforced at a gateway or API level and are not strictly part of the MVP behavior but should be considered in implementation.
