import { request } from '../lib/request';

export type AnnouncementType = 'warning' | 'info' | 'danger' | 'success';
export type AnnouncementStatus = 'draft' | 'published';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export const announcementApi = {
  getList: (status?: AnnouncementStatus) => {
    return request.get<Announcement[]>('/announcements', { params: status ? { status } : {} });
  },
  getDetail: (id: number) => {
    return request.get<Announcement>(`/announcements/${id}`);
  },
  create: (data: { title: string; content: string; type?: AnnouncementType; status?: AnnouncementStatus; created_by: number }) => {
    return request.post<Announcement>('/announcements', data);
  },
  update: (id: number, data: { title?: string; content?: string; type?: AnnouncementType; status?: AnnouncementStatus; updated_by?: number }) => {
    return request.put<Announcement>(`/announcements/${id}`, data);
  },
  publish: (id: number, userId: number) => {
    return request.put<Announcement>(`/announcements/${id}/publish`, { user_id: userId });
  },
  delete: (id: number) => {
    return request.delete<{ id: number }>(`/announcements/${id}`);
  },
};