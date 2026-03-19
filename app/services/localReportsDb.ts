import {
  isBrowserRuntime,
  readStorageJson,
  writeStorageJson,
} from "@/app/services/storageUtils";

type LocalCoordinates = {
  latitude: number;
  longitude: number;
  reverseGeoCode?: string;
};

export type LocalReportRecord = {
  id: string;
  description: string;
  category: number;
  status: number;
  createdAt: string;
  reportByName: string;
  reportByPhoneNumber: string;
  reportedBy: {
    name: string;
    phoneNumber: string;
  };
  location: LocalCoordinates;
  reportedAt: LocalCoordinates;
  aiProbabilities: Record<string, number>;
  internalNote?: string;
  images?: string[];
  image?: string[];
};

const STORAGE_KEY = "resqline.localReports.v1";

const seedReports: LocalReportRecord[] = [
  {
    id: "1001",
    description: "Structure fire near market block C",
    category: 3,
    status: 0,
    createdAt: "2026-03-21T08:35:00.000Z",
    reportByName: "Maria Santos",
    reportByPhoneNumber: "+63 917 123 4567",
    reportedBy: { name: "Maria Santos", phoneNumber: "+63 917 123 4567" },
    location: {
      latitude: 14.6574,
      longitude: 121.0287,
      reverseGeoCode: "Brgy. Pag-asa, Quezon City",
    },
    reportedAt: {
      latitude: 14.6574,
      longitude: 121.0287,
      reverseGeoCode: "Brgy. Pag-asa, Quezon City",
    },
    aiProbabilities: { fire: 0.91, smoke: 0.44, normal_scene: 0.12 },
    internalNote: "Nearest BFP team notified.",
    images: [],
    image: [],
  },
  {
    id: "1002",
    description: "Two-vehicle collision along Commonwealth Ave",
    category: 2,
    status: 1,
    createdAt: "2026-03-21T08:20:00.000Z",
    reportByName: "Rico Dela Cruz",
    reportByPhoneNumber: "+63 927 220 1002",
    reportedBy: { name: "Rico Dela Cruz", phoneNumber: "+63 927 220 1002" },
    location: {
      latitude: 14.6768,
      longitude: 121.0433,
      reverseGeoCode: "Commonwealth Ave, Quezon City",
    },
    reportedAt: {
      latitude: 14.6768,
      longitude: 121.0433,
      reverseGeoCode: "Commonwealth Ave, Quezon City",
    },
    aiProbabilities: { traffic_accident: 0.86, injured_person: 0.49 },
    internalNote: "CTMO traffic clearing ongoing.",
    images: [],
    image: [],
  },
  {
    id: "1003",
    description: "Flooded street with stalled vehicles",
    category: 4,
    status: 0,
    createdAt: "2026-03-21T08:10:00.000Z",
    reportByName: "Ana Reyes",
    reportByPhoneNumber: "+63 939 310 1003",
    reportedBy: { name: "Ana Reyes", phoneNumber: "+63 939 310 1003" },
    location: {
      latitude: 14.6512,
      longitude: 121.0478,
      reverseGeoCode: "Katipunan Ave, Quezon City",
    },
    reportedAt: {
      latitude: 14.6512,
      longitude: 121.0478,
      reverseGeoCode: "Katipunan Ave, Quezon City",
    },
    aiProbabilities: { flood: 0.94, normal_scene: 0.07 },
    internalNote: "PDRRMO pumps requested.",
    images: [],
    image: [],
  },
  {
    id: "1004",
    description: "Person collapsed at transport terminal",
    category: 1,
    status: 2,
    createdAt: "2026-03-21T07:58:00.000Z",
    reportByName: "Joel Navarro",
    reportByPhoneNumber: "+63 998 410 1004",
    reportedBy: { name: "Joel Navarro", phoneNumber: "+63 998 410 1004" },
    location: {
      latitude: 14.6397,
      longitude: 121.0541,
      reverseGeoCode: "Aurora Blvd Terminal",
    },
    reportedAt: {
      latitude: 14.6397,
      longitude: 121.0541,
      reverseGeoCode: "Aurora Blvd Terminal",
    },
    aiProbabilities: { injured_person: 0.88, normal_scene: 0.15 },
    internalNote: "Patient transferred to nearest ER.",
    images: [],
    image: [],
  },
  {
    id: "1005",
    description: "Structural damage after wall collapse near depot",
    category: 5,
    status: 1,
    createdAt: "2026-03-21T07:41:00.000Z",
    reportByName: "Liza Fernandez",
    reportByPhoneNumber: "+63 917 550 1005",
    reportedBy: { name: "Liza Fernandez", phoneNumber: "+63 917 550 1005" },
    location: {
      latitude: 14.6448,
      longitude: 121.0332,
      reverseGeoCode: "Timog Ave, Quezon City",
    },
    reportedAt: {
      latitude: 14.6448,
      longitude: 121.0332,
      reverseGeoCode: "Timog Ave, Quezon City",
    },
    aiProbabilities: { damaged_structures: 0.84, injured_person: 0.28 },
    internalNote: "Damage assessment and cordon in progress.",
    images: [],
    image: [],
  },
];

const normalizeId = (value: string) => value.replace(/^RPT-2026-/, "");

const clone = (data: LocalReportRecord[]) =>
  data.map((item) => ({
    ...item,
    reportedBy: { ...item.reportedBy },
    location: { ...item.location },
    reportedAt: { ...item.reportedAt },
    aiProbabilities: { ...item.aiProbabilities },
    images: [...(item.images ?? [])],
    image: [...(item.image ?? [])],
  }));

const readRecords = (): LocalReportRecord[] => {
  if (!isBrowserRuntime()) return clone(seedReports);

  const parsed = readStorageJson<LocalReportRecord[] | null>(STORAGE_KEY, null);
  if (!parsed) {
    const seeded = clone(seedReports);
    writeStorageJson(STORAGE_KEY, seeded);
    return seeded;
  }

  if (!Array.isArray(parsed)) {
    const seeded = clone(seedReports);
    writeStorageJson(STORAGE_KEY, seeded);
    return seeded;
  }

  return parsed;
};

const writeRecords = (records: LocalReportRecord[]) => {
  if (!isBrowserRuntime()) return;
  writeStorageJson(STORAGE_KEY, records);
};

export const fetchLocalReports = async (): Promise<LocalReportRecord[]> => {
  const records = readRecords().sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
  return clone(records);
};

export const fetchLocalReportById = async (
  id: string,
): Promise<LocalReportRecord> => {
  const normalizedId = normalizeId(id);
  const report = readRecords().find((item) => item.id === normalizedId);
  if (!report) {
    throw new Error(`Local report not found for ID: ${id}`);
  }
  return { ...report };
};

export const updateLocalReportStatus = async (
  id: string,
  status: number,
): Promise<LocalReportRecord | null> => {
  const normalizedId = normalizeId(id);
  const records = readRecords();
  const index = records.findIndex((item) => item.id === normalizedId);

  if (index === -1) {
    throw new Error(`Local report not found for ID: ${id}`);
  }

  records[index] = {
    ...records[index],
    status,
  };

  writeRecords(records);

  return { ...records[index] };
};
