// 技能状态管理

import { create } from 'zustand';
import type { SkillDefinition, SkillStats } from '../types';

interface SkillState {
  skills: (SkillDefinition & SkillStats)[];
  currentSkill: SkillDefinition | null;
  loading: boolean;

  setSkills: (skills: (SkillDefinition & SkillStats)[]) => void;
  setCurrentSkill: (skill: SkillDefinition | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSkillStore = create<SkillState>((set) => ({
  skills: [],
  currentSkill: null,
  loading: false,

  setSkills: (skills) => set({ skills }),
  setCurrentSkill: (skill) => set({ currentSkill: skill }),
  setLoading: (loading) => set({ loading }),
}));
