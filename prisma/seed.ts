import { PrismaClient, Role, VehicleStatus, LeadSource, LeadStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const LOCATIONS = [
  { name: 'Centro Monterrey', city: 'Monterrey', state: 'NL', address: 'Av. Constitución 1500' },
  { name: 'San Pedro', city: 'San Pedro Garza García', state: 'NL', address: 'Av. Vasconcelos 300' },
  { name: 'Cumbres', city: 'Monterrey', state: 'NL', address: 'Av. Lincoln 2000' },
  { name: 'Guadalupe', city: 'Guadalupe', state: 'NL', address: 'Av. Eloy Cavazos 800' },
  { name: 'Escobedo', city: 'General Escobedo', state: 'NL', address: 'Av. Sendero 450' },
  { name: 'Apodaca', city: 'Apodaca', state: 'NL', address: 'Av. Miguel Alemán 1200' },
  { name: 'Santa Catarina', city: 'Santa Catarina', state: 'NL', address: 'Av. Industriales 600' },
  { name: 'Saltillo Centro', city: 'Saltillo', state: 'COAH', address: 'Blvd. Venustiano Carranza 3000' },
  { name: 'Saltillo Sur', city: 'Saltillo', state: 'COAH', address: 'Blvd. Nazario Ortiz 1500' },
  { name: 'Torreón', city: 'Torreón', state: 'COAH', address: 'Blvd. Independencia 2500' },
  { name: 'Reynosa', city: 'Reynosa', state: 'TAMPS', address: 'Blvd. Hidalgo 1000' },
  { name: 'Tampico', city: 'Tampico', state: 'TAMPS', address: 'Av. Hidalgo 800' },
  { name: 'Querétaro', city: 'Querétaro', state: 'QRO', address: 'Blvd. Bernardo Quintana 500' },
  { name: 'León', city: 'León', state: 'GTO', address: 'Blvd. Adolfo López Mateos 2200' },
];

const MAKES_MODELS: [string, string[]][] = [
  ['Toyota', ['Camry', 'Corolla', 'RAV4', 'Hilux', 'Tacoma']],
  ['Honda', ['Civic', 'CR-V', 'Accord', 'HR-V']],
  ['Nissan', ['Sentra', 'Versa', 'Kicks', 'Frontier', 'Pathfinder']],
  ['Chevrolet', ['Aveo', 'Onix', 'Tracker', 'Silverado', 'Blazer']],
  ['Volkswagen', ['Jetta', 'Tiguan', 'Taos', 'Golf']],
  ['Ford', ['Ranger', 'Bronco Sport', 'Explorer', 'Maverick']],
  ['Mazda', ['3', 'CX-5', 'CX-30', 'CX-50']],
  ['Kia', ['Forte', 'Sportage', 'Seltos', 'Rio']],
  ['Hyundai', ['Tucson', 'Creta', 'Elantra', 'Santa Fe']],
];

const COLORS = [
  'Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul',
  'Café', 'Verde', 'Naranja', 'Beige',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateVin(): string {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) vin += chars[Math.floor(Math.random() * chars.length)];
  return vin;
}

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.leadNote.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.userLocation.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();

  // Create locations
  const locations = await Promise.all(
    LOCATIONS.map((loc) =>
      prisma.location.create({
        data: {
          name: loc.name,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          phone: `+52 81 ${randomInt(1000, 9999)} ${randomInt(1000, 9999)}`,
        },
      }),
    ),
  );
  console.log(`Created ${locations.length} locations`);

  // Create SUPER_ADMIN user
  const passwordHash = await hash('Admin123!', 12);
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@dealer.com',
      hashedPassword: passwordHash,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
      locations: {
        create: locations.map((l) => ({ locationId: l.id })),
      },
    },
  });
  console.log(`Created SUPER_ADMIN: ${superAdmin.email}`);

  // Create other users
  const userDefs: { name: string; email: string; role: Role; locationIdxs: number[] }[] = [
    { name: 'Carlos Manager', email: 'carlos@dealer.com', role: Role.MANAGER, locationIdxs: [0, 1, 2] },
    { name: 'Ana Ventas', email: 'ana@dealer.com', role: Role.SALES, locationIdxs: [0] },
    { name: 'Luis Ventas', email: 'luis@dealer.com', role: Role.SALES, locationIdxs: [0, 1] },
    { name: 'María Finanzas', email: 'maria@dealer.com', role: Role.FINANCE, locationIdxs: [0, 1, 2, 3] },
    { name: 'Pedro Soporte', email: 'pedro@dealer.com', role: Role.SUPPORT, locationIdxs: [0] },
    { name: 'Laura Admin', email: 'laura@dealer.com', role: Role.ADMIN, locationIdxs: [0, 1, 2, 3, 4, 5, 6] },
    { name: 'Roberto Manager', email: 'roberto@dealer.com', role: Role.MANAGER, locationIdxs: [7, 8, 9] },
    { name: 'Sofía Ventas', email: 'sofia@dealer.com', role: Role.SALES, locationIdxs: [7, 8] },
  ];

  const users = [superAdmin];
  for (const def of userDefs) {
    const user = await prisma.user.create({
      data: {
        name: def.name,
        email: def.email,
        hashedPassword: passwordHash,
        role: def.role,
        emailVerified: new Date(),
        locations: {
          create: def.locationIdxs.map((i) => ({ locationId: locations[i].id })),
        },
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} users total`);

  // Create suppliers
  const supplierDefs = [
    { name: 'AutoSubasta MX', contact: 'Jorge Ramírez', phone: '+52 81 1234 5678' },
    { name: 'Transportes del Norte', contact: 'Miguel Ángel', phone: '+52 81 2345 6789' },
    { name: 'Refaccionaria Express', contact: 'Ricardo Garza', phone: '+52 81 3456 7890' },
    { name: 'Seguros GNP', contact: 'Daniela López', phone: '+52 81 4567 8901' },
    { name: 'Marketing Digital Pro', contact: 'Fernanda Torres', phone: '+52 81 5678 9012' },
  ];
  const suppliers = await Promise.all(
    supplierDefs.map((s) =>
      prisma.supplier.create({ data: { name: s.name, contact: s.contact, phone: s.phone } }),
    ),
  );
  console.log(`Created ${suppliers.length} suppliers`);

  // Create vehicles
  const vehicles = [];
  let stockNum = 1000;
  for (let i = 0; i < 80; i++) {
    const [make, models] = randomFrom(MAKES_MODELS);
    const model = randomFrom(models);
    const year = randomInt(2018, 2025);
    const priceList = randomInt(180000, 850000);
    const statuses: VehicleStatus[] = [
      'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
      'RESERVED', 'SOLD', 'IN_TRANSIT', 'RECONDITIONING',
    ];
    const status = randomFrom(statuses);
    const v = await prisma.vehicle.create({
      data: {
        vin: generateVin(),
        stockNumber: `STK-${++stockNum}`,
        make,
        model,
        year,
        trim: randomFrom(['Base', 'Mid', 'Top', 'Limited', 'Sport']),
        color: randomFrom(COLORS),
        mileage: randomInt(0, 120000),
        priceList,
        priceSale: status === 'SOLD' ? priceList * (0.88 + Math.random() * 0.1) : null,
        status,
        locationId: randomFrom(locations).id,
      },
    });
    vehicles.push(v);
  }
  console.log(`Created ${vehicles.length} vehicles`);

  // Create leads
  const salesUsers = users.filter((u) => ['SALES', 'MANAGER'].includes(u.role));
  const firstNames = ['Juan', 'Andrea', 'Marcos', 'Daniela', 'Fernando', 'Gabriela', 'Héctor', 'Irene', 'José', 'Karen', 'Miguel', 'Natalia', 'Óscar', 'Patricia', 'Raúl', 'Sandra'];
  const lastNames = ['García', 'López', 'Martínez', 'González', 'Rodríguez', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres'];
  const leads = [];
  for (let i = 0; i < 50; i++) {
    const name = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
    const loc = randomFrom(locations);
    const sources: LeadSource[] = ['WHATSAPP', 'WEB', 'FB', 'IG', 'OTHER'];
    const leadStatuses: LeadStatus[] = ['NEW', 'NEW', 'CONTACTED', 'CONTACTED', 'QUALIFIED', 'LOST', 'WON'];
    const lead = await prisma.lead.create({
      data: {
        name,
        phone: `+52 81 ${randomInt(1000, 9999)} ${randomInt(1000, 9999)}`,
        email: `${name.toLowerCase().replace(/\s/g, '.').replace(/[áéíóú]/g, 'a')}@gmail.com`,
        source: randomFrom(sources),
        status: randomFrom(leadStatuses),
        assignedToId: Math.random() > 0.2 ? randomFrom(salesUsers).id : null,
        vehicleId: Math.random() > 0.4 ? randomFrom(vehicles).id : null,
        locationId: loc.id,
        notes: {
          create: [
            { content: 'Primer contacto realizado.' },
            ...(Math.random() > 0.5 ? [{ content: 'Seguimiento programado para la siguiente semana.' }] : []),
          ],
        },
      },
    });
    leads.push(lead);
  }
  console.log(`Created ${leads.length} leads`);

  // Create deals from WON leads
  const wonLeads = await prisma.lead.findMany({ where: { status: 'WON' } });
  const soldVehicles = vehicles.filter((v) => v.status === 'SOLD');
  let dealCount = 0;
  for (const lead of wonLeads.slice(0, Math.min(wonLeads.length, soldVehicles.length))) {
    const vehicle = soldVehicles[dealCount];
    if (!vehicle) break;
    await prisma.deal.create({
      data: {
        leadId: lead.id,
        vehicleId: vehicle.id,
        locationId: lead.locationId,
        salesUserId: lead.assignedToId || randomFrom(salesUsers).id,
        salePrice: vehicle.priceSale || vehicle.priceList * 0.92,
        paymentType: Math.random() > 0.4 ? 'FINANCE' : 'CASH',
        status: 'CLOSED_WON',
        closingDate: new Date(Date.now() - randomInt(1, 90) * 86400000),
        documents: JSON.stringify([
          { title: 'INE / Identificación', completed: true },
          { title: 'Comprobante de domicilio', completed: true },
          { title: 'Contrato de compraventa', completed: true },
          { title: 'Factura', completed: Math.random() > 0.3 },
        ]),
      },
    });
    dealCount++;
  }
  console.log(`Created ${dealCount} deals`);

  // Create expenses
  const categories = [
    'VEHICLE_PURCHASE', 'REPAIR', 'TRANSPORT', 'MARKETING',
    'RENT', 'UTILITIES', 'PAYROLL', 'INSURANCE', 'OTHER',
  ] as const;
  for (let i = 0; i < 40; i++) {
    const cat = randomFrom([...categories]);
    await prisma.expense.create({
      data: {
        supplierId: Math.random() > 0.3 ? randomFrom(suppliers).id : null,
        category: cat,
        description: `Gasto: ${cat.toLowerCase().replace('_', ' ')} #${i + 1}`,
        amount: randomInt(500, 250000),
        date: new Date(Date.now() - randomInt(0, 180) * 86400000),
        locationId: randomFrom(locations).id,
      },
    });
  }
  console.log('Created 40 expenses');

  // Create audit log entries
  await prisma.auditLog.createMany({
    data: [
      {
        userId: superAdmin.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: superAdmin.id,
      },
      {
        userId: superAdmin.id,
        action: 'CREATE',
        entity: 'Vehicle',
        entityId: vehicles[0]?.id,
        after: { stockNumber: vehicles[0]?.stockNumber },
      },
    ],
  });
  console.log('Created audit log entries');

  console.log('\nSeed complete!');
  console.log('Login credentials:');
  console.log('  Email: admin@dealer.com');
  console.log('  Password: Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
