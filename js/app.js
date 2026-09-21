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
//    - archivo:    ruta relativa al PDF dentro de assets/.
//    - tipo:       formato del archivo (por ejemplo "PDF").
// 2. Coloca el archivo real en la carpeta assets/.
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
        archivo: "assets/permiso-circulacion.pdf",
        tipo: "PDF"
    },
    {
        id: "revision-tecnica",
        nombre: "Certificado de revisión técnica u homologación",
        descripcion: "Certificado de revisión técnica u homologación vigente.",
        categoria: "Vehículo",
        archivo: "assets/revision-tecnica.pdf",
        tipo: "PDF"
    },
    {
        id: "soap",
        nombre: "SOAP",
        descripcion: "Seguro Obligatorio de Accidentes Personales vigente.",
        categoria: "Vehículo",
        archivo: "assets/soap.pdf",
        tipo: "PDF"
    },
    {
        id: "padron",
        nombre: "Padrón / certificado de inscripción",
        descripcion: "Certificado que acredita la inscripción del vehículo en el Registro Civil.",
        categoria: "Vehículo",
        archivo: "assets/padron.pdf",
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

// --------------------------------------------------------------------------
// Bloqueo por PIN
// --------------------------------------------------------------------------

// PIN de acceso. Se inyecta en el despliegue desde el secreto de entorno
// "PASS_CODE" mediante el workflow de GitHub Actions (js/pin-config.js).
// Si no está presente, el acceso permanece bloqueado.
const PIN_DEFECTO = window.PIN_ACCESO || "";

const pantallaPin = document.getElementById("pinScreen");
const cajasPin = document.querySelectorAll(".pin-box");
const errorPin = document.getElementById("pinError");
const botonBorrarPin = document.getElementById("pinClear");

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
        ? `<a class="btn-view" href="${documento.archivo}" target="_blank" rel="noopener">Ver documento</a>`
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

// Comprueba si el archivo de un documento existe mediante una petición HEAD.
// Si la petición falla (archivo ausente, servidor local sin permisos, etc.)
// el documento se considera "pendiente" sin romper la aplicación.
async function verificarDocumento(documento) {
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
// Eventos
// --------------------------------------------------------------------------

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
    cajasPin[0].focus();
});