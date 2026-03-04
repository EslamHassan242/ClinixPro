import { z } from 'zod';

export const patientSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    dateOfBirth: z.date().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    phone: z.string().min(8, 'Valid phone number is required'), // Made required and min length
    email: z.string().email().optional(),
    address: z.string().optional(),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    allergies: z.array(z.string()).default([]),
    chronicDiseases: z.array(z.string()).default([]),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insurancePolicyNo: z.string().optional(),
    idType: z.string().optional(),
    idNumber: z.string().optional(),
});

export const appointmentSchema = z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().optional(),
    appointmentDate: z.date(),
    startTime: z.date(),
    endTime: z.date(),
    status: z.enum(['scheduled', 'confirmed', 'in-progress', 'called', 'ready', 'completed', 'cancelled', 'no-show']).default('scheduled'),
    type: z.enum(['regular', 'follow-up', 'emergency', 'consultation']).default('regular'),
    reason: z.string().optional(),
    notes: z.string().optional(),
    isVirtual: z.boolean().default(false),
});

export const medicalRecordSchema = z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().optional(),
    appointmentId: z.string().optional(), // Linked to appointment
    visitDate: z.date().default(() => new Date()),
    type: z.enum(['regular', 'follow-up', 'emergency', 'consultation']).default('regular'),
    subjective: z.string().optional(),
    objective: z.any().optional(), // Vital signs, exam findings
    assessment: z.any().optional(), // Diagnosis, ICD-10
    plan: z.any().optional(),
    prescriptions: z.array(z.any()).optional(),
    labRequests: z.array(z.any()).optional(),
    radiologyRequests: z.array(z.any()).optional(),
    attachments: z.array(z.string()).default([]),
});
