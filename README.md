# Innovation Hub

Proyecto del curso SOFT-12 — Desarrollo Web Full Stack.

**Estudiantes:** Andreina Leal y Tatiana Solis
**Sección:** SOFT-12-C1
**Periodo:** III cuatrimestre 2026
**Docente:** Álvaro Cordero Peña

## Descripción

Innovation Hub es una aplicación web orientada a la comunidad universitaria que permite publicar ideas, necesidades y retos, identificar las competencias necesarias para desarrollarlos y facilitar la conformación de equipos interdisciplinarios.

Este repositorio contiene el prototipo correspondiente al Avance 1 del proyecto.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Bootstrap
- Sass
- JSON
- Git
- GitHub

## Estructura del repositorio

- `avance1/` — prototipo correspondiente al Avance 1.
- `avance1/index.html` — página principal de Innovation Hub.
- `avance1/paginas/` — páginas internas del prototipo.
- `avance1/datos/` — archivos JSON con datos simulados.
- `avance1/js/` — archivos JavaScript utilizados para la interacción y carga dinámica de información.
- `avance1/estilos/` — hojas de estilo utilizadas por el prototipo.
- `avance1/scss/` — archivos fuente de Sass.

## Páginas principales

El prototipo incluye las siguientes páginas:

- Inicio.
- Catálogo de iniciativas.
- Detalle de iniciativa.
- Publicación de iniciativas.
- Solicitudes de participación.
- Proyectos.
- Perfil del usuario.

## Funcionalidades implementadas

Durante el Avance 1 se desarrollaron las siguientes funcionalidades:

- navegación entre las principales pantallas del prototipo.
- visualización de iniciativas en el catálogo.
- carga de información desde archivos JSON.
- renderizado dinámico de iniciativas mediante JavaScript.
- consulta del detalle de una iniciativa.
- manejo de diferentes niveles de visibilidad.
- formulario para publicar iniciativas.
- incorporación dinámica de competencias en el formulario de publicación.
- validación de formularios mediante JavaScript.
- formulario para solicitar participación en una iniciativa.
- simulación de eliminación de iniciativas.
- página de perfil del usuario.
- página de proyectos.
- interfaz adaptable mediante Bootstrap y estilos personalizados.

## Cómo ejecutar

El proyecto no requiere servidor ni base de datos para el Avance 1.

Para visualizar el prototipo:

1. clonar o descargar este repositorio.
2. abrir la carpeta del proyecto en Visual Studio Code.
3. abrir `avance1/index.html`.
4. ejecutar el archivo en el navegador, preferiblemente mediante Live Server.
5. navegar por las diferentes secciones utilizando el menú principal.

## Datos simulados

El Avance 1 utiliza archivos JSON para representar los datos utilizados por el prototipo.

Los datos se encuentran en:

`avance1/datos/`

Estos archivos permiten simular el comportamiento de la aplicación sin utilizar todavía una base de datos o servidor.

## Decisiones de diseño

El prototipo fue desarrollado utilizando HTML semántico para mantener una estructura clara y facilitar la accesibilidad.

Bootstrap se utiliza como base para la distribución de contenido, componentes, formularios y comportamiento responsive.

Se incorporaron estilos personalizados para complementar Bootstrap y mantener una identidad visual consistente en las diferentes pantallas.

JavaScript se mantiene separado del HTML para organizar la lógica de interacción, validación y renderizado dinámico.

Los datos simulados se almacenan en archivos JSON, permitiendo separar la información de la presentación y facilitar su posterior integración con tecnologías de backend.

La navegación se diseñó para mantener acceso a las principales áreas del prototipo: catálogo, publicación de iniciativas, proyectos, perfil y solicitudes.

El prototipo fue construido con una estructura modular de carpetas para facilitar su mantenimiento y evolución durante los siguientes avances del proyecto.

## Resumen de commits

| Fecha | Hash | Mensaje |
|---|---|---|
| 2026-09-26 | c6258e8 | agrega perfil proyectos y completa navegacion del prototipo |
| 2026-09-16 | ebe51c1 | Add Tatiana Solis to student list |
| 2026-09-16 | 85e128a | Agrega validacion al formulario de solicitud |
| 2026-09-16 | 61902eb | Agrega competencias dinamicas y validacion en publicar iniciativa |
| 2026-09-16 | 382e2b7 | Agrega renderizado dinamico del detalle con visibilidad y eliminacion |
| 2026-09-16 | 9bbc052 | Actualiza datos con visibilidad y descripcion, y enlaza detalle por id |
| 2026-09-10 | 52f0641 | Agrega carga de datos y renderizado dinamico del catalogo |
| 2026-09-10 | 2525473 | Crea el formulario de publicar iniciativa en Bootstrap |
| 2026-09-10 | ea99b7c | Convierte el detalle de iniciativa a Bootstrap |
| 2026-09-10 | 50f2b28 | Convierte el catalogo a Bootstrap |
| 2026-09-10 | 0510b6f | Renombra paginas para coincidir con los enlaces del catalogo |
| 2026-09-09 | 76a6366 | Agrega formulario de solicitud de participacion |
| 2026-09-08 | 25a4561 | Agrega página de detalle de iniciativa |
| 2026-09-07 | 6c74fe6 | Completar la estructura semantica del catalogo |
| 2026-09-07 | 160e80f | Agregar las tarjetas de resultados del catalogo |
| 2026-09-07 | 02a0108 | Agregar el main con h1 y el panel de filtros del catalogo |
| 2026-09-07 | adf0472 | Maquetar el encabezado y la navegacion del catalogo |
| 2026-09-06 | 49bc187 | Agregar tabla de resumen de commits al README |
| 2026-09-06 | 452e4db | Merge branch main of innovation-hub |
| 2026-09-06 | 086c9d0 | Crear estructura del avance 1 y documentacion inicial |
| 2026-09-06 | e002bac | Initialize README with project information |
| 2026-09-06 | 3900e20 | Delete README.md |
| 2026-09-06 | d21a70a | Initial commit |
