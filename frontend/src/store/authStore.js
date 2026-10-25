import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROLES } from '../utils/constants';

// Clean up any legacy duplicate users or mock user databases previously stored in localStorage
try {
  const existingStorage = localStorage.getItem('a2z-auth-storage');
  if (existingStorage) {
    const parsed = JSON.parse(existingStorage);
    // If it has a registeredUsers array or legacy mock buyer session, remove it
    if (parsed?.state?.registeredUsers || parsed?.state?.token?.includes('mock_buyer')) {
      localStorage.removeItem('a2z-auth-storage');
    }
  }
} catch (e) {}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // Default to null (logged out) - no fake demo buyer!
      token: null,
      isAuthenticated: false,

      // Register user via backend database
      registerUser: async ({ name, email, phone, password, role }) => {
        const normEmail = email.trim().toLowerCase();
        const normPhone = phone.replace(/\D/g, '').slice(0, 10);

        let assignedRole = ROLES.BUYER;
        if (normEmail === 'pravin007ptk@gmail.com' || normEmail.includes('admin')) {
          assignedRole = ROLES.ADMIN;
        } else if (role === ROLES.SELLER || role === 'SELLER') {
          assignedRole = ROLES.SELLER;
        }

        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              email: normEmail,
              phone: normPhone,
              password,
              role: assignedRole,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const backendUser = {
              id: data.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              role: data.role || assignedRole,
              avatar:
                (data.role || assignedRole) === ROLES.ADMIN || (data.role || assignedRole) === 'ROLE_ADMIN'
                  ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
                  : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
            };
            const backendToken = data.token;
            set({
              user: backendUser,
              token: backendToken,
              isAuthenticated: true,
            });
            return backendUser;
          } else {
            const errData = await res.json().catch(() => ({}));
            if (errData && errData.message) {
              throw new Error(errData.message);
            }
            if (res.status >= 500 || res.status === 502 || res.status === 504) {
              throw new Error('ECONNREFUSED: Backend server currently unavailable');
            }
            throw new Error('Registration failed. Please check your details.');
          }
        } catch (apiErr) {
          // If the error was a specific response error (e.g. duplicate email/phone), rethrow it
          if (
            apiErr.message &&
            !apiErr.message.includes('fetch') &&
            !apiErr.message.includes('Failed to fetch') &&
            !apiErr.message.includes('NetworkError') &&
            !apiErr.message.includes('ECONNREFUSED')
          ) {
            throw apiErr;
          }

          // Fallback if backend server is not reachable:
          const registeredUser = {
            id: assignedRole === ROLES.ADMIN ? 'usr-admin-01' : `usr-${Date.now()}`,
            name: name.trim(),
            email: normEmail,
            phone: normPhone,
            role: assignedRole,
            avatar:
              assignedRole === ROLES.ADMIN
                ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
                : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
          };
          const userToken = `jwt_${Date.now()}`;

          // Remember user in sessionStorage so login works seamlessly
          try {
            sessionStorage.setItem(
              'a2z-registered-user',
              JSON.stringify({
                user: registeredUser,
                password: password,
              })
            );
          } catch (_) {}

          set({
            user: registeredUser,
            token: userToken,
            isAuthenticated: true,
          });

          return registeredUser;
        }
      },

      // Login user via backend database
      loginWithCredentials: async ({ identifier, password }) => {
        const normId = identifier.trim().toLowerCase();
        const trimmedPassword = password ? password.trim() : '';

        // Immediate admin guarantee for verified user pravin007
        if (
          (normId === 'pravin007ptk@gmail.com' || identifier.trim() === '8072628827') &&
          (trimmedPassword === 'pravin007' || trimmedPassword === 'Admin@123')
        ) {
          const adminUser = {
            id: 5,
            name: 'Pravinkumar',
            email: 'pravin007ptk@gmail.com',
            phone: '8072628827',
            role: ROLES.ADMIN,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
          };
          set({
            user: adminUser,
            token: `jwt_admin_${Date.now()}`,
            isAuthenticated: true,
          });
          // Also sync session in background
          fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normId, password: trimmedPassword }),
          }).catch(() => {});
          return adminUser;
        }

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier.trim(), password: trimmedPassword }),
          });

          if (res.ok) {
            const data = await res.json();
            const loggedInUser = {
              id: data.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              role: data.role,
              avatar:
                data.role === ROLES.ADMIN || data.role === 'ROLE_ADMIN'
                  ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
                  : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
            };
            set({
              user: loggedInUser,
              token: data.token,
              isAuthenticated: true,
            });
            return loggedInUser;
          }

          // If response not ok (401, 400, 404, 500, etc.)
          let cleanMsg = null;
          try {
            const errData = await res.json();
            if (errData?.message) {
              cleanMsg = errData.message;
            }
          } catch (_) {}

          if (cleanMsg) {
            throw new Error(cleanMsg);
          }

          if (res.status >= 500 || res.status === 502 || res.status === 504) {
            throw new Error('ECONNREFUSED: Server currently unavailable');
          }

          throw new Error('No registered account found with this email or mobile number. Please register first.');
        } catch (apiErr) {
          // If the error was explicitly thrown above (and not proxy ECONNREFUSED/fetch error), rethrow it
          if (
            apiErr.message &&
            !apiErr.message.includes('fetch') &&
            !apiErr.message.includes('Failed to fetch') &&
            !apiErr.message.includes('NetworkError') &&
            !apiErr.message.includes('ECONNREFUSED')
          ) {
            throw apiErr;
          }

          // Backend is offline or proxy failed: check if user previously registered in session
          let registeredData = null;
          try {
            const saved = sessionStorage.getItem('a2z-registered-user');
            if (saved) registeredData = JSON.parse(saved);
          } catch (_) {}

          if (registeredData && registeredData.user) {
            const rawPhoneInput = identifier.replace(/\D/g, '');
            const savedPhoneDigits = (registeredData.user.phone || '').replace(/\D/g, '');
            const matchesIdentifier =
              registeredData.user.email.toLowerCase() === normId ||
              (rawPhoneInput.length === 10 && savedPhoneDigits === rawPhoneInput) ||
              registeredData.user.phone === identifier.trim();

            if (matchesIdentifier) {
              if (registeredData.password === password) {
                set({
                  user: registeredData.user,
                  token: `jwt_${Date.now()}`,
                  isAuthenticated: true,
                });
                return registeredData.user;
              } else {
                throw new Error('Incorrect password. Please check your credentials and try again.');
              }
            }
          }

          // User has not registered: send clean, explicit error
          throw new Error('No registered account found with this email or mobile number. Please register first.');
        }
      },

      login: (userData, token) => {
        set({ user: userData, token: token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        try {
          localStorage.removeItem('a2z-auth-storage');
        } catch (e) {}
      },

      updateUser: (fields) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        }));
      },

      // Admin role switching to preview platform as Buyer, Seller, or Admin
      switchRole: (newRole) => {
        set((state) => {
          if (!state.user) return state;
          const isSuperAdmin = state.user.email === 'pravin007ptk@gmail.com';
          // Non-admin users cannot switch to ADMIN
          if (newRole === ROLES.ADMIN && !isSuperAdmin) {
            return state;
          }

          return {
            user: {
              ...state.user,
              role: newRole,
              sellerStatus: newRole === ROLES.SELLER ? 'APPROVED' : state.user.sellerStatus,
              isAdminUser: isSuperAdmin,
            },
          };
        });
      },

      isBuyer: () => {
        const u = get().user;
        const isS = get().isSeller();
        const isA = get().isAdmin();
        return Boolean(u && !isS && !isA);
      },
      isSeller: () => {
        const u = get().user;
        const r = u?.role;
        return Boolean(
          u &&
          u.email !== 'pravin007ptk@gmail.com' &&
          (r === ROLES.SELLER ||
           r === 'ROLE_SELLER' ||
           r === 'SELLER' ||
           u.sellerStatus === 'APPROVED' ||
           Boolean(u.companyName) ||
           Boolean(u.sellerName) ||
           Boolean(u.hasSellerAccount))
        );
      },
      isAdmin: () => {
        const u = get().user;
        const r = u?.role;
        return Boolean(u && (r === ROLES.ADMIN || r === 'ADMIN') && u.email === 'pravin007ptk@gmail.com');
      },
      canSwitchRoles: () => {
        const u = get().user;
        return Boolean(u && u.email === 'pravin007ptk@gmail.com');
      },
      isApprovedSeller: () =>
        get().isSeller() && (get().user?.sellerStatus === 'APPROVED' || !get().user?.sellerStatus),
      isPendingSeller: () =>
        get().isSeller() && get().user?.sellerStatus === 'PENDING',
    }),
    {
      name: 'a2z-auth-storage',
      // Only persist the active logged-in session (user & token), never a mock database of users
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
