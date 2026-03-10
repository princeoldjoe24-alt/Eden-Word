export type SpiritualMaturity = 'new' | 'growing' | 'mature';
export type Denomination = 'Pentecostal' | 'Orthodox' | 'Catholic' | 'Protestant' | 'Non-Denominational';
export type AgeGroup = 'teen' | 'young-adult' | 'adult' | 'church-elder';
export type LifeStage = 'single' | 'married' | 'parent' | 'career' | 'transition' | 'challenge';

export interface UserProfile {
  name: string;
  ageGroup: AgeGroup;
  maturity: SpiritualMaturity;
  denomination: Denomination;
  lifeStage: LifeStage;
  country: string;
  language: string;
  kingdomGoals: string[];
  onboarded: boolean;
  stars: number;
}

export interface StudyTrack {
  id: string;
  title: string;
  description: string;
  icon: string;
  levels: ('basic' | 'intermediate' | 'advanced')[];
  kingdomPurpose: string;
  duration: string;
  category: string;
  prayer: string;
}

export interface DailyContent {
  verse: string;
  reference: string;
  bibleVersion: string;
  reflection: string;
  application: string;
  prayer: string;
  challenge: string;
  praiseAndPsalms: string;
}
