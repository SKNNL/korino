import { z } from 'zod';

// Item validation schema
export const itemSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit contenir au moins 3 caractères").max(100, "Le titre ne peut pas dépasser 100 caractères"),
  description: z.string().trim().max(2000, "La description ne peut pas dépasser 2000 caractères").optional(),
  category: z.string().min(1, "La catégorie est requise"),
  location: z.string().trim().max(200, "La localisation ne peut pas dépasser 200 caractères").optional(),
  brand: z.string().trim().max(100, "La marque ne peut pas dépasser 100 caractères").optional(),
  condition: z.enum(['neuf', 'tres_bon_etat', 'bon_etat', 'etat_correct', 'pour_pieces']).optional(),
  price_range: z.string().optional()
});

// Message validation schema
export const messageSchema = z.object({
  content: z.string().trim().min(1, "Le message ne peut pas être vide").max(1000, "Le message ne peut pas dépasser 1000 caractères")
});

// Profile validation schema
export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom ne peut pas dépasser 100 caractères").optional(),
  bio: z.string().trim().max(500, "La bio ne peut pas dépasser 500 caractères").optional(),
  location: z.string().trim().max(200, "La localisation ne peut pas dépasser 200 caractères").optional()
});

// Authentication validation schemas
export const signUpSchema = z.object({
  email: z.string().email("Format d'email invalide").max(255, "L'email ne peut pas dépasser 255 caractères"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(100, "Le mot de passe ne peut pas dépasser 100 caractères"),
  fullName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom ne peut pas dépasser 100 caractères")
});

export const signInSchema = z.object({
  email: z.string().email("Format d'email invalide").max(255, "L'email ne peut pas dépasser 255 caractères"),
  password: z.string().min(1, "Le mot de passe est requis")
});

// Review validation schema
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500, "Le commentaire ne peut pas dépasser 500 caractères").optional()
});

// Message template validation schema
export const messageTemplateSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis").max(100, "Le titre ne peut pas dépasser 100 caractères"),
  content: z.string().trim().min(1, "Le contenu est requis").max(500, "Le contenu ne peut pas dépasser 500 caractères")
});

// Exchange proposal validation schema
export const exchangeProposalSchema = z.object({
  message: z.string().trim().max(500, "Le message ne peut pas dépasser 500 caractères").optional()
});

// Report validation schema
export const reportSchema = z.object({
  reason: z.string().min(1, "La raison est requise"),
  description: z.string().trim().min(1, "La description est requise").max(2000, "La description ne peut pas dépasser 2000 caractères")
});

export type ItemFormData = z.infer<typeof itemSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type MessageTemplateFormData = z.infer<typeof messageTemplateSchema>;
export type ExchangeProposalFormData = z.infer<typeof exchangeProposalSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
