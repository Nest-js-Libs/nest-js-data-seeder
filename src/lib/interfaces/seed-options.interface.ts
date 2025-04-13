/**
 * Opciones para la generación de datos
 */
export interface SeedOptions {
  /**
   * Valores personalizados para sobrescribir la generación automática
   * Puede ser un valor fijo, una función que genere el valor, o un array de valores
   * para seleccionar aleatoriamente
   */
  overrides?: {
    [key: string]: any | (() => any) | any[];
  };

  /**
   * Configuración para relaciones entre entidades
   */
  relations?: {
    [key: string]: {
      /**
       * Tipo de entidad relacionada
       */
      type: any;
      /**
       * Número de entidades relacionadas a generar (para relaciones one-to-many o many-to-many)
       */
      count?: number;
      /**
       * Usar entidades existentes en lugar de crear nuevas
       */
      useExisting?: boolean;
    };
  };

  /**
   * Función para ejecutar después de generar cada entidad pero antes de guardarla
   */
  afterGenerate?: (entity: any) => void | Promise<void>;

  /**
   * Función para ejecutar después de guardar cada entidad
   */
  afterSave?: (entity: any) => void | Promise<void>;

  /**
   * Limpiar datos existentes antes de generar nuevos
   * (sobrescribe la configuración global)
   */
  cleanBeforeSeed?: boolean;
}
