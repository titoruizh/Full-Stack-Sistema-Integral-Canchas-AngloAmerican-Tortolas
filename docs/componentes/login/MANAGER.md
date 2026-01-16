# Lógica de Negocio: LoginManager

Ubicación: `src/components/login/LoginManager.ts`

La clase `LoginManager` centraliza toda la lógica del frontend.

## Responsabilidades

### 1. Gestión del DOM
Mantiene referencias tipadas a todos los elementos HTML críticos.
```typescript
private usuarioSelect: HTMLSelectElement | null;
private loginBtn: HTMLButtonElement | null;
// ...
```
Esto asegura que TypeScript nos avise si intentamos acceder a propiedades inexistentes.

### 2. Comunicación con API
Métodos asíncronos para interactuar con el backend:
- `cargarEmpresas()`: GET `/api/empresas`. Renderiza el grid.
- `loadUsuarios(empresaId)`: GET `/api/usuarios`. Puebla el select.
- `onLogin(event)`: POST `/api/auth/login`. Valida credenciales.

### 3. Gestión de Estado Visual
- `setLoading(boolean)`: Bloquea/Desbloquea botones y muestra spinner.
- `showMessage(msg, type)`: Renderiza alertas de error (rojo) o éxito (verde).
- `showCompaniesView()`: Resetea el formulario y vuelve a la vista 1.

### 4. Sistema de Partículas
Inicializa la clase `ParticleNetwork` (importada localmente) si detecta el canvas.

## Interfaces Clave

```typescript
interface Empresa {
    id: number;
    nombre: string;
}

interface Usuario {
    id: number;
    nombre_completo: string;
    rol_nombre: string;
}
```
