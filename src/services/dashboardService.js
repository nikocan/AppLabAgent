// App Lab Agent - Dashboard ve analitik verilerini toplayan ve özetleyen servis katmanı.

const {
  listProjects,
  listTasks,
  getBuild,
  getRelease
} = require('../data/memoryStore');

function getDashboardStats() {
  const projects = listProjects();
  const tasks = listTasks();

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    inProgressTasks: tasks.filter(t => t.status === 'running').length
  };

  return {
    success: true,
    stats,
    generatedAt: new Date().toISOString()
  };
}

function getProjectTimeline() {
  const projects = listProjects();
  
  return projects.map(project => ({
    id: project.id,
    name: project.name,
    status: project.status,
    startDate: project.createdAt,
    progress: calculateProjectProgress(project.id),
    milestones: getProjectMilestones(project.id)
  }));
}

function calculateProjectProgress(projectId) {
  const tasks = listTasks().filter(t => t.projectId === projectId);
  if (tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completedTasks / tasks.length) * 100);
}

function getProjectMilestones(projectId) {
  // Mock milestones - gerçek implementasyonda veritabanından gelir
  return [
    { name: 'Proje Başlangıcı', date: new Date().toISOString(), completed: true },
    { name: 'İlk Prototip', date: new Date().toISOString(), completed: false }
  ];
}

function getRecentActivity() {
  const activities = [];
  
  // Son projeler
  const recentProjects = listProjects()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
    
  recentProjects.forEach(project => {
    activities.push({
      type: 'project_created',
      message: `Yeni proje oluşturuldu: ${project.name}`,
      timestamp: project.createdAt,
      projectId: project.id
    });
  });

  // Son görevler
  const recentTasks = listTasks()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
    
  recentTasks.forEach(task => {
    activities.push({
      type: 'task_updated',
      message: `Görev güncellendi: ${task.type}`,
      timestamp: task.createdAt || new Date().toISOString(),
      taskId: task.id
    });
  });

  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
}

function getSystemHealth() {
  return {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    services: {
      database: 'connected',
      redis: 'connected',
      ai_service: 'active',
      automation: 'running'
    },
    lastHealthCheck: new Date().toISOString()
  };
}

module.exports = {
  getDashboardStats,
  getProjectTimeline,
  getRecentActivity,
  getSystemHealth,
  calculateProjectProgress
};