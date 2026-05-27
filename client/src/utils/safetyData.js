const KHARGONE_CENTER = [21.8257, 75.6132];
const DEFAULT_BLACKSPOT_RADIUS_METERS = 650;
const MORTH_MP_BLACKSPOTS_SOURCE_URL = "https://morth.nic.in/sites/default/files/Madhya_Pradesh.pdf";
const roadSafetyScope = {
  activeDistrict: "Madhya Pradesh",
  officialBlackspotSource: "MoRTH public PDF: 25 Black Spots in the State of Madhya Pradesh",
  officialBlackspotSourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
  morthDashboardReportedMpCount: 444,
  futureReadyFor: ["chrome_extension", "live_traffic_apis", "ai_risk_analysis", "official_mis_sync"],
};

const severityMeta = {
  high: {
    label: "High risk",
    color: "#ef4444",
    softColor: "rgba(239,68,68,0.2)",
    radius: 360,
    score: 42,
    order: 0,
  },
  medium: {
    label: "Medium risk",
    color: "#f59e0b",
    softColor: "rgba(245,158,11,0.22)",
    radius: 280,
    score: 24,
    order: 1,
  },
  low: {
    label: "Low risk",
    color: "#facc15",
    softColor: "rgba(250,204,21,0.22)",
    radius: 210,
    score: 12,
    order: 2,
  },
};

const verificationMeta = {
  government_verified: {
    label: "Government Verified",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  community_verified: {
    label: "Community Verified",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  under_review: {
    label: "Under Review",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

const khargoneDemoBlackspots = [
  {
    id: "demo-bistan-road-market-curve",
    location: "Bistan road near Khargone market curve",
    lat: 21.8249,
    lng: 75.6049,
    latitude: 21.8249,
    longitude: 75.6049,
    severity: "High",
    type: "Dangerous turn",
    description: "Sharp mixed-traffic curve with repeated braking near the market approach.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 94,
    accidentFrequency: 11,
    sourceType: "Khargone road safety cell",
    createdAt: "2026-05-18T09:00:00.000Z",
    updatedAt: "2026-05-21T09:00:00.000Z",
  },
  {
    id: "demo-bhikangaon-crossing",
    location: "Bhikangaon road crossing, Khargone district",
    lat: 21.8666,
    lng: 75.6918,
    latitude: 21.8666,
    longitude: 75.6918,
    severity: "Medium",
    type: "Road accident",
    description: "Fast approach traffic and poor lane discipline around the crossing.",
    status: "approved",
    verificationStatus: "community_verified",
    confidenceScore: 82,
    accidentFrequency: 7,
    sourceType: "Community reports",
    createdAt: "2026-05-17T10:30:00.000Z",
    updatedAt: "2026-05-21T10:30:00.000Z",
  },
  {
    id: "demo-sanawad-road-stretch",
    location: "Sanawad road accident-prone stretch near Khargone",
    lat: 21.8098,
    lng: 75.6756,
    latitude: 21.8098,
    longitude: 75.6756,
    severity: "High",
    type: "Near miss",
    description: "High-speed corridor with night visibility issues and frequent overtaking.",
    status: "approved",
    verificationStatus: "community_verified",
    confidenceScore: 88,
    accidentFrequency: 9,
    sourceType: "RouteRaksha community",
    createdAt: "2026-05-16T11:15:00.000Z",
    updatedAt: "2026-05-21T11:15:00.000Z",
  },
  {
    id: "demo-dongargaon-bridge",
    location: "Dongargaon bridge approach, Khargone",
    lat: 21.7819,
    lng: 75.5882,
    latitude: 21.7819,
    longitude: 75.5882,
    severity: "Medium",
    type: "Dangerous turn",
    description: "Bridge approach narrows quickly with poor shoulder visibility.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 90,
    accidentFrequency: 6,
    sourceType: "Khargone road safety cell",
    createdAt: "2026-05-15T12:00:00.000Z",
    updatedAt: "2026-05-21T12:00:00.000Z",
  },
  {
    id: "demo-bistan-road-school-zone",
    location: "Bistan road school-zone shoulder, Khargone",
    lat: 21.8393,
    lng: 75.5765,
    latitude: 21.8393,
    longitude: 75.5765,
    severity: "Low",
    type: "Pothole or bad road",
    description: "Uneven shoulder and pedestrian movement during school hours.",
    status: "approved",
    verificationStatus: "under_review",
    confidenceScore: 68,
    accidentFrequency: 3,
    sourceType: "Demo survey",
    createdAt: "2026-05-14T08:30:00.000Z",
    updatedAt: "2026-05-21T08:30:00.000Z",
  },
  {
    id: "corridor-mp052-bakaner-ganesh-ghat",
    location: "Bakaner / Ganesh Ghat, NH-52 Indore-Khalghat section",
    lat: 22.335,
    lng: 75.54,
    latitude: 22.335,
    longitude: 75.54,
    severity: "High",
    type: "Dangerous turn",
    description:
      "Official MoRTH black spot MP052 around km 62-65 on the Indore-Khalghat section; steep ghat/down-grade with heavy-vehicle rollover, lane breach and fire-crash history. NHAI has completed an 8.8 km mitigation/new-lane project, so keep this marked as rectified but still important for route awareness.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 96,
    accidentFrequency: 35,
    routeRadiusMeters: 2200,
    sourceType: "Government data",
    sourceUrl: "https://forestsclearance.nic.in/writereaddata/Addinfo/0_0_91113123812181BenefitsofLoopconstruction.pdf",
    createdAt: "2026-05-23T10:00:00.000Z",
    updatedAt: "2026-05-23T10:00:00.000Z",
  },
  {
    id: "corridor-balsamud-kasrawad-highway",
    location: "Balsamud / Kasrawad section, Khargone-Indore highway",
    lat: 22.0858,
    lng: 75.62345,
    latitude: 22.0858,
    longitude: 75.62345,
    severity: "High",
    type: "Road accident",
    description:
      "Candidate high-risk point from recent fatal head-on collision reporting near Balsamud in Kasrawad police station limits on the Khargone-Indore highway. Needs confirmation from Khargone DRSC/traffic police before government-verified status.",
    status: "approved",
    verificationStatus: "under_review",
    confidenceScore: 74,
    accidentFrequency: 2,
    routeRadiusMeters: 1800,
    sourceType: "Community report",
    sourceUrl: "https://assamtribune.com/national/two-dead-as-vehicles-collide-head-on-on-khargoneindore-road-in-mp-1597086",
    createdAt: "2026-05-23T10:05:00.000Z",
    updatedAt: "2026-05-23T10:05:00.000Z",
  },
  {
    id: "corridor-khalghat-sanjay-setu",
    location: "Khalghat / Sanjay Setu bridge, Narmada crossing",
    lat: 22.15734,
    lng: 75.44606,
    latitude: 22.15734,
    longitude: 75.44606,
    severity: "High",
    type: "Road accident",
    description:
      "Candidate bridge hazard on the Indore-Khargone/Mumbai route; public reports cite a major bus fall from the old bridge after overtaking/loss of control. Verify current bridge safety status with Dhar/Khargone road safety committee records.",
    status: "approved",
    verificationStatus: "under_review",
    confidenceScore: 72,
    accidentFrequency: 1,
    routeRadiusMeters: 1800,
    sourceType: "Community report",
    sourceUrl: "https://www.hindustantimes.com/cities/indore-news/mp-bus-accident-video-bus-falls-off-bridge-into-narmada-river-in-dhar-district-rescue-ops-on-101658125741651.html",
    createdAt: "2026-05-23T10:10:00.000Z",
    updatedAt: "2026-05-23T10:10:00.000Z",
  },
  {
    id: "corridor-nanded-bridge-badgonda-mhow",
    location: "Nanded Bridge / Badgonda area, Rau-Khalghat four-lane near Mhow",
    lat: 22.456,
    lng: 75.653,
    latitude: 22.456,
    longitude: 75.653,
    severity: "High",
    type: "Road accident",
    description:
      "Candidate high-risk point from fatal head-on collision/fire reporting near Nanded Bridge in the Badgonda police station area on the Rau-Khalghat four-lane. Coordinates are corridor-level approximate until police/NHAI chainage is received.",
    status: "approved",
    verificationStatus: "under_review",
    confidenceScore: 70,
    accidentFrequency: 1,
    routeRadiusMeters: 2200,
    sourceType: "Community report",
    sourceUrl: "https://english.hindusthansamachar.in/Encyc/2025/10/9/Four-Killed-Three-Injured-as-Two-Cars-Collide-and.php",
    createdAt: "2026-05-23T10:15:00.000Z",
    updatedAt: "2026-05-23T10:15:00.000Z",
  },
  {
    id: "corridor-manpur-slope-nh52",
    location: "Manpur slope section, NH-52 near Mhow",
    lat: 22.4315,
    lng: 75.6211,
    latitude: 22.4315,
    longitude: 75.6211,
    severity: "High",
    type: "Road accident",
    description:
      "Candidate ghat/slope risk near Manpur on the Khargone-Indore corridor; public accident reports mention multi-vehicle crashes around the Manpur area of Mhow tehsil. Needs official DRSC/NHAI validation and exact chainage.",
    status: "approved",
    verificationStatus: "under_review",
    confidenceScore: 68,
    accidentFrequency: 1,
    routeRadiusMeters: 2200,
    sourceType: "Community report",
    sourceUrl: "https://english.hindusthansamachar.in/Encyc/2025/10/9/Four-Killed-Three-Injured-as-Two-Cars-Collide-and.php",
    createdAt: "2026-05-23T10:20:00.000Z",
    updatedAt: "2026-05-23T10:20:00.000Z",
  },
];

const officialMpBlackspots = [
  {
    id: "morth-mp-001-navda-barkheda-dewas",
    location: "Navda Phata to Barkheda Phata, Dewas district, NH-3",
    district: "Dewas",
    policeStation: "Tok Khard",
    lat: 22.986,
    lng: 76.109,
    latitude: 22.986,
    longitude: 76.109,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 1. Reason: road crossing, highly populated area, excessive traffic, high vehicle speed and driver carelessness. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 76,
    accidentFrequency: 10,
    fatalities: 10,
    nhNo: "3",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 1,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 12000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-002-mausan-uldanapulia-jabalpur",
    location: "Mausan, Kachhpura, Barnu Tiraha, Khital, Uldana Pulia, Jabalpur district, NH-7",
    district: "Jabalpur",
    lat: 23.1815,
    lng: 79.9864,
    latitude: 23.1815,
    longitude: 79.9864,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 2. Reason: high speed of vehicles and driver carelessness. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 72,
    accidentFrequency: 10,
    fatalities: 10,
    nhNo: "7",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 2,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 16000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-003-gosalpur-pahreva-jabalpur",
    location: "Kalari, Mohtas, Gosalpur, Sanskara, Pahreva Naka, Jabalpur district, NH-7",
    district: "Jabalpur",
    lat: 23.447,
    lng: 80.072,
    latitude: 23.447,
    longitude: 80.072,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 3. Reason: turning and narrow road. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 74,
    accidentFrequency: 12,
    fatalities: 12,
    nhNo: "7",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 3,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 14000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-004-bajrangwada-bargi-jabalpur",
    location: "Bajrangwada, Bargi Mohala, Jabalpur district, NH-7",
    district: "Jabalpur",
    lat: 22.983,
    lng: 79.875,
    latitude: 22.983,
    longitude: 79.875,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 4. Reason follows the previous record: turning and narrow road. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 74,
    accidentFrequency: 11,
    fatalities: 11,
    nhNo: "7",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 4,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 10000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-005-chakahanala-phutataal-jabalpur",
    location: "Chakahanala, Burjhai Tiraha, Moiliya Tiraha, Phutataal, Jabalpur district, NH-7",
    district: "Jabalpur",
    lat: 23.48,
    lng: 80.106,
    latitude: 23.48,
    longitude: 80.106,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 5. Reason: sharp turning, high density of population and bad road condition. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 72,
    accidentFrequency: 12,
    fatalities: 12,
    nhNo: "7",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 5,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 15000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-006-usvair-kevalachi-jabalpur",
    location: "Usvair Tiraha, Kadrakhada, Kevalachi, Jabalpur district, NH-7",
    district: "Jabalpur",
    lat: 23.42,
    lng: 80.075,
    latitude: 23.42,
    longitude: 80.075,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 6. Reason follows record 5: sharp turning, high population density and bad road condition. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 72,
    accidentFrequency: 19,
    fatalities: 19,
    nhNo: "7",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 6,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 15000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-007-samardha-bhopal",
    location: "Samardha, Bhopal district, NH-12",
    district: "Bhopal",
    lat: 23.1164883,
    lng: 77.5040254,
    latitude: 23.1164883,
    longitude: 77.5040254,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 7. Reason: blind turn and populated area. Coordinates are geocoded from the official place name because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 86,
    accidentFrequency: 12,
    fatalities: 12,
    nhNo: "12",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 7,
    coordinatePrecision: "place_geocoded",
    routeRadiusMeters: 3500,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-008-bagsewaniya-bhopal",
    location: "Bagsewaniya, Bhopal district, NH-12",
    district: "Bhopal",
    lat: 23.1936137,
    lng: 77.4623699,
    latitude: 23.1936137,
    longitude: 77.4623699,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 8. Reason: populated area on both sides of road and openings at NHs without parameters. Coordinates are geocoded from the official place name because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 88,
    accidentFrequency: 16,
    fatalities: 16,
    nhNo: "12",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 8,
    coordinatePrecision: "place_geocoded",
    routeRadiusMeters: 3000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-009-anand-nagar-bhopal",
    location: "Anand Nagar, Bhopal district, NH-12",
    district: "Bhopal",
    lat: 23.2511846,
    lng: 77.4855484,
    latitude: 23.2511846,
    longitude: 77.4855484,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 9. Reason: populated area and business road. Coordinates are geocoded from the official place name because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 88,
    accidentFrequency: 11,
    fatalities: 11,
    nhNo: "12",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 9,
    coordinatePrecision: "place_geocoded",
    routeRadiusMeters: 3000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-010-ayodhya-bypass-bhopal",
    location: "Ayodhya Bypass, Bhopal district, NH-12",
    district: "Bhopal",
    lat: 23.2560846,
    lng: 77.4782617,
    latitude: 23.2560846,
    longitude: 77.4782617,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 10. Reason: movement of small vehicles due to educational and medical institutions on both sides of NH. Coordinates are geocoded from the official place name because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 88,
    accidentFrequency: 13,
    fatalities: 13,
    nhNo: "12",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 10,
    coordinatePrecision: "place_geocoded",
    routeRadiusMeters: 3000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-011-sehore-bypass-bhopal",
    location: "Sehore Bypass, Bhopal district, NH-12",
    district: "Bhopal",
    lat: 23.2853734,
    lng: 77.273845,
    latitude: 23.2853734,
    longitude: 77.273845,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 11. Reason: overspeeding and rural road connecting to NH. Coordinates are geocoded from the official place name because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 82,
    accidentFrequency: 11,
    fatalities: 11,
    nhNo: "12",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 11,
    coordinatePrecision: "place_geocoded",
    routeRadiusMeters: 4500,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-012-malhargarh-mandsaur",
    location: "Malhar Kasba / Malhargarh, Mandsaur district, NH-31",
    district: "Mandsaur",
    lat: 24.282,
    lng: 74.991,
    latitude: 24.282,
    longitude: 74.991,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 12. Reason: high population density on both sides of road and turning point. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 78,
    accidentFrequency: 12,
    fatalities: 12,
    nhNo: "31",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 12,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 7000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-013-suthod-mandsaur",
    location: "Suthod, Mandsaur district, NH-31",
    district: "Mandsaur",
    lat: 24.25,
    lng: 75.05,
    latitude: 24.25,
    longitude: 75.05,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 13. Reason follows record 12: high population density on both sides of road and turning point. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 72,
    accidentFrequency: 10,
    fatalities: 10,
    nhNo: "31",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 13,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 9000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-014-piplia-bottleganj-mandsaur",
    location: "Piplia Mandi Chaupati, Bahi Parshavnath Phanta, Bottleganj Chaupati, Naka No. 10, Mandsaur district, NH-31",
    district: "Mandsaur",
    lat: 24.137,
    lng: 75.105,
    latitude: 24.137,
    longitude: 75.105,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 14. Reason: road crossing and carelessness. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 76,
    accidentFrequency: 13,
    fatalities: 13,
    nhNo: "31",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 14,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 14000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-015-ishvari-kulhari-shivpuri",
    location: "Near village Ishvari and between Kulhari, Shivpuri district, NH-3",
    district: "Shivpuri",
    lat: 25.517,
    lng: 77.721,
    latitude: 25.517,
    longitude: 77.721,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 15. Reason: narrow and bad road condition. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 72,
    accidentFrequency: 13,
    fatalities: 13,
    nhNo: "3",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 15,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 12000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-016-badwas-shivpuri",
    location: "Kasba Badwas / Badarwas, Shivpuri district, NH-3",
    district: "Shivpuri",
    lat: 24.9735,
    lng: 77.565,
    latitude: 24.9735,
    longitude: 77.565,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 16. Reason follows record 15: narrow and bad road condition. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 74,
    accidentFrequency: 12,
    fatalities: 12,
    nhNo: "3",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 16,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 10000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-017-bhagora-amolaha-shivpuri",
    location: "From Bhagora to Amolaha, Shivpuri district, NH-25",
    district: "Shivpuri",
    lat: 25.35,
    lng: 77.85,
    latitude: 25.35,
    longitude: 77.85,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 17. Reason: high speed of vehicles. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 72,
    accidentFrequency: 12,
    fatalities: 12,
    nhNo: "25",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 17,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 12000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-018-keshar-amolaha-veerpur-shivpuri",
    location: "Between Old Keshar Amolaha and Shivhare Dhaba Veerpur, Shivpuri district, NH-25",
    district: "Shivpuri",
    lat: 25.42,
    lng: 77.91,
    latitude: 25.42,
    longitude: 77.91,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 18. Reason follows record 17: high speed of vehicles. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 72,
    accidentFrequency: 10,
    fatalities: 10,
    nhNo: "25",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 18,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 10000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-019-new-amola-shivpuri",
    location: "Between New Amola No. 1 and 2, Shivpuri district, NH-25",
    district: "Shivpuri",
    lat: 25.411195,
    lng: 77.9535479,
    latitude: 25.411195,
    longitude: 77.9535479,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 19. Reason: road crossing and high speed. Coordinates are geocoded from the official place name because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 84,
    accidentFrequency: 14,
    fatalities: 14,
    nhNo: "25",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 19,
    coordinatePrecision: "place_geocoded",
    routeRadiusMeters: 5500,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-020-padora-majhera-shivpuri",
    location: "From Padora to Majhera, Shivpuri district, NH-76",
    district: "Shivpuri",
    lat: 25.427,
    lng: 77.59,
    latitude: 25.427,
    longitude: 77.59,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 20. Reason: high speed of vehicles and sudden appearance of animals on road. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 72,
    accidentFrequency: 16,
    fatalities: 16,
    nhNo: "76",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 20,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 14000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-021-jaitpura-dhar",
    location: "Jaitpura Pulia, Trimurti Crossing, Hatwara Hotel, Rajnandini area, Dhar district, NH-59",
    district: "Dhar",
    lat: 22.601,
    lng: 75.305,
    latitude: 22.601,
    longitude: 75.305,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 21. Reason: narrow pulia and road. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 74,
    accidentFrequency: 11,
    fatalities: 11,
    nhNo: "59",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 21,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 9000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-022-neemuch-unspecified",
    location: "Neemuch district NH-31 official black spot - exact location not specified in source PDF",
    district: "Neemuch",
    lat: 24.6305517,
    lng: 75.1829,
    latitude: 24.6305517,
    longitude: 75.1829,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 22. The public PDF lists district Neemuch, NH-31 and 12 fatalities, but the location/reason cells are blank. Coordinates use Neemuch district anchor with a wider route radius until exact chainage is available.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 60,
    accidentFrequency: 12,
    fatalities: 12,
    nhNo: "31",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 22,
    coordinatePrecision: "district_anchor",
    routeRadiusMeters: 18000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-023-sagar-gram-pulia-neemuch",
    location: "Sagar Gram Pulia, Neemuch district, NH-31",
    district: "Neemuch",
    lat: 24.58,
    lng: 75.1,
    latitude: 24.58,
    longitude: 75.1,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 23. Reason: accidents due to turning of road. Coordinates are corridor-level approximate because the public PDF does not provide lat/lng.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 70,
    accidentFrequency: 10,
    fatalities: 10,
    nhNo: "31",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 23,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 12000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-024-manor-harsa-panna",
    location: "From village Manor to Harsa More, Panna district, NH-75",
    district: "Panna",
    lat: 24.721,
    lng: 80.187,
    latitude: 24.721,
    longitude: 80.187,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 24. Reason: height of ghat, narrow pulia, blind turns and no signage. The source identifies a 16 km stretch; coordinates are corridor-level approximate.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 72,
    accidentFrequency: 15,
    fatalities: 15,
    nhNo: "75",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 24,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 20000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "morth-mp-025-janwar-bahera-panna",
    location: "From village Janwar More to village Bahera, Panna district, NH-75",
    district: "Panna",
    lat: 24.62,
    lng: 80.11,
    latitude: 24.62,
    longitude: 80.11,
    severity: "High",
    type: "Official MoRTH black spot",
    description:
      "Official MoRTH MP black spot record 25. Reason: blind turns and damaged pulia. The source identifies a 7 km stretch; coordinates are corridor-level approximate.",
    status: "approved",
    verificationStatus: "government_verified",
    confidenceScore: 72,
    accidentFrequency: 12,
    fatalities: 12,
    nhNo: "75",
    sourceType: "MoRTH official public PDF",
    sourceUrl: MORTH_MP_BLACKSPOTS_SOURCE_URL,
    sourceRecordNo: 25,
    coordinatePrecision: "corridor_approximate",
    routeRadiusMeters: 12000,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getSeverityMeta(severity) {
  return severityMeta[normalize(severity)] || severityMeta.medium;
}

function getVerificationMeta(status) {
  return verificationMeta[normalize(status)] || verificationMeta.under_review;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getPoint(report) {
  const lat = Number(report.lat ?? report.latitude);
  const lng = Number(report.lng ?? report.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

function distanceInMeters(a, b) {
  const earthRadius = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function distancePointToSegment(point, segmentStart, segmentEnd) {
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos(toRadians(point.lat));
  const startX = (segmentStart.lng - point.lng) * metersPerDegreeLng;
  const startY = (segmentStart.lat - point.lat) * metersPerDegreeLat;
  const endX = (segmentEnd.lng - point.lng) * metersPerDegreeLng;
  const endY = (segmentEnd.lat - point.lat) * metersPerDegreeLat;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const segmentLengthSquared = deltaX * deltaX + deltaY * deltaY;

  if (!segmentLengthSquared) {
    return Math.sqrt(startX * startX + startY * startY);
  }

  const t = Math.max(0, Math.min(1, -(startX * deltaX + startY * deltaY) / segmentLengthSquared));
  const projectedX = startX + t * deltaX;
  const projectedY = startY + t * deltaY;

  return Math.sqrt(projectedX * projectedX + projectedY * projectedY);
}

function distanceToRoute(point, routePoints) {
  if (!point || routePoints.length < 2) {
    return Infinity;
  }

  return routePoints.reduce((nearest, routePoint, index) => {
    if (!index) {
      return nearest;
    }

    return Math.min(nearest, distancePointToSegment(point, routePoints[index - 1], routePoint));
  }, Infinity);
}

function getBlackspotRouteRadius(blackspot, fallbackRadius = DEFAULT_BLACKSPOT_RADIUS_METERS) {
  const requestedRadius = Number(blackspot.routeRadiusMeters || fallbackRadius);
  const precision = normalize(blackspot.coordinatePrecision);

  if (precision === "district_anchor") {
    return 0;
  }

  if (precision === "corridor_approximate") {
    return Math.min(requestedRadius, 2500);
  }

  if (precision === "place_geocoded") {
    return Math.min(requestedRadius, 1800);
  }

  return requestedRadius;
}

function getDangerSegmentRadius(blackspot, fallbackRadius = DEFAULT_BLACKSPOT_RADIUS_METERS) {
  const severityRadius = getSeverityMeta(blackspot.severity).radius + 180;
  const routeRadius = getBlackspotRouteRadius(blackspot, fallbackRadius);

  if (!routeRadius) {
    return 0;
  }

  return Math.min(Math.max(routeRadius, severityRadius), 1400);
}

function normalizeBlackspot(report, defaults = {}) {
  const point = getPoint(report);

  return {
    ...defaults,
    ...report,
    id: report.sourceId || report.id || report._id,
    lat: point?.lat ?? null,
    lng: point?.lng ?? null,
    latitude: point?.lat ?? null,
    longitude: point?.lng ?? null,
    severity: report.severity || "Medium",
    confidenceScore: Number(report.confidenceScore ?? defaults.confidenceScore ?? 62),
    accidentFrequency: Number(report.accidentFrequency ?? defaults.accidentFrequency ?? 1),
    routeRadiusMeters: Number(report.routeRadiusMeters ?? defaults.routeRadiusMeters ?? DEFAULT_BLACKSPOT_RADIUS_METERS),
    sourceType: report.sourceType || defaults.sourceType || "Community report",
    verificationStatus:
      report.verificationStatus ||
      defaults.verificationStatus ||
      (normalize(report.status) === "approved" ? "community_verified" : "under_review"),
  };
}

function mergeBlackspots(reports = []) {
  const seen = new Set();
  const combined = [...khargoneDemoBlackspots, ...officialMpBlackspots, ...reports].map((report) =>
    normalizeBlackspot(report),
  );

  return combined.filter((report) => {
    const key = report.sourceId || report.id || `${normalize(report.location)}-${report.lat}-${report.lng}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return Number.isFinite(report.lat) && Number.isFinite(report.lng);
  });
}

function mergeKhargoneBlackspots(reports = []) {
  return mergeBlackspots(reports);
}

function getRouteBlackspots(routePoints, reports = [], radiusMeters = DEFAULT_BLACKSPOT_RADIUS_METERS) {
  return mergeBlackspots(reports)
    .map((blackspot) => ({
      ...blackspot,
      distanceFromRoute: distanceToRoute({ lat: blackspot.lat, lng: blackspot.lng }, routePoints),
    }))
    .filter((blackspot) => blackspot.distanceFromRoute <= getBlackspotRouteRadius(blackspot, radiusMeters))
    .sort((a, b) => {
      const severityDelta = getSeverityMeta(a.severity).order - getSeverityMeta(b.severity).order;
      return severityDelta || a.distanceFromRoute - b.distanceFromRoute;
    });
}

function calculateRouteSafety(blackspots, routeDistanceMeters = 0) {
  const breakdown = blackspots.reduce(
    (acc, blackspot) => {
      acc[normalize(blackspot.severity) || "medium"] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 },
  );
  const rawScore = blackspots.reduce((score, blackspot) => {
    const severity = getSeverityMeta(blackspot.severity);
    const confidenceBoost = Math.min(Number(blackspot.confidenceScore || 60), 100) / 100;
    const distanceFactor = Math.max(0.45, 1 - (blackspot.distanceFromRoute || 0) / 1000);
    return score + severity.score * confidenceBoost * distanceFactor;
  }, 0);
  const routePenalty = routeDistanceMeters > 12000 ? 0.88 : 1;
  const dangerScore = Math.min(100, Math.round(rawScore * routePenalty));
  const safetyScore = Math.max(0, 100 - dangerScore);
  const safetyLevel = dangerScore >= 58 ? "Dangerous" : dangerScore >= 28 ? "Moderate" : "Safe";

  return {
    breakdown,
    dangerScore,
    safetyScore,
    safetyLevel,
    totalDangerousSpots: blackspots.length,
  };
}

function getDangerousRouteSegments(routePoints, blackspots, radiusMeters = DEFAULT_BLACKSPOT_RADIUS_METERS) {
  if (routePoints.length < 2 || !blackspots.length) {
    return [];
  }

  return routePoints.slice(1).reduce((segments, point, index) => {
    const previous = routePoints[index];
    const midpoint = {
      lat: (previous.lat + point.lat) / 2,
      lng: (previous.lng + point.lng) / 2,
    };
    const nearby = blackspots.find((blackspot) => {
      const segmentRadius = getDangerSegmentRadius(blackspot, radiusMeters);

      if (!segmentRadius) {
        return false;
      }

      return distancePointToSegment(
        { lat: blackspot.lat, lng: blackspot.lng },
        previous,
        point,
      ) <= segmentRadius;
    });

    if (
      nearby &&
      distanceInMeters(midpoint, { lat: nearby.lat, lng: nearby.lng }) <=
        getDangerSegmentRadius(nearby, radiusMeters) * 1.25
    ) {
      segments.push({
        points: [
          [previous.lat, previous.lng],
          [point.lat, point.lng],
        ],
        severity: nearby.severity,
      });
    }

    return segments;
  }, []);
}

function clusterBlackspots(blackspots, radiusMeters = 420) {
  const clusters = [];

  blackspots.forEach((blackspot) => {
    const point = { lat: blackspot.lat, lng: blackspot.lng };
    const cluster = clusters.find((item) => distanceInMeters(item.center, point) <= radiusMeters);

    if (cluster) {
      cluster.items.push(blackspot);
      cluster.center = {
        lat: cluster.items.reduce((sum, item) => sum + item.lat, 0) / cluster.items.length,
        lng: cluster.items.reduce((sum, item) => sum + item.lng, 0) / cluster.items.length,
      };
    } else {
      clusters.push({ center: point, items: [blackspot] });
    }
  });

  return clusters;
}

function findNearbyRisks(origin, reports = [], limit = 5) {
  if (!origin) {
    return [];
  }

  return mergeBlackspots(reports)
    .map((blackspot) => ({
      ...blackspot,
      distanceFromUser: distanceInMeters(origin, { lat: blackspot.lat, lng: blackspot.lng }),
    }))
    .sort((a, b) => a.distanceFromUser - b.distanceFromUser)
    .slice(0, limit);
}

function isDuplicateRiskReport(candidate, existingReports = [], radiusMeters = 180) {
  const candidatePoint = getPoint(candidate);
  const candidateLocation = normalize(candidate.location);

  return existingReports.some((report) => {
    const point = getPoint(report);
    const sameText =
      candidateLocation &&
      normalize(report.location) &&
      (normalize(report.location).includes(candidateLocation) ||
        candidateLocation.includes(normalize(report.location)));

    if (candidatePoint && point && distanceInMeters(candidatePoint, point) <= radiusMeters) {
      return true;
    }

    return sameText && normalize(report.type) === normalize(candidate.type);
  });
}

function formatMeters(meters) {
  if (!Number.isFinite(meters)) {
    return "Unknown";
  }

  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export {
  DEFAULT_BLACKSPOT_RADIUS_METERS,
  KHARGONE_CENTER,
  calculateRouteSafety,
  clusterBlackspots,
  distanceInMeters,
  distanceToRoute,
  findNearbyRisks,
  formatMeters,
  getDangerousRouteSegments,
  getRouteBlackspots,
  getSeverityMeta,
  getVerificationMeta,
  isDuplicateRiskReport,
  khargoneDemoBlackspots,
  mergeBlackspots,
  mergeKhargoneBlackspots,
  normalize,
  officialMpBlackspots,
  roadSafetyScope,
};
