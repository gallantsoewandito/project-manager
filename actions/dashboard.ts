import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
  try {
    const [totalProjects, activeTasks, pendingReview] = await Promise.all([
      prisma.project.count(),
      prisma.task.count({ where: { status: { not: 'DONE' } } }),
      prisma.task.count({ where: { status: 'REVIEW' } }),
    ]);

    return {
      totalProjects,
      activeTasks,
      pendingReview,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return { totalProjects: 0, activeTasks: 0, pendingReview: 0 };
  }
}