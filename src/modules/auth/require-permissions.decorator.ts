
//este archivo, una vez armado, prácticamente no lo vuelves a tocar. 
// Es infraestructura reutilizable, no lógica de negocio.

import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
    action: string;
    subject: string;
}

export const RequirePermissions = (...permissions: RequiredPermission[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);


//Analogía simple
// Piénsalo como el molde de una galleta — armas el molde una sola vez, 
// y lo reutilizas para hacer galletas de chocolate, de vainilla, de avena 
// (categorías, productos, órdenes...) sin tener que rehacer el molde cada vez. 
// 
// El molde (RequirePermissions) es fijo; lo que metes dentro ({ action: '...', subject: '...' }) 
// cambia según lo que estés horneando.