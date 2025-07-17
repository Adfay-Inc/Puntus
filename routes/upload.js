const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Configuración de multer para manejo de archivos
const storage = multer.memoryStorage(); // Almacenar en memoria para procesar con Sharp

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024, // 1MB máximo
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// @route   POST /api/upload/logo
// @desc    Subir logo de equipo
// @access  Public
router.post('/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No se subió ningún archivo' });
    }

    // Generar nombre único para el archivo
    const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const filePath = path.join(__dirname, '../public/uploads/logos', fileName);

    // Procesar imagen con Sharp
    const imageBuffer = await sharp(req.file.buffer)
      .resize(512, 512, {
        fit: 'cover',
        position: 'center'
      })
      .png({
        quality: 90,
        compressionLevel: 6
      })
      .toBuffer();

    // Verificar que la imagen procesada no exceda 1MB
    if (imageBuffer.length > 1024 * 1024) {
      return res.status(400).json({ 
        msg: 'La imagen es demasiado grande. Debe ser menor a 1MB después del procesamiento.' 
      });
    }

    // Guardar archivo procesado
    await fs.writeFile(filePath, imageBuffer);

    // Retornar URL del archivo
    const logoUrl = `/uploads/logos/${fileName}`;
    
    console.log('Logo subido exitosamente:', logoUrl);
    
    res.json({
      msg: 'Logo subido exitosamente',
      logoUrl: logoUrl,
      fileName: fileName,
      size: imageBuffer.length
    });

  } catch (error) {
    console.error('Error al subir logo:', error);
    
    if (error.message === 'Solo se permiten archivos de imagen') {
      return res.status(400).json({ msg: error.message });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'El archivo es demasiado grande. Máximo 1MB.' });
    }
    
    res.status(500).json({ msg: 'Error al procesar la imagen' });
  }
});

// @route   DELETE /api/upload/logo/:fileName
// @desc    Eliminar logo
// @access  Public
router.delete('/logo/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '../public/uploads/logos', fileName);
    
    // Verificar que el archivo existe
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ msg: 'Archivo no encontrado' });
    }
    
    // Eliminar archivo
    await fs.unlink(filePath);
    
    res.json({ msg: 'Logo eliminado exitosamente' });
    
  } catch (error) {
    console.error('Error al eliminar logo:', error);
    res.status(500).json({ msg: 'Error al eliminar el archivo' });
  }
});

// @route   GET /api/upload/validate-image
// @desc    Validar imagen antes de subir (opcional)
// @access  Public
router.post('/validate-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No se subió ningún archivo' });
    }

    // Obtener metadatos de la imagen
    const metadata = await sharp(req.file.buffer).metadata();
    
    res.json({
      valid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: req.file.size
      },
      msg: 'Imagen válida'
    });

  } catch (error) {
    console.error('Error al validar imagen:', error);
    res.status(400).json({ 
      valid: false,
      msg: 'Archivo de imagen inválido' 
    });
  }
});

module.exports = router;