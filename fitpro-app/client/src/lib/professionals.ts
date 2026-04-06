import type { Professional } from '@/contexts/ProfessionalChatContext';

export const PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'Coach Rafael',
    type: 'personal',
    rating: 4.9,
    availability: 'Disponível agora',
    specialties: ['Hipertrofia', 'Força'],
    description: 'Especialista em hipertrofia e recomposição corporal.',
    avatar: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663450499537/mCgZF8gjzvqAzH2XF2CQPp/fitpro-personal-trainer-1-46XbjRsmYzG6EzLMGRnLbY.webp',
  },
  {
    id: '2',
    name: 'Nutricionista Ana',
    type: 'nutritionist',
    rating: 4.8,
    availability: 'Disponível em 2h',
    specialties: ['Emagrecimento', 'Performance'],
    description: 'Especialista em nutrição esportiva e reedução alimentar.',
    avatar: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663450499537/mCgZF8gjzvqAzH2XF2CQPp/fitpro-nutritionist-1-D25pGxWWEMx3uymsS2wo4v.webp',
  },
  {
    id: '3',
    name: 'Coach Marina',
    type: 'personal',
    rating: 4.7,
    availability: 'Disponível amanhã',
    specialties: ['Funcional', 'Mobilidade'],
    description: 'Especialista em treinos funcionais e prevenção de lesões.',
    avatar: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663450499537/mCgZF8gjzvqAzH2XF2CQPp/fitpro-personal-trainer-2-NFpGk9rxkh9vri2kzMzLd5.webp',
  },
];

export function getProfessionalById(id?: string | null) {
  if (!id) return null;
  return PROFESSIONALS.find((professional) => professional.id === id) ?? null;
}
