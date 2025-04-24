import { Task, Column, Lane } from './types';

// Moved 'backlog' to the beginning
export const initialColumns: Column[] = [
  { id: 'backlog', title: 'DA FARE NON URGENTI' },
  { id: 'todo', title: 'Da Fare' },
  { id: 'inprogress', title: 'In Corso' },
  { id: 'review', title: 'Pronto per Revisione' },
  { id: 'clientreview', title: 'Revisione Cliente' },
  { id: 'done', title: 'Fatto' },
];

export const initialLanes: Lane[] = [
  { id: 'ideation', title: 'Ideazione' },
  { id: 'visual', title: 'Visual (video, grafica, foto)' },
  { id: 'copy', title: 'Copy' },
  { id: 'scheduling', title: 'Programmazione' },
];

export const initialTasks: Task[] = [
  { id: 'task-1', content: 'Brainstorm campagne Q4', columnId: 'backlog', laneId: 'ideation', priority: 'medium' },
  { id: 'task-2', content: 'Creare moodboard video prodotto', columnId: 'todo', laneId: 'visual', priority: 'high', tags: ['video', 'prodotto-x'] },
  { id: 'task-3', content: 'Scrivere copy post blog lancio', columnId: 'inprogress', laneId: 'copy', dueDate: '2024-08-15' },
  { id: 'task-4', content: 'Pianificare post social media settimana prossima', columnId: 'todo', laneId: 'scheduling' },
  { id: 'task-5', content: 'Revisionare bozza grafica evento', columnId: 'review', laneId: 'visual', priority: 'high' },
  { id: 'task-6', content: 'Finalizzare script video testimonianza', columnId: 'clientreview', laneId: 'copy' },
  { id: 'task-7', content: 'Analizzare performance campagna email', columnId: 'done', laneId: 'ideation', tags: ['analisi', 'email'] },
  { id: 'task-8', content: 'Shooting fotografico nuovi arrivi', columnId: 'inprogress', laneId: 'visual', dueDate: '2024-08-10' },
];
