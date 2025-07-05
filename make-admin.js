// Utility script to make a user an admin
// Run this in the browser console on any page with Firebase loaded

class AdminPromoter {
    constructor() {
        this.database = null;
        this.ref = null;
        this.set = null;
        this.get = null;
        this.init();
    }

    init() {
        console.log('[ADMIN PROMOTER] Initializing...');
        this.waitForFirebase();
    }

    waitForFirebase() {
        if (window.firebaseDatabase && window.firebaseRef && window.firebaseSet && window.firebaseGet) {
            console.log('[ADMIN PROMOTER] Firebase is ready');
            this.database = window.firebaseDatabase;
            this.ref = window.firebaseRef;
            this.set = window.firebaseSet;
            this.get = window.firebaseGet;
            this.setupPromoter();
        } else {
            console.log('[ADMIN PROMOTER] Firebase not ready, retrying...');
            setTimeout(() => this.waitForFirebase(), 100);
        }
    }

    setupPromoter() {
        // Add global function
        window.makeUserAdmin = (username) => {
            this.promoteToAdmin(username);
        };

        // Add UI if on admin page
        if (window.location.pathname.includes('admin.html')) {
            this.addPromoterUI();
        }

        console.log('[ADMIN PROMOTER] Ready! Use makeUserAdmin("username") to promote a user');
    }

    addPromoterUI() {
        const container = document.querySelector('.admin-container');
        if (!container) return;

        const promoterDiv = document.createElement('div');
        promoterDiv.className = 'admin-section';
        promoterDiv.innerHTML = `
            <h2><i class="fas fa-crown"></i> Promote User to Admin</h2>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="promote-username" placeholder="Enter username" style="flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary);">
                <button onclick="promoter.promoteFromUI()" class="btn btn-primary">Promote to Admin</button>
            </div>
        `;

        container.appendChild(promoterDiv);
    }

    async promoteFromUI() {
        const username = document.getElementById('promote-username').value.trim();
        if (!username) {
            alert('Please enter a username');
            return;
        }
        await this.promoteToAdmin(username);
    }

    async promoteToAdmin(username) {
        try {
            console.log(`[ADMIN PROMOTER] Promoting ${username} to admin...`);

            // Get current user data
            const userRef = this.ref(this.database, `registered_users/${username}`);
            const snapshot = await this.get(userRef);

            if (!snapshot.exists()) {
                console.error(`[ADMIN PROMOTER] User ${username} not found`);
                alert(`User ${username} not found`);
                return;
            }

            const userData = snapshot.val();
            console.log('[ADMIN PROMOTER] Current user data:', userData);

            // Update user to admin
            const updatedUserData = {
                ...userData,
                role: 'admin',
                promotedAt: Date.now(),
                promotedBy: 'AdminPromoter'
            };

            await this.set(userRef, updatedUserData);
            console.log(`[ADMIN PROMOTER] Successfully promoted ${username} to admin`);
            alert(`Successfully promoted ${username} to admin!`);

            // If this is the current user, update localStorage
            const currentUser = JSON.parse(localStorage.getItem('hackconvo_user') || '{}');
            if (currentUser.username === username) {
                currentUser.role = 'admin';
                localStorage.setItem('hackconvo_user', JSON.stringify(currentUser));
                console.log('[ADMIN PROMOTER] Updated current user in localStorage');
            }

        } catch (error) {
            console.error('[ADMIN PROMOTER] Error promoting user:', error);
            alert('Error promoting user: ' + error.message);
        }
    }

    async promoteToModerator(username) {
        try {
            console.log(`[ADMIN PROMOTER] Promoting ${username} to moderator...`);

            // Get current user data
            const userRef = this.ref(this.database, `registered_users/${username}`);
            const snapshot = await this.get(userRef);

            if (!snapshot.exists()) {
                console.error(`[ADMIN PROMOTER] User ${username} not found`);
                alert(`User ${username} not found`);
                return;
            }

            const userData = snapshot.val();
            console.log('[ADMIN PROMOTER] Current user data:', userData);

            // Update user to moderator
            const updatedUserData = {
                ...userData,
                role: 'moderator',
                promotedAt: Date.now(),
                promotedBy: 'AdminPromoter'
            };

            await this.set(userRef, updatedUserData);
            console.log(`[ADMIN PROMOTER] Successfully promoted ${username} to moderator`);
            alert(`Successfully promoted ${username} to moderator!`);

            // If this is the current user, update localStorage
            const currentUser = JSON.parse(localStorage.getItem('hackconvo_user') || '{}');
            if (currentUser.username === username) {
                currentUser.role = 'moderator';
                localStorage.setItem('hackconvo_user', JSON.stringify(currentUser));
                console.log('[ADMIN PROMOTER] Updated current user in localStorage');
            }

        } catch (error) {
            console.error('[ADMIN PROMOTER] Error promoting user:', error);
            alert('Error promoting user: ' + error.message);
        }
    }

    async listAdmins() {
        try {
            console.log('[ADMIN PROMOTER] Listing all users with roles...');
            const usersRef = this.ref(this.database, 'registered_users');
            const snapshot = await this.get(usersRef);

            if (!snapshot.exists()) {
                console.log('[ADMIN PROMOTER] No users found');
                return;
            }

            const users = snapshot.val();
            const roleUsers = Object.entries(users)
                .filter(([username, userData]) => userData.role && userData.role !== 'user')
                .map(([username, userData]) => ({
                    username,
                    role: userData.role,
                    promotedAt: userData.promotedAt,
                    createdAt: userData.createdAt
                }));

            console.log('[ADMIN PROMOTER] Current users with roles:', roleUsers);
            return roleUsers;

        } catch (error) {
            console.error('[ADMIN PROMOTER] Error listing users with roles:', error);
            return [];
        }
    }
}

// Initialize promoter
const promoter = new AdminPromoter();

// Add global functions
window.listAdmins = () => promoter.listAdmins();
window.makeUserAdmin = (username) => promoter.promoteToAdmin(username);
window.makeUserModerator = (username) => promoter.promoteToModerator(username);

console.log(`
=== HackConvo Admin Promoter ===
Available functions:
- makeUserAdmin("username") - Promote a user to admin
- makeUserModerator("username") - Promote a user to moderator
- listAdmins() - List all current admins

Examples:
  makeUserAdmin("john_doe")
  makeUserModerator("jane_smith")
`); 