import { initializeApp } from 'firebase-admin/app';
initializeApp();

// Importar serviços de matérias
import { createSubject } from './services/subjects/create.js';
import { updateSubject } from './services/subjects/update.js';
import { deleteSubject } from './services/subjects/delete.js';

// Importar serviços de notas
import { addGrade } from './services/grades/create.js';
import { updateGrade } from './services/grades/update.js';
import { deleteGrade } from './services/grades/delete.js';

// Exportar functions
export const validateAndCreateSubject = createSubject;
export const validateAndUpdateSubject = updateSubject;
export const validateAndDeleteSubject = deleteSubject;
export const validateAndAddGrade = addGrade;
export const validateAndUpdateGrade = updateGrade;
export const validateAndDeleteGrade = deleteGrade; 