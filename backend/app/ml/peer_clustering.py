import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


class PeerClusterEngine:
    """
    Statistically Defensible K-Means Peer Benchmarking Engine.
    Requires genuine multi-facility telemetry datasets.
    Zero synthetic or randomly generated peers.
    """

    MIN_ELIGIBLE_PEER_COUNT = 10
    MIN_OBSERVATIONS_PER_PEER = 100
    MIN_FEATURE_VARIANCE = 0.05

    def __init__(self):
        self.scaler = StandardScaler()

    @staticmethod
    def evaluate_defensibility(
        peer_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluate whether the available peer pool meets statistical clustering criteria:
        1. Minimum eligible peer count (>= 10 facilities in same sector)
        2. Minimum observations per facility (>= 100 records)
        3. Feature completeness and non-zero variance (> 0.05)
        """
        peer_count = len(peer_data)
        eligible_peers = [
            p for p in peer_data 
            if p.get("observation_count", 0) >= PeerClusterEngine.MIN_OBSERVATIONS_PER_PEER
            and p.get("intensity", 0.0) > 0.0
        ]
        eligible_count = len(eligible_peers)

        if eligible_count < PeerClusterEngine.MIN_ELIGIBLE_PEER_COUNT:
            return {
                "is_defensible": False,
                "reason": (
                    f"Insufficient peer facilities in this industrial sector. "
                    f"Statistically defensible K-Means clustering requires at least "
                    f"{PeerClusterEngine.MIN_ELIGIBLE_PEER_COUNT} comparable facilities with >= "
                    f"{PeerClusterEngine.MIN_OBSERVATIONS_PER_PEER} telemetry readings each. "
                    f"Found {eligible_count} eligible peer(s)."
                ),
                "peer_count": eligible_count,
                "required_peers": PeerClusterEngine.MIN_ELIGIBLE_PEER_COUNT,
                "observation_depth_met": all(p.get("observation_count", 0) >= PeerClusterEngine.MIN_OBSERVATIONS_PER_PEER for p in eligible_peers) if eligible_peers else False,
                "variance_threshold_met": False
            }

        # Check feature matrix variance
        features = np.array([
            [p["production_volume"], p["electricity_intensity"], p.get("fuel_intensity", 0.0), p["intensity"]]
            for p in eligible_peers
        ])
        variances = np.var(features, axis=0)
        variance_met = bool(np.all(variances > PeerClusterEngine.MIN_FEATURE_VARIANCE))

        if not variance_met:
            return {
                "is_defensible": False,
                "reason": "Peer feature variance across the cohort is too low for distinct cluster separation.",
                "peer_count": eligible_count,
                "required_peers": PeerClusterEngine.MIN_ELIGIBLE_PEER_COUNT,
                "observation_depth_met": True,
                "variance_threshold_met": False
            }

        return {
            "is_defensible": True,
            "peer_count": eligible_count,
            "required_peers": PeerClusterEngine.MIN_ELIGIBLE_PEER_COUNT,
            "observation_depth_met": True,
            "variance_threshold_met": True,
            "features": features
        }

    def cluster_facility(
        self,
        target_facility: Dict[str, Any],
        peer_pool: List[Dict[str, Any]],
        sector_baseline: float
    ) -> Dict[str, Any]:
        """
        Group facility into peer cohort using K-Means if defensible,
        otherwise return an honest 'insufficient_data' state.
        Zero synthetic or fabricated data is generated.
        """
        validation = self.evaluate_defensibility(peer_pool)
        if not validation["is_defensible"]:
            return {
                "status": "insufficient_data",
                "has_peer_data": False,
                "cluster_label": "Unassigned",
                "cluster_name": "Insufficient Benchmark Peers",
                "message": validation["reason"],
                "peer_count": validation["peer_count"],
                "required_peer_count": validation["required_peers"],
                "criteria_status": {
                    "eligible_peers_met": validation["peer_count"] >= PeerClusterEngine.MIN_ELIGIBLE_PEER_COUNT,
                    "observation_depth_met": validation["observation_depth_met"],
                    "variance_threshold_met": validation["variance_threshold_met"]
                },
                "facility_intensity": round(target_facility.get("intensity", 0.0), 2),
                "cohort_average_intensity": round(sector_baseline, 2),
                "gap_percent": 0.0,
                "peer_characteristics": {
                    "cohort_size": validation["peer_count"],
                    "note": "K-Means clustering disabled until real sector peer threshold is satisfied."
                }
            }

        # Genuine clustering on real peers
        peer_features = validation["features"]
        target_features = np.array([[
            target_facility["production_volume"],
            target_facility["electricity_intensity"],
            target_facility.get("fuel_intensity", 0.0),
            target_facility["intensity"]
        ]])

        all_points = np.vstack([peer_features, target_features])
        scaled_points = self.scaler.fit_transform(all_points)

        k = min(3, len(peer_features) // 3)
        model = KMeans(n_clusters=k, random_state=42, n_init="auto")
        model.fit(scaled_points[:-1])
        target_cluster = int(model.predict(scaled_points[-1:])[0])

        cluster_labels = model.labels_
        peer_mask = cluster_labels == target_cluster
        assigned_peers_intensity = peer_features[peer_mask, 3]
        cluster_avg_intensity = float(np.mean(assigned_peers_intensity)) if len(assigned_peers_intensity) > 0 else sector_baseline

        facility_intensity = target_facility["intensity"]
        gap_percent = round(((facility_intensity - cluster_avg_intensity) / cluster_avg_intensity) * 100, 1) if cluster_avg_intensity > 0 else 0.0

        # Rank clusters by centroid intensity
        cluster_centers_intensity = [float(np.mean(peer_features[cluster_labels == i, 3])) for i in range(k)]
        sorted_indices = np.argsort(cluster_centers_intensity)

        if target_cluster == sorted_indices[0]:
            cluster_name = "Top-Decile Clean Producers"
        elif target_cluster == sorted_indices[-1]:
            cluster_name = "High Carbon Intensity Cohort"
        else:
            cluster_name = "Median Industry Cohort"

        return {
            "status": "success",
            "has_peer_data": True,
            "cluster_id": target_cluster + 1,
            "cluster_label": f"Cluster {target_cluster + 1}",
            "cluster_name": cluster_name,
            "similar_facility_count": int(np.sum(peer_mask)),
            "facility_intensity": round(facility_intensity, 2),
            "cluster_average": round(cluster_avg_intensity, 2),
            "gap_percent": gap_percent,
            "peer_characteristics": {
                "cohort_size": int(np.sum(peer_mask)),
                "cluster_k": k,
                "validation": "Statistically defensible multi-facility cluster"
            }
        }
