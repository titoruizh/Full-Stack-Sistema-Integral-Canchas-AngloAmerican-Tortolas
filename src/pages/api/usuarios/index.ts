import { supabase, type Usuario, type UsuarioCompleto } from '../../../lib/supabase.js';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const searchParams = url.searchParams;
    const empresa_id = searchParams.get('empresa_id');
    const rol_id = searchParams.get('rol_id');
    const activo = searchParams.get('activo');

    let query = supabase
      .from('vista_usuarios_completa')
      .select('*');

    // Aplicar filtros si se proporcionan
    if (empresa_id) {
      query = query.eq('empresa_id', parseInt(empresa_id));
    }

    if (rol_id) {
      query = query.eq('rol_id', parseInt(rol_id));
    }

    if (activo !== null && activo !== undefined) {
      query = query.eq('activo', activo === 'true');
    }

    const { data: usuarios, error } = await query.order('empresa_nombre', { ascending: true })
      .order('rol_nombre', { ascending: true })
      .order('nombre_completo', { ascending: true });

    if (error) {
      console.error('Error al obtener usuarios:', error);
      return new Response(JSON.stringify({ 
        error: 'Error al obtener usuarios', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      usuarios: usuarios || [] 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error inesperado en API usuarios:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { nombre_completo, email, empresa_id, rol_id, activo = true } = body;

    // Validar campos requeridos
    if (!nombre_completo || !empresa_id || !rol_id) {
      return new Response(JSON.stringify({
        error: 'Campos requeridos faltantes',
        details: 'nombre_completo, empresa_id y rol_id son obligatorios'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Crear usuario con password por defecto '123'
    const nuevoUsuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'> = {
      nombre_completo,
      email: email || null,
      empresa_id: parseInt(empresa_id),
      rol_id: parseInt(rol_id),
      activo,
      password_hash: '123' // Password por defecto para desarrollo
    };

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert([nuevoUsuario])
      .select()
      .single();

    if (error) {
      console.error('Error al crear usuario:', error);
      
      // Manejar error de duplicado
      if (error.code === '23505') {
        return new Response(JSON.stringify({
          error: 'Usuario duplicado',
          details: 'Ya existe un usuario con ese nombre en la empresa'
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        error: 'Error al crear usuario',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      usuario: usuario,
      message: 'Usuario creado exitosamente'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error inesperado al crear usuario:', error);
    return new Response(JSON.stringify({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};