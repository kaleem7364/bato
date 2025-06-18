import { database } from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', function() {
    // جلب بيانات الاستهلاك من Firebase
    const consumptionsRef = ref(database, 'consumptions');
    
    onValue(consumptionsRef, (snapshot) => {
        const data = snapshot.val();
        console.log('Consumption data:', data);
        
        // هنا يمكنك معالجة البيانات وعرضها في لوحة التحكم
        // مثلاً تحديث الإحصائيات أو عرض آخر التسجيلات
    });
    
    // يمكنك إضافة المزيد من وظائف لوحة التحكم هنا
});
