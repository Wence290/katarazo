document.addEventListener("DOMContentLoaded", function () {
  const torneoGuardado = localStorage.getItem("torneoFifa");

  if (!torneoGuardado) {
    alert("Primero tenés que crear un torneo.");
    window.location.href = "index.html";
    return;
  }

  const torneo = JSON.parse(torneoGuardado);

  if (
    !torneo.participantes ||
    torneo.participantes.length === 0
  ) {
    alert("Primero tenés que cargar los participantes.");
    window.location.href = "participantes.html";
    return;
  }

  if (torneo.participantes.length % 2 !== 0) {
    alert("La cantidad de jugadores debe ser par.");
    window.location.href = "index.html";
    return;
  }

  const nombreTorneo = document.getElementById(
    "nombre-torneo"
  );

  const cantidadJugadores = document.getElementById(
    "cantidad-jugadores"
  );

  const fechaActualTexto = document.getElementById(
    "fecha-actual"
  );

  const partidosPorFecha = document.getElementById(
    "partidos-por-fecha"
  );

  const navegacionFechas = document.getElementById(
    "navegacion-fechas"
  );

  const tituloFecha = document.getElementById(
    "titulo-fecha"
  );

  const estadoFecha = document.getElementById(
    "estado-fecha"
  );

  const listaPartidos = document.getElementById(
    "lista-partidos"
  );

  const cuerpoTabla = document.getElementById(
    "cuerpo-tabla"
  );

  const mensajePartidos = document.getElementById(
    "mensaje-partidos"
  );

  const botonGuardar = document.getElementById(
    "boton-guardar-resultados"
  );

  const botonFinalizar = document.getElementById(
    "boton-finalizar-fecha"
  );

  const botonNuevoTorneo = document.getElementById(
    "boton-nuevo-torneo"
  );

  let fechaSeleccionada = torneo.fechaActual || 1;

  nombreTorneo.textContent = torneo.nombre;

  cantidadJugadores.textContent =
    torneo.participantes.length;

  partidosPorFecha.textContent =
    (torneo.participantes.length * 3) / 2;

  function guardarTorneo() {
    localStorage.setItem(
      "torneoFifa",
      JSON.stringify(torneo)
    );
  }

  function buscarParticipante(idParticipante) {
    return torneo.participantes.find(
      function (participante) {
        return participante.id === idParticipante;
      }
    );
  }

  function obtenerFecha(numeroFecha) {
    return torneo.fechas.find(function (fecha) {
      return fecha.numero === numeroFecha;
    });
  }

  function generarRondasRoundRobin(participantes) {
    const jugadores = participantes.map(
      function (participante) {
        return participante.id;
      }
    );

    const jugadorFijo = jugadores[0];
    let jugadoresRotativos = jugadores.slice(1);

    const rondas = [];
    const cantidadRondas = jugadores.length - 1;

    for (
      let numeroRonda = 0;
      numeroRonda < cantidadRondas;
      numeroRonda++
    ) {
      const ordenRonda = [
        jugadorFijo,
        ...jugadoresRotativos
      ];

      const partidosRonda = [];

      for (
        let posicion = 0;
        posicion < ordenRonda.length / 2;
        posicion++
      ) {
        partidosRonda.push({
          jugadorLocalId: ordenRonda[posicion],

          jugadorVisitanteId:
            ordenRonda[
              ordenRonda.length - 1 - posicion
            ]
        });
      }

      rondas.push(partidosRonda);

      jugadoresRotativos = [
        jugadoresRotativos[
          jugadoresRotativos.length - 1
        ],

        ...jugadoresRotativos.slice(0, -1)
      ];
    }

    return rondas;
  }

  function generarFixture() {
    const rondas = generarRondasRoundRobin(
      torneo.participantes
    );

    const fechas = [];

    for (
      let numeroFecha = 1;
      numeroFecha <= torneo.totalFechas;
      numeroFecha++
    ) {
      const partidosFecha = [];

      for (
        let rondaFecha = 0;
        rondaFecha < 3;
        rondaFecha++
      ) {
        const indiceRonda =
          ((numeroFecha - 1) * 3 + rondaFecha) %
          rondas.length;

        rondas[indiceRonda].forEach(
          function (partido) {
            partidosFecha.push({
              id:
                "fecha-" +
                numeroFecha +
                "-partido-" +
                (partidosFecha.length + 1),

              jugadorLocalId:
                partido.jugadorLocalId,

              jugadorVisitanteId:
                partido.jugadorVisitanteId,

              equipoLocal: null,
              equipoVisitante: null,

              golesLocal: null,
              golesVisitante: null
            });
          }
        );
      }

      fechas.push({
        numero: numeroFecha,
        finalizada: false,
        equiposAsignados: false,
        partidos: partidosFecha
      });
    }

    return fechas;
  }

  function asignarEquiposAFecha(fecha) {
    if (fecha.equiposAsignados) {
      return;
    }

    fecha.partidos.forEach(function (partido) {
      const jugadorLocal = buscarParticipante(
        partido.jugadorLocalId
      );

      const jugadorVisitante = buscarParticipante(
        partido.jugadorVisitanteId
      );

      partido.equipoLocal = jugadorLocal.equipo;
      partido.equipoVisitante =
        jugadorVisitante.equipo;
    });

    fecha.equiposAsignados = true;

    guardarTorneo();
  }

  if (!torneo.fechas || torneo.fechas.length === 0) {
    torneo.fechas = generarFixture();
  }

  const fechaActualInicial = obtenerFecha(
    torneo.fechaActual
  );

  asignarEquiposAFecha(fechaActualInicial);
  guardarTorneo();

  function resultadoCargado(partido) {
    return (
      partido.golesLocal !== null &&
      partido.golesVisitante !== null
    );
  }

  function fechaCompleta(fecha) {
    return fecha.partidos.every(
      function (partido) {
        return resultadoCargado(partido);
      }
    );
  }

  function fechaEditable(fecha) {
    return (
      fecha.numero === torneo.fechaActual &&
      !fecha.finalizada &&
      !torneo.torneoFinalizado
    );
  }

  function crearNavegacionFechas() {
    navegacionFechas.innerHTML = "";

    torneo.fechas.forEach(function (fecha) {
      const botonFecha = document.createElement(
        "button"
      );

      botonFecha.type = "button";
      botonFecha.className = "boton-fecha";
      botonFecha.textContent =
        "Fecha " + fecha.numero;

      if (fecha.numero === fechaSeleccionada) {
        botonFecha.classList.add("activa");
      }

      if (fecha.finalizada) {
        botonFecha.classList.add("completa");
      }

      if (fecha.numero > torneo.fechaActual) {
        botonFecha.disabled = true;
      }

      botonFecha.addEventListener(
        "click",
        function () {
          const fechaVisible = obtenerFecha(
            fechaSeleccionada
          );

          if (fechaEditable(fechaVisible)) {
            guardarResultadosVisibles(false);
          }

          fechaSeleccionada = fecha.numero;

          renderizarTodo();
        }
      );

      navegacionFechas.appendChild(botonFecha);
    });
  }

  function crearTarjetaPartido(
    partido,
    posicion,
    editable
  ) {
    const jugadorLocal = buscarParticipante(
      partido.jugadorLocalId
    );

    const jugadorVisitante = buscarParticipante(
      partido.jugadorVisitanteId
    );

    const tarjeta = document.createElement(
      "article"
    );

    tarjeta.className = "partido-card";

    tarjeta.innerHTML = `
      <p class="numero-partido">
        Partido ${posicion + 1}
      </p>

      <div class="enfrentamiento">

        <div class="lado-jugador local">

          <span class="nombre-jugador">
            ${jugadorLocal.nombre}
          </span>

          <span class="nombre-equipo">
            ${partido.equipoLocal}
          </span>

        </div>

        <div class="resultado-partido">

          <input
            type="number"
            min="0"
            max="99"
            class="input-goles goles-local"
            data-partido-id="${partido.id}"
            value="${
              partido.golesLocal !== null
                ? partido.golesLocal
                : ""
            }"
            ${editable ? "" : "disabled"}
          >

          <span class="separador-resultado">
            -
          </span>

          <input
            type="number"
            min="0"
            max="99"
            class="input-goles goles-visitante"
            data-partido-id="${partido.id}"
            value="${
              partido.golesVisitante !== null
                ? partido.golesVisitante
                : ""
            }"
            ${editable ? "" : "disabled"}
          >

        </div>

        <div class="lado-jugador visitante">

          <span class="nombre-jugador">
            ${jugadorVisitante.nombre}
          </span>

          <span class="nombre-equipo">
            ${partido.equipoVisitante}
          </span>

        </div>

      </div>
    `;

    return tarjeta;
  }

  function renderizarPartidos() {
    const fecha = obtenerFecha(
      fechaSeleccionada
    );

    asignarEquiposAFecha(fecha);

    const editable = fechaEditable(fecha);

    tituloFecha.textContent =
      "Fecha " + fecha.numero;

    fechaActualTexto.textContent =
      torneo.fechaActual +
      " de " +
      torneo.totalFechas;

    listaPartidos.innerHTML = "";

    fecha.partidos.forEach(
      function (partido, posicion) {
        listaPartidos.appendChild(
          crearTarjetaPartido(
            partido,
            posicion,
            editable
          )
        );
      }
    );

    mensajePartidos.textContent = "";
    mensajePartidos.classList.remove(
      "correcto"
    );

    if (fecha.finalizada) {
      estadoFecha.textContent =
        "Fecha finalizada";

      estadoFecha.classList.add("completa");

      botonGuardar.disabled = true;
      botonFinalizar.disabled = true;

      return;
    }

    if (!editable) {
      estadoFecha.textContent =
        "Fecha bloqueada";

      estadoFecha.classList.remove("completa");

      botonGuardar.disabled = true;
      botonFinalizar.disabled = true;

      return;
    }

    botonGuardar.disabled = false;

    if (fechaCompleta(fecha)) {
      estadoFecha.textContent =
        "Resultados completos";

      estadoFecha.classList.add("completa");

      botonFinalizar.disabled = false;
    } else {
      estadoFecha.textContent =
        "Resultados pendientes";

      estadoFecha.classList.remove("completa");

      botonFinalizar.disabled = true;
    }
  }

  function guardarResultadosVisibles(
    mostrarMensaje = true
  ) {
    const fecha = obtenerFecha(
      fechaSeleccionada
    );

    if (!fechaEditable(fecha)) {
      return;
    }

    const inputsLocales =
      document.querySelectorAll(
        ".goles-local"
      );

    const inputsVisitantes =
      document.querySelectorAll(
        ".goles-visitante"
      );

    inputsLocales.forEach(
      function (inputLocal, posicion) {
        const partido = fecha.partidos.find(
          function (partidoActual) {
            return (
              partidoActual.id ===
              inputLocal.dataset.partidoId
            );
          }
        );

        const valorLocal =
          inputLocal.value.trim();

        const valorVisitante =
          inputsVisitantes[
            posicion
          ].value.trim();

        if (
          valorLocal === "" &&
          valorVisitante === ""
        ) {
          partido.golesLocal = null;
          partido.golesVisitante = null;
          return;
        }

        if (
          valorLocal === "" ||
          valorVisitante === ""
        ) {
          partido.golesLocal = null;
          partido.golesVisitante = null;
          return;
        }

        const golesLocal = Number(valorLocal);
        const golesVisitante = Number(
          valorVisitante
        );

        if (
          !Number.isInteger(golesLocal) ||
          !Number.isInteger(golesVisitante) ||
          golesLocal < 0 ||
          golesVisitante < 0
        ) {
          partido.golesLocal = null;
          partido.golesVisitante = null;
          return;
        }

        partido.golesLocal = golesLocal;
        partido.golesVisitante =
          golesVisitante;
      }
    );

    guardarTorneo();
    renderizarTabla();
    crearNavegacionFechas();

    botonFinalizar.disabled =
      !fechaCompleta(fecha);

    if (mostrarMensaje) {
      mensajePartidos.textContent =
        "Los resultados fueron guardados.";

      mensajePartidos.classList.add(
        "correcto"
      );
    }
  }

  function crearEstadisticasIniciales(
    participante
  ) {
    return {
      id: participante.id,
      nombre: participante.nombre,

      partidosJugados: 0,
      ganados: 0,
      empatados: 0,
      perdidos: 0,

      golesFavor: 0,
      golesContra: 0,
      diferenciaGol: 0,

      puntos: 0
    };
  }

  function calcularTabla() {
    const tabla = torneo.participantes.map(
      crearEstadisticasIniciales
    );

    torneo.fechas.forEach(function (fecha) {
      fecha.partidos.forEach(
        function (partido) {
          if (!resultadoCargado(partido)) {
            return;
          }

          const local = tabla.find(
            function (jugador) {
              return (
                jugador.id ===
                partido.jugadorLocalId
              );
            }
          );

          const visitante = tabla.find(
            function (jugador) {
              return (
                jugador.id ===
                partido.jugadorVisitanteId
              );
            }
          );

          local.partidosJugados++;
          visitante.partidosJugados++;

          local.golesFavor +=
            partido.golesLocal;

          local.golesContra +=
            partido.golesVisitante;

          visitante.golesFavor +=
            partido.golesVisitante;

          visitante.golesContra +=
            partido.golesLocal;

          if (
            partido.golesLocal >
            partido.golesVisitante
          ) {
            local.ganados++;
            local.puntos += 3;

            visitante.perdidos++;
          } else if (
            partido.golesLocal <
            partido.golesVisitante
          ) {
            visitante.ganados++;
            visitante.puntos += 3;

            local.perdidos++;
          } else {
            local.empatados++;
            visitante.empatados++;

            local.puntos++;
            visitante.puntos++;
          }
        }
      );
    });

    tabla.forEach(function (jugador) {
      jugador.diferenciaGol =
        jugador.golesFavor -
        jugador.golesContra;
    });

    tabla.sort(function (a, b) {
      if (b.puntos !== a.puntos) {
        return b.puntos - a.puntos;
      }

      if (
        b.diferenciaGol !==
        a.diferenciaGol
      ) {
        return (
          b.diferenciaGol -
          a.diferenciaGol
        );
      }

      if (
        b.golesFavor !== a.golesFavor
      ) {
        return (
          b.golesFavor -
          a.golesFavor
        );
      }

      return a.nombre.localeCompare(
        b.nombre
      );
    });

    return tabla;
  }

  function mostrarDiferenciaGol(
    diferenciaGol
  ) {
    if (diferenciaGol > 0) {
      return "+" + diferenciaGol;
    }

    return diferenciaGol;
  }

  function renderizarTabla() {
    const tabla = calcularTabla();

    cuerpoTabla.innerHTML = "";

    tabla.forEach(
      function (jugador, posicion) {
        const fila =
          document.createElement("tr");

        const clasePrimero =
          posicion === 0
            ? "primer-puesto"
            : "";

        let claseDiferencia = "";

        if (jugador.diferenciaGol > 0) {
          claseDiferencia =
            "diferencia-positiva";
        } else if (
          jugador.diferenciaGol < 0
        ) {
          claseDiferencia =
            "diferencia-negativa";
        }

        fila.innerHTML = `
          <td class="${clasePrimero}">
            ${posicion + 1}
          </td>

          <td class="${clasePrimero}">
            ${jugador.nombre}
          </td>

          <td>${jugador.partidosJugados}</td>
          <td>${jugador.ganados}</td>
          <td>${jugador.empatados}</td>
          <td>${jugador.perdidos}</td>
          <td>${jugador.golesFavor}</td>
          <td>${jugador.golesContra}</td>

          <td class="${claseDiferencia}">
            ${mostrarDiferenciaGol(
              jugador.diferenciaGol
            )}
          </td>

          <td class="${clasePrimero}">
            ${jugador.puntos}
          </td>
        `;

        cuerpoTabla.appendChild(fila);
      }
    );
  }

  function finalizarFecha() {
    guardarResultadosVisibles(false);

    const fecha = obtenerFecha(
      fechaSeleccionada
    );

    if (fecha.numero !== torneo.fechaActual) {
      return;
    }

    if (!fechaCompleta(fecha)) {
      mensajePartidos.textContent =
        "Tenés que cargar todos los resultados.";

      mensajePartidos.classList.remove(
        "correcto"
      );

      return;
    }

    fecha.finalizada = true;

    if (fecha.numero < torneo.totalFechas) {
      torneo.fechaActual =
        fecha.numero + 1;

      torneo.equiposBloqueados = false;

      guardarTorneo();

      window.location.href =
        "cambiar-equipos.html";

      return;
    }

    torneo.torneoFinalizado = true;

    guardarTorneo();
    renderizarTodo();

    mensajePartidos.textContent =
      "¡El torneo terminó!";

    mensajePartidos.classList.add(
      "correcto"
    );
  }

  function crearNuevoTorneo() {
    const confirmacion = confirm(
      "¿Seguro que querés eliminar este torneo?"
    );

    if (!confirmacion) {
      return;
    }

    localStorage.removeItem("torneoFifa");

    window.location.href = "index.html";
  }

  function renderizarTodo() {
    crearNavegacionFechas();
    renderizarPartidos();
    renderizarTabla();
  }

  botonGuardar.addEventListener(
    "click",
    function () {
      guardarResultadosVisibles(true);
      renderizarPartidos();
    }
  );

  botonFinalizar.addEventListener(
    "click",
    finalizarFecha
  );

  botonNuevoTorneo.addEventListener(
    "click",
    crearNuevoTorneo
  );

  renderizarTodo();
});