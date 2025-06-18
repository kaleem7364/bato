import { auth } from './firebase-config.js';

// حالات المصادقة
auth.onAuthStateChanged(user => {
    if (user) {
        // المستخدم مسجل الدخول
        console.log('User is logged in:', user);
        document.querySelector('.user-profile span').textContent = user.displayName || 'مستخدم';
    } else {
        // لا يوجد مستخدم مسجل الدخول
        console.log('User is logged out');
        // يمكنك توجيه المستخدم إلى صفحة تسجيل الدخول هنا
    }
});

// تسجيل الدخول
function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

// تسجيل الخروج
function logout() {
    return auth.signOut();
}

// تصدير الدوال
export { login, logout };
