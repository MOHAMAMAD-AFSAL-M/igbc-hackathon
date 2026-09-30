"""
Cluster API routes.
"""
from fastapi import APIRouter, HTTPException
from ..services import cluster_service

router = APIRouter(prefix="/clusters", tags=["clusters"])


@router.get("/")
def get_clusters():
    """Return all clusters with aggregate capacity data."""
    return cluster_service.get_all_clusters()


@router.get("/{cluster_id}")
def get_cluster(cluster_id: str):
    """Return a single cluster with capacity data."""
    data = cluster_service.get_cluster_by_id(cluster_id)
    if not data:
        raise HTTPException(status_code=404, detail="Cluster not found")
    return data


@router.get("/{cluster_id}/prosumers")
def get_cluster_prosumers(cluster_id: str):
    """Return prosumers belonging to a cluster."""
    return cluster_service.get_cluster_prosumers(cluster_id)
