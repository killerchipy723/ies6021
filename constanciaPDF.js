const fs = require('fs');
const path = require('path');
const pdf = require('pdfkit');

async function generarConstanciaPDF(idAlumno, carreraNombre, fechaInscripcion, estadoCarrera, alumnoNombre, dni) {
    // Definir la ruta en la carpeta public/pdfs
    const pdfDir = path.join(__dirname, 'public', 'pdfs');
    
    // Verificar si el directorio existe; si no, crearlo
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }
    
    const pdfPath = path.join(pdfDir, `ConstanciaInsc-N°${idAlumno}.pdf`);

    return new Promise((resolve, reject) => {
        const doc = new pdf();
        const writeStream = fs.createWriteStream(pdfPath);

        writeStream.on('finish', () => {
            console.log(`PDF generado en la ruta: ${pdfPath}`);
            resolve(pdfPath);  // Retornar la ruta para el enlace de descarga
        });

        writeStream.on('error', (error) => {
            reject(error);
        });

        doc.pipe(writeStream);

        // Definir las coordenadas y dimensiones del recuadro
        const margin = 40;
        const width = 500; // Ancho total del contenido
        const baseHeight = 200; // Alto base del contenido
        const height = baseHeight + (baseHeight / 2); // Aumentar la altura en un tercio

        // Dibujar el recuadro
        doc.rect(margin, margin, width, height).stroke(); // Dibuja el rectángulo

        // Contenido del PDF
        doc.fontSize(20).font('Helvetica-Bold').text('Constancia de Preinscripción', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`Institución: IES N° 6.021 Juan Carlos Dávalos`, { align: 'center' });
        doc.moveDown(2);

        const carreraLineHeight = 18;
        const carreraYPosition = doc.y;

        doc.fontSize(12).font('Helvetica-Bold').text(`Alumno: ${alumnoNombre}`, 60, carreraYPosition);
        doc.text(`DNI: ${dni}`, 60, carreraYPosition + carreraLineHeight);
        doc.fontSize(12).font('Helvetica-Bold').text(`Carrera:`, 60, carreraYPosition + carreraLineHeight * 2);
        
        const carreraNombreWidth = width - 60; // Ajustar el ancho del texto
        doc.fontSize(12).font('Helvetica-Bold').text(carreraNombre, 60, carreraYPosition + carreraLineHeight * 3, {
            width: carreraNombreWidth,
            align: 'left'
        });
        
        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica-Bold').text(`Fecha de Preinscripción: ${fechaInscripcion}`, 60, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text(`Estado de Preinscripción: ${estadoCarrera}`, 60, doc.y);

        doc.moveDown(2);
        doc.text('Este documento certifica que el alumno ha sido Preinscrito exitosamente.', { align: 'center', font: 'Helvetica-Oblique' });

        doc.end();
    });
}

module.exports = generarConstanciaPDF;
