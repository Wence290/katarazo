const listaParticipantes = document.getElementById(
  "lista-participantes"
);

const formularioParticipantes = document.getElementById(
  "form-participantes"
);

const tituloTorneo = document.getElementById(
  "titulo-torneo"
);

const mensajeError = document.getElementById(
  "mensaje-error"
);

const botonVolver = document.getElementById(
  "boton-volver"
);

const torneoGuardado = localStorage.getItem("torneoFifa");

if (!torneoGuardado) {
  alert("Primero tenés que crear un torneo.");

  window.location.href = "index.html";
}

const torneo = JSON.parse(torneoGuardado);

tituloTorneo.textContent = torneo.nombre;

function crearCamposParticipantes() {
  listaParticipantes.innerHTML = "";

  for (
    let numeroJugador = 1;
    numeroJugador <= torneo.cantidadJugadores;
    numeroJugador++
  ) {
    const participanteHTML = `
      <article class="participante">

        <div class="numero-jugador">
          ${numeroJugador}
        </div>

        <div class="datos-participante">

          <h2>Jugador ${numeroJugador}</h2>

          <div class="fila-campos">

            <div class="campo">
              <label for="nombre-${numeroJugador}">
                Nombre
              </label>

              <input
                type="text"
                id="nombre-${numeroJugador}"
                class="input-nombre"
                placeholder="Ejemplo: Wences"
                autocomplete="off"
                required
              >
            </div>

            <div class="campo">
              <label for="equipo-${numeroJugador}">
                Equipo
              </label>

              <input
                type="text"
                id="equipo-${numeroJugador}"
                class="input-equipo"
                placeholder="Ejemplo: Real Madrid"
                autocomplete="off"
                required
              >
            </div>

          </div>

        </div>

      </article>
    `;

    listaParticipantes.insertAdjacentHTML(
      "beforeend",
      participanteHTML
    );
  }
}

function obtenerParticipantes() {
  const inputsNombres = document.querySelectorAll(
    ".input-nombre"
  );

  const inputsEquipos = document.querySelectorAll(
    ".input-equipo"
  );

  const participantes = [];

  for (
    let posicion = 0;
    posicion < inputsNombres.length;
    posicion++
  ) {
    const nombre = inputsNombres[posicion].value.trim();
    const equipo = inputsEquipos[posicion].value.trim();

    participantes.push({
      id: posicion + 1,
      nombre: nombre,
      equipo: equipo,

      estadisticas: {
        partidosJugados: 0,
        ganados: 0,
        empatados: 0,
        perdidos: 0,
        golesFavor: 0,
        golesContra: 0,
        diferenciaGol: 0,
        puntos: 0
      }
    });
  }

  return participantes;
}

function hayCamposVacios(participantes) {
  return participantes.some(function (participante) {
    return (
      participante.nombre === "" ||
      participante.equipo === ""
    );
  });
}

function hayNombresRepetidos(participantes) {
  const nombres = participantes.map(function (participante) {
    return participante.nombre.toLowerCase();
  });

  const nombresSinRepetir = new Set(nombres);

  return nombresSinRepetir.size !== nombres.length;
}

function hayEquiposRepetidos(participantes) {
  const equipos = participantes.map(function (participante) {
    return participante.equipo.toLowerCase();
  });

  const equiposSinRepetir = new Set(equipos);

  return equiposSinRepetir.size !== equipos.length;
}

formularioParticipantes.addEventListener(
  "submit",
  function (evento) {
    evento.preventDefault();

    mensajeError.textContent = "";

    const participantes = obtenerParticipantes();

    if (hayCamposVacios(participantes)) {
      mensajeError.textContent =
        "Tenés que completar el nombre y el equipo de todos los jugadores.";

      return;
    }

    if (hayNombresRepetidos(participantes)) {
      mensajeError.textContent =
        "No puede haber dos jugadores con el mismo nombre.";

      return;
    }

    if (hayEquiposRepetidos(participantes)) {
      mensajeError.textContent =
        "No puede haber dos jugadores con el mismo equipo.";

      return;
    }

    torneo.participantes = participantes;
    torneo.equiposBloqueados = true;
    torneo.fechaActual = 1;

    localStorage.setItem(
      "torneoFifa",
      JSON.stringify(torneo)
    );

    window.location.href = "torneo.html";
  }
);

botonVolver.addEventListener("click", function () {
  window.location.href = "index.html";
});

crearCamposParticipantes();