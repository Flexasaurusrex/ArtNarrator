import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
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
  snapGrid: number; // in seconds
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

// Main Store State
interface AppState {
  // Project data
  currentProject: Project | null;
  scenes: Scene[];
  textStyles: TextStyle[];
  musicTracks: MusicTrack[];
  
  // UI state
  playback: PlaybackState;
  timeline: TimelineState;
  ui: UIState;
  export: ExportState;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

// Store Actions
interface AppActions {
  // Project actions
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
  clearProject: () => void;
  
  // Scene actions
  setScenes: (scenes: Scene[]) => void;
  addScene: (scene: CreateScene) => void;
  updateScene: (id: string, updates: UpdateScene) => void;
  deleteScene: (id: string) => void;
  duplicateScene: (id: string) => void;
  reorderScenes: (oldIndex: number, newIndex: number) => void;
  moveScene: (id: string, newOrder: number) => void;
  
  // Text style actions
  setTextStyles: (styles: TextStyle[]) => void;
  addTextStyle: (style: Omit<TextStyle, 'id'>) => void;
  updateTextStyle: (id: string, updates: Partial<TextStyle>) => void;
  deleteTextStyle: (id: string) => void;
  
  // Music actions
  setMusicTracks: (tracks: MusicTrack[]) => void;
  addMusicTrack: (track: Omit<MusicTrack, 'id'>) => void;
  updateMusicTrack: (id: string, updates: Partial<MusicTrack>) => void;
  deleteMusicTrack: (id: string) => void;
  
  // Playback actions
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  resetPlayback: () => void;
  
  // Timeline actions
  selectScenes: (sceneIds: string[]) => void;
  selectScene: (sceneId: string) => void;
  clearSelection: () => void;
  setDraggedScene: (sceneId: string | null) => void;
  toggleSnap: () => void;
  setSnapGrid: (grid: number) => void;
  toggleSafeAreas: () => void;
  
  // UI actions
  setActivePanel: (panel: UIState['activePanel']) => void;
  setTheme: (theme: UIState['theme']) => void;
  toggleGrid: () => void;
  setPreviewDevice: (device: UIState['previewDevice']) => void;
  
  // Export actions
  setCurrentRender: (render: RenderJob | null) => void;
  addToRenderHistory: (render: RenderJob) => void;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Bulk operations
  distributeScenesDuration: (totalDuration: number) => void;
  applyEffectToAll: (effect: Scene['fx']) => void;
  matchScenesToBeatGrid: (bpm: number) => void;
  
  // URL state serialization
  serializeToURL: () => string;
  deserializeFromURL: (urlParams: string) => void;
}

// Default state values
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

// Create the store
export const useAppStore = create<AppState & AppActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
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
        setProject: (project) => set((state) => {
          state.currentProject = project;
        }),
        
        updateProject: (updates) => set((state) => {
          if (state.currentProject) {
            Object.assign(state.currentProject, updates);
          }
        }),
        
        clearProject: () => set((state) => {
          state.currentProject = null;
          state.scenes = [];
          state.textStyles = [];
          state.musicTracks = [];
          state.playback = DEFAULT_PLAYBACK;
          state.timeline = DEFAULT_TIMELINE;
          state.export = DEFAULT_EXPORT;
        }),
        
        // Scene actions
        setScenes: (scenes) => set((state) => {
          state.scenes = scenes.sort((a, b) => a.order - b.order);
        }),
        
        addScene: (scene) => set((state) => {
          const newScene: Scene = {
            ...scene,
            id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            order: scene.order ?? state.scenes.length,
          };
          state.scenes.push(newScene);
          state.scenes.sort((a, b) => a.order - b.order);
        }),
        
        updateScene: (id, updates) => set((state) => {
          const index = state.scenes.findIndex(s => s.id === id);
          if (index !== -1) {
            Object.assign(state.scenes[index], updates);
          }
        }),
        
        deleteScene: (id) => set((state) => {
          state.scenes = state.scenes.filter(s => s.id !== id);
          state.timeline.selectedSceneIds = state.timeline.selectedSceneIds.filter(sid => sid !== id);
          // Reorder remaining scenes
          state.scenes.forEach((scene, index) => {
            scene.order = index;
          });
        }),
        
        duplicateScene: (id) => set((state) => {
          const scene = state.scenes.find(s => s.id === id);
          if (scene) {
            const newScene: Scene = {
              ...scene,
              id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              order: scene.order + 1,
              title: `${scene.title} (Copy)`,
            };
            
            // Shift other scenes' order
            state.scenes.forEach(s => {
              if (s.order > scene.order) s.order += 1;
            });
            
            state.scenes.push(newScene);
            state.scenes.sort((a, b) => a.order - b.order);
          }
        }),
        
        reorderScenes: (oldIndex, newIndex) => set((state) => {
          const scenes = [...state.scenes];
          const [movedScene] = scenes.splice(oldIndex, 1);
          scenes.splice(newIndex, 0, movedScene);
          
          // Update order values
          scenes.forEach((scene, index) => {
            scene.order = index;
          });
          
          state.scenes = scenes;
        }),
        
        moveScene: (id, newOrder) => set((state) => {
          const scene = state.scenes.find(s => s.id === id);
          if (scene) {
            const oldOrder = scene.order;
            scene.order = newOrder;
            
            // Adjust other scenes
            state.scenes.forEach(s => {
              if (s.id !== id) {
                if (oldOrder < newOrder && s.order > oldOrder && s.order <= newOrder) {
                  s.order -= 1;
                } else if (oldOrder > newOrder && s.order >= newOrder && s.order < oldOrder) {
                  s.order += 1;
                }
              }
            });
            
            state.scenes.sort((a, b) => a.order - b.order);
          }
        }),
        
        // Text style actions
        setTextStyles: (styles) => set((state) => {
          state.textStyles = styles;
        }),
        
        addTextStyle: (style) => set((state) => {
          const newStyle: TextStyle = {
            ...style,
            id: `style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };
          state.textStyles.push(newStyle);
        }),
        
        updateTextStyle: (id, updates) => set((state) => {
          const index = state.textStyles.findIndex(s => s.id === id);
          if (index !== -1) {
            Object.assign(state.textStyles[index], updates);
          }
        }),
        
        deleteTextStyle: (id) => set((state) => {
          state.textStyles = state.textStyles.filter(s => s.id !== id);
          // Clear references from scenes
          state.scenes.forEach(scene => {
            if (scene.textStyleId === id) {
              scene.textStyleId = undefined;
            }
          });
        }),
        
        // Music actions
        setMusicTracks: (tracks) => set((state) => {
          state.musicTracks = tracks;
        }),
        
        addMusicTrack: (track) => set((state) => {
          const newTrack: MusicTrack = {
            ...track,
            id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };
          state.musicTracks.push(newTrack);
        }),
        
        updateMusicTrack: (id, updates) => set((state) => {
          const index = state.musicTracks.findIndex(t => t.id === id);
          if (index !== -1) {
            Object.assign(state.musicTracks[index], updates);
          }
        }),
        
        deleteMusicTrack: (id) => set((state) => {
          state.musicTracks = state.musicTracks.filter(t => t.id !== id);
        }),
        
        // Playback actions
        setPlaying: (playing) => set((state) => {
          state.playback.isPlaying = playing;
        }),
        
        setCurrentTime: (time) => set((state) => {
          state.playback.currentTime = time;
        }),
        
        setDuration: (duration) => set((state) => {
          state.playback.duration = duration;
        }),
        
        setPlaybackRate: (rate) => set((state) => {
          state.playback.playbackRate = rate;
        }),
        
        resetPlayback: () => set((state) => {
          state.playback = DEFAULT_PLAYBACK;
        }),
        
        // Timeline actions
        selectScenes: (sceneIds) => set((state) => {
          state.timeline.selectedSceneIds = sceneIds;
        }),
        
        selectScene: (sceneId) => set((state) => {
          state.timeline.selectedSceneIds = [sceneId];
        }),
        
        clearSelection: () => set((state) => {
          state.timeline.selectedSceneIds = [];
        }),
        
        setDraggedScene: (sceneId) => set((state) => {
          state.timeline.draggedSceneId = sceneId;
        }),
        
        toggleSnap: () => set((state) => {
          state.timeline.snapEnabled = !state.timeline.snapEnabled;
        }),
        
        setSnapGrid: (grid) => set((state) => {
          state.timeline.snapGrid = grid;
        }),
        
        toggleSafeAreas: () => set((state) => {
          state.timeline.safeAreaVisible = !state.timeline.safeAreaVisible;
          state.ui.showSafeAreas = state.timeline.safeAreaVisible;
        }),
        
        // UI actions
        setActivePanel: (panel) => set((state) => {
          state.ui.activePanel = panel;
        }),
        
        setTheme: (theme) => set((state) => {
          state.ui.theme = theme;
        }),
        
        toggleGrid: () => set((state) => {
          state.ui.showGrid = !state.ui.showGrid;
        }),
        
        setPreviewDevice: (device) => set((state) => {
          state.ui.previewDevice = device;
        }),
        
        // Export actions
        setCurrentRender: (render) => set((state) => {
          state.export.currentRender = render;
        }),
        
        addToRenderHistory: (render) => set((state) => {
          state.export.renderHistory.unshift(render);
          // Keep only last 10 renders
          if (state.export.renderHistory.length > 10) {
            state.export.renderHistory = state.export.renderHistory.slice(0, 10);
          }
        }),
        
        // Utility actions
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        
        setError: (error) => set((state) => {
          state.error = error;
        }),
        
        // Bulk operations
        distributeScenesDuration: (totalDuration) => set((state) => {
          const sceneCount = state.scenes.length;
          if (sceneCount > 0) {
            const durationPerScene = totalDuration / sceneCount;
            state.scenes.forEach(scene => {
              scene.durationSec = durationPerScene;
            });
          }
        }),
        
        applyEffectToAll: (effect) => set((state) => {
          state.scenes.forEach(scene => {
            scene.fx = effect;
          });
        }),
        
        matchScenesToBeatGrid: (bpm) => set((state) => {
          const beatDuration = 60 / bpm; // seconds per beat
          const sceneBeats = 4; // each scene lasts 4 beats by default
          const sceneDuration = beatDuration * sceneBeats;
          
          state.scenes.forEach(scene => {
            scene.durationSec = sceneDuration;
          });
        }),
        
        // URL serialization (simplified version)
        serializeToURL: () => {
          const state = get();
          const data = {
            project: state.currentProject,
            scenes: state.scenes,
            textStyles: state.textStyles,
            musicTracks: state.musicTracks,
          };
          return btoa(JSON.stringify(data));
        },
        
        deserializeFromURL: (urlParams) => {
          try {
            const data = JSON.parse(atob(urlParams));
            set((state) => {
              if (data.project) state.currentProject = data.project;
              if (data.scenes) state.scenes = data.scenes;
              if (data.textStyles) state.textStyles = data.textStyles;
              if (data.musicTracks) state.musicTracks = data.musicTracks;
            });
          } catch (error) {
            console.error('Failed to deserialize URL state:', error);
          }
        },
      }))
    ),
    { name: 'artnarrator-store' }
  )
);

// Computed selectors
export const useProjectData = () => {
  return useAppStore((state) => ({
    project: state.currentProject,
    scenes: state.scenes,
    textStyles: state.textStyles,
    musicTracks: state.musicTracks,
  }));
};

export const useTimelineData = () => {
  return useAppStore((state) => ({
    scenes: state.scenes,
    selectedSceneIds: state.timeline.selectedSceneIds,
    draggedSceneId: state.timeline.draggedSceneId,
    snapEnabled: state.timeline.snapEnabled,
    snapGrid: state.timeline.snapGrid,
  }));
};

export const usePlaybackData = () => {
  return useAppStore((state) => state.playback);
};

export const useUIData = () => {
  return useAppStore((state) => state.ui);
};

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
