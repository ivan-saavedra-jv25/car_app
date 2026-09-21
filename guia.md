Quiero que desarrolles una página web estática, sencilla y moderna para mostrar los documentos que deben estar disponibles para un conductor y su vehículo en Chile.

## 1. Tecnologías

Utiliza exclusivamente:

* HTML5
* CSS3
* JavaScript Vanilla

No utilizar:

* React
* Angular
* Vue
* Bootstrap
* Tailwind
* jQuery
* Node.js
* Backend
* Base de datos
* APIs externas
* Librerías externas

La página debe funcionar como un sitio estático.

## 2. Estructura del proyecto

Crear la siguiente estructura:

```text
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── assets/
    ├── cedula-identidad.pdf
    ├── licencia-conducir.pdf
    ├── permiso-circulacion.pdf
    ├── revision-tecnica.pdf
    ├── soap.pdf
    └── padron.pdf
```

Los archivos dentro de `assets/` serán reemplazados posteriormente por los documentos reales.

## 3. Documentos

La aplicación debe manejar exactamente estos 6 documentos:

### Documentos del conductor

**1. Cédula de identidad o pasaporte**

Archivo esperado:

```text
assets/cedula-identidad.pdf
```

Categoría:

```text
Conductor
```

Descripción:

```text
Documento de identificación vigente del conductor.
```

**2. Licencia de conducir**

Archivo esperado:

```text
assets/licencia-conducir.pdf
```

Categoría:

```text
Conductor
```

Descripción:

```text
Licencia de conducir vigente y correspondiente al tipo de vehículo.
```

### Documentos del vehículo

**3. Permiso de circulación**

Archivo esperado:

```text
assets/permiso-circulacion.pdf
```

Categoría:

```text
Vehículo
```

Descripción:

```text
Permiso de circulación correspondiente al período vigente.
```

**4. Certificado de revisión técnica u homologación**

Archivo esperado:

```text
assets/revision-tecnica.pdf
```

Categoría:

```text
Vehículo
```

Descripción:

```text
Certificado de revisión técnica u homologación vigente.
```

**5. SOAP**

Archivo esperado:

```text
assets/soap.pdf
```

Categoría:

```text
Vehículo
```

Descripción:

```text
Seguro Obligatorio de Accidentes Personales vigente.
```

**6. Padrón / certificado de inscripción**

Archivo esperado:

```text
assets/padron.pdf
```

Categoría:

```text
Vehículo
```

Descripción:

```text
Certificado que acredita la inscripción del vehículo en el Registro Civil.
```

## 4. Configuración en JavaScript

Toda la información de los documentos debe estar centralizada en `js/app.js`.

Utilizar una estructura similar a:

```javascript
const documentos = [
    {
        id: "cedula-identidad",
        nombre: "Cédula de identidad o pasaporte",
        descripcion: "Documento de identificación vigente del conductor.",
        categoria: "Conductor",
        archivo: "assets/cedula-identidad.pdf",
        tipo: "PDF"
    },
    // ...
];
```

No duplicar esta información directamente en el HTML.

El HTML debe contener principalmente la estructura general de la página y JavaScript debe generar las tarjetas dinámicamente.

## 5. Estado de los documentos

La aplicación debe comprobar si cada archivo existe.

Para cada documento:

### Si el archivo existe

Mostrar:

* Estado: `Disponible`
* Indicador visual de estado disponible
* Botón `Ver documento`

El botón debe abrir el archivo en una nueva pestaña.

### Si el archivo no existe

Mostrar:

* Estado: `Pendiente`
* Indicador visual de estado pendiente
* Texto `Documento pendiente`
* No mostrar un botón funcional para abrir el documento.

IMPORTANTE:

Como la aplicación será estática, implementar esta comprobación utilizando una petición `fetch` al archivo.

Por ejemplo:

```javascript
fetch(documento.archivo, { method: "HEAD" })
```

Manejar correctamente los errores cuando el archivo no exista.

No utilizar backend para verificar los archivos.

## 6. Dashboard superior

Crear un encabezado moderno con:

**Documentos del Conductor y Vehículo**

Texto secundario:

**Consulta el estado de la documentación necesaria para conducir en Chile.**

Debajo mostrar tres indicadores:

```text
6
Documentos requeridos
```

```text
X
Disponibles
```

```text
X
Pendientes
```

Los valores de disponibles y pendientes deben calcularse automáticamente mediante JavaScript.

## 7. Secciones

Separar visualmente los documentos en:

### Documentos del conductor

Mostrar las 2 tarjetas correspondientes.

### Documentos del vehículo

Mostrar las 4 tarjetas correspondientes.

No mostrar las placas patentes como documentos, ya que no corresponden a archivos que se deban cargar.

## 8. Tarjetas

Cada documento debe mostrarse en una tarjeta moderna.

La tarjeta debe contener:

* Icono/documento
* Nombre
* Descripción
* Categoría
* Estado
* Botón para ver el documento cuando esté disponible

Ejemplo visual:

```text
┌────────────────────────────────────┐
│  📄                                │
│                                    │
│  Cédula de identidad               │
│  Documento de identificación...    │
│                                    │
│  ✓ Disponible                      │
│                                    │
│  [ Ver documento ]                 │
└────────────────────────────────────┘
```

## 9. Buscador

Agregar un buscador simple en la parte superior.

Debe permitir filtrar las tarjetas por:

* Nombre
* Descripción
* Categoría

El filtrado debe realizarse completamente con JavaScript, sin recargar la página.

## 10. Filtros

Agregar filtros:

```text
Todos
Conductor
Vehículo
```

Al seleccionar una categoría solamente deben mostrarse los documentos correspondientes.

El buscador y los filtros deben funcionar simultáneamente.

## 11. Diseño visual

Quiero un diseño:

* Moderno
* Minimalista
* Profesional
* Limpio
* Responsive
* Mobile First
* Buena experiencia en escritorio y celular

Utilizar una paleta basada principalmente en:

* Azul
* Verde
* Blanco
* Grises suaves

No utilizar colores excesivamente fuertes.

Utilizar:

* Bordes redondeados
* Sombras suaves
* Espaciado consistente
* Animaciones/transiciones sutiles
* Estados hover
* Buen contraste
* Tipografía moderna utilizando fuentes del sistema

No utilizar imágenes externas.

Los iconos pueden realizarse mediante caracteres Unicode o CSS, sin incorporar librerías de iconos externas.

## 12. Responsive

La página debe funcionar correctamente en:

* Desktop
* Laptop
* Tablet
* Smartphone

En desktop utilizar un grid de tarjetas.

En dispositivos pequeños las tarjetas deben pasar a una sola columna.

## 13. Footer

Agregar un footer discreto indicando:

```text
Documentación del conductor y vehículo
Información de referencia para Chile
```

No agregar información legal que no haya sido proporcionada.

## 14. Código

Separar correctamente:

* HTML → estructura
* CSS → estilos
* JavaScript → lógica

El código debe ser limpio y fácil de mantener.

Agregar comentarios únicamente donde sean útiles.

Especialmente explicar en `app.js` cómo agregar un nuevo documento.

Por ejemplo, posteriormente debería ser posible agregar un documento simplemente incorporando:

```javascript
{
    id: "nuevo-documento",
    nombre: "Nuevo documento",
    descripcion: "Descripción",
    categoria: "Vehículo",
    archivo: "assets/nuevo-documento.pdf",
    tipo: "PDF"
}
```

sin tener que modificar el HTML.

## 15. Manejo de errores

Si `fetch` no puede acceder al archivo:

* Considerarlo como `Pendiente`.
* No romper la aplicación.
* No mostrar errores técnicos al usuario.
* Mostrar un estado visual amigable.

La consola puede contener información útil para debugging, pero la interfaz no debe mostrar errores técnicos.

## 16. Resultado esperado

Quiero que generes todos los archivos necesarios:

```text
index.html
css/styles.css
js/app.js
```

La aplicación debe poder ejecutarse simplemente abriendo `index.html`.

No crear backend.

No crear endpoints.

No crear base de datos.

No crear tests.

No agregar funcionalidades que no hayan sido solicitadas.

El resultado debe sentirse como una pequeña aplicación/document dashboard moderna, no como una página HTML básica.
