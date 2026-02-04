
// Adapting source for Vite
import { supabase } from '../supabaseClient'; // Reuse existing client

class FichajeSupabaseService {
  // ===== OPERACIONES CRUD BÁSICAS =====

  async crearFichajeEntrada(empleadoId, fecha, userId = null) {
    try {
      // Ensuring fecha is just the YYYY-MM-DD part if a Date object is passed
      const fechaStr = fecha instanceof Date ? fecha.toISOString().split("T")[0] : fecha;

      const { data, error } = await supabase
        .from("fichajes")
        .insert({
          empleado_id: empleadoId,
          fecha: fechaStr,
          // hora_entrada: null, // Let the trigger set it to now()
          created_by: userId,
          es_modificado: false,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error creando fichaje:", error);
      return { success: false, error: error.message };
    }
  }

  async registrarSalida(fichajeId) {
    try {
      const { data, error } = await supabase.rpc("registrar_salida_fichaje", {
        p_fichaje_id: fichajeId,
      });

      if (error) throw error;
      return { success: true, data: data && data.length > 0 ? data[0] : null };
    } catch (error) {
      console.error("Error registrando salida:", error);
      return { success: false, error: error.message };
    }
  }

  async obtenerFichajeDia(empleadoId, fecha = new Date()) {
    try {
      const fechaStr = fecha.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("fichajes")
        .select("*")
        .eq("empleado_id", empleadoId)
        .eq("fecha", fechaStr)
        .single(); // Intentionally expecting one or none

      if (error && error.code !== "PGRST116") throw error;
      return { success: true, data: data || null };
    } catch (error) {
      console.error("Error obteniendo fichaje del día:", error);
      return { success: false, error: error.message };
    }
  }

  async obtenerFichajesPendientes(empleadoId) {
    try {
      const { data, error } = await supabase
        .from("fichajes")
        .select("*")
        .eq("empleado_id", empleadoId)
        .is("hora_salida", null)
        .order("fecha", { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error obteniendo fichajes pendientes:", error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  async cerrarFichajeAutomaticamente(fichajeId, motivo) {
      try {
          const { error } = await supabase
              .from('fichajes')
              .update({ 
                  hora_salida: new Date().toISOString(), // Fallback if RPC not used for auto-close, but instructions imply update
                  es_modificado: true,
                  valor_original: { motivo_cierre_auto: motivo }
              })
              .eq('id', fichajeId);

          if (error) throw error;
          return { success: true };
      } catch (error) {
          console.error("Error cerrando fichaje automáticamente:", error);
          return { success: false, error: error.message };
      }
  }


  // ===== GESTIÓN DE PAUSAS =====

  async iniciarPausa(fichajeId, tipo = "descanso", descripcion = null) {
    try {
      const { data, error } = await supabase
        .from("fichajes_pausas")
        .insert({
          fichaje_id: fichajeId,
          tipo: tipo,
          // inicio: null, // Trigger uses now()
          descripcion: descripcion,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error iniciando pausa:", error);
      return { success: false, error: error.message };
    }
  }

  async finalizarPausa(pausaId) {
    try {
      const { data, error } = await supabase.rpc("finalizar_pausa_fichaje", {
        p_pausa_id: pausaId,
      });

      if (error) throw error;
      return { success: true, data: data && data.length > 0 ? data[0] : null };
    } catch (error) {
      console.error("Error finalizando pausa:", error);
      return { success: false, error: error.message };
    }
  }

  async obtenerPausas(fichajeId) {
    try {
      const { data, error } = await supabase
        .from("fichajes_pausas")
        .select("*")
        .eq("fichaje_id", fichajeId)
        .order("inicio", { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error obteniendo pausas:", error);
      return { success: false, error: error.message };
    }
  }

  async obtenerPausaActiva(fichajeId) {
    try {
      const { data, error } = await supabase
        .from("fichajes_pausas")
        .select("*")
        .eq("fichaje_id", fichajeId)
        .is("fin", null)
        .order("inicio", { ascending: false })
        .limit(1);

      if (error) throw error;
      return { success: true, data: data && data.length > 0 ? data[0] : null };
    } catch (error) {
      console.error("Error obteniendo pausa activa:", error);
      return { success: false, error: error.message };
    }
  }

  // ===== HISTORIAL Y REPORTES =====

  async obtenerFichajesEmpleado(empleadoId, fechaInicio, fechaFin) {
    try {
      const { data, error } = await supabase
        .from("fichajes")
        .select("*")
        .eq("empleado_id", empleadoId)
        .gte("fecha", fechaInicio.toISOString().split("T")[0])
        .lte("fecha", fechaFin.toISOString().split("T")[0])
        .order("fecha", { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error obteniendo fichajes del empleado:", error);
      return { success: false, error: error.message };
    }
  }
}

const fichajeSupabaseService = new FichajeSupabaseService();
export default fichajeSupabaseService;
