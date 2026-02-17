/** Localization strings – ES-MX */
export const t = {
  // General
  app_name: 'Dealer Admin',
  save: 'Guardar',
  cancel: 'Cancelar',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
  search: 'Buscar...',
  filter: 'Filtrar',
  loading: 'Cargando...',
  no_results: 'Sin resultados',
  confirm_delete: '¿Estás seguro de que deseas eliminar este registro?',
  actions: 'Acciones',
  back: 'Volver',
  export: 'Exportar',
  all: 'Todos',

  // Auth
  login: 'Iniciar sesión',
  logout: 'Cerrar sesión',
  email: 'Correo electrónico',
  password: 'Contraseña',
  login_title: 'Iniciar sesión',
  login_subtitle: 'Ingresa tus credenciales para acceder al sistema',
  login_magic_link: 'Enviar enlace mágico',
  login_credentials: 'Iniciar con contraseña',

  // Nav
  nav_dashboard: 'Dashboard',
  nav_inventory: 'Inventario',
  nav_leads: 'Leads',
  nav_deals: 'Ventas',
  nav_suppliers: 'Proveedores',
  nav_expenses: 'Gastos',
  nav_invoices: 'Facturas',
  nav_locations: 'Ubicaciones',
  nav_users: 'Usuarios',
  nav_reports: 'Reportes',
  nav_audit: 'Auditoría',

  // Vehicles
  vehicle: 'Vehículo',
  vehicles: 'Vehículos',
  vin: 'VIN',
  stock_number: 'No. Stock',
  make: 'Marca',
  model: 'Modelo',
  year: 'Año',
  trim: 'Versión',
  color: 'Color',
  mileage: 'Kilometraje',
  price_list: 'Precio Lista',
  price_sale: 'Precio Venta',
  status: 'Estado',
  location: 'Ubicación',

  // Vehicle statuses
  status_available: 'Disponible',
  status_reserved: 'Reservado',
  status_sold: 'Vendido',
  status_in_transit: 'En tránsito',
  status_reconditioning: 'Reacondicionamiento',

  // Leads
  lead: 'Lead',
  leads: 'Leads',
  lead_name: 'Nombre',
  lead_phone: 'Teléfono',
  lead_source: 'Fuente',
  lead_assigned: 'Asignado a',
  lead_notes: 'Notas',
  source_whatsapp: 'WhatsApp',
  source_web: 'Web',
  source_fb: 'Facebook',
  source_ig: 'Instagram',
  source_other: 'Otro',
  lead_status_new: 'Nuevo',
  lead_status_contacted: 'Contactado',
  lead_status_qualified: 'Calificado',
  lead_status_lost: 'Perdido',
  lead_status_won: 'Ganado',

  // Deals
  deal: 'Venta',
  deals: 'Ventas',
  sale_price: 'Precio de venta',
  payment_type: 'Tipo de pago',
  payment_cash: 'Contado',
  payment_finance: 'Financiamiento',
  deal_status_open: 'Abierto',
  deal_status_won: 'Cerrado (Ganado)',
  deal_status_lost: 'Cerrado (Perdido)',
  closing_date: 'Fecha de cierre',
  documents: 'Documentos',

  // Expenses
  expense: 'Gasto',
  expenses: 'Gastos',
  amount: 'Monto',
  date: 'Fecha',
  category: 'Categoría',
  description: 'Descripción',
  supplier: 'Proveedor',
  suppliers: 'Proveedores',

  // Users
  user: 'Usuario',
  users: 'Usuarios',
  role: 'Rol',
  name: 'Nombre',
  active: 'Activo',

  // Dashboard
  dashboard: 'Dashboard',
  kpi_available_vehicles: 'Vehículos disponibles',
  kpi_new_leads_week: 'Leads nuevos (semana)',
  kpi_conversion_rate: 'Tasa de conversión',
  kpi_total_sales: 'Ventas totales',
  kpi_total_expenses: 'Gastos totales',
  kpi_avg_days_to_sell: 'Días promedio para vender',
} as const;

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: t.status_available,
  RESERVED: t.status_reserved,
  SOLD: t.status_sold,
  IN_TRANSIT: t.status_in_transit,
  RECONDITIONING: t.status_reconditioning,
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  WHATSAPP: t.source_whatsapp,
  WEB: t.source_web,
  FB: t.source_fb,
  IG: t.source_ig,
  OTHER: t.source_other,
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: t.lead_status_new,
  CONTACTED: t.lead_status_contacted,
  QUALIFIED: t.lead_status_qualified,
  LOST: t.lead_status_lost,
  WON: t.lead_status_won,
};

export const DEAL_STATUS_LABELS: Record<string, string> = {
  OPEN: t.deal_status_open,
  CLOSED_WON: t.deal_status_won,
  CLOSED_LOST: t.deal_status_lost,
};

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  CASH: t.payment_cash,
  FINANCE: t.payment_finance,
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  VEHICLE_PURCHASE: 'Compra de vehículo',
  REPAIR: 'Reparación',
  TRANSPORT: 'Transporte',
  MARKETING: 'Marketing',
  RENT: 'Renta',
  UTILITIES: 'Servicios',
  PAYROLL: 'Nómina',
  INSURANCE: 'Seguro',
  OTHER: 'Otro',
};

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  SALES: 'Ventas',
  FINANCE: 'Finanzas',
  SUPPORT: 'Soporte',
  VIEWER: 'Visor',
};

export const VEHICLE_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  SOLD: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-purple-100 text-purple-800',
  RECONDITIONING: 'bg-orange-100 text-orange-800',
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
  WON: 'bg-emerald-100 text-emerald-800',
};

export const DEAL_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  CLOSED_WON: 'bg-green-100 text-green-800',
  CLOSED_LOST: 'bg-red-100 text-red-800',
};
