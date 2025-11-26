# Roadmap de Implementación: De Maqueta a Producción

![Roadmap de Implementación](/infografia_roadmap.png)

Este documento sirve como guía para presentar el proyecto al equipo de TI de la empresa mandante y planificar la transición de este prototipo (MVP) a un sistema oficial en producción.

## 1. Validación del MVP (Estado Actual)
Actualmente tienes una **Maqueta Funcional de Alta Fidelidad**.
*   **Logro**: Digitaliza el proceso de papel actual.
*   **Tecnología**: Stack moderno y escalable (Astro + Node.js + Supabase).
*   **Objetivo**: Que la gerencia/operaciones apruebe la funcionalidad y el flujo.

## 2. Auditoría TI & Seguridad (El "Pase" a Producción)
Una vez aprobado el concepto, el equipo de TI debe validar la solución.
*   **Código Fuente**: Entrega del repositorio (GitHub/GitLab) para revisión de calidad.
*   **Credenciales**: Actualmente usas claves de desarrollo. Para producción, TI debe generar nuevas credenciales de base de datos y almacenarlas en variables de entorno seguras (Vault, AWS Secrets, etc.).
*   **Seguridad de Datos**: Revisión de las políticas RLS (Row Level Security) de Supabase para asegurar que cada empresa vea solo lo que le corresponde.

## 3. Infraestructura & Base de Datos
¿Qué hacemos con Supabase (Free Tier)?
*   **Recomendación Profesional**: Migrar a un plan **Pro (Team)** de Supabase o **Self-Hosted**.
    *   *Por qué*: El plan gratuito se "pausa" tras inactividad y tiene límites de conexión. Un entorno corporativo necesita SLAs (garantía de servicio), backups automáticos diarios y soporte.
*   **Alternativa Corporativa**: Si la empresa no permite nubes públicas, Supabase se puede instalar en servidores propios (Docker) o usar una base de datos PostgreSQL existente de la empresa.

## 4. Despliegue (Deploy)
¿Dónde vivirá la aplicación?
*   **Opción A (Nube Moderna)**: Vercel, Netlify o Railway. Es lo más rápido y compatible con Astro.
*   **Opción B (Servidor Corporativo)**: Dockerizar la aplicación Node.js.
    *   Se entrega una imagen Docker del proyecto.
    *   TI la despliega en su Kubernetes/AWS/Azure interno.
    *   Se configura un dominio corporativo (ej: `gestioncanchas.angloamerican.com`).

## 5. Capacitación & Soporte
*   **Onboarding**: Sesiones con los usuarios de Besalco, Linkapsis, etc., para enseñarles el uso (aunque la UI es intuitiva).
*   **Soporte**: Definir quién atiende si "se cae el sistema". Idealmente, el equipo de TI asume el soporte de nivel 1, y tú (o un desarrollador) el mantenimiento evolutivo.

---

### 💡 Tips para tu reunión con TI
*   **No digas**: "Hice una paginita web".
*   **Di**: "Desarrollé un **MVP Fullstack** utilizando **Arquitectura Server-Side Rendering (SSR)** con **Astro** y una base de datos relacional **PostgreSQL** gestionada".
*   **Sobre Supabase**: "Usé Supabase para prototipar rápido, pero es 100% compatible con cualquier PostgreSQL estándar si prefieren migrarlo a su infraestructura".
