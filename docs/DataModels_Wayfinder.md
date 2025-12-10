# Wayfinder Data Models (MVP)

This document describes the core data models for the Wayfinder MVP in a relational database. Field types are indicative and can be adjusted based on the chosen database and ORM.

---

## 1. User

The User table may already exist if an authentication system is in place. Minimal fields needed by Wayfinder:

- `id` (UUID or integer, primary key)
- `email` (string, optional in this context)
- `created_at` (timestamp)

Wayfinder will reference `user_id` in its own tables.

---

## 2. IdeaSeed

Represents an initial concept entered or chosen by the user.

- `id` (UUID, primary key)
- `user_id` (foreign key to User.id)
- `text` (string or text)
- `created_at` (timestamp)

Each IdeaSeed can lead to one or more Nodes in the curiosity map.

---

## 3. Node

Represents a concept in the user’s curiosity map. The first Node related to an IdeaSeed may directly mirror the seed text.

- `id` (UUID, primary key)
- `user_id` (foreign key to User.id)
- `seed_id` (foreign key to IdeaSeed.id, nullable if node is derived from other nodes)
- `concept` (string or text) — short representation of the idea
- `generated_via` (string) — e.g., `"seed"` or `"sideways"`
- `metadata` (JSON, optional) — store additional attributes if needed
- `created_at` (timestamp)

---

## 4. LateralLink

Represents a directed connection between two Nodes. These links define the edges in the curiosity map.

- `id` (UUID, primary key)
- `from_node` (foreign key to Node.id)
- `to_node` (foreign key to Node.id)
- `relation` (string) — e.g., `"analogy"`, `"contrast"`, `"pattern"`, `"association"`
- `created_at` (timestamp)

This model allows one user’s graph to be constructed by querying Nodes and LateralLinks where `user_id` matches.

---

## 5. MicroDiscovery

Stores the prompt and the user’s response for a micro-discovery associated with a given Node.

- `id` (UUID, primary key)
- `user_id` (foreign key to User.id)
- `node_id` (foreign key to Node.id)
- `prompt` (text) — the generated micro-discovery prompt
- `response` (JSON or text) — the user’s response
- `created_at` (timestamp)

The `response` field can be plain text or JSON if structured responses are desired later.

---

## 6. Reflection

Represents a short reflection and tag for a given Node. Multiple reflections per node are possible, but in the MVP we expect one per micro-discovery interaction.

- `id` (UUID, primary key)
- `user_id` (foreign key to User.id)
- `node_id` (foreign key to Node.id)
- `surprise` (text, nullable) — user’s description of surprise or insight
- `tag` (string) — a short tag such as `"systems"`, `"aesthetics"`, `"paradox"`
- `metaphor` (text, nullable) — optional metaphor or phrase
- `created_at` (timestamp)

In later versions, tags and metaphors may be normalized into separate tables or enumerations.

---

## 7. SelfNarrative

Caches narrative text that summarizes the user’s curiosity patterns. New narratives can be generated on demand and stored as separate records or by updating the existing one.

- `id` (UUID, primary key)
- `user_id` (foreign key to User.id)
- `narrative` (text)
- `created_at` (timestamp)

Optionally, a `type` field could indicate different narrative styles or versions.

---

## 8. Indexing Considerations

To support common queries efficiently:

- Index `user_id` on Node, LateralLink, MicroDiscovery, Reflection, and SelfNarrative.
- Index `created_at` where sorting by recency is common.
- Consider composite indexes such as `(user_id, created_at)` on Node and MicroDiscovery for timeline views.

---

## 9. Migration Strategy

- Start by creating the core tables: IdeaSeed, Node, LateralLink, MicroDiscovery, Reflection, SelfNarrative.
- Ensure foreign key constraints are in place for referential integrity.
- Backfill or integrate with existing User table from the authentication system.

This minimal set of models is sufficient to implement the MVP as described in the PRD and Tech Spec.
