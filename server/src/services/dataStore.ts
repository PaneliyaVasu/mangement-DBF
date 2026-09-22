import bcrypt from 'bcryptjs';
import {
  User,
  Center,
  Location,
  Event,
  EventType,
  EventSchedule,
  Team,
  TeamMembership,
  Mahatma,
  EventTeamAssignment,
  EventMahatmaAssignment,
  Attendance,
  Expense,
  ExpenseCategory,
  ExpenseHistory,
  Notification,
  AuditLog,
} from '../../../shared/types/index.ts';

// In-Memory Data Store (Provides instantaneous MongoDB compatibility and seeding)
export class DataStore {
  users: User[] = [];
  centers: Center[] = [];
  locations: Location[] = [];
  events: Event[] = [];
  eventTypes: EventType[] = [];
  eventSchedules: EventSchedule[] = [];
  teams: Team[] = [];
  teamMemberships: TeamMembership[] = [];
  mahatmas: Mahatma[] = [];
  eventTeamAssignments: EventTeamAssignment[] = [];
  eventMahatmaAssignments: EventMahatmaAssignment[] = [];
  attendance: Attendance[] = [];
  expenses: Expense[] = [];
  expenseCategories: ExpenseCategory[] = [];
  expenseHistory: ExpenseHistory[] = [];
  notifications: Notification[] = [];
  auditLogs: AuditLog[] = [];

  // Passwords mapped by user id for verification
  private passwordHashes: Map<string, string> = new Map();

  private initialized = false;

  async init() {
    if (this.initialized) return;
    await this.seedDemoData();
    this.initialized = true;
  }

  setPasswordHash(userId: string, hash: string) {
    this.passwordHashes.set(userId, hash);
  }

  getPasswordHash(userId: string): string | undefined {
    return this.passwordHashes.get(userId);
  }

  async seedDemoData() {
    console.info('🌱 Seeding demo data for Surat Center Management Platform...');

    // 1. Center
    const suratCenter: Center = {
      id: 'center-surat-01',
      name: 'Surat Center',
      description: 'Main Spiritual and Satsang Center for Dada Bhagwan foundation in Surat, Gujarat.',
      address: 'Adajan Gam, Hazira Road, Opposite Prime Arcade',
      city: 'Surat',
      state: 'Gujarat',
      country: 'India',
      postalCode: '395009',
      phone: '+91 261 278 9900',
      email: 'info.surat@suratcenter.org',
      timezone: 'Asia/Kolkata',
      active: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    this.centers.push(suratCenter);

    // 2. Locations
    const locations: Location[] = [
      {
        id: 'loc-01',
        centerId: suratCenter.id,
        name: 'Surat Main Center',
        address: 'Adajan Gam, Hazira Road',
        city: 'Surat',
        state: 'Gujarat',
        postalCode: '395009',
        latitude: 21.1959,
        longitude: 72.7933,
        capacity: 600,
        facilities: ['Air Conditioned Hall', 'Audio/Visual Setup', 'Prasad Dining Area', 'Wheelchair Access', 'Covered Parking'],
        contactName: 'Rajeshbhai Patel',
        contactPhone: '+91 98250 11223',
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'loc-02',
        centerId: suratCenter.id,
        name: 'Surat Satsang Hall',
        address: 'VIP Road, Vesu',
        city: 'Surat',
        state: 'Gujarat',
        postalCode: '395007',
        latitude: 21.1418,
        longitude: 72.7709,
        capacity: 350,
        facilities: ['Stage Sound System', 'Live Streaming Setup', 'Shoe Counter Area', 'Drinking Water RO'],
        contactName: 'Amitbhai Desai',
        contactPhone: '+91 98251 22334',
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'loc-03',
        centerId: suratCenter.id,
        name: 'Surat Community Hall',
        address: 'Gajera Circle, Katargam',
        city: 'Surat',
        state: 'Gujarat',
        postalCode: '395004',
        latitude: 21.2266,
        longitude: 72.8312,
        capacity: 250,
        facilities: ['Open Courtyard', 'Prasad Preparation Kitchen', 'Stage Setup', 'Two-wheeler Parking'],
        contactName: 'Priteshbhai Mehta',
        contactPhone: '+91 98252 33445',
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    this.locations.push(...locations);

    // 3. Event Types
    const eventTypes: EventType[] = [
      { id: 'et-01', name: 'Satsang', description: 'Spiritual discourse and spiritual Q&A session', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'et-02', name: 'Gnan Vidhi', description: 'Self-realization scientific experiment ceremony', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'et-03', name: 'Spiritual Session', description: 'Interactive spiritual guidance and study session', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'et-04', name: 'Special Event', description: 'Annual gatherings and anniversary celebrations', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'et-05', name: 'Festival', description: 'Diwali, Guru Purnima, and Janmashtami celebrations', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'et-06', name: 'Volunteer Meeting', description: 'Coordination and seva planning for upcoming events', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'et-07', name: 'Training', description: 'AV technical, sound, and registration training', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'et-08', name: 'Center Meeting', description: 'Administrative and quarterly review meeting', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'et-09', name: 'Other', description: 'General community activity', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
    ];
    this.eventTypes.push(...eventTypes);

    // 4. Users (with bcrypt hashes)
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const financeHash = await bcrypt.hash('Finance@123', salt);
    const coordHash = await bcrypt.hash('Coord@123', salt);
    const volunteerHash = await bcrypt.hash('Volunteer@123', salt);

    const users: User[] = [
      {
        id: 'user-01',
        name: 'Rajeshbhai Patel',
        email: 'admin@suratcenter.org',
        phone: '+91 98250 11223',
        role: 'SUPER_ADMIN',
        centerIds: [suratCenter.id],
        active: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'user-02',
        name: 'Hansaben Shah',
        email: 'center.admin@suratcenter.org',
        phone: '+91 98250 22334',
        role: 'CENTER_ADMIN',
        centerIds: [suratCenter.id],
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'user-03',
        name: 'Amitbhai Desai',
        email: 'finance@suratcenter.org',
        phone: '+91 98250 33445',
        role: 'FINANCE_ADMIN',
        centerIds: [suratCenter.id],
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'user-04',
        name: 'Priteshbhai Mehta',
        email: 'coordinator@suratcenter.org',
        phone: '+91 98250 44556',
        role: 'EVENT_COORDINATOR',
        centerIds: [suratCenter.id],
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'user-05',
        name: 'Bhavikaben Joshi',
        email: 'volunteer@suratcenter.org',
        phone: '+91 98250 55667',
        role: 'VOLUNTEER',
        centerIds: [suratCenter.id],
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
    ];

    users.forEach((u) => {
      this.users.push(u);
      if (u.role === 'SUPER_ADMIN' || u.role === 'CENTER_ADMIN') {
        this.setPasswordHash(u.id, adminHash);
      } else if (u.role === 'FINANCE_ADMIN') {
        this.setPasswordHash(u.id, financeHash);
      } else if (u.role === 'EVENT_COORDINATOR') {
        this.setPasswordHash(u.id, coordHash);
      } else {
        this.setPasswordHash(u.id, volunteerHash);
      }
    });

    // 5. Teams
    const teams: Team[] = [
      {
        id: 'team-01',
        centerId: suratCenter.id,
        name: 'Welcome Team',
        description: 'Warm greeting, guest guidance, and seating coordination at entrance',
        primaryCoordinatorId: 'user-01',
        assistantCoordinatorIds: ['user-05'],
        memberCount: 18,
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'team-02',
        centerId: suratCenter.id,
        name: 'Seva Team',
        description: 'General arrangement, crowd flow, and hall assistance during satsangs',
        primaryCoordinatorId: 'user-04',
        assistantCoordinatorIds: [],
        memberCount: 24,
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'team-03',
        centerId: suratCenter.id,
        name: 'Food & Prasad Team',
        description: 'Preparation, packaging, hygiene, and distribution of Mahaprasad',
        primaryCoordinatorId: 'user-02',
        assistantCoordinatorIds: ['user-03'],
        memberCount: 30,
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'team-04',
        centerId: suratCenter.id,
        name: 'Decoration Team',
        description: 'Altar decoration, flowers, rangoli, and stage aesthetics',
        primaryCoordinatorId: 'user-05',
        assistantCoordinatorIds: [],
        memberCount: 14,
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'team-05',
        centerId: suratCenter.id,
        name: 'Technical Team',
        description: 'Audio microphones, live broadcast, projection screens, and video recording',
        primaryCoordinatorId: 'user-04',
        assistantCoordinatorIds: [],
        memberCount: 12,
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'team-06',
        centerId: suratCenter.id,
        name: 'Parking Team',
        description: 'Vehicle management, parking tokens, and smooth traffic entry/exit',
        primaryCoordinatorId: 'user-01',
        assistantCoordinatorIds: [],
        memberCount: 16,
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'team-07',
        centerId: suratCenter.id,
        name: 'Registration Team',
        description: 'Attendee check-in, name tags, new mahatma records, and inquiries',
        primaryCoordinatorId: 'user-02',
        assistantCoordinatorIds: ['user-05'],
        memberCount: 15,
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'team-08',
        centerId: suratCenter.id,
        name: 'Cleanliness Team',
        description: 'Hall maintenance, waste segregation, water stations, and sanitization',
        primaryCoordinatorId: 'user-03',
        assistantCoordinatorIds: [],
        memberCount: 20,
        active: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
    ];
    this.teams.push(...teams);

    // 6. Mahatmas
    const mahatmaList: Partial<Mahatma>[] = [
      { firstName: 'Rajeshbhai', lastName: 'Patel', phone: '+91 98250 11223', email: 'rajesh.patel@example.com', availability: 'Weekends & Evenings', notes: 'Senior coordinator for Surat center' },
      { firstName: 'Hansaben', lastName: 'Shah', phone: '+91 98250 22334', email: 'hansa.shah@example.com', availability: 'Full Time Seva', notes: 'Manages registration and center affairs' },
      { firstName: 'Amitbhai', lastName: 'Desai', phone: '+91 98250 33445', email: 'amit.desai@example.com', availability: 'Weekdays 5 PM onward', notes: 'Accounts and budget coordinator' },
      { firstName: 'Priteshbhai', lastName: 'Mehta', phone: '+91 98250 44556', email: 'pritesh.mehta@example.com', availability: 'All Saturdays and Sundays', notes: 'Technical sound and video lead' },
      { firstName: 'Bhavikaben', lastName: 'Joshi', phone: '+91 98250 55667', email: 'bhavika.joshi@example.com', availability: 'Morning & Evenings', notes: 'Decoration and stage lead' },
      { firstName: 'Chetanbhai', lastName: 'Vora', phone: '+91 98250 66778', email: 'chetan.vora@example.com', availability: 'Weekends', notes: 'Prasad and kitchen coordination' },
      { firstName: 'Dipakbhai', lastName: 'Dave', phone: '+91 98250 77889', email: 'dipak.dave@example.com', availability: 'Sundays only', notes: 'Parking and transport assistance' },
      { firstName: 'Meenaben', lastName: 'Prajapati', phone: '+91 98250 88990', email: 'meena.prajapati@example.com', availability: 'Flexible', notes: 'Welcome and mahila satsang' },
      { firstName: 'Nimishbhai', lastName: 'Gandhi', phone: '+91 98250 99001', email: 'nimish.gandhi@example.com', availability: 'Weekends', notes: 'Registration desk' },
      { firstName: 'Vaishaliben', lastName: 'Modi', phone: '+91 98251 00112', email: 'vaishali.modi@example.com', availability: 'Evenings', notes: 'Book stall and literature counter' },
      { firstName: 'Jitendrabhai', lastName: 'Solanki', phone: '+91 98251 11223', email: 'jitendra.solanki@example.com', availability: 'All days', notes: 'Cleanliness and seva volunteer' },
      { firstName: 'Kokilaben', lastName: 'Chauhan', phone: '+91 98251 22334', email: 'kokila.chauhan@example.com', availability: 'Morning satsangs', notes: 'Prasad serving' },
      { firstName: 'Mukeshbhai', lastName: 'Panchal', phone: '+91 98251 33445', email: 'mukesh.panchal@example.com', availability: 'Sundays', notes: 'Sound engineer volunteer' },
      { firstName: 'Ramilaben', lastName: 'Bhatt', phone: '+91 98251 44556', email: 'ramila.bhatt@example.com', availability: 'Weekends', notes: 'Flower decoration volunteer' },
      { firstName: 'Sureshbhai', lastName: 'Raval', phone: '+91 98251 55667', email: 'suresh.raval@example.com', availability: 'Evenings', notes: 'Crowd direction' },
      { firstName: 'Naynaben', lastName: 'Parekh', phone: '+91 98251 66778', email: 'nayna.parekh@example.com', availability: 'Flexible', notes: 'Registration coordinator' },
    ];

    mahatmaList.forEach((m, idx) => {
      const mahatmaId = `mah-${String(idx + 1).padStart(2, '0')}`;
      const mahatma: Mahatma = {
        id: mahatmaId,
        centerId: suratCenter.id,
        firstName: m.firstName!,
        lastName: m.lastName!,
        displayName: `${m.firstName} ${m.lastName}`,
        phone: m.phone!,
        email: m.email,
        status: 'ACTIVE',
        availability: m.availability,
        notes: m.notes,
        active: true,
        teamIds: [teams[idx % teams.length].id, teams[(idx + 2) % teams.length].id],
        createdAt: '2025-01-15T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      };
      this.mahatmas.push(mahatma);

      // Add team membership
      this.teamMemberships.push({
        id: `tm-${idx + 1}`,
        teamId: teams[idx % teams.length].id,
        mahatmaId,
        role: idx < 4 ? 'COORDINATOR' : 'MEMBER',
        active: true,
        joinedAt: '2025-02-01T00:00:00.000Z',
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2025-02-01T00:00:00.000Z',
      });
    });

    // 7. Expense Categories
    const expenseCategories: ExpenseCategory[] = [
      { id: 'cat-01', name: 'Food', description: 'Mahaprasad groceries, cooking ingredients, sweets, tea', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-02', name: 'Transportation', description: 'Bus transport for mahatmas, goods tempo, volunteer transport', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-03', name: 'Venue', description: 'Hall maintenance, generator fuel, cleaning charges', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-04', name: 'Decoration', description: 'Stage backdrop, fresh marigold flowers, carpet, lighting', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-05', name: 'Printing', description: 'Pamphlets, invitation cards, banners, satsang book covers', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-06', name: 'Stationery', description: 'Registration badges, notebooks, markers, tokens', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-07', name: 'Equipment', description: 'Microphone cables, PA speakers, projector bulb, live stream cords', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-08', name: 'Utilities', description: 'Electricity bills, water delivery cans, disposal supplies', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-09', name: 'Maintenance', description: 'AC servicing, painting touch-up, plumbing repairs', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-10', name: 'Accommodation', description: 'Guest speaker lodging, mattress hire, blankets', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-11', name: 'Travel', description: 'Speaker travel tickets, taxi charges', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-12', name: 'Other', description: 'Miscellaneous petty expenses', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
    ];
    this.expenseCategories.push(...expenseCategories);

    // 8. Events (Upcoming, Ongoing, Completed for Archive)
    const events: Event[] = [
      {
        id: 'evt-01',
        centerId: suratCenter.id,
        locationId: 'loc-01',
        name: 'Dada Bhagwan Satsang',
        slug: 'dada-bhagwan-satsang-sep-2026',
        description: 'Special evening Satsang on Akram Vignan principles, followed by question-and-answer session and Mahaprasad.',
        eventType: 'Satsang',
        date: '2026-09-26',
        startTime: '18:30',
        endTime: '21:00',
        timezone: 'Asia/Kolkata',
        status: 'PUBLISHED',
        expectedAttendance: 186,
        actualAttendance: 0,
        primaryCoordinatorId: 'user-01',
        teamIds: ['team-01', 'team-02', 'team-03', 'team-04', 'team-05', 'team-07'],
        bannerImageUrl: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1200&q=80',
        instructions: 'All mahatmas are requested to be seated by 6:15 PM. Mobile phones must be kept on silent mode.',
        createdBy: 'user-01',
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-09-15T10:00:00.000Z',
      },
      {
        id: 'evt-02',
        centerId: suratCenter.id,
        locationId: 'loc-02',
        name: 'Volunteer Meeting',
        slug: 'volunteer-meeting-sep-2026',
        description: 'Coordination and duty assignments for upcoming Dada Bhagwan Satsang and Gnan Vidhi preparations.',
        eventType: 'Volunteer Meeting',
        date: '2026-09-24',
        startTime: '19:00',
        endTime: '20:30',
        timezone: 'Asia/Kolkata',
        status: 'PUBLISHED',
        expectedAttendance: 60,
        actualAttendance: 0,
        primaryCoordinatorId: 'user-04',
        teamIds: ['team-01', 'team-02', 'team-03', 'team-05'],
        instructions: 'Please bring your volunteer badges. Team coordinators must report attendance upon arrival.',
        createdBy: 'user-01',
        createdAt: '2026-09-05T10:00:00.000Z',
        updatedAt: '2026-09-10T10:00:00.000Z',
      },
      {
        id: 'evt-03',
        centerId: suratCenter.id,
        locationId: 'loc-01',
        name: 'Mahila Satsang',
        slug: 'mahila-satsang-sep-2026',
        description: 'Dedicated spiritual satsang for sisters, focusing on harmonious daily living and inner peace.',
        eventType: 'Spiritual Session',
        date: '2026-09-28',
        startTime: '16:00',
        endTime: '18:30',
        timezone: 'Asia/Kolkata',
        status: 'PUBLISHED',
        expectedAttendance: 140,
        actualAttendance: 0,
        primaryCoordinatorId: 'user-02',
        teamIds: ['team-01', 'team-03', 'team-07'],
        instructions: 'Tea and light prasad will be served after the concluding prayer.',
        createdBy: 'user-02',
        createdAt: '2026-09-06T10:00:00.000Z',
        updatedAt: '2026-09-12T10:00:00.000Z',
      },
      {
        id: 'evt-04',
        centerId: suratCenter.id,
        locationId: 'loc-03',
        name: 'Satsang Sabha',
        slug: 'satsang-sabha-oct-2026',
        description: 'Weekly community spiritual sabha with reading of Aptavani scripture and experiential sharing.',
        eventType: 'Satsang',
        date: '2026-10-03',
        startTime: '18:00',
        endTime: '20:30',
        timezone: 'Asia/Kolkata',
        status: 'PUBLISHED',
        expectedAttendance: 110,
        actualAttendance: 0,
        primaryCoordinatorId: 'user-04',
        teamIds: ['team-02', 'team-03', 'team-08'],
        createdBy: 'user-01',
        createdAt: '2026-09-08T10:00:00.000Z',
        updatedAt: '2026-09-08T10:00:00.000Z',
      },
      {
        id: 'evt-05',
        centerId: suratCenter.id,
        locationId: 'loc-02',
        name: 'Yuva Satsang',
        slug: 'yuva-satsang-oct-2026',
        description: 'Youth spiritual interaction addressing career focus, stress relief, and moral strength.',
        eventType: 'Spiritual Session',
        date: '2026-10-04',
        startTime: '17:00',
        endTime: '19:30',
        timezone: 'Asia/Kolkata',
        status: 'PUBLISHED',
        expectedAttendance: 95,
        actualAttendance: 0,
        primaryCoordinatorId: 'user-04',
        teamIds: ['team-05', 'team-07'],
        createdBy: 'user-04',
        createdAt: '2026-09-09T10:00:00.000Z',
        updatedAt: '2026-09-09T10:00:00.000Z',
      },
      {
        id: 'evt-06',
        centerId: suratCenter.id,
        locationId: 'loc-01',
        name: 'Gnan Vidhi',
        slug: 'gnan-vidhi-oct-2026',
        description: 'Sacred Self-Realization ceremony. Registration mandatory for all seekers.',
        eventType: 'Gnan Vidhi',
        date: '2026-10-10',
        startTime: '10:00',
        endTime: '14:00',
        timezone: 'Asia/Kolkata',
        status: 'PUBLISHED',
        expectedAttendance: 320,
        actualAttendance: 0,
        primaryCoordinatorId: 'user-01',
        teamIds: ['team-01', 'team-02', 'team-03', 'team-04', 'team-05', 'team-06', 'team-07', 'team-08'],
        instructions: 'Please bring photo ID for registration counter. Full Mahaprasad provided.',
        createdBy: 'user-01',
        createdAt: '2026-09-10T10:00:00.000Z',
        updatedAt: '2026-09-15T10:00:00.000Z',
      },
      // Historic Completed Events for Archives (Years 2026, 2025, 2024)
      {
        id: 'evt-arch-01',
        centerId: suratCenter.id,
        locationId: 'loc-01',
        name: 'Janmashtami Spiritual Festival',
        slug: 'janmashtami-spiritual-festival-aug-2026',
        description: 'Festive devotional celebration, devotional kirtan, and discourse on Lord Krishna spiritual essence.',
        eventType: 'Festival',
        date: '2026-08-25',
        startTime: '18:00',
        endTime: '22:00',
        timezone: 'Asia/Kolkata',
        status: 'COMPLETED',
        expectedAttendance: 350,
        actualAttendance: 368,
        primaryCoordinatorId: 'user-01',
        teamIds: ['team-01', 'team-02', 'team-03', 'team-04'],
        createdBy: 'user-01',
        createdAt: '2026-08-01T10:00:00.000Z',
        updatedAt: '2026-08-26T10:00:00.000Z',
      },
      {
        id: 'evt-arch-02',
        centerId: suratCenter.id,
        locationId: 'loc-01',
        name: 'Guru Purnima Celebration',
        slug: 'guru-purnima-celebration-jul-2026',
        description: 'Annual Guru Purnima worship, reverence, collective prayers, and prasadam.',
        eventType: 'Festival',
        date: '2026-07-20',
        startTime: '08:30',
        endTime: '13:30',
        timezone: 'Asia/Kolkata',
        status: 'COMPLETED',
        expectedAttendance: 450,
        actualAttendance: 472,
        primaryCoordinatorId: 'user-01',
        teamIds: ['team-01', 'team-02', 'team-03', 'team-06', 'team-07'],
        createdBy: 'user-01',
        createdAt: '2026-07-01T10:00:00.000Z',
        updatedAt: '2026-07-21T10:00:00.000Z',
      },
      {
        id: 'evt-arch-03',
        centerId: suratCenter.id,
        locationId: 'loc-02',
        name: 'Annual Center Coordinators Training',
        slug: 'annual-center-coordinators-training-feb-2026',
        description: 'Workshop on spiritual leadership, event scheduling, and volunteer management.',
        eventType: 'Training',
        date: '2026-02-14',
        startTime: '09:00',
        endTime: '16:00',
        timezone: 'Asia/Kolkata',
        status: 'COMPLETED',
        expectedAttendance: 80,
        actualAttendance: 82,
        primaryCoordinatorId: 'user-02',
        teamIds: ['team-05', 'team-07'],
        createdBy: 'user-01',
        createdAt: '2026-01-20T10:00:00.000Z',
        updatedAt: '2026-02-15T10:00:00.000Z',
      },
      {
        id: 'evt-arch-04',
        centerId: suratCenter.id,
        locationId: 'loc-01',
        name: 'New Year Grand Satsang 2026',
        slug: 'new-year-grand-satsang-jan-2026',
        description: 'Welcoming 2026 with devotional prayers, contemplation, and peaceful blessings.',
        eventType: 'Special Event',
        date: '2026-01-01',
        startTime: '18:00',
        endTime: '21:00',
        timezone: 'Asia/Kolkata',
        status: 'COMPLETED',
        expectedAttendance: 280,
        actualAttendance: 295,
        primaryCoordinatorId: 'user-01',
        teamIds: ['team-01', 'team-03'],
        createdBy: 'user-01',
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2026-01-02T10:00:00.000Z',
      },
      {
        id: 'evt-arch-05',
        centerId: suratCenter.id,
        locationId: 'loc-01',
        name: 'Diwali Annakut Mahotsav 2025',
        slug: 'diwali-annakut-mahotsav-nov-2025',
        description: 'Grand offering of 108 dishes, light festival, and divine satsang.',
        eventType: 'Festival',
        date: '2025-11-02',
        startTime: '16:30',
        endTime: '21:30',
        timezone: 'Asia/Kolkata',
        status: 'COMPLETED',
        expectedAttendance: 500,
        actualAttendance: 520,
        primaryCoordinatorId: 'user-01',
        teamIds: ['team-01', 'team-03', 'team-04', 'team-06'],
        createdBy: 'user-01',
        createdAt: '2025-10-10T10:00:00.000Z',
        updatedAt: '2025-11-03T10:00:00.000Z',
      },
    ];
    this.events.push(...events);

    // 9. Schedules for Event 1 (Dada Bhagwan Satsang)
    const schedules: EventSchedule[] = [
      { id: 'sch-01', eventId: 'evt-01', title: 'Arrival & Registration', description: 'Welcoming Mahatmas and check-in at registration counters', startTime: '18:00', endTime: '18:30', responsibleCoordinatorId: 'user-02', order: 1, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' },
      { id: 'sch-02', eventId: 'evt-01', title: 'Satsang Begins', description: 'Initial prayers, Vidhi, and recitation of divine stuti', startTime: '18:30', endTime: '19:15', responsibleCoordinatorId: 'user-01', order: 2, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' },
      { id: 'sch-03', eventId: 'evt-01', title: 'Spiritual Session & Discourse', description: 'Discourse on Dadashri words of wisdom: Harmony in family life', startTime: '19:15', endTime: '20:00', responsibleCoordinatorId: 'user-01', order: 3, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' },
      { id: 'sch-04', eventId: 'evt-01', title: 'Discussion & Question Answers', description: 'Direct questions submitted by attendees answered by speakers', startTime: '20:00', endTime: '20:30', responsibleCoordinatorId: 'user-01', order: 4, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' },
      { id: 'sch-05', eventId: 'evt-01', title: 'Closing Aarti & Mahaprasad', description: 'Final blessings, Aarti singing, and sitting for dinner prasadam', startTime: '20:30', endTime: '21:30', responsibleCoordinatorId: 'user-02', order: 5, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' },
    ];
    this.eventSchedules.push(...schedules);

    // 10. Event Team Assignments
    const teamAssignments: EventTeamAssignment[] = [
      { id: 'eta-01', eventId: 'evt-01', teamId: 'team-07', coordinatorId: 'user-02', responsibility: 'Registration and welcome desk setup', notes: 'Keep 200 badges and pen ready', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z' },
      { id: 'eta-02', eventId: 'evt-01', teamId: 'team-03', coordinatorId: 'user-02', responsibility: 'Food and Prasad distribution', notes: 'Dinner khichdi, kadhi, and sweet for 200 attendees', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z' },
      { id: 'eta-03', eventId: 'evt-01', teamId: 'team-04', coordinatorId: 'user-05', responsibility: 'Stage flower decoration and lighting', notes: 'Fresh marigolds and rose petals', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z' },
      { id: 'eta-04', eventId: 'evt-01', teamId: 'team-05', coordinatorId: 'user-04', responsibility: 'Live sound mixing and projection', notes: 'Check cordless mics 30 mins before start', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z' },
    ];
    this.eventTeamAssignments.push(...teamAssignments);

    // 11. Event Mahatma Assignments
    const mahatmaAssignments: EventMahatmaAssignment[] = [
      { id: 'ema-01', eventId: 'evt-01', mahatmaId: 'mah-01', teamId: 'team-01', responsibility: 'Main entrance welcome', status: 'CONFIRMED', createdAt: '2026-09-12T00:00:00.000Z', updatedAt: '2026-09-12T00:00:00.000Z' },
      { id: 'ema-02', eventId: 'evt-01', mahatmaId: 'mah-02', teamId: 'team-07', responsibility: 'Registration table 1', status: 'CONFIRMED', createdAt: '2026-09-12T00:00:00.000Z', updatedAt: '2026-09-12T00:00:00.000Z' },
      { id: 'ema-03', eventId: 'evt-01', mahatmaId: 'mah-04', teamId: 'team-05', responsibility: 'Sound console lead', status: 'CONFIRMED', createdAt: '2026-09-12T00:00:00.000Z', updatedAt: '2026-09-12T00:00:00.000Z' },
      { id: 'ema-04', eventId: 'evt-01', mahatmaId: 'mah-05', teamId: 'team-04', responsibility: 'Floral Garland preparation', status: 'CONFIRMED', createdAt: '2026-09-12T00:00:00.000Z', updatedAt: '2026-09-12T00:00:00.000Z' },
    ];
    this.eventMahatmaAssignments.push(...mahatmaAssignments);

    // 12. Attendance records for completed event
    for (let i = 1; i <= 15; i++) {
      const mahId = `mah-${String(i).padStart(2, '0')}`;
      this.attendance.push({
        id: `att-arch-${i}`,
        eventId: 'evt-arch-01',
        mahatmaId: mahId,
        status: i % 7 === 0 ? 'ABSENT' : 'PRESENT',
        markedBy: 'user-02',
        markedAt: '2026-08-25T18:45:00.000Z',
        createdAt: '2026-08-25T18:45:00.000Z',
        updatedAt: '2026-08-25T18:45:00.000Z',
      });
    }

    // Registered attendance for Event 1
    for (let i = 1; i <= 10; i++) {
      const mahId = `mah-${String(i).padStart(2, '0')}`;
      this.attendance.push({
        id: `att-evt1-${i}`,
        eventId: 'evt-01',
        mahatmaId: mahId,
        status: i <= 7 ? 'REGISTERED' : 'PRESENT',
        markedBy: 'user-02',
        markedAt: '2026-09-20T10:00:00.000Z',
        createdAt: '2026-09-20T10:00:00.000Z',
        updatedAt: '2026-09-20T10:00:00.000Z',
      });
    }

    // 13. Expenses (Matching prompt example: ₹12,500 Food, ₹4,000 Decoration, ₹2,500 Transportation, ₹1,200 Printing = ₹20,200)
    const expenses: Expense[] = [
      {
        id: 'exp-01',
        centerId: suratCenter.id,
        eventId: 'evt-01',
        teamId: 'team-03',
        title: 'Mahaprasad Groceries & Dairy',
        description: 'Rice, wheat flour, pure ghee, spices, vegetables, and milk for 200 mahatmas dinner',
        category: 'Food',
        amount: 12500,
        currency: 'INR',
        expenseDate: '2026-09-20',
        paidBy: 'Hansaben Shah',
        paymentMethod: 'UPI / Google Pay',
        status: 'APPROVED',
        submittedBy: 'user-02',
        approvedBy: 'user-03',
        approvedAt: '2026-09-21T11:00:00.000Z',
        createdAt: '2026-09-20T14:30:00.000Z',
        updatedAt: '2026-09-21T11:00:00.000Z',
      },
      {
        id: 'exp-02',
        centerId: suratCenter.id,
        eventId: 'evt-01',
        teamId: 'team-04',
        title: 'Stage Flower Garlands & Lighting',
        description: 'Fresh marigold garlands, altar floral arrangement, and spotlight rental',
        category: 'Decoration',
        amount: 4000,
        currency: 'INR',
        expenseDate: '2026-09-21',
        paidBy: 'Bhavikaben Joshi',
        paymentMethod: 'Cash',
        status: 'APPROVED',
        submittedBy: 'user-05',
        approvedBy: 'user-03',
        approvedAt: '2026-09-21T15:30:00.000Z',
        createdAt: '2026-09-21T09:00:00.000Z',
        updatedAt: '2026-09-21T15:30:00.000Z',
      },
      {
        id: 'exp-03',
        centerId: suratCenter.id,
        eventId: 'evt-01',
        teamId: 'team-06',
        title: 'Volunteer Shuttle & Goods Tempo',
        description: 'Tempo rental for bringing dining tables, mats, and senior mahatmas shuttle van',
        category: 'Transportation',
        amount: 2500,
        currency: 'INR',
        expenseDate: '2026-09-21',
        paidBy: 'Amitbhai Desai',
        paymentMethod: 'UPI',
        status: 'APPROVED',
        submittedBy: 'user-03',
        approvedBy: 'user-01',
        approvedAt: '2026-09-21T16:00:00.000Z',
        createdAt: '2026-09-21T11:00:00.000Z',
        updatedAt: '2026-09-21T16:00:00.000Z',
      },
      {
        id: 'exp-04',
        centerId: suratCenter.id,
        eventId: 'evt-01',
        teamId: 'team-07',
        title: 'Invitation Cards & Badges Printing',
        description: '250 attendee name tags, colored stage banner, and schedule leaflets',
        category: 'Printing',
        amount: 1200,
        currency: 'INR',
        expenseDate: '2026-09-18',
        paidBy: 'Rajeshbhai Patel',
        paymentMethod: 'Net Banking',
        status: 'PAID',
        submittedBy: 'user-01',
        approvedBy: 'user-03',
        approvedAt: '2026-09-19T10:00:00.000Z',
        paidAt: '2026-09-19T14:00:00.000Z',
        createdAt: '2026-09-18T10:00:00.000Z',
        updatedAt: '2026-09-19T14:00:00.000Z',
      },
      {
        id: 'exp-05',
        centerId: suratCenter.id,
        eventId: 'evt-02',
        teamId: 'team-05',
        title: 'Cordless Microphone Batteries & Aux Cables',
        description: 'Rechargeable 9V batteries for wireless stage mics and balanced XLR cables',
        category: 'Equipment',
        amount: 3200,
        currency: 'INR',
        expenseDate: '2026-09-19',
        paidBy: 'Priteshbhai Mehta',
        paymentMethod: 'UPI',
        status: 'SUBMITTED',
        submittedBy: 'user-04',
        createdAt: '2026-09-19T16:00:00.000Z',
        updatedAt: '2026-09-19T16:00:00.000Z',
      },
      {
        id: 'exp-06',
        centerId: suratCenter.id,
        locationId: 'loc-01',
        title: 'Hall Deep Cleaning & Sanitization Supplies',
        description: 'Floor phenyl, garbage liners, hand soaps, and mop sets for Surat Main Center',
        category: 'Maintenance',
        amount: 1850,
        currency: 'INR',
        expenseDate: '2026-09-15',
        paidBy: 'Hansaben Shah',
        paymentMethod: 'Cash',
        status: 'PAID',
        submittedBy: 'user-02',
        approvedBy: 'user-03',
        approvedAt: '2026-09-16T10:00:00.000Z',
        paidAt: '2026-09-16T12:00:00.000Z',
        createdAt: '2026-09-15T10:00:00.000Z',
        updatedAt: '2026-09-16T12:00:00.000Z',
      },
      {
        id: 'exp-07',
        centerId: suratCenter.id,
        title: 'Draft Generator Fuel Estimate',
        description: 'Diesel backup for Satsang Hall generator during heavy rains',
        category: 'Utilities',
        amount: 2200,
        currency: 'INR',
        expenseDate: '2026-09-21',
        paidBy: 'Priteshbhai Mehta',
        paymentMethod: 'Cash',
        status: 'DRAFT',
        submittedBy: 'user-04',
        createdAt: '2026-09-21T18:00:00.000Z',
        updatedAt: '2026-09-21T18:00:00.000Z',
      },
    ];
    this.expenses.push(...expenses);

    // 14. Expense History
    expenses.forEach((e) => {
      this.expenseHistory.push({
        id: `eh-${e.id}-1`,
        expenseId: e.id,
        action: 'CREATED',
        performedBy: e.submittedBy,
        newStatus: 'DRAFT',
        note: 'Expense bill logged',
        createdAt: e.createdAt,
      });

      if (e.status !== 'DRAFT') {
        this.expenseHistory.push({
          id: `eh-${e.id}-2`,
          expenseId: e.id,
          action: 'SUBMITTED',
          performedBy: e.submittedBy,
          previousStatus: 'DRAFT',
          newStatus: 'SUBMITTED',
          note: 'Submitted to finance for approval',
          createdAt: e.createdAt,
        });
      }

      if (e.status === 'APPROVED' || e.status === 'PAID') {
        this.expenseHistory.push({
          id: `eh-${e.id}-3`,
          expenseId: e.id,
          action: 'APPROVED',
          performedBy: e.approvedBy || 'user-03',
          previousStatus: 'SUBMITTED',
          newStatus: 'APPROVED',
          note: 'Approved for disbursement',
          createdAt: e.approvedAt || e.updatedAt,
        });
      }

      if (e.status === 'PAID') {
        this.expenseHistory.push({
          id: `eh-${e.id}-4`,
          expenseId: e.id,
          action: 'MARKED_PAID',
          performedBy: e.approvedBy || 'user-03',
          previousStatus: 'APPROVED',
          newStatus: 'PAID',
          note: 'Payment completed via bank transfer',
          createdAt: e.paidAt || e.updatedAt,
        });
      }
    });

    // 15. Notifications
    const notifications: Notification[] = [
      {
        id: 'notif-01',
        userId: 'user-01',
        type: 'EVENT_ASSIGNED',
        title: 'Next Event: Dada Bhagwan Satsang',
        message: 'You are the primary coordinator for the upcoming event on 26 September 2026.',
        entityType: 'Event',
        entityId: 'evt-01',
        read: false,
        createdAt: '2026-09-21T08:00:00.000Z',
      },
      {
        id: 'notif-02',
        userId: 'user-03',
        type: 'EXPENSE_SUBMITTED',
        title: 'New Expense Pending Approval',
        message: 'Priteshbhai submitted ₹3,200 for Cordless Microphone Batteries.',
        entityType: 'Expense',
        entityId: 'exp-05',
        read: false,
        createdAt: '2026-09-19T16:05:00.000Z',
      },
      {
        id: 'notif-03',
        userId: 'user-02',
        type: 'EXPENSE_APPROVED',
        title: 'Expense Approved: ₹12,500',
        message: 'Mahaprasad groceries expense has been approved by finance admin Amitbhai.',
        entityType: 'Expense',
        entityId: 'exp-01',
        read: true,
        createdAt: '2026-09-21T11:05:00.000Z',
      },
      {
        id: 'notif-04',
        userId: 'user-04',
        type: 'EVENT_REMINDER',
        title: 'Upcoming Volunteer Meeting',
        message: 'Volunteer coordination meeting scheduled for 24 September at Surat Satsang Hall.',
        entityType: 'Event',
        entityId: 'evt-02',
        read: false,
        createdAt: '2026-09-21T09:00:00.000Z',
      },
    ];
    this.notifications.push(...notifications);

    // 16. Audit Logs
    const auditLogs: AuditLog[] = [
      {
        id: 'aud-01',
        userId: 'user-01',
        action: 'Created event: Dada Bhagwan Satsang',
        entityType: 'Event',
        entityId: 'evt-01',
        metadata: { name: 'Dada Bhagwan Satsang', date: '2026-09-26', location: 'Surat Main Center' },
        createdAt: '2026-09-01T10:00:00.000Z',
      },
      {
        id: 'aud-02',
        userId: 'user-02',
        action: 'Submitted expense: Mahaprasad Groceries',
        entityType: 'Expense',
        entityId: 'exp-01',
        metadata: { amount: 12500, category: 'Food' },
        createdAt: '2026-09-20T14:30:00.000Z',
      },
      {
        id: 'aud-03',
        userId: 'user-03',
        action: 'Approved expense: Mahaprasad Groceries',
        entityType: 'Expense',
        entityId: 'exp-01',
        metadata: { amount: 12500, status: 'APPROVED' },
        createdAt: '2026-09-21T11:00:00.000Z',
      },
      {
        id: 'aud-04',
        userId: 'user-01',
        action: 'Assigned team: Registration Team to Dada Bhagwan Satsang',
        entityType: 'EventTeamAssignment',
        entityId: 'eta-01',
        metadata: { eventId: 'evt-01', teamId: 'team-07' },
        createdAt: '2026-09-10T00:00:00.000Z',
      },
    ];
    this.auditLogs.push(...auditLogs);

    console.info('✅ Seeded demo data successfully for Surat Center Management Platform');
  }
}

export const dbStore = new DataStore();
dbStore.init();
