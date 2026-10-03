import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

import { io, Socket } from 'socket.io-client';

export interface AdminConsultationSession {
  sessionId: string;
  appointmentId: string;
  roomId: string;
  status: string;
  doctorName?: string;
  doctorId?: string;
  doctorSpecialization?: string;
  patientName?: string;
  patientId?: string;
  patientPhone?: string;
  connectedAt?: string | Date;
  patientJoinedAt?: string | Date;
  googleMeetUrl?: string;
  videoProvider?: string;
  durationSeconds?: number;
  recordsCount?: number;
  prescriptionIssued?: boolean;
}

@Component({
  selector: 'app-teleconsultation-monitor',
  templateUrl: './teleconsultation-monitor.component.html',
  styleUrls: ['./teleconsultation-monitor.component.scss'],
})
export class TeleconsultationMonitorComponent implements OnInit, OnDestroy {
  public sessions: AdminConsultationSession[] = [];
  public loading: boolean = false;
  public totalActive: number = 0;
  public totalWaiting: number = 0;
  public totalFallback: number = 0;
  public autoRefreshEnabled: boolean = true;
  private refreshTimer: any = null;
  private socket: Socket | null = null;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initSocket();
    this.fetchActiveSessions();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private initSocket(): void {
    try {
      const socketUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? 'http://localhost:8080'
        : (environment.API_BASE_URL.replace(/\/api\/?$/, ''));

      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
      });

      this.socket.on('connect', () => {
        console.log('[Admin Monitor] Socket connected, registering admin presence...');
        this.socket?.emit('admin:register');
      });

      this.socket.on('admin:initial-sessions', (sessions: AdminConsultationSession[]) => {
        console.log('[Admin Monitor] Initial sessions received:', sessions);
        if (Array.isArray(sessions)) {
          this.sessions = sessions;
          this.computeStats();
        }
      });

      this.socket.on('admin:session-updated', (updated: any) => {
        console.log('[Admin Monitor] Real-time session updated:', updated);
        if (!updated || !updated.appointmentId) return;

        const apptId = String(updated.appointmentId);
        if (updated.status === 'ENDED') {
          this.sessions = this.sessions.filter((s) => String(s.appointmentId) !== apptId);
        } else {
          const idx = this.sessions.findIndex((s) => String(s.appointmentId) === apptId);
          if (idx >= 0) {
            this.sessions[idx] = { ...this.sessions[idx], ...updated };
          } else {
            this.sessions.unshift({
              sessionId: updated.sessionId || `sess_${apptId}`,
              appointmentId: apptId,
              roomId: updated.roomId || `room_${apptId}`,
              status: updated.status || 'WAITING',
              doctorName: updated.doctorName || 'Doctor',
              doctorId: updated.doctorId || '',
              patientName: updated.patientName || 'Patient',
              patientId: updated.patientId || '',
              patientPhone: updated.patientPhone || '',
              connectedAt: updated.connectedAt,
              patientJoinedAt: updated.patientJoinedAt || updated.joinedAt,
              googleMeetUrl: updated.googleMeetUrl,
              videoProvider: updated.videoProvider || 'native_webrtc',
              recordsCount: updated.recordsCount || 0,
              prescriptionIssued: !!updated.prescriptionIssued,
            });
          }
        }
        this.computeStats();
      });
    } catch (err) {
      console.warn('[Admin Monitor] Socket initialization error:', err);
    }
  }

  public fetchActiveSessions(): void {
    this.loading = true;
    const apiBase = environment.API_BASE_URL.endsWith('/')
      ? environment.API_BASE_URL
      : `${environment.API_BASE_URL}/`;
    const url = `${apiBase}v1/consultation/admin/active-sessions`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.loading = false;
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.result)
          ? res.result
          : (res?.data?.activeSessions || res?.result?.activeSessions || []);
        
        if (Array.isArray(list)) {
          this.sessions = list;
          this.computeStats();
        }
      },
      error: (err) => {
        this.loading = false;
        console.warn('[AdminTeleconsultation] Fetch error:', err);
      },
    });
  }

  private computeStats(): void {
    this.totalActive = this.sessions.filter((s) => s.status === 'CONNECTED' || s.status === 'CONNECTING').length;
    this.totalWaiting = this.sessions.filter((s) => s.status === 'WAITING' || s.status === 'PATIENT_JOINED').length;
    this.totalFallback = this.sessions.filter((s) => !!s.googleMeetUrl).length;
  }

  public toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
      this.toastr.info('Live auto-refresh enabled');
    } else {
      if (this.refreshTimer) clearInterval(this.refreshTimer);
      this.toastr.info('Live auto-refresh paused');
    }
  }

  private startAutoRefresh(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = setInterval(() => {
      if (this.autoRefreshEnabled) {
        this.fetchActiveSessions();
      }
    }, 5000);
  }

  public forceEndSession(session: AdminConsultationSession): void {
    const reason = prompt('Enter termination reason (for audit compliance):', 'Superadmin forced termination');
    if (reason === null) return; // user cancelled

    const apiBase = environment.API_BASE_URL.endsWith('/')
      ? environment.API_BASE_URL
      : `${environment.API_BASE_URL}/`;
    const url = `${apiBase}v1/consultation/admin/force-end/${session.appointmentId}`;

    this.http.post<any>(url, { reason }).subscribe({
      next: (res) => {
        this.toastr.success(`Session ${session.appointmentId} has been terminated.`);
        this.fetchActiveSessions();
      },
      error: (err) => {
        console.error('[Admin] Force end failed:', err);
        this.toastr.error('Failed to terminate session. Check server logs.');
      },
    });
  }

  public copyLink(url?: string): void {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.toastr.success('Link copied to clipboard');
    });
  }

  public formatDuration(startTime?: string | Date): string {
    if (!startTime) return '00:00';
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const elapsed = Math.max(0, Math.floor((now - start) / 1000));
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
