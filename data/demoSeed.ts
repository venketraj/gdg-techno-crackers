import type { DemoUser, IssueClusterRow, IssueValidationRow, ReportRow, SensitivePlaceRow } from "@/types";

const seedNow = "2026-07-04T06:00:00.000Z";

export const demoSeed = {
  sensitivePlaces: [
    {
      id: "seed-sensitive-school",
      name: "Demo Government School",
      place_type: "school",
      latitude: 9.9301,
      longitude: 78.1206,
      weight: 10
    },
    {
      id: "seed-sensitive-health-centre",
      name: "Demo Primary Health Centre",
      place_type: "hospital",
      latitude: 9.9235,
      longitude: 78.1189,
      weight: 12
    },
    {
      id: "seed-sensitive-bus-stand",
      name: "Demo Bus Stand",
      place_type: "bus_stand",
      latitude: 9.9257,
      longitude: 78.1217,
      weight: 6
    }
  ] satisfies SensitivePlaceRow[],

  clusters: [
    {
      id: "seed-cluster-road-damage",
      category: "road_damage",
      center_latitude: 9.93005,
      center_longitude: 78.12045,
      report_count: 23,
      priority_score: 91,
      severity: "critical",
      status: "received",
      assigned_department: "Public Works / Highways",
      latest_reason: "Large pothole near school zone; repeated citizen reports.",
      created_at: "2026-07-03T12:00:00.000Z",
      updated_at: seedNow
    },
    {
      id: "seed-cluster-garbage",
      category: "garbage",
      center_latitude: 9.9229,
      center_longitude: 78.1195,
      report_count: 12,
      priority_score: 67,
      severity: "high",
      status: "assigned",
      assigned_department: "Municipality Sanitation",
      latest_reason: "Garbage pile visible near market area.",
      created_at: "2026-07-02T06:00:00.000Z",
      updated_at: seedNow
    },
    {
      id: "seed-cluster-drain-blockage",
      category: "drain_blockage",
      center_latitude: 9.9279,
      center_longitude: 78.124,
      report_count: 8,
      priority_score: 76,
      severity: "high",
      status: "received",
      assigned_department: "Drainage / Stormwater Department",
      latest_reason: "Blocked stormwater drain with rainfall risk.",
      created_at: "2026-07-03T22:00:00.000Z",
      updated_at: seedNow
    }
  ] satisfies IssueClusterRow[],

  reports: [] satisfies ReportRow[],

  users: [
    {
      id: "admin-madurai",
      name: "Madurai Admin",
      phone: "9999990000",
      ward: "All Wards",
      role: "admin",
      score: 0,
      reportsSubmitted: 0,
      reportsValidated: 0,
      title: null
    },
    {
      id: "citizen-meena",
      name: "Meena R",
      phone: "9000011111",
      ward: "Ward 12",
      role: "citizen",
      score: 142,
      reportsSubmitted: 15,
      reportsValidated: 11,
      title: "Voice of Madurai"
    },
    {
      id: "citizen-arun",
      name: "Arun Kumar",
      phone: "9000022222",
      ward: "Ward 8",
      role: "citizen",
      score: 96,
      reportsSubmitted: 12,
      reportsValidated: 7,
      title: null
    },
    {
      id: "citizen-nisha",
      name: "Nisha Fathima",
      phone: "9000033333",
      ward: "Ward 18",
      role: "citizen",
      score: 74,
      reportsSubmitted: 9,
      reportsValidated: 5,
      title: null
    },
    {
      id: "citizen-selvam",
      name: "Selvam P",
      phone: "9000044444",
      ward: "Ward 4",
      role: "citizen",
      score: 61,
      reportsSubmitted: 8,
      reportsValidated: 4,
      title: null
    },
    {
      id: "citizen-priya",
      name: "Priya S",
      phone: "9000055555",
      ward: "Ward 21",
      role: "citizen",
      score: 48,
      reportsSubmitted: 6,
      reportsValidated: 3,
      title: null
    }
  ] satisfies DemoUser[],

  validations: [
    {
      id: "seed-validation-road",
      report_id: "seed-report-road",
      cluster_id: "seed-cluster-road-damage",
      user_id: "citizen-arun",
      user_name: "Arun Kumar",
      description: "Deep pothole near the school entrance.",
      category: "road_damage",
      severity: "critical",
      image_url: "",
      latitude: 9.93005,
      longitude: 78.12045,
      authenticity_score: 86,
      status: "pending",
      admin_note: null,
      created_at: "2026-07-04T04:00:00.000Z",
      validated_at: null
    },
    {
      id: "seed-validation-garbage",
      report_id: "seed-report-garbage",
      cluster_id: "seed-cluster-garbage",
      user_id: "citizen-nisha",
      user_name: "Nisha Fathima",
      description: "Garbage is blocking the market side lane.",
      category: "garbage",
      severity: "high",
      image_url: "",
      latitude: 9.9229,
      longitude: 78.1195,
      authenticity_score: 78,
      status: "pending",
      admin_note: null,
      created_at: "2026-07-04T01:00:00.000Z",
      validated_at: null
    }
  ] satisfies IssueValidationRow[]
};
