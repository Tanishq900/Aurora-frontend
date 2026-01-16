import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuroraMap from '../../components/AuroraMap';
import { securityRequestsService, SecurityRegistrationRequest } from '../../services/security-requests.service';
import { useAuthStore } from '../../state/auth.store';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SecurityRegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    loadRequests();
  }, [user, navigate]);

  const loadRequests = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await securityRequestsService.adminList();
      setRequests(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const approve = async (id: string) => {
    try {
      const updated = await securityRequestsService.adminApprove(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to approve request';
      alert(msg);
    }
  };

  const markers = useMemo(() => {
    return requests
      .map((r) => {
        const lat = Number((r.location as any)?.lat);
        const lng = Number((r.location as any)?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const riskScore = r.status === 'pending' ? 30 : r.status === 'approved' ? 10 : 60;
        return { id: r.id, lat, lng, riskScore };
      })
      .filter(Boolean) as Array<{ id: string; lat: number; lng: number; riskScore: number }>;
  }, [requests]);

  return (
    <div className="min-h-screen aurora-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass-panel px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold aurora-text">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Security registration approvals</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={loadRequests}
              className="px-4 py-2 bg-secondary/60 hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border/50"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-secondary/60 hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border/50"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/20 border border-destructive/40 text-destructive-foreground px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Request Locations</h2>
            <AuroraMap height="420px" sosMarkers={markers} enableGeolocation={false} />
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Requests</h2>

            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="text-muted-foreground">No requests yet.</div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="bg-secondary/40 border border-border/50 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-foreground font-semibold">{r.email}</div>
                        <div className="text-sm text-muted-foreground">Status: {r.status}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(r.created_at).toLocaleString()}
                        </div>
                      </div>

                      {r.status === 'pending' ? (
                        <button
                          onClick={() => approve(r.id)}
                          className="px-3 py-2 bg-secondary/60 hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border/50"
                        >
                          Approve
                        </button>
                      ) : (
                        <div className="text-sm text-muted-foreground">{r.approved_by ? `By ${r.approved_by}` : ''}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
