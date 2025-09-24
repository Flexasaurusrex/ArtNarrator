import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { 
  Project, 
  Scene, 
  TextStyle, 
  MusicTrack, 
  RenderJob,
  CreateScene,
  UpdateScene 
} from './schemas';

// UI State Types
interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
}

interface TimelineState {
  selectedSceneIds: string[];
  draggedSceneId: string | null;
  snapEnabled: boolean;
  snapGrid: number;
  safeAreaVisible: boolean;
}

interface UIState {
  activePanel: 'scene' | 'text' | 'music' | 'export';
  theme: 'dark' | 'light';
  showGrid: boolean;
  showSafeAreas: boolean;
  previewDevice: 'mobile' | 'desktop' | 'tablet';
}

interface ExportState {
  currentRender: RenderJob | null;
  renderHistory: RenderJob[];
}

interface AppState {
  currentProject: Project | null;
  scenes: Scene[];
  textStyles: TextStyle[];
  musicTracks: MusicTrack[];
  playback: PlaybackState;
  timeline: TimelineState;
  ui: UIState;
  export: ExportState;
  isLoading: boolean;
  error: string | null;
}

interface AppActions {
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
  clearProject: () => void;
  setScenes: (scenes: Scene[]) => void;
  addScene: (scene: CreateScene) => void;
  updateScene: (id: string, updates: UpdateScene) => void;
  deleteScene: (id: string) => void;
  duplicateScene: (id: string) => void;
  reorderScenes: (oldIndex: number, newIndex: number) => void;
  setTextStyles: (styles: TextStyle[]) => void;
  addTextStyle: (style: Omit<TextStyle, 'id'>) => void;
  updateTextStyle: (id: string, updates: Partial<TextStyle>) => void;
  deleteTextStyle: (id: string) => void;
  setMusicTracks: (tracks: MusicTrack[]) => void;
  addMusicTrack: (track: Omit<MusicTrack, 'id'>) => void;
  updateMusicTrack: (id: string, updates: Partial<MusicTrack>) => void;
  deleteMusicTrack: (id: string) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  resetPlayback: () => void;
  selectScenes: (sceneIds: string[]) => void;
  selectScene: (sceneId: string) => void;
  clearSelection: () => void;
  toggleSnap: () => void;
  toggleSafeAreas: () => void;
  setActivePanel: (panel: UIState['activePanel']) => void;
  setTheme: (theme: UIState['theme']) => void;
  toggleGrid: () => void;
  setPreviewDevice: (device: UIState['previewDevice']) => void;
  setCurrentRender: (render: RenderJob | null) => void;
  addToRenderHistory: (render: RenderJob) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  distributeScenesDuration: (totalDuration: number) => void;
  applyEffectToAll: (effect: Scene['fx']) => void;
  matchScenesToBeatGrid: (bpm: number) => void;
}

const DEFAULT_PLAYBACK: PlaybackState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
};

const DEFAULT_TIMELINE: TimelineState = {
  selectedSceneIds: [],
  draggedSceneId: null,
  snapEnabled: true,
  snapGrid: 0.25,
  safeAreaVisible: true,
};

const DEFAULT_UI: UIState = {
  activePanel: 'scene',
  theme: 'dark',
  showGrid: false,
  showSafeAreas: true,
  previewDevice: 'mobile',
};

const DEFAULT_EXPORT: ExportState = {
  currentRender: null,
  renderHistory: [],
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      currentProject: null,
      scenes: [],
      textStyles: [],
      musicTracks: [],
      playback: DEFAULT_PLAYBACK,
      timeline: DEFAULT_TIMELINE,
      ui: DEFAULT_UI,
      export: DEFAULT_EXPORT,
      isLoading: false,
      error: null,
      
      // Project actions
      setProject: (project) => set({ currentProject: project }),
      updateProject: (updates) => set((state) => ({ 
        currentProject: state.currentProject ? { ...state.currentProject, ...updates } : null 
      })),
      clearProject: () => set({
        currentProject: null,
        scenes: [],
        textStyles: [],
        musicTracks: [],
        playback: DEFAULT_PLAYBACK,
        timeline: DEFAULT_TIMELINE,
        export: DEFAULT_EXPORT,
      }),
      
      // Scene actions
      setScenes: (scenes) => set({ scenes: scenes.sort((a, b) => a.order - b.order) }),
      addScene: (scene) => set((state) => {
        const newScene: Scene = {
          ...scene,
          id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          order: scene.order ?? state.scenes.length,
        };
        return { scenes: [...state.scenes, newScene].sort((a, b) => a.order - b.order) };
      }),
      updateScene: (id, updates) => set((state) => ({
        scenes: state.scenes.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteScene: (id) => set((state) => ({
        scenes: state.scenes.filter(s => s.id !== id).map((scene, index) => ({ ...scene, order: index })),
        timeline: {
          ...state.timeline,
          selectedSceneIds: state.timeline.selectedSceneIds.filter(sid => sid !== id)
        }
      })),
      duplicateScene: (id) => set((state) => {
        const scene = state.scenes.find(s => s.id === id);
        if (!scene) return state;
        
        const newScene: Scene = {
          ...scene,
          id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          order: scene.order + 1,
          title: `${scene.title} (Copy)`,
        };
        
        const updatedScenes = state.scenes
          .map(s => s.order > scene.order ? { ...s, order: s.order + 1 } : s)
          .concat(newScene)
          .sort((a, b) => a.order - b.order);
          
        return { scenes: updatedScenes };
      }),
      reorderScenes: (oldIndex, newIndex) => set((state) => {
        const scenes = [...state.scenes];
        const [movedScene] = scenes.splice(oldIndex, 1);
        scenes.splice(newIndex, 0, movedScene);
        return { scenes: scenes.map((scene, index) => ({ ...scene, order: index })) };
      }),
      
      // Text style actions
      setTextStyles: (textStyles) => set({ textStyles }),
      addTextStyle: (style) => set((state) => {
        const newStyle: TextStyle = {
          ...style,
          id: `style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        return { textStyles: [...state.textStyles, newStyle] };
      }),
      updateTextStyle: (id, updates) => set((state) => ({
        textStyles: state.textStyles.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteTextStyle: (id) => set((state) => ({
        textStyles: state.textStyles.filter(s => s.id !== id),
        scenes: state.scenes.map(scene => 
          scene.textStyleId === id ? { ...scene, textStyleId: undefined } : scene
        )
      })),
      
      // Music actions
      setMusicTracks: (musicTracks) => set({ musicTracks }),
      addMusicTrack: (track) => set((state) => {
        const newTrack: MusicTrack = {
          ...track,
          id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        return { musicTracks: [...state.musicTracks, newTrack] };
      }),
      updateMusicTrack: (id, updates) => set((state) => ({
        musicTracks: state.musicTracks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteMusicTrack: (id) => set((state) => ({
        musicTracks: state.musicTracks.filter(t => t.id !== id)
      })),
      
      // Playback actions
      setPlaying: (isPlaying) => set((state) => ({ 
        playback: { ...state.playback, isPlaying } 
      })),
      setCurrentTime: (currentTime) => set((state) => ({ 
        playback: { ...state.playback, currentTime } 
      })),
      setDuration: (duration) => set((state) => ({ 
        playback: { ...state.playback, duration } 
      })),
      setPlaybackRate: (playbackRate) => set((state) => ({ 
        playback: { ...state.playback, playbackRate } 
      })),
      resetPlayback: () => set((state) => ({ playback: DEFAULT_PLAYBACK })),
      
      // Timeline actions
      selectScenes: (selectedSceneIds) => set((state) => ({
        timeline: { ...state.timeline, selectedSceneIds }
      })),
      selectScene: (sceneId) => set((state) => ({
        timeline: { ...state.timeline, selectedSceneIds: [sceneId] }
      })),
      clearSelection: () => set((state) => ({
        timeline: { ...state.timeline, selectedSceneIds: [] }
      })),
      toggleSnap: () => set((state) => ({
        timeline: { ...state.timeline, snapEnabled: !state.timeline.snapEnabled }
      })),
      toggleSafeAreas: () => set((state) => ({
        timeline: { ...state.timeline, safeAreaVisible: !state.timeline.safeAreaVisible },
        ui: { ...state.ui, showSafeAreas: !state.timeline.safeAreaVisible }
      })),
      
      // UI actions
      setActivePanel: (activePanel) => set((state) => ({
        ui: { ...state.ui, activePanel }
      })),
      setTheme: (theme) => set((state) => ({
        ui: { ...state.ui, theme }
      })),
      toggleGrid: () => set((state) => ({
        ui: { ...state.ui, showGrid: !state.ui.showGrid }
      })),
      setPreviewDevice: (previewDevice) => set((state) => ({
        ui: { ...state.ui, previewDevice }
      })),
      
      // Export actions
      setCurrentRender: (currentRender) => set((state) => ({
        export: { ...state.export, currentRender }
      })),
      addToRenderHistory: (render) => set((state) => ({
        export: { 
          ...state.export, 
          renderHistory: [render, ...state.export.renderHistory].slice(0, 10) 
        }
      })),
      
      // Utility actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Bulk operations
      distributeScenesDuration: (totalDuration) => set((state) => {
        const sceneCount = state.scenes.length;
        if (sceneCount === 0) return state;
        const durationPerScene = totalDuration / sceneCount;
        return {
          scenes: state.scenes.map(scene => ({ ...scene, durationSec: durationPerScene }))
        };
      }),
      applyEffectToAll: (effect) => set((state) => ({
        scenes: state.scenes.map(scene => ({ ...scene, fx: effect }))
      })),
      matchScenesToBeatGrid: (bpm) => set((state) => {
        const beatDuration = 60 / bpm;
        const sceneDuration = beatDuration * 4;
        return {
          scenes: state.scenes.map(scene => ({ ...scene, durationSec: sceneDuration }))
        };
      }),
    }))
  )
);

// Helper hooks
export const useSelectedScenes = () => {
  return useAppStore((state) => {
    const selectedIds = state.timeline.selectedSceneIds;
    return state.scenes.filter(scene => selectedIds.includes(scene.id!));
  });
};

export const useTotalDuration = () => {
  return useAppStore((state) => 
    state.scenes.reduce((total, scene) => total + scene.durationSec, 0)
  );
};

export const useCurrentScene = () => {
  return useAppStore((state) => {
    const { currentTime } = state.playback;
    let cumulativeTime = 0;
    
    for (const scene of state.scenes) {
      if (currentTime >= cumulativeTime && currentTime < cumulativeTime + scene.durationSec) {
        return scene;
      }
      cumulativeTime += scene.durationSec;
    }
    
    return state.scenes[state.scenes.length - 1] || null;
  });
};
