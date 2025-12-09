/**
 * Cliente API Centralizado
 * Wrapper para fetch que maneja configuración, auth y errores
 */

class ApiClient {
    constructor(baseURL = '/api/v1') {
        this.baseURL = baseURL;
    }

    /**
     * Obtener headers por defecto incluyendo Auth
     */
    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...customHeaders
        };

        // Agregar token si existe (intenta cookie primero, luego storage)
        const token = window.StorageUtils?.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Manejar respuesta del servidor
     */
    async handleResponse(response) {
        // Intentar parsear JSON
        let data;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Si la respuesta no es OK, lanzar error
        if (!response.ok) {
            // Manejo especial para 401 (No autorizado)
            if (response.status === 401) {
                console.warn('Sesión expirada o inválida');
                // Disparar evento para que la UI reaccione (ej: logout)
                document.dispatchEvent(new CustomEvent('api:unauthorized'));
            }

            const error = new Error(data.message || 'Error en la petición');
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    /**
     * Método GET
     */
    async get(endpoint, params = {}) {
        const queryString = window.Helpers?.buildQueryString(params) || '';
        const url = `${this.baseURL}${endpoint}${queryString}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            throw error;
        }
    }

    /**
     * Método POST
     */
    async post(endpoint, body = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`POST ${endpoint} failed:`, error);
            throw error;
        }
    }

    /**
     * Método PUT
     */
    async put(endpoint, body = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`PUT ${endpoint} failed:`, error);
            throw error;
        }
    }

    /**
     * Método PATCH
     */
    async patch(endpoint, body = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`PATCH ${endpoint} failed:`, error);
            throw error;
        }
    }

    /**
     * Método DELETE
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`DELETE ${endpoint} failed:`, error);
            throw error;
        }
    }

    /**
     * Subir archivos (Multipart)
     */
    async upload(endpoint, formData) {
        try {
            // No seteamos Content-Type para que el navegador ponga el boundary automágicamente
            const headers = this.getHeaders();
            delete headers['Content-Type'];

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error(`UPLOAD ${endpoint} failed:`, error);
            throw error;
        }
    }
}

// Inicializar y exportar instancia global
if (typeof window !== 'undefined') {
    // Usar URL base desde config o default
    const baseURL = window.CONFIG?.API_BASE_URL || '/api/v1';
    window.API = new ApiClient(baseURL);
}
