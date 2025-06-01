function ZoomModal({ imageUrl, onClose }) {
    return (
        <div
        onClick={onClose} // clic fuera de la imagen = cerrar
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // <- fondo oscuro semitransparente
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}
        >
        <img
            src={imageUrl}
            alt="vista ampliada"
            onClick={(e) => e.stopPropagation()} // clic en la imagen no cierra
            style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            cursor: "default",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)", // opcional para contraste
            }}
            draggable={false}
        />
        </div>
  );
}

export default ZoomModal;
