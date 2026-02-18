import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import fichajesCodigosService from './services/fichajesCodigosService';
import { Plus, Upload, Edit2, Trash2, Search, X } from 'lucide-react';
import './FichajeCodigosAdmin.css';

const FichajeCodigosAdmin = ({ userId }) => {
  const [codigos, setCodigos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    codigo: '',
    empleadoId: '',
    descripcion: ''
  });

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [codigosData, empleadosData] = await Promise.all([
        fichajesCodigosService.obtenerTodosLosCodigos(),
        fetchEmpleados() 
      ]);
      setCodigos(codigosData || []);
      setEmpleados(empleadosData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error cargando los datos. Por favor recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpleados = async () => {
    // Assuming we fetch from a 'users' or 'user_profiles' table used elsewhere
    // Or if creating a custom list, we might just query `auth.users` via a stored procedure 
    // or a public profile table if it exists. 
    // Based on App.jsx, there is 'user_profiles'.
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email');
    
    if (error) {
      console.warn('Could not fetch user_profiles, defaulting to empty list or handling gracefully', error);
      return [];
    }
    return data;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCodigos = codigos.filter(code => {
    const searchLower = searchTerm.toLowerCase();
    const empleado = empleados.find(e => e.id === code.empleado_id);
    const empleadoNombre = empleado ? (empleado.full_name || empleado.email) : code.empleado_id;
    
    return (
      code.codigo.toLowerCase().includes(searchLower) ||
      (code.descripcion && code.descripcion.toLowerCase().includes(searchLower)) ||
      String(empleadoNombre).toLowerCase().includes(searchLower)
    );
  });

  const handleOpenModal = (code = null) => {
    if (code) {
      setFormData({
        id: code.id,
        codigo: code.codigo,
        empleadoId: code.empleado_id,
        descripcion: code.descripcion || ''
      });
    } else {
      setFormData({
        id: null,
        codigo: '',
        empleadoId: '',
        descripcion: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ id: null, codigo: '', empleadoId: '', descripcion: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.codigo || !formData.empleadoId) {
      alert('Código y Empleado son obligatorios');
      return;
    }

    try {
      setProcessing(true);
      await fichajesCodigosService.crearOActualizarCodigo(
        formData.codigo.toUpperCase(),
        formData.empleadoId,
        formData.descripcion,
        userId
      );
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving code:', error);
      if (error.code === '23505') {
        alert('Este código ya existe. Por favor usa uno diferente.');
      } else {
        alert('Error guardando el código: ' + error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres desactivar este código?')) return;
    
    try {
      setProcessing(true);
      await fichajesCodigosService.desactivarCodigo(id);
      await fetchData();
    } catch (error) {
      console.error('Error deactivating code:', error);
      alert('Error desactivando el código');
    } finally {
      setProcessing(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setProcessing(true);
      const result = await fichajesCodigosService.importarCodigosDesdeExcel(file, userId);
      alert(`Importación completada. Procesados: ${result.processed}, Errores: ${result.errors}`);
      await fetchData();
    } catch (error) {
      console.error('Error importing:', error);
      alert('Error importando el archivo: ' + error.message);
    } finally {
      setProcessing(false);
      e.target.value = null; // Reset input
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="fichajes-admin-container">
      <div className="fichajes-admin-header">
        <h2 className="fichajes-admin-title">Gestión de Códigos de Fichaje</h2>
        
        <div className="fichajes-admin-controls">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Buscar por código, nombre..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="import-controls">
            <label htmlFor="file-upload" className="btn-secondary">
              <Upload size={18} /> Importar Excel
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImport}
            />
          </div>

          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Nuevo Código
          </button>
        </div>
      </div>

      <div className="fichajes-table-container">
        <table className="fichajes-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Empleado</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCodigos.length > 0 ? (
              filteredCodigos.map(code => {
                const empleado = empleados.find(e => e.id === code.empleado_id);
                const empleadoNombre = empleado ? (empleado.full_name || empleado.email) : code.empleado_id;
                
                return (
                  <tr key={code.id}>
                    <td><strong>{code.codigo}</strong></td>
                    <td>{empleadoNombre}</td>
                    <td>{code.descripcion || '-'}</td>
                    <td>
                      <span className={`status-badge ${code.activo ? 'status-active' : 'status-inactive'}`}>
                        {code.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleOpenModal(code)} title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(code.id)} title="Desactivar">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No se encontraron códigos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{formData.id ? 'Editar Código' : 'Nuevo Código'}</h3>
              <button className="close-modal-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Código *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value.toUpperCase()})}
                  placeholder="Ej: A123"
                  required
                  disabled={!!formData.id} // Disable editing code if updating (optional restriction)
                />
              </div>

              <div className="form-group">
                <label className="form-label">Empleado *</label>
                {empleados.length > 0 ? (
                  <select
                    className="form-select"
                    value={formData.empleadoId}
                    onChange={(e) => setFormData({...formData, empleadoId: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar Empleado</option>
                    {empleados.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name || emp.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    value={formData.empleadoId}
                    onChange={(e) => setFormData({...formData, empleadoId: e.target.value})}
                    placeholder="ID de Empleado (No se encontraron usuarios)"
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-input"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={processing}>
                  {processing ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FichajeCodigosAdmin;
