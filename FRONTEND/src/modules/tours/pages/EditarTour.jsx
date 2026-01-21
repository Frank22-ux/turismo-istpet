import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaSave, FaImages, FaMapMarkerAlt, FaCalendarAlt, FaHotel, FaUserTie } from 'react-icons/fa';
import { getTourRequest, updateTourRequest } from '../services/tour.service';
import './EditarTour.css';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const EditarTour = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, watch, reset } = useForm();
    
    const [coverPreview, setCoverPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(null); 
    const [galleryFiles, setGalleryFiles] = useState([]); 
    const [galleryPreviews, setGalleryPreviews] = useState([]); 
    const [listaGuias, setListaGuias] = useState([]);
    const [listaHoteles, setListaHoteles] = useState([]);
    const [position, setPosition] = useState(null);

    const defaultCenter = [-0.1807, -78.4678];

    useEffect(() => {
        const cargarTodo = async () => {
            try {
                // Catálogos (Asegúrate de que coincidan con los IDs de tu DB)
                setListaGuias([
                    { id: 1, nombre: 'Carlos Andrés Turista' },
                    { id: 2, nombre: 'Maria Fernanda Gomez' }
                ]);
                setListaHoteles([
                    { id: 1, nombre: 'Hotel Paraíso Real' },
                    { id: 2, nombre: 'Hostal La Montaña' }
                ]);

                const tour = await getTourRequest(id);
                if (!tour) return;

                // Mapeo exacto de campos para el formulario
                reset({
                    nombre: tour.nombre,
                    ciudad_destino: tour.ciudad_destino,
                    precio: tour.precio,
                    descripcion: tour.descripcion,
                    duracion: tour.duracion,
                    // Conversión de fecha ISO a YYYY-MM-DD para el input date
                    fecha_inicio: tour.fecha_inicio ? tour.fecha_inicio.split('T')[0] : '',
                    fecha_fin: tour.fecha_fin ? tour.fecha_fin.split('T')[0] : '',
                    latitud: tour.latitud,
                    longitud: tour.longitud,
                    id_guia: tour.id_guia || '',
                    id_hotel_base: tour.id_hotel_base || ''
                });

                if (tour.imagen_portada) setCoverPreview(`http://localhost:4000${tour.imagen_portada}`);
                if (tour.galeria) setGalleryPreviews(tour.galeria.map(img => `http://localhost:4000${img}`));
                if (tour.latitud && tour.longitud) setPosition({ lat: parseFloat(tour.latitud), lng: parseFloat(tour.longitud) });

            } catch (error) {
                console.error("Error al cargar:", error);
            }
        };
        cargarTodo();
    }, [id, reset]);

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setPosition(e.latlng); 
                setValue('latitud', e.latlng.lat.toFixed(6));
                setValue('longitud', e.latlng.lng.toFixed(6));
            },
        });
        return position ? <Marker position={position} /> : null;
    }

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            
            // 1. Agregar campos de texto obligatorios
            formData.append('nombre', data.nombre);
            formData.append('ciudad_destino', data.ciudad_destino);
            formData.append('precio', data.precio);
            formData.append('duracion', data.duracion);
            formData.append('descripcion', data.descripcion || '');
            
            // 2. Manejo de fechas (asegurarse de que no vayan como strings vacíos si son null)
            formData.append('fecha_inicio', data.fecha_inicio || '');
            formData.append('fecha_fin', data.fecha_fin || '');
            
            // 3. Coordenadas
            formData.append('latitud', data.latitud);
            formData.append('longitud', data.longitud);

            // 4. IDs de relación (convertir a null si están vacíos)
            formData.append('id_guia', data.id_guia !== "" ? data.id_guia : "");
            formData.append('id_hotel_base', data.id_hotel_base !== "" ? data.id_hotel_base : "");

            // 5. Archivos: Solo se agregan si el usuario seleccionó nuevos
            if (imagenFile) {
                formData.append('imagen_portada', imagenFile);
            }
            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => formData.append('galeria', file));
            }

            await updateTourRequest(id, formData);
            alert('¡Tour actualizado con éxito!');
            navigate('/admin/crear-tour');
        } catch (error) {
            console.error("Error en submit:", error);
            alert('Error al guardar cambios.');
        }
    };

    return (
        <div className="editar-tour-container">
            <div className="editar-tour-card">
                <div className="card-header">
                    <h2>Editar Tour: {watch('nombre')}</h2>
                    <Link to="/admin/crear-tour" className="close-btn">×</Link>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="media-section">
                        <div className="media-col-main">
                            <label className="form-label">Imagen de Portada</label>
                            <div className="image-upload-wrapper">
                                <input type="file" id="pInput" className="hidden-file-input" onChange={e => {
                                    const file = e.target.files[0];
                                    if(file) { setImagenFile(file); setCoverPreview(URL.createObjectURL(file)); }
                                }} />
                                <label htmlFor="pInput" className="image-upload-label">
                                    {coverPreview ? <img src={coverPreview} className="image-preview" alt="Portada"/> : <span>Cambiar Foto</span>}
                                </label>
                            </div>
                        </div>
                        <div className="media-col-gallery">
                            <label className="form-label">Galería de Fotos</label>
                            <input type="file" multiple id="gInput" className="hidden-file-input" onChange={e => {
                                const files = Array.from(e.target.files);
                                setGalleryFiles(files);
                                setGalleryPreviews(files.map(f => URL.createObjectURL(f)));
                            }} />
                            <label htmlFor="gInput" className="gallery-upload-btn"><FaImages /> Actualizar Galería</label>
                            <div className="gallery-grid">
                                {galleryPreviews.map((src, i) => <img key={i} src={src} className="gallery-thumb" alt="Miniatura"/>)}
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Nombre del Tour *</label>
                            <input type="text" className="form-input" {...register("nombre", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Ciudad Destino *</label>
                            <input type="text" className="form-input" {...register("ciudad_destino", { required: true })} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Precio ($) *</label>
                            <input type="number" step="0.01" className="form-input" {...register("precio", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Duración *</label>
                            <input type="text" className="form-input" {...register("duracion", { required: true })} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaCalendarAlt /> Fecha Inicio</label>
                            <input type="date" className="form-input" {...register("fecha_inicio")} />
                        </div>
                        <div className="form-col">
                            <label className="form-label"><FaCalendarAlt /> Fecha Fin</label>
                            <input type="date" className="form-input" {...register("fecha_fin")} />
                        </div>
                    </div>

                    <div className="map-section">
                        <label className="form-label"><FaMapMarkerAlt /> Ubicación (Haz clic para mover el pin)</label>
                        <div className="map-wrapper" style={{ height: '300px', marginBottom: '15px' }}>
                            <MapContainer center={position || defaultCenter} zoom={13} style={{ height: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        <div className="form-row">
                            <div className="form-col">
                                <input type="hidden" {...register("latitud")} />
                            </div>
                            <div className="form-col">
                                <input type="hidden" {...register("longitud")} />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaHotel /> Hotel Base</label>
                            <select className="form-input" {...register("id_hotel_base")}>
                                <option value="">-- Ninguno --</option>
                                {listaHoteles.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-col">
                            <label className="form-label"><FaUserTie /> Guía Asignado</label>
                            <select className="form-input" {...register("id_guia")}>
                                <option value="">-- Sin Asignar --</option>
                                {listaGuias.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción Detallada</label>
                        <textarea className="form-textarea" rows="4" {...register("descripcion")}></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/admin/crear-tour')} className="btn-cancel">Descartar</button>
                        <button type="submit" className="btn-save"><FaSave /> Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarTour;