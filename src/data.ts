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

export const initialTasks: Task[] = [];
