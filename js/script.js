document.addEventListener("DOMContentLoaded", function () {
  console.log("El archivo script.js está conectado correctamente");

  const formularioTorneo = document.getElementById("torneo-form");
  const inputNombreTorneo = document.getElementById("nombre-torneo");
  const selectCantidadJugadores = document.getElementById(
    "cantidad-jugadores"
  );
  const mensajeError = document.getElementById("mensaje-error");

  if (!formularioTorneo) {
    console.error(
      "No se encontró el formulario con id torneo-form"
    );

    return;
  }

  formularioTorneo.addEventListener(
    "submit",
    function (evento) {
      evento.preventDefault();

      console.log("Se tocó el botón Crear torneo");

      const nombreTorneo = inputNombreTorneo.value.trim();
      const cantidadJugadores = Number(
        selectCantidadJugadores.value
      );

      mensajeError.textContent = "";

      if (nombreTorneo === "") {
        mensajeError.textContent =
          "Tenés que escribir el nombre del torneo.";

        return;
      }

      if (
        cantidadJugadores < 4 ||
        cantidadJugadores > 10
      ) {
        mensajeError.textContent =
          "La cantidad de jugadores no es válida.";

        return;
      }

      const cantidadesPermitidas = [4, 6, 8, 10];

      if (!cantidadesPermitidas.includes(cantidadJugadores)) {
        mensajeError.textContent =
          "La cantidad de jugadores debe ser 4, 6, 8 o 10.";

        return;
      }

      const torneo = {
        nombre: nombreTorneo,
        cantidadJugadores: cantidadJugadores,
        fechaActual: 1,
        totalFechas: 4,
        participantes: [],
        equiposBloqueados: false
      };

      localStorage.setItem(
        "torneoFifa",
        JSON.stringify(torneo)
      );

      console.log("Torneo guardado:", torneo);

      window.location.href = "./participantes.html";
    }
  );
});