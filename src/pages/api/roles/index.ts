import { supabase, type Rol } from '../../../lib/supabase.js';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const searchParams = url.searchParams;
    const empresa_id = searchParams.get('empresa_id');

    let query = supabase
      .from('roles')
      .select(`
        *,
        empresa:empresas(
          id,
          nombre
        )
      `);

    // Filtrar por empresa si se especifica
    if (empresa_id) {
      query = query.eq('empresa_id', parseInt(empresa_id));
    }

    const { data: roles, error } = await query.order('empresa_id', { ascending: true })
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al obtener roles:', error);
      return new Response(JSON.stringify({ 
        error: 'Error al obtener roles', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      roles: roles || [] 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error inesperado en API roles:', error);
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
    const { nombre, empresa_id, descripcion } = body;

    // Validar campos requeridos
    if (!nombre || !empresa_id) {
      return new Response(JSON.stringify({
        error: 'Campos requeridos faltantes',
        details: 'nombre y empresa_id son obligatorios'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const nuevoRol: Omit<Rol, 'id' | 'created_at'> = {
      nombre,
      empresa_id: parseInt(empresa_id),
      descripcion: descripcion || null
    };

    const { data: rol, error } = await supabase
      .from('roles')
      .insert([nuevoRol])
      .select(`
        *,
        empresa:empresas(
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('Error al crear rol:', error);
      
      // Manejar error de duplicado
      if (error.code === '23505') {
        return new Response(JSON.stringify({
          error: 'Rol duplicado',
          details: 'Ya existe un rol con ese nombre en la empresa'
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        error: 'Error al crear rol',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      rol: rol,
      message: 'Rol creado exitosamente'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error inesperado al crear rol:', error);
    return new Response(JSON.stringify({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};