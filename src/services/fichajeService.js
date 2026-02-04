
import fichajeSupabaseService from "./fichajeSupabaseService";

class FichajeService {
  async ficharEntrada(empleadoId, userId) {
    try {
      const hoy = new Date();

      // Verificar si ya fichó hoy
      const { data: fichajeExistente } =
        await fichajeSupabaseService.obtenerFichajeDia(empleadoId, hoy);

      if (fichajeExistente) {
        return {
          success: false,
          error: "Ya has fichado la entrada hoy",
          data: fichajeExistente,
        };
      }

      // Cerrar fichajes pendientes antes de crear uno nuevo
      await this.verificarYcerrarFichajesOlvidados(empleadoId);

      // Crear nuevo fichaje
      const resultado = await fichajeSupabaseService.crearFichajeEntrada(
        empleadoId,
        hoy,
        userId,
      );

      if (!resultado.success) return resultado;

      return {
        success: true,
        message: "Entrada registrada correctamente",
        data: resultado.data,
      };
    } catch (error) {
      console.error("Error en ficharEntrada:", error);
      return {
        success: false,
        error: error.message || "Error al registrar la entrada",
      };
    }
  }

  async ficharSalida(empleadoId, userId) {
    try {
      const hoy = new Date();
      const { data: fichaje } = await fichajeSupabaseService.obtenerFichajeDia(
        empleadoId,
        hoy,
      );

      if (!fichaje) {
        return { success: false, error: "No has fichado la entrada hoy" };
      }

      if (fichaje.hora_salida) {
        return {
          success: false,
          error: "Ya has fichado la salida hoy",
          data: fichaje,
        };
      }

      // Verificar pausas activas
      const { data: pausaActiva } =
        await fichajeSupabaseService.obtenerPausaActiva(fichaje.id);

      if (pausaActiva) {
        return {
          success: false,
          error:
            "Tienes una pausa activa. Finaliza la pausa antes de fichar la salida",
        };
      }

      const resultado = await fichajeSupabaseService.registrarSalida(
        fichaje.id,
      );

      if (!resultado.success) return resultado;

      return {
        success: true,
        message: "Salida registrada correctamente",
        data: resultado.data,
      };
    } catch (error) {
      console.error("Error en ficharSalida:", error);
      return {
        success: false,
        error: error.message || "Error al registrar la salida",
      };
    }
  }

  async iniciarPausa(empleadoId, tipo = "descanso", descripcion = null) {
    try {
      const hoy = new Date();
      const { data: fichaje } = await fichajeSupabaseService.obtenerFichajeDia(
        empleadoId,
        hoy,
      );

      if (!fichaje) {
        return { success: false, error: "No has fichado la entrada hoy" };
      }

      if (fichaje.hora_salida) {
        return {
          success: false,
          error: "Ya has fichado la salida. No puedes iniciar una pausa",
        };
      }

      const { data: pausaActiva } =
        await fichajeSupabaseService.obtenerPausaActiva(fichaje.id);

      if (pausaActiva) {
        return {
          success: false,
          error:
            "Ya tienes una pausa activa. Finaliza la pausa actual antes de iniciar otra",
        };
      }

      const resultado = await fichajeSupabaseService.iniciarPausa(
        fichaje.id,
        tipo,
        descripcion,
      );

      if (!resultado.success) return resultado;

      return {
        success: true,
        message: `Pausa de ${tipo} iniciada`,
        data: resultado.data,
      };
    } catch (error) {
      console.error("Error en iniciarPausa:", error);
      return {
        success: false,
        error: error.message || "Error al iniciar la pausa",
      };
    }
  }

  async finalizarPausa(empleadoId) {
    try {
      const hoy = new Date();
      const { data: fichaje } = await fichajeSupabaseService.obtenerFichajeDia(
        empleadoId,
        hoy,
      );

      if (!fichaje) {
        return { success: false, error: "No has fichado la entrada hoy" };
      }

      const { data: pausaActiva } =
        await fichajeSupabaseService.obtenerPausaActiva(fichaje.id);

      if (!pausaActiva) {
        return { success: false, error: "No tienes ninguna pausa activa" };
      }

      const resultado = await fichajeSupabaseService.finalizarPausa(
        pausaActiva.id,
      );

      if (!resultado.success) return resultado;

      return {
        success: true,
        message: "Pausa finalizada correctamente",
        data: resultado.data,
      };
    } catch (error) {
      console.error("Error en finalizarPausa:", error);
      return {
        success: false,
        error: error.message || "Error al finalizar la pausa",
      };
    }
  }

  async obtenerEstadoFichaje(empleadoId) {
    try {
      const hoy = new Date();

      // Verificar y cerrar fichajes olvidados
      await this.verificarYcerrarFichajesOlvidados(empleadoId);

      const { data: fichaje } = await fichajeSupabaseService.obtenerFichajeDia(
        empleadoId,
        hoy,
      );

      if (!fichaje) {
        return {
          success: true,
          data: {
            tieneFichaje: false,
            puedeFicharEntrada: true,
            puedeFicharSalida: false,
            puedeIniciarPausa: false,
            puedeFinalizarPausa: false,
            pausaActiva: null,
          },
        };
      }

      const { data: pausas } = await fichajeSupabaseService.obtenerPausas(
        fichaje.id,
      );
      const { data: pausaActiva } =
        await fichajeSupabaseService.obtenerPausaActiva(fichaje.id);

      return {
        success: true,
        data: {
          tieneFichaje: true,
          fichaje: fichaje,
          puedeFicharEntrada: false,
          puedeFicharSalida: !fichaje.hora_salida && !pausaActiva,
          puedeIniciarPausa: !fichaje.hora_salida && !pausaActiva,
          puedeFinalizarPausa: !!pausaActiva,
          pausaActiva: pausaActiva,
          pausas: pausas || [],
        },
      };
    } catch (error) {
      console.error("Error en obtenerEstadoFichaje:", error);
      return {
        success: false,
        error: error.message || "Error al obtener el estado del fichaje",
      };
    }
  }

  async verificarYcerrarFichajesOlvidados(empleadoId) {
    try {
      const ahora = new Date();
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const { data: fichajesPendientes } =
        await fichajeSupabaseService.obtenerFichajesPendientes(empleadoId);

      if (!fichajesPendientes || fichajesPendientes.length === 0) return;

      for (const fichaje of fichajesPendientes) {
        const { data: pausaActiva } =
          await fichajeSupabaseService.obtenerPausaActiva(fichaje.id);
        if (pausaActiva) continue;

        const fechaFichaje = new Date(fichaje.fecha);
        fechaFichaje.setHours(0, 0, 0, 0);
        const esHoy = fechaFichaje.getTime() === hoy.getTime();

        if (esHoy && fichaje.hora_entrada) {
          const horaEntrada = new Date(fichaje.hora_entrada);
          const horasAbierto = (ahora - horaEntrada) / (1000 * 60 * 60);

          if (horasAbierto >= 14) {
            await fichajeSupabaseService.cerrarFichajeAutomaticamente(
              fichaje.id,
              `Cerrado automáticamente: llevaba ${horasAbierto.toFixed(2)} horas abierto`,
            );
          }
        } else if (fechaFichaje < hoy) {
          await fichajeSupabaseService.cerrarFichajeAutomaticamente(
            fichaje.id,
            "Cerrado automáticamente: fichaje de día anterior sin salida",
          );
        }
      }
    } catch (error) {
      console.error("Error verificando fichajes olvidados:", error);
    }
  }

  formatearHoras(horas) {
    if (!horas && horas !== 0) return "0h";

    const horasEnteras = Math.floor(horas);
    const minutos = Math.round((horas - horasEnteras) * 60);

    if (minutos === 0) return `${horasEnteras}h`;
    return `${horasEnteras}h ${minutos}m`;
  }
}

const fichajeService = new FichajeService();
export default fichajeService;
