import { questions } from './questions.js';
import { gbti_types } from './types_data.js';

class QuizEngine {
    constructor() {
        this.currentIndex = 0;
        this.scores = { E: 0, T: 0, A: 0, P: 0 };
        this.dimensionCounts = { E: 5, T: 5, A: 5, P: 5 }; // Based on 20 questions
        
        this.elements = {
            hero: document.getElementById('hero'),
            quiz: document.getElementById('quiz-container'),
            result: document.getElementById('result-container'),
            loading: document.getElementById('loading-screen'),
            qText: document.getElementById('question-text'),
            progress: document.getElementById('progress-fill'),
            ball: document.getElementById('golf-ball-marker'),
            dimLabel: document.getElementById('dimension-label'),
            btns: document.querySelectorAll('.answer-btn')
        };

        this.init();
    }

    init() {
        document.getElementById('start-btn').addEventListener('click', () => this.startQuiz());
        this.elements.btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = parseInt(e.currentTarget.dataset.value);
                this.handleAnswer(val);
            });
        });
        document.getElementById('save-card-btn').addEventListener('click', () => this.saveCard());
    }

    startQuiz() {
        gsap.to(this.elements.hero, { opacity: 0, y: -50, duration: 0.5, onComplete: () => {
            this.elements.hero.classList.add('hidden');
            this.elements.quiz.classList.remove('hidden');
            this.showQuestion();
            gsap.from(this.elements.quiz, { opacity: 0, y: 50, duration: 0.5 });
        }});
    }

    showQuestion() {
        const q = questions[this.currentIndex];
        this.elements.qText.innerText = q.text;
        
        const dims = { E: "Social Style", T: "Decision Logic", A: "Risk Tolerance", P: "Routine & Prep" };
        this.elements.dimLabel.innerText = `${dims[q.dimension]}...`;

        const percent = (this.currentIndex / questions.length) * 100;
        this.elements.progress.style.width = `${percent}%`;
        this.elements.ball.style.left = `calc(${percent}% - 10px)`;
    }

    handleAnswer(value) {
        const q = questions[this.currentIndex];
        this.scores[q.dimension] += value;
        this.currentIndex++;

        if (this.currentIndex < questions.length) {
            this.transitionQuestion();
        } else {
            this.processResult();
        }
    }

    transitionQuestion() {
        const card = document.getElementById('question-card');
        gsap.to(card, { opacity: 0, x: -20, duration: 0.2, onComplete: () => {
            this.showQuestion();
            gsap.fromTo(card, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3 });
        }});
    }

    processResult() {
        this.elements.quiz.classList.add('hidden');
        this.elements.loading.classList.remove('hidden');
        

        gsap.to("#loading-ball", {
            x: 200,
            y: -80,
            duration: 1.5,
            ease: "power2.out",
            repeat: 1,
            yoyo: true
        });

        setTimeout(() => {
            const finalType = [
                this.scores.E > 0 ? "E" : "I",
                this.scores.T > 0 ? "T" : "F",
                this.scores.A > 0 ? "A" : "C",
                this.scores.P > 0 ? "P" : "S"
            ].join("");
            this.showResult(finalType);
        }, 3000);
    }

    showResult(typeCode) {
        const data = gbti_types[typeCode] || gbti_types["DEFAULT"];
        
        document.getElementById('type-code').innerText = typeCode;
        document.getElementById('type-nickname').innerText = data.title;
        document.getElementById('type-desc').innerText = data.description;
        document.getElementById('type-img').src = data.img;
        document.getElementById('type-pro').innerText = data.pro;
        document.getElementById('type-gear').innerText = data.gear;
        document.getElementById('type-coaching').innerText = data.coaching;


        const container = document.getElementById('dimension-bars');
        container.innerHTML = '';
        
        const dimensions = [
            { label: 'Energy', left: 'Extraverted', right: 'Introverted', val: this.calculatePercent(this.scores.E, 'E') },
            { label: 'Logic', left: 'Technical', right: 'Feel-based', val: this.calculatePercent(this.scores.T, 'T') },
            { label: 'Risk', left: 'Aggressive', right: 'Conservative', val: this.calculatePercent(this.scores.A, 'A') },
            { label: 'Strategy', left: 'Planned', right: 'Spontaneous', val: this.calculatePercent(this.scores.P, 'P') }
        ];

        dimensions.forEach(d => {
            const isLeft = d.val >= 50;
            const displayVal = isLeft ? d.val : 100 - d.val;
            
            const html = `
                <div class="space-y-2">
                    <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <span class="${isLeft ? 'text-[#2D5A27]' : ''}">${d.left}</span>
                        <span class="${!isLeft ? 'text-[#2D5A27]' : ''}">${d.right}</span>
                    </div>
                    <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
                        <div class="h-full bg-[#2D5A27] transition-all duration-1000" style="width: ${displayVal}%; margin-left: ${isLeft ? '0' : 'auto'}"></div>
                    </div>
                    <div class="flex justify-between text-[10px] font-bold">
                        <span>${isLeft ? displayVal + '%' : ''}</span>
                        <span>${!isLeft ? displayVal + '%' : ''}</span>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });

        this.elements.loading.classList.add('hidden');
        this.elements.result.classList.remove('hidden');
        gsap.from("#result-container", { opacity: 0, scale: 0.98, duration: 1, ease: "expo.out" });
        lucide.createIcons();
    }

    calculatePercent(score, dim) {

        const max = 15;
        const normalized = ((score + max) / (max * 2)) * 100;
        return Math.round(normalized);
    }

    async saveCard() {
        const area = document.getElementById('capture-area');
        const btn = document.getElementById('save-card-btn');
        btn.innerText = "Generating...";
        
        const canvas = await html2canvas(area, {
            backgroundColor: "#F5F5F5",
            scale: 2
        });
        
        const link = document.createElement('a');
        link.download = `GBTI_Personality_${document.getElementById('type-code').innerText}.png`;
        link.href = canvas.toDataURL();
        link.click();
        btn.innerHTML = `<i data-lucide="download" class="w-4 h-4"></i><span>Save Personality Card</span>`;
        lucide.createIcons();
    }
}

new QuizEngine();
