import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios'; // <--- Importamos axios directamente
import { 
    FaSave, FaHotel, FaMapMarkerAlt, FaStar, 
    FaCloudUploadAlt, FaPhone, FaArrowLeft, FaImages 
} from 'react-icons/fa';

// --- MAPA ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import './CrearHotel.css';

const API_URL = 'http://localhost:4000'; // Tu servidor backend

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CrearHotel = () => {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const navigate = useNavigate();
    
    // --- ESTADOS PARA ARCHIVOS ---
    const [preview, setPreview] = useState(null);
    const [fotoFile, setFotoFile] = useState(null); 
    const [galleryFiles, setGalleryFiles] = useState([]); 
    const [galleryPreviews, setGalleryPreviews] = useState([]); 

    // --- ESTADOS MAPA ---
    const [position, setPosition] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const defaultCenter = [-0.1807, -78.4678]; // Quito

    const fetchAddress = async (lat, lng) => {
        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const fullAddress = data.display_name || "";
            setValue('direccion', fullAddress);
        } catch (error) {
            console.error("Error al obtener dirección:", error);
        } finally {
            setIsSearching(false);
        }
    };

    function LocationMarker() {
        useMapEvents({
            async click(e) {
                const { lat, lng } = e.latlng;
                setPosition(e.latlng);
                setValue('latitud', lat.toFixed(6));
                setValue('longitud', lng.toFixed(6));
                await fetchAddress(lat, lng);
            },
        });
        return position ? <Marker position={position} /> : null;
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setGalleryFiles(files); 
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews(newPreviews);
        }
    };

    const onSubmit = async (data) => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            // Datos de texto
            formData.append('nombre', data.nombre);
            formData.append('direccion', data.direccion);
            formData.append('telefono', data.telefono || '');
            formData.append('estrellas', data.estrellas);
            formData.append('latitud', data.latitud || 0);
            formData.append('longitud', data.longitud || 0);
            formData.append('descripcion', data.descripcion || '');
            
            // Imagen principal (foto)
            if (fotoFile) formData.append('foto', fotoFile);

            // Galería de imágenes
            if (galleryFiles.length > 0) {
                galleryFiles.forEach((file) => {
                    formData.append('galeria', file); 
                });
            }

            // --- PETICIÓN DIRECTA AL BACKEND ---
            await axios.post(`${API_URL}/api/hoteles`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('¡Hotel registrado con éxito!');
            navigate('/admin/hoteles');
        } catch (error) {
            console.error(error);
            alert('Error al registrar el hotel en el servidor');
        }
    };

    return (
        <div className="crear-hotel-container">
            <div className="crear-hotel-card">
                <header className="card-header-hotel">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        <FaArrowLeft />
                    </button>
                    <h2><FaHotel /> Nuevo Establecimiento</h2>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="hotel-form">
                    
                    <div className="media-upload-grid">
                        <div className="main-photo-upload">
                            <label className="form-label">Foto de Portada *</label>
                            <div className="hotel-preview-wrapper">
                                <img src={preview || 'https://via.placeholder.com/300x200?text=Portada'} alt="Preview" className="hotel-img-preview" />
                                <label htmlFor="hotel-foto" className="btn-add-img">
                                    <FaCloudUploadAlt /> Subir Portada
                                    <input type="file" id="hotel-foto" hidden accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>

                        <div className="gallery-upload-box">
                            <label className="form-label">Galería de Imágenes</label>
                            <input type="file" id="hotel-galeria" hidden accept="image/*" multiple onChange={handleGalleryChange} />
                            <label htmlFor="hotel-galeria" className="btn-add-gallery">
                                <FaImages /> Seleccionar Fotos
                            </label>
                            <div className="mini-gallery-grid">
                                {galleryPreviews.map((src, i) => (
                                    <img key={i} src={src} className="mini-preview" alt="Gallery item" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-grid-hotel">
                        <div className="form-group">
                            <label><FaHotel /> Nombre del Hotel *</label>
                            <input type="text" {...register("nombre", { required: "Campo obligatorio" })} placeholder="Ej. Hotel Plaza Real" />
                        </div>

                        <div className="form-group">
                            <label><FaStar /> Estrellas</label>
                            <select {...register("estrellas")}>
                                {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Estrellas</option>)}
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label><FaMapMarkerAlt /> Ubicar en el Mapa (Click para obtener dirección)</label>
                            <div className="map-wrapper-hotel">
                                <MapContainer center={defaultCenter} zoom={13} className="leaflet-container-hotel">
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationMarker />
                                </MapContainer>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Latitud</label>
                            <input type="number" step="any" {...register("latitud")} />
                        </div>
                        <div className="form-group">
                            <label>Longitud</label>
                            <input type="number" step="any" {...register("longitud")} />
                        </div>

                        <div className="form-group full-width">
                            <label><FaMapMarkerAlt /> Dirección Detectada / Manual *</label>
                            <input 
                                type="text" 
                                className={isSearching ? 'input-loading' : ''}
                                {...register("direccion", { required: "La dirección es obligatoria" })}
                                placeholder="Haz click en el mapa o escribe aquí..."
                            />
                        </div>

                        <div className="form-group">
                            <label><FaPhone /> Teléfono</label>
                            <input type="tel" {...register("telefono")} placeholder="Ej. 0987654321" />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Descripción / Comodidades</label>
                        <textarea rows="3" {...register("descripcion")} placeholder="WiFi, Desayuno, Parqueadero..."></textarea>
                    </div>

                    <div className="form-actions-hotel">
                        <button type="button" className="btn-cancel-hotel" onClick={() => navigate(-1)}>Cancelar</button>
                        <button type="submit" className="btn-save-hotel" disabled={isSearching}>
                            <FaSave /> {isSearching ? 'Buscando...' : 'Guardar Hotel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearHotel;