import AccidentReport from "../models/AccidentReport.js";
import seedBlackspots from "../data/seedBlackspots.js";

const SEED_REPORTER_EMAIL = "seed@routeraksha.local";
const SEED_REPORTER_NAME = "RouteRaksha Source Layer";

function toSeedDocument(blackspot) {
  return {
    location: blackspot.location,
    latitude: blackspot.latitude,
    longitude: blackspot.longitude,
    type: blackspot.type || "Road accident",
    severity: blackspot.severity || "High",
    description: blackspot.description,
    accidentTime: blackspot.accidentTime || "",
    lightCondition: blackspot.lightCondition || "Unknown",
    notes: blackspot.notes || "",
    imageData: "",
    confidenceScore: blackspot.confidenceScore ?? 70,
    accidentFrequency: blackspot.accidentFrequency ?? 1,
    routeRadiusMeters: blackspot.routeRadiusMeters ?? 650,
    sourceId: blackspot.sourceId,
    sourceUrl: blackspot.sourceUrl || "",
    dataOrigin: "seed_blackspot",
    sourceType: blackspot.sourceType || "Government data",
    verificationStatus: blackspot.verificationStatus || "under_review",
    status: "approved",
    reporterName: SEED_REPORTER_NAME,
    reporterEmail: SEED_REPORTER_EMAIL,
    reviewedBy: "System seed",
    reviewedAt: new Date(),
    approvedAt: new Date(),
    declinedAt: null,
  };
}

async function seedInitialBlackspots() {
  const operations = seedBlackspots.map((blackspot) => ({
    updateOne: {
      filter: { sourceId: blackspot.sourceId },
      update: {
        $set: toSeedDocument(blackspot),
        $setOnInsert: { createdAt: new Date() },
      },
      upsert: true,
    },
  }));

  if (!operations.length) {
    return { upserted: 0, modified: 0 };
  }

  const result = await AccidentReport.bulkWrite(operations, { ordered: false });

  return {
    upserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
  };
}

export { seedInitialBlackspots };
