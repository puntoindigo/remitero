export type ActivityAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_REMITO'
  | 'UPDATE_REMITO'
  | 'DELETE_REMITO'
  | 'CREATE_CLIENT'
  | 'UPDATE_CLIENT'
  | 'DELETE_CLIENT'
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'CREATE_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'DELETE_CATEGORY'
  | 'CREATE_ESTADO_REMITO'
  | 'UPDATE_ESTADO_REMITO'
  | 'DELETE_ESTADO_REMITO'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'ACTIVATE_USER'
  | 'DEACTIVATE_USER'
  | 'RESEND_INVITATION'
  | 'UPDATE_PROFILE'
  | 'VIEW_REPORT'
  | 'EXPORT_DATA'
  | 'OTHER';

export interface ActivityLogMetadata {
  [key: string]: any;
  remitoId?: string;
  remitoNumber?: number;
  clientId?: string;
  productId?: string;
  categoryId?: string;
  estadoId?: string;
  userId?: string;
  targetUserId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: ActivityAction;
  description: string | null;
  metadata: ActivityLogMetadata | null;
  created_at: string;
}

/**
 * Obtiene el texto descriptivo de una acción
 */
export function getActionDescription(action: ActivityAction, metadata?: ActivityLogMetadata): string {
  switch (action) {
    case 'LOGIN':
      return 'Inició sesión';
    case 'LOGOUT':
      return 'Cerró sesión';
    case 'CREATE_REMITO':
      return metadata?.remitoNumber 
        ? `Creó remito #${metadata.remitoNumber}`
        : 'Creó un remito';
    case 'UPDATE_REMITO':
      return metadata?.remitoNumber 
        ? `Actualizó remito #${metadata.remitoNumber}`
        : 'Actualizó un remito';
    case 'DELETE_REMITO':
      return metadata?.remitoNumber 
        ? `Eliminó remito #${metadata.remitoNumber}`
        : 'Eliminó un remito';
    case 'CREATE_CLIENT':
      return 'Creó un cliente';
    case 'UPDATE_CLIENT':
      return 'Actualizó un cliente';
    case 'DELETE_CLIENT':
      return 'Eliminó un cliente';
    case 'CREATE_PRODUCT':
      return 'Creó un producto';
    case 'UPDATE_PRODUCT':
      return 'Actualizó un producto';
    case 'DELETE_PRODUCT':
      return 'Eliminó un producto';
    case 'CREATE_CATEGORY':
      return 'Creó una categoría';
    case 'UPDATE_CATEGORY':
      return 'Actualizó una categoría';
    case 'DELETE_CATEGORY':
      return 'Eliminó una categoría';
    case 'CREATE_ESTADO_REMITO':
      return 'Creó un estado de remito';
    case 'UPDATE_ESTADO_REMITO':
      return 'Actualizó un estado de remito';
    case 'DELETE_ESTADO_REMITO':
      return 'Eliminó un estado de remito';
    case 'CREATE_USER':
      return 'Creó un usuario';
    case 'UPDATE_USER':
      return 'Actualizó un usuario';
    case 'DELETE_USER':
      return 'Eliminó un usuario';
    case 'ACTIVATE_USER':
      return 'Activó un usuario';
    case 'DEACTIVATE_USER':
      return 'Desactivó un usuario';
    case 'RESEND_INVITATION':
      return 'Reenvió invitación';
    case 'UPDATE_PROFILE':
      return 'Actualizó su perfil';
    case 'VIEW_REPORT':
      return 'Vió un reporte';
    case 'EXPORT_DATA':
      return 'Exportó datos';
    default:
      return 'Realizó una acción';
  }
}

