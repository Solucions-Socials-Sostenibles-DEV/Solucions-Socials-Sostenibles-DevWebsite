import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';

/**
 * Service for managing Fichaje Codes
 */
const fichajesCodigosService = {
  /**
   * Obtiene todos los códigos de fichaje activos
   * @returns {Promise<Array>} Lista de códigos
   */
  async obtenerTodosLosCodigos() {
    const { data, error } = await supabase
      .from('fichajes_codigos')
      .select('*')
      .eq('activo', true)
      .order('codigo', { ascending: true });

    if (error) {
      console.error('Error fetching fichajes_codigos:', error);
      throw error;
    }
    return data;
  },

  /**
   * Crea o actualiza un código de fichaje
   * @param {string} codigo - El código de fichaje
   * @param {string} empleadoId - El ID del empleado
   * @param {string} descripcion - Descripción opcional
   * @param {string} userId - ID del usuario creador (opcional)
   * @returns {Promise<Object>} El código creado o actualizado
   */
  async crearOActualizarCodigo(codigo, empleadoId, descripcion, userId) {
    // Check if code exists
    const { data: existingData } = await supabase
      .from('fichajes_codigos')
      .select('id')
      .eq('codigo', codigo)
      .single();

    let result;
    if (existingData) {
      // Update
      const { data, error } = await supabase
        .from('fichajes_codigos')
        .update({
          empleado_id: empleadoId,
          descripcion: descripcion,
          activo: true, // If it was inactive, reactivate it
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('fichajes_codigos')
        .insert({
          codigo: codigo,
          empleado_id: empleadoId,
          descripcion: descripcion,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }
    return result;
  },

  /**
   * Desactiva un código (borrado lógico)
   * @param {string} id - ID del registro
   * @returns {Promise<void>}
   */
  async desactivarCodigo(id) {
    const { error } = await supabase
      .from('fichajes_codigos')
      .update({ activo: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Busca un empleado dado su código de fichaje
   * @param {string} codigo 
   * @returns {Promise<Object|null>}
   */
  async buscarEmpleadoPorCodigo(codigo) {
     const { data, error } = await supabase
      .from('fichajes_codigos')
      .select('empleado_id')
      .eq('codigo', codigo)
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error searching employee by code:', error);
      throw error;
    }
    return data;
  },

  /**
   * Importa códigos desde un archivo Excel
   * @param {File} file - Archivo Excel
   * @param {string} userId - ID del usuario que importa
   * @returns {Promise<Object>} Resumen de la importación
   */
  async importarCodigosDesdeExcel(file, userId) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let processed = 0;
          let errors = 0;

          // Process each row
          // Expected columns: "CLAVE" (codigo), "NOMBRE" (empleado - we might need to resolve ID or just store name if user table allows text, 
          // but instructions say "Busca columnas CLAVE and NOMBRE". 
          // NOTE: The instruction says "Itera y llama a crear/actualizar". 
          // If `empleado_id` is required to be a UUID from `users` or a specific table, we might have an issue if the Excel only has names.
          // However, assuming for now we might map or just pass the value if the schema supports it.
          // Re-reading task: "2. Servicio Frontend... busca columnas... itera y llama a crear/actualizar".
          // "3. Componente React... Mapeado de la lista de empleados".
          // If the excel has names, mapping them to IDs might be tricky without exact matches. 
          // I will assume for now we use the "NOMBRE" column as the value to try to match or just store if `empleado_id` was text (DB schema said `empleado_id text not null`, so it stores the ID as text, potentially unrelated to auth.users if not strictly foreign keyed in the instruction's schema).
          // The instruction schema: `empleado_id text not null`. It does NOT have a foreign key to auth.users in the create table snippet provided by user.
          
          for (const row of jsonData) {
            const codigo = row['CLAVE'] || row['codigo'] || row['Codigo'];
            // We use the 'NOMBRE' as the ID if we can't map it, or maybe the system expects the ID in that column. 
            // Given the user instruction "Busca columnas 'CLAVE' (código) y 'NOMBRE' (empleado)", let's assume 'NOMBRE' contains the value we want to store in `empleado_id`.
            const empleadoVal = row['NOMBRE'] || row['nombre'] || row['Nombre'] || row['EMPLEADO'];

            if (codigo && empleadoVal) {
              try {
                await this.crearOActualizarCodigo(String(codigo), String(empleadoVal), 'Importado desde Excel', userId);
                processed++;
              } catch (err) {
                console.error(`Error processing row ${codigo}:`, err);
                errors++;
              }
            }
          }

          resolve({ processed, errors });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }
};

export default fichajesCodigosService;
