import { Injectable } from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Vue d'ensemble pour le tableau de bord admin.
   */
  async getStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsers30d,
      totalCompanies,
      pendingCompanies,
      eventsByStatus,
      upcomingEvents,
      totalFavorites,
      totalCategories,
      totalPlaces,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.company.count(),
      this.prisma.company.count({ where: { isValidated: false } }),
      this.prisma.event.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.event.count({
        where: { status: EventStatus.PUBLISHED, date: { gte: new Date() } },
      }),
      this.prisma.userFavorite.count(),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.place.count(),
    ]);

    // Toujours renvoyer les 5 statuts, même à zéro
    const statusCounts = Object.fromEntries(
      Object.values(EventStatus).map(status => [
        status,
        eventsByStatus.find(row => row.status === status)?._count._all ?? 0,
      ]),
    ) as Record<EventStatus, number>;

    return {
      users: { total: totalUsers, last30Days: newUsers30d },
      companies: { total: totalCompanies, pendingValidation: pendingCompanies },
      events: {
        byStatus: statusCounts,
        upcomingPublished: upcomingEvents,
        pendingModeration: statusCounts.PENDING,
      },
      favorites: { total: totalFavorites },
      categories: { active: totalCategories },
      places: { total: totalPlaces },
    };
  }
}
