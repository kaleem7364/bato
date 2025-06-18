// تهيئة Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyYourApiKeyHere",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {
    // عرض التاريخ الحالي
    const currentDateElement = document.getElementById('current-date');
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('ar-SA', options);
    
    // بيانات الأجهزة المسبقة
    const applianceData = {
        'fridge': { wattage: 150, hours: 24, icon: 'fa-refrigerator' },
        'ac': { wattage: 2000, hours: 8, icon: 'fa-wind' },
        'tv': { wattage: 100, hours: 5, icon: 'fa-tv' },
        'washing': { wattage: 500, hours: 1, icon: 'fa-washing-machine' },
        'heater': { wattage: 1500, hours: 2, icon: 'fa-water' },
        'light': { wattage: 60, hours: 6, icon: 'fa-lightbulb' },
        'other': { wattage: 0, hours: 0, icon: 'fa-plug' }
    };
    
    // عناصر DOM
    const calculateBtn = document.getElementById('calculate');
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');
    const applianceSelect = document.getElementById('appliance');
    const wattageInput = document.getElementById('wattage');
    const hoursInput = document.getElementById('hours');
    const daysInput = document.getElementById('days');
    const rateInput = document.getElementById('rate');
    const notesInput = document.getElementById('notes');
    const dailyConsumption = document.getElementById('daily-consumption');
    const monthlyConsumption = document.getElementById('monthly-consumption');
    const monthlyCost = document.getElementById('monthly-cost');
    const consumptionProgress = document.getElementById('consumption-progress');
    const consumptionLevel = document.getElementById('consumption-level');
    const deviceItems = document.querySelectorAll('.device-item');
    
    // إعداد الرسم البياني
    const ctx = document.getElementById('consumptionChart').getContext('2d');
    const consumptionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['الثلاجة', 'المكيف', 'التلفزيون', 'الغسالة', 'السخان', 'الإضاءة'],
            datasets: [{
                label: 'استهلاك الكهرباء (كيلوواط ساعة)',
                data: [300, 450, 120, 80, 200, 150],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'كيلوواط ساعة',
                        font: {
                            size: 14,
                            family: 'Tajawal'
                        }
                    },
                    ticks: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    titleFont: {
                        family: 'Tajawal'
                    },
                    bodyFont: {
                        family: 'Tajawal'
                    },
                    footerFont: {
                        family: 'Tajawal'
                    }
                }
            }
        }
    });
    
    // أحداث الأجهزة الشائعة
    deviceItems.forEach(item => {
        item.addEventListener('click', function() {
            const deviceType = this.getAttribute('data-device');
            applianceSelect.value = deviceType;
            wattageInput.value = applianceData[deviceType].wattage;
            hoursInput.value = applianceData[deviceType].hours;
            
            // إضافة تأثير مرئي
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });
    
    // حدث اختيار جهاز
    applianceSelect.addEventListener('change', function() {
        const selectedAppliance = this.value;
        if (selectedAppliance && selectedAppliance !== 'other') {
            wattageInput.value = applianceData[selectedAppliance].wattage;
            hoursInput.value = applianceData[selectedAppliance].hours;
        } else if (selectedAppliance === 'other') {
            wattageInput.value = '';
            hoursInput.value = '';
        }
    });
    
    // حدث حساب الاستهلاك
    calculateBtn.addEventListener('click', function() {
        const wattage = parseFloat(wattageInput.value);
        const hours = parseFloat(hoursInput.value);
        const days = parseFloat(daysInput.value);
        const rate = parseFloat(rateInput.value);
        
        if (isNaN(wattage) || isNaN(hours) || isNaN(days) || isNaN(rate)) {
            showAlert('الرجاء إدخال قيم صحيحة في جميع الحقول', 'error');
            return;
        }
        
        // حساب الاستهلاك
        const daily = (wattage * hours) / 1000;
        const monthly = daily * days;
        const cost = monthly * rate;
        
        // عرض النتائج
        dailyConsumption.textContent = daily.toFixed(2) + ' ك.و.س';
        monthlyConsumption.textContent = monthly.toFixed(2) + ' ك.و.س';
        monthlyCost.textContent = cost.toFixed(2) + ' ريال';
        
        // تحديث شريط التقدم
        updateConsumptionLevel(monthly);
        
        // تحديث الرسم البياني
        updateChart(monthly);
        
        // تأثير عند الحساب
        this.classList.add('btn-pulse');
        setTimeout(() => {
            this.classList.remove('btn-pulse');
        }, 500);
    });
    
    // حدث حفظ البيانات
    saveBtn.addEventListener('click', function() {
        const wattage = parseFloat(wattageInput.value);
        const hours = parseFloat(hoursInput.value);
        const days = parseFloat(daysInput.value);
        const rate = parseFloat(rateInput.value);
        const appliance = applianceSelect.value;
        const notes = notesInput.value;
        
        if (isNaN(wattage) {
            showAlert('الرجاء إدخال قدرة الجهاز أولاً', 'error');
            return;
        }
        
        const consumptionData = {
            appliance: appliance,
            wattage: wattage,
            hours: hours,
            days: days,
            rate: rate,
            dailyConsumption: (wattage * hours) / 1000,
            monthlyConsumption: (wattage * hours * days) / 1000,
            cost: (wattage * hours * days * rate) / 1000,
            notes: notes,
            timestamp: new Date().toISOString()
        };
        
        // حفظ البيانات في Firebase
        const newConsumptionRef = push(ref(database, 'consumptions'));
        set(newConsumptionRef, consumptionData)
            .then(() => {
                showAlert('تم حفظ بيانات الاستهلاك بنجاح', 'success');
            })
            .catch((error) => {
                showAlert('حدث خطأ أثناء حفظ البيانات: ' + error.message, 'error');
            });
    });
    
    // حدث إعادة التعيين
    resetBtn.addEventListener('click', function() {
        applianceSelect.value = '';
        wattageInput.value = '';
        hoursInput.value = '';
        daysInput.value = '30';
        rateInput.value = '0.18';
        notesInput.value = '';
        dailyConsumption.textContent = '0 ك.و.س';
        monthlyConsumption.textContent = '0 ك.و.س';
        monthlyCost.textContent = '0 ريال';
        consumptionProgress.style.width = '0%';
        consumptionLevel.textContent = 'منخفض';
        
        // إعادة تعيين الرسم البياني
        consumptionChart.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
        consumptionChart.update();
    });
    
    // تحديث مستوى الاستهلاك
    function updateConsumptionLevel(monthlyConsumption) {
        let level, width, color;
        
        if (monthlyConsumption < 100) {
            level = 'منخفض';
            width = '30%';
            color = '#4cc9f0';
        } else if (monthlyConsumption < 300) {
            level = 'متوسط';
            width = '60%';
            color = '#4895ef';
        } else {
            level = 'مرتفع';
            width = '90%';
            color = '#f72585';
        }
        
        consumptionLevel.textContent = level;
        consumptionProgress.style.width = width;
        consumptionProgress.style.background = color;
    }
    
    // تحديث الرسم البياني
    function updateChart(monthlyConsumption) {
        const baseValues = [300, 450, 120, 80, 200, 150];
        const updatedValues = baseValues.map(value => value * (monthlyConsumption / 300));
        
        consumptionChart.data.datasets[0].data = updatedValues;
        consumptionChart.update();
    }
    
    // عرض التنبيهات
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => {
                alertDiv.remove();
            }, 500);
        }, 3000);
    }
    
    // تهيئة Chart.js للأزرار
    document.getElementById('daily-chart').addEventListener('click', function() {
        updateChartType('daily');
        setActiveButton(this);
    });
    
    document.getElementById('monthly-chart').addEventListener('click', function() {
        updateChartType('monthly');
        setActiveButton(this);
    });
    
    document.getElementById('yearly-chart').addEventListener('click', function() {
        updateChartType('yearly');
        setActiveButton(this);
    });
    
    function setActiveButton(button) {
        document.querySelectorAll('.chart-actions .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }
    
    function updateChartType(type) {
        // هنا يمكنك تغيير بيانات الرسم البياني حسب النوع
        // هذا مثال بسيط لتوضيح الفكرة
        let labels, data;
        
        switch(type) {
            case 'daily':
                labels = ['12 ص', '3 ص', '6 ص', '9 ص', '12 م', '3 م', '6 م', '9 م'];
                data = [50, 30, 20, 60, 120, 150, 100, 80];
                consumptionChart.config.type = 'line';
                break;
            case 'monthly':
                labels = ['الثلاجة', 'المكيف', 'التلفزيون', 'الغسالة', 'السخان', 'الإضاءة'];
                data = [300, 450, 120, 80, 200, 150];
                consumptionChart.config.type = 'bar';
                break;
            case 'yearly':
                labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                data = [400, 380, 350, 320, 450, 600, 800, 850, 700, 550, 450, 400];
                consumptionChart.config.type = 'line';
                break;
        }
        
        consumptionChart.data.labels = labels;
        consumptionChart.data.datasets[0].data = data;
        consumptionChart.update();
    }
});
