/**
 * Industry & Peer Benchmark Mock Data (Single Source of Truth)
 * Aligned strictly with 101 kgCO2e / metric ton product
 */

export const benchmarkMock = {
  facility_id: 'FAC-8842',
  sector: 'Alloy & Steel Fabrication',
  intensity_unit: 'kgCO₂e / metric ton product',

  // Industry-wide benchmark
  industry_benchmark: {
    facility_intensity: 101, // kgCO2e / metric ton product
    benchmark_average: 85, // kgCO2e / metric ton product
    difference_percent: 18.8, // (101 - 85) / 85 * 100 = 18.82%
    performance: 'Above Sector Average',
    status_summary: 'Facility emits 18.8% more carbon per metric ton of product than the regional industry benchmark.',
    top_performers_average: 68,
  },

  // Peer cluster comparison (Backend clustered)
  peer_cluster: {
    cluster_name: 'Cluster 2: Medium-Heavy Precision Casting',
    similar_facility_count: 24,
    facility_intensity: 101,
    cluster_average: 88,
    gap_percent: 14.8, // (101 - 88) / 88 * 100 = 14.77%
    cluster_min: 71,
    cluster_max: 128,
    cluster_description: 'Comparative group of 24 induction melting and casting plants operating in western industrial zones with 30k-60k metric ton annual output.',
  },

  // Post-intervention projection
  projected_intensity_with_action: 75.4, // kgCO2e / metric ton product (places facility in top quartile)
};
