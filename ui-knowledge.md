# Base de Conocimiento UI/UX (NameThatUI Framework)

Este archivo actúa como el "cerebro referencial" para el Ecosistema Titanium. Cualquier agente de IA que trabaje en este proyecto debe alinear su vocabulario y patrones de diseño a estas definiciones oficiales para mantener un estándar de interfaz *Premium* y exacto.

## Patrones de Layout & Estructura
- **Bento Grid:** Layout que organiza el contenido en una cuadrícula asimétrica de tarjetas modulares que recuerdan a las cajas bento japonesas. Excelente para features.
- **Masonry Layout:** Cuadrícula fluida donde los elementos tienen alturas variables y se apilan encajando unos con otros (estilo Pinterest).
- **Split View:** Interfaz dividida en paneles ajustables (típicamente Sidebar y área principal). 
- **Sticky vs. Fixed Positioning:** *Sticky* mantiene el elemento en el flujo hasta cierta posición, *Fixed* lo saca del flujo por completo flotando en la pantalla.

## Feedback Visual & Carga
- **Toast (Snackbar):** Pequeño mensaje de retroalimentación que aparece temporalmente en la parte inferior o esquina, desapareciendo tras unos segundos sin interrumpir al usuario.
- **Skeleton:** Estado de carga estructurado que imita la figura del contenido final (cajas grises pulsantes en lugar de un spinner). Aporta mayor rendimiento percibido que el Spinner.
- **Progress Ring vs. Spinner:** Progress Ring muestra avance cuantificable (0-100), Spinner indica carga indefinida.
- **Focus Ring:** Resplandor coloreado que indica qué interfaz tiene el input actual (Accesibilidad).

## Navegación & Acciones
- **Menú de Desbordamiento (The Three Dots / Kebab):** Los tres puntos verticales/horizontales para esconder acciones secundarias urgentes.
- **Breadcrumbs:** Navegación en rastro de migas (Inicio > Servicios > Portal).
- **Segmented Control (Toggle Group):** Grupo de botones conectados horizontalmente donde solo uno puede estar activo a la vez. Mejor alternativa a los "Radios" para UI moderna.
- **Dropdown Menu vs Popover:** Dropdown abre una lista estricta de opciones. Popover (burbuja flotante con flecha apuntando a su origen) puede contener contenido rico, gráficos o formularios pequeños.

## Entradas & Formularios
- **Combobox:** Un híbrido entre input de texto y menú desplegable (Typeahead/Autocomplete).
- **Command Palette:** Menú modal global invocado por atajos (ej. Cmd+K) para búsqueda rápida y comandos. Altamente premium.
- **Stepper:** Control de flechas (Up/Down) agrupado para incrementar/decrementar números.

---
**Directriz de Agente:** 
Para toda nueva adición en el `ruben-medina-portfolio`, se favorecerá el Layout *Bento Grid* para tarjetas, el *Skeleton* para transiciones de IA, el *Toast* para confirmaciones de llenado, y el *Command Palette* si se requiere una barra de búsqueda compleja.
