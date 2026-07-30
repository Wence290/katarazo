document.addEventListener("DOMContentLoaded", function () {
  const torneoGuardado = localStorage.getItem(
    "torneoFifa"
  );

  if (!torneoGuardado) {
    alert("No hay ningún torneo creado.");

    window.location.href = "index.html";
    return;
  }

  const torneo = JSON.parse(torneoGuardado);

  if (
    !torneo.participantes ||
    torneo.participantes.length === 0
  ) {
    window.location.href =
      "participantes.html";

    return;
  }

  if (
    torneo.fechaActual <= 1 ||
    torneo.fechaActual > torneo.totalFechas ||
    torneo.torneoFinalizado
  ) {
    window.location.href = "torneo.html";
    return;
  }

  const tituloCambio = document.getElementById(
    "titulo-cambio"
  );

  const listaCambioEquipos =
    document.getElementById(
      "lista-cambio-equipos"
    );

  const formulario = document.getElementById(
    "form-cambio-equipos"
  );

  const mensajeError = document.getElementById(
    "mensaje-error"
  );

  tituloCambio.textContent =
    "Equipos para la fecha " +
    torneo.fechaActual;

  function crearListaJugadores() {
    listaCambioEquipos.innerHTML = "";

    torneo.participantes.forEach(
      function (participante, posicion) {
        const tarjeta =
          document.createElement("article");

        tarjeta.className =
          "jugador-cambio";

        tarjeta.innerHTML = `
          <div class="numero-jugador">
            ${posicion + 1}
          </div>

          <div class="datos-jugador">

            <h2>
              ${participante.nombre}
            </h2>

            <p class="equipo-anterior">
              Equipo actual:
              ${participante.equipo}
            </p>

          </div>

          <div class="campo-equipo">

            <label
              for="equipo-${participante.id}"
            >
              Equipo para la fecha
              ${torneo.fechaActual}
            </label>

            <input
              type="text"
              id="equipo-${participante.id}"
              class="input-nuevo-equipo"
              data-participante-id="${participante.id}"
              value="${participante.equipo}"
              maxlength="40"
              autocomplete="off"
              required
            >

          </div>
        `;

        listaCambioEquipos.appendChild(
          tarjeta
        );
      }
    );
  }

  function guardarNuevosEquipos() {
    const inputsEquipos =
      document.querySelectorAll(
        ".input-nuevo-equipo"
      );

    const nuevosEquipos = [];

    inputsEquipos.forEach(function (input) {
      nuevosEquipos.push({
        participanteId: Number(
          input.dataset.participanteId
        ),

        equipo: input.value.trim()
      });
    });

    const hayCamposVacios =
      nuevosEquipos.some(
        function (item) {
          return item.equipo === "";
        }
      );

    if (hayCamposVacios) {
      mensajeError.textContent =
        "Todos los jugadores deben tener un equipo.";

      return false;
    }

    const equiposNormalizados =
      nuevosEquipos.map(function (item) {
        return item.equipo.toLowerCase();
      });

    const equiposSinRepetir = new Set(
      equiposNormalizados
    );

    if (
      equiposSinRepetir.size !==
      equiposNormalizados.length
    ) {
      mensajeError.textContent =
        "No puede haber dos jugadores con el mismo equipo.";

      return false;
    }

    nuevosEquipos.forEach(
      function (nuevoEquipo) {
        const participante =
          torneo.participantes.find(
            function (jugador) {
              return (
                jugador.id ===
                nuevoEquipo.participanteId
              );
            }
          );

        participante.equipo =
          nuevoEquipo.equipo;
      }
    );

    const fechaSiguiente =
      torneo.fechas.find(
        function (fecha) {
          return (
            fecha.numero ===
            torneo.fechaActual
          );
        }
      );

    fechaSiguiente.partidos.forEach(
      function (partido) {
        const jugadorLocal =
          torneo.participantes.find(
            function (jugador) {
              return (
                jugador.id ===
                partido.jugadorLocalId
              );
            }
          );

        const jugadorVisitante =
          torneo.participantes.find(
            function (jugador) {
              return (
                jugador.id ===
                partido.jugadorVisitanteId
              );
            }
          );

        partido.equipoLocal =
          jugadorLocal.equipo;

        partido.equipoVisitante =
          jugadorVisitante.equipo;
      }
    );

    fechaSiguiente.equiposAsignados = true;
    torneo.equiposBloqueados = true;

    localStorage.setItem(
      "torneoFifa",
      JSON.stringify(torneo)
    );

    return true;
  }

  formulario.addEventListener(
    "submit",
    function (evento) {
      evento.preventDefault();

      mensajeError.textContent = "";

      const guardado =
        guardarNuevosEquipos();

      if (!guardado) {
        return;
      }

      window.location.href =
        "torneo.html";
    }
  );

  crearListaJugadores();
});