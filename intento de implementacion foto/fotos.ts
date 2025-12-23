// =====================================================
// API ENDPOINT: Subir Fotos de Validación
// POST /api/validaciones/[id]/fotos
// =====================================================
// Permite subir hasta 5 fotos para una validación específica
// Fecha: 2025-12-22
// =====================================================

import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const validacionId = parseInt(params.id!);
    
    if (isNaN(validacionId)) {
      return new Response(JSON.stringify({ error: 'ID de validación inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener FormData con las fotos
    const formData = await request.formData();
    const fotos = formData.getAll('fotos') as File[];
    
    if (!fotos || fotos.length === 0) {
      return new Response(JSON.stringify({ error: 'No se enviaron fotos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📸 Recibidas ${fotos.length} fotos para validación ${validacionId}`);

    // Validar número máximo de fotos
    if (fotos.length > 5) {
      return new Response(JSON.stringify({ 
        error: 'Máximo 5 fotos permitidas',
        recibidas: fotos.length 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener información de la validación
    const { data: validacion, error: validacionError } = await supabase
      .from('validaciones')
      .select('cancha_id, empresa_validadora_id')
      .eq('id', validacionId)
      .single();

    if (validacionError || !validacion) {
      console.error('❌ Error obteniendo validación:', validacionError);
      return new Response(JSON.stringify({ 
        error: 'Validación no encontrada',
        validacion_id: validacionId 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Validación encontrada:', validacion);

    // Obtener nombre de empresa
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('nombre')
      .eq('id', validacion.empresa_validadora_id)
      .single();

    if (empresaError || !empresa) {
      console.error('❌ Error obteniendo empresa:', empresaError);
      return new Response(JSON.stringify({ error: 'Empresa no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const empresaNombre = empresa.nombre.toLowerCase();
    console.log(`🏢 Empresa: ${empresaNombre}`);

    const fotosSubidas = [];
    const errores = [];

    // Subir cada foto
    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i];
      
      console.log(`📤 Procesando foto ${i + 1}/${fotos.length}: ${foto.name} (${foto.size} bytes)`);

      // Validar tamaño (5MB máximo)
      if (foto.size > 5 * 1024 * 1024) {
        console.warn(`⚠️ Foto ${i + 1} excede 5MB (${foto.size} bytes), omitiendo...`);
        errores.push({
          foto: foto.name,
          error: 'Excede 5MB',
          tamano: foto.size
        });
        continue;
      }

      // Validar tipo MIME
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!tiposPermitidos.includes(foto.type)) {
        console.warn(`⚠️ Foto ${i + 1} tipo no permitido: ${foto.type}`);
        errores.push({
          foto: foto.name,
          error: 'Tipo de archivo no permitido',
          tipo: foto.type
        });
        continue;
      }

      // Generar nombre único con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
      const extension = foto.name.split('.').pop()?.toLowerCase() || 'jpg';
      const nombreArchivo = `foto-${i + 1}-${timestamp}.${extension}`;
      
      // Ruta en Storage: empresa/cancha-X/validacion-Y/foto-Z.ext
      const storagePath = `${empresaNombre}/cancha-${validacion.cancha_id}/validacion-${validacionId}/${nombreArchivo}`;

      console.log(`📁 Ruta de almacenamiento: ${storagePath}`);

      // Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('validaciones-fotos')
        .upload(storagePath, foto, {
          contentType: foto.type,
          upsert: false
        });

      if (uploadError) {
        console.error(`❌ Error subiendo foto ${i + 1}:`, uploadError);
        errores.push({
          foto: foto.name,
          error: uploadError.message
        });
        continue;
      }

      console.log(`✅ Foto ${i + 1} subida a Storage`);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('validaciones-fotos')
        .getPublicUrl(storagePath);

      console.log(`🔗 URL pública: ${urlData.publicUrl}`);

      // Insertar registro en BD
      const { data: fotoData, error: fotoError } = await supabase
        .from('validaciones_fotos')
        .insert({
          validacion_id: validacionId,
          storage_path: storagePath,
          storage_url: urlData.publicUrl,
          nombre_archivo: foto.name,
          tipo_mime: foto.type,
          tamano_bytes: foto.size,
          orden: i + 1,
          empresa_id: validacion.empresa_validadora_id,
          cancha_id: validacion.cancha_id
        })
        .select()
        .single();

      if (fotoError) {
        console.error(`❌ Error insertando registro de foto ${i + 1}:`, fotoError);
        errores.push({
          foto: foto.name,
          error: fotoError.message
        });
        continue;
      }

      console.log(`✅ Registro de foto ${i + 1} insertado en BD`);
      fotosSubidas.push(fotoData);
    }

    console.log(`✅ Proceso completado: ${fotosSubidas.length} fotos subidas, ${errores.length} errores`);

    return new Response(JSON.stringify({
      message: `${fotosSubidas.length} foto(s) subida(s) exitosamente`,
      fotos: fotosSubidas,
      errores: errores.length > 0 ? errores : undefined,
      total_procesadas: fotos.length,
      total_exitosas: fotosSubidas.length,
      total_errores: errores.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error inesperado en POST /api/validaciones/[id]/fotos:', error);
    return new Response(JSON.stringify({
      error: 'Error interno del servidor',
      detalles: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// =====================================================
// GET: Obtener fotos de una validación
// =====================================================

export const GET: APIRoute = async ({ params }) => {
  try {
    const validacionId = parseInt(params.id!);

    if (isNaN(validacionId)) {
      return new Response(JSON.stringify({ error: 'ID de validación inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 Obteniendo fotos de validación ${validacionId}`);

    const { data: fotos, error } = await supabase
      .from('validaciones_fotos')
      .select('*')
      .eq('validacion_id', validacionId)
      .order('orden', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo fotos:', error);
      return new Response(JSON.stringify({ 
        error: 'Error al obtener fotos',
        detalles: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ ${fotos?.length || 0} fotos encontradas`);

    return new Response(JSON.stringify({
      validacion_id: validacionId,
      total_fotos: fotos?.length || 0,
      fotos: fotos || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error inesperado en GET /api/validaciones/[id]/fotos:', error);
    return new Response(JSON.stringify({
      error: 'Error interno del servidor',
      detalles: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
