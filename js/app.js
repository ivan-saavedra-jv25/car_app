// ==========================================================================
// Documentación del Conductor y Vehículo
// --------------------------------------------------------------------------
// Configuración centralizada de documentos.
//
// CÓMO AGREGAR UN NUEVO DOCUMENTO:
// 1. Agrega un objeto al arreglo `documentos` con los siguientes campos:
//    - id:         identificador único y simple (se usa en atributos DOM).
//    - nombre:     nombre visible del documento.
//    - descripcion:descripción breve mostrada en la tarjeta.
//    - categoria:  "Conductor" o "Vehículo" (agrupa las secciones).
//    - archivo:    ruta relativa en assets/ o URL de Google Drive del PDF.
//    - tipo:       formato del archivo (por ejemplo "PDF").
// 2. Coloca el archivo real en la carpeta assets/ o comparte el PDF en Google Drive.
// No es necesario modificar el HTML ni la lógica de la aplicación.
// ==========================================================================

const documentos = [
    {
        id: "cedula-identidad",
        nombre: "Cédula de identidad o pasaporte",
        descripcion: "Documento de identificación vigente del conductor.",
        categoria: "Conductor",
        archivo: "assets/cedula-identidad.pdf",
        tipo: "PDF"
    },
    {
        id: "licencia-conducir",
        nombre: "Licencia de conducir",
        descripcion: "Licencia de conducir vigente y correspondiente al tipo de vehículo.",
        categoria: "Conductor",
        archivo: "assets/licencia-conducir.pdf",
        tipo: "PDF"
    },
    {
        id: "permiso-circulacion",
        nombre: "Permiso de circulación",
        descripcion: "Permiso de circulación correspondiente al período vigente.",
        categoria: "Vehículo",
        archivo: "https://drive.google.com/file/d/1nAx3P4lUvqplWTHV7mUYCZuIELuIQ1hQ/view?usp=drive_web",
        tipo: "PDF"
    },
    {
        id: "revision-tecnica",
        nombre: "Certificado de revisión técnica u homologación",
        descripcion: "Certificado de revisión técnica u homologación vigente.",
        categoria: "Vehículo",
        archivo: "https://drive.google.com/file/d/1WiFKYU-412sqIuN31a9qSxxtCuHgl5WK/view?usp=drive_web",
        tipo: "PDF"
    },
    {
        id: "soap",
        nombre: "SOAP",
        descripcion: "Seguro Obligatorio de Accidentes Personales vigente.",
        categoria: "Vehículo",
        archivo: "https://drive.google.com/file/d/10CZAhx6iVDuLJwg593-doXa_jlbNIqwg/view?usp=drive_web",
        tipo: "PDF"
    },
    {
        id: "padron",
        nombre: "Padrón / certificado de inscripción",
        descripcion: "Certificado que acredita la inscripción del vehículo en el Registro Civil.",
        categoria: "Vehículo",
        archivo: "https://drive.google.com/file/d/1k8nCz_uceJSK1ytSQhIEDpm_0oUeg2Yt/view?usp=drive_web",
        tipo: "PDF"
    }
];

// Categorías ocultas de la interfaz. Para volver a mostrar el conductor,
// elimínalo de esta lista (o deja el arreglo vacío).
const CATEGORIAS_OCULTAS = ["Conductor"];

// Lista efectiva de documentos que se verifica, muestra y cuenta.
const documentosVisibles = documentos.filter(
    (doc) => !CATEGORIAS_OCULTAS.includes(doc.categoria)
);

// Estado de cada documento (disponible / pendiente).
const estadoDocumentos = {};

// Estado actual del filtro de categoría.
let filtroCategoria = "todos";

// Referencias a los elementos del DOM.
const contenedores = {
    "Vehículo": document.getElementById("section-Vehículo")
};
const resumenDocumentos = document.getElementById("documentSummary");
const botonesFiltro = document.querySelectorAll(".filter-btn");
const mensajeVacio = document.getElementById("emptyMessage");

const modalDocumento = document.getElementById("pdfModal");
const tituloModalDocumento = document.getElementById("pdfModalTitle");
const iframeDocumento = document.querySelector(".pdf-modal-body iframe");
const botonCerrarModal = document.querySelector(".pdf-modal-close");
let botonOrigenModal = null;

// --------------------------------------------------------------------------
// Bloqueo por PIN
// --------------------------------------------------------------------------

// PIN de acceso. Se inyecta en el despliegue desde el secreto "PASS_CODE"
// del environment "pass_code" mediante el workflow de GitHub Actions
// (js/environments.js). En local se usa js/environments.js con datos propios.
// Si no está presente, el acceso permanece bloqueado.
const PIN_DEFECTO = window.PIN_ACCESO || "";

const pantallaPin = document.getElementById("pinScreen");
const cajasPin = document.querySelectorAll(".pin-box");
const errorPin = document.getElementById("pinError");
const botonBorrarPin = document.getElementById("pinClear");
const nombreApp = document.getElementById("appName");
const botonCerrarSesion = document.getElementById("logoutBtn");

// Registra la entrada de los campos y verifica al completar los 4 dígitos.
document.querySelectorAll(".pin-box").forEach((caja, index) => {
    caja.addEventListener("input", () => {
        // Solo aceptar dígitos.
        caja.value = caja.value.replace(/\D/g, "");
        ocultarErrorPin();

        // Avanzar al siguiente cuadro automáticamente.
        if (caja.value && index < cajasPin.length - 1) {
            cajasPin[index + 1].focus();
        }

        if (obtenerPin() && obtenerPin().length === 4) {
            verificarPin();
        }
    });

    // Retroceder con la tecla de borrar cuando el cuadro está vacío.
    caja.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !caja.value && index > 0) {
            cajasPin[index - 1].focus();
        }
    });
});

botonBorrarPin.addEventListener("click", () => {
    limpiarPin();
    cajasPin[0].focus();
});

// Reúne los 4 dígitos como un solo valor.
function obtenerPin() {
    return Array.from(cajasPin).map((caja) => caja.value).join("");
}

function verificarPin() {
    if (obtenerPin() === PIN_DEFECTO) {
        desbloquear();
    } else {
        errorPin.classList.add("visible");
        pantallaPin.classList.add("shake");
        setTimeout(limpiarPin, 500);
    }
}

function ocultarErrorPin() {
    errorPin.classList.remove("visible");
    pantallaPin.classList.remove("shake");
}

function limpiarPin() {
    ocultarErrorPin();
    cajasPin.forEach((caja) => (caja.value = ""));
}

// Muestra el contenido de los documentos al desbloquear.
function desbloquear() {
    pantallaPin.classList.add("hidden");
    renderizar();
    cargarEstadoDocumentos();
}

// Vuelve a la pantalla de PIN, limpiando el PIN y el contenido mostrado.
function bloquear() {
    if (modalDocumento.classList.contains("open")) cerrarModalDocumento();
    limpiarPin();
    pantallaPin.classList.remove("hidden");
    for (const contenedor of Object.values(contenedores)) {
        contenedor.textContent = "";
    }
    mensajeVacio.hidden = true;
    resumenDocumentos.textContent = "";
    cajasPin[0].focus();
}

botonCerrarSesion.addEventListener("click", bloquear);

// --------------------------------------------------------------------------
// Tarjetas
// --------------------------------------------------------------------------

// Crea la tarjeta HTML de un documento.
function crearTarjeta(documento) {
    const estado = estadoDocumentos[documento.id];
    const disponible = estado === "disponible";
    const item = document.createElement("article");
    item.className = "card" + (disponible ? " card-available" : " card-pending");
    item.dataset.id = documento.id;

    const estadoHtml = disponible
        ? `<span class="badge badge-available"><span class="badge-dot"></span>Disponible</span>`
        : `<span class="badge badge-pending"><span class="badge-dot"></span>Pendiente</span>`;

    const accionHtml = disponible
        ? `<button type="button" class="btn-view" data-open="${documento.id}">Ver documento</button>`
        : `<p class="pending-text">Documento pendiente</p>`;

    item.innerHTML = `
        <div class="card-top">
            <span class="card-icon" aria-hidden="true">&#128196;</span>
            <span class="card-category">${documento.categoria}</span>
        </div>
        <h3 class="card-title">${documento.nombre}</h3>
        <p class="card-desc">${documento.descripcion}</p>
        <div class="card-status">${estadoHtml}</div>
        <div class="card-actions">${accionHtml}</div>
    `;

    return item;
}

// Renderiza las tarjetas visibles según filtros activos.
function renderizar() {
    let totalesVisibles = 0;

    for (const categoria of Object.keys(contenedores)) {
        const contenedor = contenedores[categoria];
        contenedor.textContent = "";

        const documentosCategoria = documentos.filter((doc) => doc.categoria === categoria);
        const visibles = documentosCategoria.filter((doc) => coincideConFiltros(doc));

        visibles.forEach((doc) => contenedor.appendChild(crearTarjeta(doc)));
        totalesVisibles += visibles.length;
    }

    mensajeVacio.hidden = totalesVisibles !== 0;
}

// Un documento coincide si pasa el filtro de categoría.
function coincideConFiltros(documento) {
    return filtroCategoria === "todos" || documento.categoria === filtroCategoria;
}

// --------------------------------------------------------------------------
// Estado de los documentos
// --------------------------------------------------------------------------

// Convierte una URL de Google Drive en su versión embebible en el iframe.
// Para archivos locales, devuelve la ruta sin cambios.
function urlVistaDocumento(documento) {
    const coincidencia = documento.archivo.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
    if (coincidencia) {
        return `https://drive.google.com/file/d/${coincidencia[1]}/preview`;
    }
    return documento.archivo;
}

// Comprueba si el archivo de un documento existe mediante una petición HEAD.
// Google Drive no permite este tipo de petición (CORS), por lo que estos
// documentos se consideran disponibles directamente.
// Si la petición falla (archivo ausente, servidor local sin permisos, etc.)
// el documento se considera "pendiente" sin romper la aplicación.
async function verificarDocumento(documento) {
    if (documento.archivo.includes("drive.google.com")) {
        estadoDocumentos[documento.id] = "disponible";
        return;
    }
    try {
        const respuesta = await fetch(documento.archivo, { method: "HEAD" });
        estadoDocumentos[documento.id] = respuesta.ok ? "disponible" : "pendiente";
    } catch (error) {
        console.warn(`No se pudo verificar '${documento.archivo}':`, error.message);
        estadoDocumentos[documento.id] = "pendiente";
    }
}

// Verifica todos los documentos y actualiza la interfaz al finalizar.
async function cargarEstadoDocumentos() {
    await Promise.all(documentosVisibles.map(verificarDocumento));
    renderizar();
    actualizarIndicadores();
}

// Recalcula los contadores del dashboard.
function actualizarIndicadores() {
    let disponibles = 0;
    for (const doc of documentosVisibles) {
        if (estadoDocumentos[doc.id] === "disponible") disponibles++;
    }
    const pendientes = documentosVisibles.length - disponibles;
    resumenDocumentos.textContent =
        `${documentosVisibles.length} documentos requeridos · ${disponibles} disponibles · ${pendientes} pendientes`;
}

// --------------------------------------------------------------------------
// Modal de documentos
// --------------------------------------------------------------------------

function abrirModalDocumento(documento, boton) {
    botonOrigenModal = boton;
    tituloModalDocumento.textContent = documento.nombre;
    iframeDocumento.src = urlVistaDocumento(documento);
    modalDocumento.classList.add("open");
    modalDocumento.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    botonCerrarModal.focus();
}

function cerrarModalDocumento() {
    modalDocumento.classList.remove("open");
    modalDocumento.setAttribute("aria-hidden", "true");
    iframeDocumento.src = "";
    document.body.style.overflow = "";
    if (botonOrigenModal) botonOrigenModal.focus();
}

// --------------------------------------------------------------------------
// Eventos
// --------------------------------------------------------------------------

document.addEventListener("click", (event) => {
    const botonAbrir = event.target.closest("[data-open]");
    if (botonAbrir) {
        const documento = documentos.find((doc) => doc.id === botonAbrir.dataset.open);
        if (documento) abrirModalDocumento(documento, botonAbrir);
        return;
    }
    if (event.target.matches("[data-close-modal]")) {
        cerrarModalDocumento();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalDocumento.classList.contains("open")) {
        cerrarModalDocumento();
    }
});

botonesFiltro.forEach((boton) => {
    boton.addEventListener("click", () => {
        botonesFiltro.forEach((b) => b.classList.remove("active"));
        boton.classList.add("active");
        filtroCategoria = boton.dataset.filter;
        renderizar();
    });
});

// --------------------------------------------------------------------------
// Inicio
// --------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // El contenido se carga al desbloquear con el PIN.
    if (nombreApp) nombreApp.textContent = window.APP_NAME || "";
    cajasPin[0].focus();
});