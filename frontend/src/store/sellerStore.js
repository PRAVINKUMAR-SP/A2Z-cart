import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SELLER_STATUS } from '../utils/constants';

// Clean up any legacy mock seller applications or hardcoded duplicate profiles
try {
  const existing = localStorage.getItem('a2z-seller-storage');
  if (existing) {
    const parsed = JSON.parse(existing);
    if (
      JSON.stringify(parsed).includes('TechHub') ||
      JSON.stringify(parsed).includes('Gadget Galaxy') ||
      JSON.stringify(parsed).includes('Vikram Singhania') ||
      JSON.stringify(parsed).includes('APP-100')
    ) {
      localStorage.removeItem('a2z-seller-storage');
    }
  }
} catch (e) {}

export const useSellerStore = create(
  persist(
    (set, get) => ({
      applications: [],
      currentSellerProfile: null,

      setSellerProfile: (profile) => {
        set({ currentSellerProfile: profile });
      },

      saveSellerProfile: async (profileData) => {
        set({ currentSellerProfile: profileData });

        try {
          const res = await fetch('/api/seller/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
          });
          if (res.ok) {
            const data = await res.json();
            set({ currentSellerProfile: { ...profileData, id: data.id } });
            return data;
          }
        } catch (e) {
          console.warn('Backend sync failed, saved locally:', e.message);
        }
        return profileData;
      },

      fetchSellerProfile: async (userId, email) => {
        try {
          const params = new URLSearchParams();
          if (userId) params.append('userId', userId);
          if (email) params.append('email', email);

          const res = await fetch(`/api/seller/profile?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.exists) {
              set({ currentSellerProfile: data });
              return data;
            } else {
              set({ currentSellerProfile: null });
              return null;
            }
          }
        } catch (e) {
          console.warn('Failed to fetch seller profile:', e.message);
        }
        return null;
      },

      submitApplication: (appData) => {
        const newApp = {
          ...appData,
          id: `APP-${Math.floor(100 + Math.random() * 900)}`,
          status: SELLER_STATUS.APPROVED,
          appliedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
        };
        set((state) => ({ applications: [newApp, ...state.applications] }));
        return newApp;
      },

      approveApplication: (appId, notes = 'Application approved after compliance review.') => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === appId
              ? {
                  ...app,
                  status: SELLER_STATUS.APPROVED,
                  approvedAt: new Date().toISOString(),
                  adminNotes: notes,
                }
              : app
          ),
        }));
      },

      rejectApplication: (appId, reason) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === appId
              ? {
                  ...app,
                  status: SELLER_STATUS.REJECTED,
                  rejectedAt: new Date().toISOString(),
                  rejectionReason: reason || 'Document discrepancies.',
                  adminNotes: reason,
                }
              : app
          ),
        }));
      },

      getApplicationByUserId: (userId) => {
        return get().applications.find((app) => app.userId === userId);
      },

      deleteApplication: (appId) => {
        set((state) => ({
          applications: state.applications.filter((app) => app.id !== appId)
        }));
      },
    }),
    {
      name: 'a2z-seller-storage',
      partialize: (state) => ({
        currentSellerProfile: state.currentSellerProfile,
        applications: state.applications,
      }),
    }
  )
);
