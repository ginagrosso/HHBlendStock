# AI Agent Skills Index

## Purpose
Este README sirve como índice y guía rápida para los *skill agents* disponibles en `.agents/skills`.
Los skills contienen reglas, plantillas y referencias que los agentes usan para responder y ejecutar tareas relacionadas.

## Uso rápido
1. Identificar la intención del pedido.
2. Buscar el skill más relevante dentro de `.agents/skills/`.
3. Abrir su `SKILL.md` (o `agent.md` / `rules.md`) y aplicar las convenciones locales.

## Skills disponibles
- `commits/` — helpers y plantillas relacionadas a commits y convenciones de versionado. (ver `.agents/skills/commits/agent.md` y `templates.md`)
- `developing-genkit-js/` — guía y plantillas para desarrollo de genkits y herramientas JS (ver `SKILL.md` y `references/`).
- `documentation/` — reglas y plantillas para generación de documentación técnica.
- `firebase-auth-basics/` — referencias y guía para autenticación con Firebase (cliente web y reglas).
- `firebase-basics/` — guías de configuración general de Firebase, CLI y entornos locales.
- `firebase-firestore/` — prácticas y referencias para diseño de Firestore y reglas de seguridad.
- `firebase-hosting-basics/` — configuración y despliegue en Firebase Hosting.
- `firebase-security-rules-auditor/` — utilidades y procesos para auditar reglas de seguridad.

Cada skill normalmente incluye:
- `SKILL.md` o `agent.md` — documento principal con intención del skill y convenciones.
- `rules.md` — reglas operativas o de comportamiento del agente.
- `templates.md` — plantillas reutilizables (commits, PRs, mensajes, etc.).
- `references/` — documentación técnica y ejemplos.

## Cómo agregar un nuevo skill
1. Crear una carpeta en `.agents/skills/<nombre>`.
2. Incluir al menos `SKILL.md` describiendo el propósito y límites del skill.
3. Añadir `rules.md` si hay reglas operativas específicas y `templates.md` si hay plantillas.
4. Registrar el nuevo skill en este README si es relevante para búsquedas rápidas.

## Dónde buscar recursos útiles
- Plantillas de commits y convenciones: `.agents/skills/commits/templates.md`
- Buenas prácticas Firebase: `.agents/skills/firebase-basics` y `.agents/skills/firebase-firestore`.
- Ejemplos y referencias para SDKs: revisar los subfolders `references/` dentro de cada skill.

## Buenas prácticas al usar estos skills
- Priorizar `SKILL.md` y `rules.md` dentro del skill escogido antes de ejecutar cambios.
- Mantener los cambios pequeños y enfocados; referenciar el skill en el commit.
- Si un skill necesita actualización, editar su `SKILL.md` y añadir una nota en `commits/agent.md`.

---
Si querés, puedo generar un índice más detallado (lista de archivos por skill con enlaces internos) o actualizar este README para incluir ejemplos concretos de uso para Firebase y documentación.
