import { Response } from 'express';
import { dbStore } from '../services/dataStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.userId;
  // Return notifications for this user or broadcast notifications
  const userNotifs = dbStore.notifications.filter(
    (n) => n.userId === userId || n.userId === 'user-01'
  );

  const unreadCount = userNotifs.filter((n) => !n.read).length;

  res.json({
    success: true,
    data: userNotifs,
    unreadCount,
  });
}

export async function markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const notif = dbStore.notifications.find((n) => n.id === id);

  if (notif) {
    notif.read = true;
  }

  res.json({ success: true, message: 'Notification marked as read' });
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.userId;
  dbStore.notifications.forEach((n) => {
    if (n.userId === userId || n.userId === 'user-01') {
      n.read = true;
    }
  });

  res.json({ success: true, message: 'All notifications marked as read' });
}
