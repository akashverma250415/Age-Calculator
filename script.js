class AppleStyleAgeCalculator {
    constructor() {
        this.form = document.getElementById('ageForm');
        this.dobInput = document.getElementById('inputDob');
        this.birthTimeInput = document.getElementById('birthTime');
        this.currentDateInput = document.getElementById('cdate');
        this.currentTimeInput = document.getElementById('currentTime');
        this.liveToggle = document.getElementById('liveToggle');
        this.errorMessage = document.getElementById('errorMessage');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.liveIndicator = document.getElementById('liveIndicator');
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        
        this.liveInterval = null;
        this.isLiveMode = false;
        
        this.init();
    }
    
    init() {
        this.setDefaultValues();
        this.addEventListeners();
        this.setupScrollAnimations();
        this.setupNavbar();
    }
    
    setDefaultValues() {
        const now = new Date();
        this.currentDateInput.value = this.formatDate(now);
        this.currentTimeInput.value = this.formatTime(now);
        this.birthTimeInput.value = "00:00:00";
    }
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    addEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.liveToggle.addEventListener('click', () => this.toggleLiveMode());
        
        // Mobile menu
        this.hamburger.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.hamburger.classList.toggle('active');
        });
        
        // Close mobile menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('active');
                this.hamburger.classList.remove('active');
            });
        });
    }
    
    setupNavbar() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                this.navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            } else {
                this.navbar.style.background = 'rgba(0, 0, 0, 0.8)';
            }
            
            lastScroll = currentScroll;
        });
    }
    
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.skill-card, .project-card, .timeline-item, .contact-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    handleSubmit(e) {
        e.preventDefault();
        this.stopLiveMode();
        this.calculateAge();
    }
    
    calculateAge(useLiveTime = false) {
        const dobValue = this.dobInput.value;
        const currentDateValue = useLiveTime ? this.formatDate(new Date()) : this.currentDateInput.value;
        const birthTimeValue = this.birthTimeInput.value || "00:00:00";
        const currentTimeValue = useLiveTime ? this.formatTime(new Date()) : (this.currentTimeInput.value || "00:00:00");
        
        if (!dobValue || !currentDateValue) {
            this.showError('Please enter both Date of Birth and Calculate Date');
            return;
        }
        
        const birthDateTime = new Date(`${dobValue}T${birthTimeValue}`);
        const currentDateTime = new Date(`${currentDateValue}T${currentTimeValue}`);
        
        if (isNaN(birthDateTime.getTime()) || isNaN(currentDateTime.getTime())) {
            this.showError('Please enter valid dates and times');
            return;
        }
        
        if (birthDateTime >= currentDateTime) {
            this.showError('Date of Birth must be before Calculate Date');
            return;
        }
        
        this.hideError();
        
        const age = this.getPreciseAge(birthDateTime, currentDateTime);
        this.displayResults(age);
    }
    
    getPreciseAge(start, end) {
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();
        let hours = end.getHours() - start.getHours();
        let minutes = end.getMinutes() - start.getMinutes();
        let seconds = end.getSeconds() - start.getSeconds();
        
        if (seconds < 0) {
            seconds += 60;
            minutes--;
        }
        if (minutes < 0) {
            minutes += 60;
            hours--;
        }
        if (hours < 0) {
            hours += 24;
            days--;
        }
        if (days < 0) {
            const prevMonth = end.getMonth() === 0 ? 11 : end.getMonth() - 1;
            const prevMonthYear = end.getMonth() === 0 ? end.getFullYear() - 1 : end.getFullYear();
            days += new Date(prevMonthYear, prevMonth + 1, 0).getDate();
            months--;
        }
        if (months < 0) {
            months += 12;
            years--;
        }
        
        return { years, months, days, hours, minutes, seconds };
    }
    
    displayResults(age) {
        this.animateValue('years', age.years);
        this.animateValue('months', age.months);
        this.animateValue('days', age.days);
        this.animateValue('hours', age.hours);
        this.animateValue('minutes', age.minutes);
        this.animateValue('seconds', age.seconds);
        
        const timeString = `${String(age.hours).padStart(2, '0')}:${String(age.minutes).padStart(2, '0')}:${String(age.seconds).padStart(2, '0')}`;
        document.getElementById('ageSummary').textContent = 
            `You are exactly ${age.years} years, ${age.months} months, ${age.days} days, and ${timeString} old.`;
        
        this.resultsContainer.classList.add('show');
        
        setTimeout(() => {
            this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
    
    animateValue(id, value) {
        const element = document.getElementById(id);
        const duration = 1000;
        const start = 0;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (value - start) * easeOutQuart);
            
            element.textContent = String(current).padStart(2, '0');
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
    
    toggleLiveMode() {
        if (this.isLiveMode) {
            this.stopLiveMode();
        } else {
            this.startLiveMode();
        }
    }
    
    startLiveMode() {
        this.isLiveMode = true;
        this.liveToggle.innerHTML = '<i class="fas fa-stop"></i> Stop Live Timer';
        this.liveIndicator.classList.add('active');
        
        this.calculateAge(true);
        
        this.liveInterval = setInterval(() => {
            this.calculateAge(true);
        }, 1000);
    }
    
    stopLiveMode() {
        this.isLiveMode = false;
        this.liveToggle.innerHTML = '<i class="fas fa-play"></i> Start Live Timer';
        this.liveIndicator.classList.remove('active');
        
        if (this.liveInterval) {
            clearInterval(this.liveInterval);
            this.liveInterval = null;
        }
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        setTimeout(() => this.hideError(), 5000);
    }
    
    hideError() {
        this.errorMessage.classList.remove('show');
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new AppleStyleAgeCalculator();
    
    // Add smooth reveal animations
    const style = document.createElement('style');
    style.textContent = `
        .skill-card, .project-card, .timeline-item, .contact-card {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .skill-card.animate-in, 
        .project-card.animate-in, 
        .timeline-item.animate-in, 
        .contact-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 44px;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.95);
            padding: 20px;
            gap: 15px;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    `;
    document.head.appendChild(style);
});
