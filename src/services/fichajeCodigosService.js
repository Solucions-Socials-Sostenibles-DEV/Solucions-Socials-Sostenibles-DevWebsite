
import { supabase } from '../supabaseClient';

class FichajeCodigosService {
  async buscarEmpleadoPorCodigo(codigo) {
    try {
      if (!codigo || !codigo.trim()) {
        return { success: false, error: "El código no puede estar vacío" };
      }

      const codigoLimpio = codigo.trim().toUpperCase();

      const { data, error } = await supabase
        .from("fichajes_codigos")
        .select("*, empleado_id")
        .eq("codigo", codigoLimpio)
        .eq("activo", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { success: false, error: "Código no encontrado o no válido" };
        }
        throw error;
      }

      if (!data) {
        return { success: false, error: "Código no encontrado" };
      }

      return {
        success: true,
        data: {
          codigo: data.codigo,
          empleadoId: data.empleado_id,
          descripcion: data.descripcion,
        },
      };
    } catch (error) {
      console.error("Error buscando empleado por código:", error);
      return {
        success: false,
        error: error.message || "Error al buscar el código",
      };
    }
  }
}

export default new FichajeCodigosService();
