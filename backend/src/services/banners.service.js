const BannerModel = require('../models/banner.model');

class BannersService {
  /**
   * Obtener todos los banners
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Resultado con banners y metadata
   */
  async getBanners(filters = {}) {
    try {
      const banners = await BannerModel.findAll(filters);
      
      return {
        success: true,
        data: banners,
        count: banners.length
      };
    } catch (error) {
      console.error('Error en getBanners:', error);
      throw error;
    }
  }

  /**
   * Obtener un banner por ID
   * @param {number} id - ID del banner
   * @returns {Promise<Object>} Resultado con el banner
   */
  async getBannerById(id) {
    try {
      const banner = await BannerModel.findById(id);

      if (!banner) {
        return {
          success: false,
          message: 'Banner no encontrado'
        };
      }

      return {
        success: true,
        data: banner
      };
    } catch (error) {
      console.error('Error en getBannerById:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo banner
   * @param {Object} bannerData - Datos del banner
   * @returns {Promise<Object>} Resultado con el banner creado
   */
  async createBanner(bannerData) {
    try {
      // Validaciones básicas
      if (!bannerData.titulo || !bannerData.imagen_url) {
        return {
          success: false,
          message: 'Título e imagen son requeridos'
        };
      }

      const banner = await BannerModel.create(bannerData);

      return {
        success: true,
        data: banner,
        message: 'Banner creado exitosamente'
      };
    } catch (error) {
      console.error('Error en createBanner:', error);
      throw error;
    }
  }

  /**
   * Actualizar un banner
   * @param {number} id - ID del banner
   * @param {Object} bannerData - Datos a actualizar
   * @returns {Promise<Object>} Resultado con el banner actualizado
   */
  async updateBanner(id, bannerData) {
    try {
      // Verificar que el banner existe
      const existingBanner = await BannerModel.findById(id);
      if (!existingBanner) {
        return {
          success: false,
          message: 'Banner no encontrado'
        };
      }

      const banner = await BannerModel.update(id, bannerData);

      return {
        success: true,
        data: banner,
        message: 'Banner actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error en updateBanner:', error);
      throw error;
    }
  }

  /**
   * Eliminar un banner
   * @param {number} id - ID del banner
   * @param {boolean} permanent - Si es true, elimina permanentemente
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteBanner(id, permanent = false) {
    try {
      // Verificar que el banner existe
      const existingBanner = await BannerModel.findById(id);
      if (!existingBanner) {
        return {
          success: false,
          message: 'Banner no encontrado'
        };
      }

      if (permanent) {
        await BannerModel.deletePermanent(id);
        return {
          success: true,
          message: 'Banner eliminado permanentemente'
        };
      } else {
        await BannerModel.delete(id);
        return {
          success: true,
          message: 'Banner desactivado exitosamente'
        };
      }
    } catch (error) {
      console.error('Error en deleteBanner:', error);
      throw error;
    }
  }

  /**
   * Obtener banners activos por posición
   * @param {string} posicion - Posición del banner
   * @returns {Promise<Object>} Resultado con banners activos
   */
  async getActiveBannersByPosition(posicion) {
    try {
      const banners = await BannerModel.findActiveByPosition(posicion);

      return {
        success: true,
        data: banners,
        count: banners.length
      };
    } catch (error) {
      console.error('Error en getActiveBannersByPosition:', error);
      throw error;
    }
  }
}

module.exports = new BannersService();
