import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
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

import './EditarHotel.css';

const API_URL = 'http://localhost:4000';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const EditarHotel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
    
    const [preview, setPreview] = useState(null);
    const [fotoFile, setFotoFile] = useState(null); 
    const [galleryFiles, setGalleryFiles] = useState([]); 
    const [galleryPreviews, setGalleryPreviews] = useState([]); 
    const [position, setPosition] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const defaultCenter = [-0.1807, -78.4678]; 

    // 1. CARGAR DATOS ACTUALES DEL HOTEL
    useEffect(() => {
        const cargarHotel = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/hoteles/${id}`);
                const hotel = res.data;

                reset({
                    nombre: hotel.nombre,
                    direccion: hotel.direccion,
                    telefono: hotel.telefono,
                    estrellas: hotel.estrellas,
                    latitud: hotel.latitud,
                    longitud: hotel.longitud,
                    descripcion: hotel.descripcion
                });

                if (hotel.foto_url) setPreview(`${API_URL}${hotel.foto_url}`);
                if (hotel.galeria) setGalleryPreviews(hotel.galeria.map(img => `${API_URL}${img}`));
                if (hotel.latitud && hotel.longitud) {
                    setPosition({ lat: parseFloat(hotel.latitud), lng: parseFloat(hotel.longitud) });
                }
            } catch (error) {
                console.error("Error al cargar hotel:", error);
                alert("No se pudo obtener la información del hotel.");
            }
        };
        cargarHotel();
    }, [id, reset]);

    const fetchAddress = async (lat, lng) => {
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            setValue('direccion', data.display_name || "");
        } catch (error) { console.error(error); } 
        finally { setIsSearching(false); }
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
        setGalleryFiles(files);
        setGalleryPreviews(files.map(file => URL.createObjectURL(file)));
    };

    const onSubmit = async (data) => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            formData.append('nombre', data.nombre);
            formData.append('direccion', data.direccion);
            formData.append('telefono', data.telefono || '');
            formData.append('estrellas', data.estrellas);
            formData.append('latitud', data.latitud);
            formData.append('longitud', data.longitud);
            formData.append('descripcion', data.descripcion || '');
            
            if (fotoFile) formData.append('foto', fotoFile);
            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => formData.append('galeria', file));
            }

            // Usamos PUT para actualizar
            await axios.put(`${API_URL}/api/hoteles/${id}`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('¡Hotel actualizado con éxito!');
            navigate('/admin/hoteles');
        } catch (error) {
            alert('Error al actualizar el hotel');
        }
    };

    return (
        <div className="crear-hotel-container">
            <div className="crear-hotel-card">
                <header className="card-header-hotel">
                    <button className="btn-back" onClick={() => navigate(-1)}><FaArrowLeft /></button>
                    <h2><FaHotel /> Editar: {watch('nombre')}</h2>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="hotel-form">
                    <div className="media-upload-grid">
                        <div className="main-photo-upload">
                            <label className="form-label">Foto de Portada Actual</label>
                            <div className="hotel-preview-wrapper">
                                <img src={preview || 'https://via.placeholder.com/300x200'} className="hotel-img-preview" alt="Preview" />
                                <label htmlFor="hotel-foto" className="btn-add-img">
                                    <FaCloudUploadAlt /> Cambiar Foto
                                    <input type="file" id="hotel-foto" hidden accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>

                        <div className="gallery-upload-box">
                            <label className="form-label">Actualizar Galería</label>
                            <input type="file" id="hotel-galeria" hidden accept="image/*" multiple onChange={handleGalleryChange} />
                            <label htmlFor="hotel-galeria" className="btn-add-gallery"><FaImages /> Seleccionar Nuevas</label>
                            <div className="mini-gallery-grid">
                                {galleryPreviews.map((src, i) => <img key={i} src={src} className="mini-preview" alt="Gallery" />)}
                            </div>
                        </div>
                    </div>

                    <div className="form-grid-hotel">
                        <div className="form-group">
                            <label>Nombre del Hotel *</label>
                            <input type="text" {...register("nombre", { required: true })} />
                        </div>
                        <div className="form-group">
                            <label>Estrellas</label>
                            <select {...register("estrellas")}>
                                {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Estrellas</option>)}
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label><FaMapMarkerAlt /> Ubicación (Clic para cambiar)</label>
                            <div className="map-wrapper-hotel">
                                <MapContainer center={position || defaultCenter} zoom={13} className="leaflet-container-hotel">
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationMarker />
                                </MapContainer>
                            </div>
                        </div>

                        <div className="form-group"><label>Latitud</label><input type="number" step="any" {...register("latitud")} /></div>
                        <div className="form-group"><label>Longitud</label><input type="number" step="any" {...register("longitud")} /></div>

                        <div className="form-group full-width">
                            <label>Dirección *</label>
                            <input type="text" {...register("direccion", { required: true })} className={isSearching ? 'input-loading' : ''} />
                        </div>

                        <div className="form-group">
                            <label>Teléfono</label>
                            <input type="tel" {...register("telefono")} />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Descripción / Servicios</label>
                        <textarea rows="3" {...register("descripcion")}></textarea>
                    </div>

                    <div className="form-actions-hotel">
                        <button type="button" className="btn-cancel-hotel" onClick={() => navigate('/admin/hoteles')}>Cancelar</button>
                        <button type="submit" className="btn-save-hotel" disabled={isSearching}>
                            <FaSave /> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarHotel;