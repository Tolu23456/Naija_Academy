/**
 * app.js - Nigeria Academy Dashboard SPA Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('page-content');
    const scrollContainer = document.getElementById('mainContent');
    const navButtons = document.querySelectorAll('.nav-item');
    const loader = document.getElementById('global-loader');
    const sidebar = document.getElementById('sidebar');

    function showLoader() {
        if(loader) loader.classList.remove('hidden');
    }

    function hideLoader() {
        if(loader) loader.classList.add('hidden');
    }

    // Initialize page-specific functionality since inline scripts aren't always run via fetch injection
    async function initializePage(page) {
        if (page === 'physics') {
            const kinLink = document.querySelector('.dynamic-link[data-subject="physics"]');
            if (kinLink) kinLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadPage('physics/kinematics');
            });
        }
        if (page === 'chemistry') {
            const orgLink = document.querySelector('.dynamic-link[data-subject="chemistry"]');
            if (orgLink) orgLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadPage('chemistry/organic');
            });
        }
        if (page === 'maths') {
            const algLink = document.querySelector('.dynamic-link[data-subject="maths"]');
            if (algLink) algLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadPage('maths/algebra');
            });
        }
        
        if (page === 'exams/cbt') {
            let CBT_QUESTIONS = [];
            try {
                const res = await fetch('./cbt_questions.json');
                if (!res.ok) throw new Error("JSON Fetch failed");
                const data = await res.json();
                
                const allQuestions = [];
                for (const subject in data) {
                    data[subject].forEach(item => {
                        allQuestions.push({
                            q: item.question,
                            options: item.options,
                            correct: item.answerIndex
                        });
                    });
                }
                
                const shuffled = allQuestions.sort(() => 0.5 - Math.random());
                CBT_QUESTIONS = shuffled.slice(0, 10);
                
                if (CBT_QUESTIONS.length === 0) throw new Error("Empty question bank");
            } catch (err) {
                console.error("Failed to load CBT questions:", err);
                CBT_QUESTIONS = [
                    { q: 'Network error loading real questions. Choose the opposite of Arrive:', options: ['Depart', 'Come', 'Enter', 'Leave'], correct: 0 }
                ];
            }
            
            let currentQ = 0;
            let selectedAnswers = new Array(CBT_QUESTIONS.length).fill(null);
            
            const qText = document.getElementById('cbt-question-text');
            const optionsContainer = document.getElementById('cbt-options');
            const currentQDisp = document.getElementById('cbt-current-q');
            const totalQDisp = document.getElementById('cbt-total-q');
            const nextBtn = document.getElementById('cbt-next');
            const prevBtn = document.getElementById('cbt-prev');
            const submitBtn = document.getElementById('cbt-submit');
            
            if(totalQDisp) totalQDisp.innerText = CBT_QUESTIONS.length;

            function renderQ() {
                if(!qText) return;
                const q = CBT_QUESTIONS[currentQ];
                currentQDisp.innerText = currentQ + 1;
                qText.innerText = q.q;
                
                optionsContainer.innerHTML = '';
                q.options.forEach((opt, idx) => {
                    const label = document.createElement('label');
                    label.className = 'custom-checkbox glass-card p-2';
                    label.style.display = 'flex';
                    label.style.alignItems = 'center';
                    label.style.cursor = 'pointer';
                    label.style.border = selectedAnswers[currentQ] === idx ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)';
                    label.style.marginBottom = '0.5rem';
                    
                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.name = 'cbt-option';
                    input.style.marginRight = '1rem';
                    input.checked = selectedAnswers[currentQ] === idx;
                    
                    input.onchange = () => {
                        selectedAnswers[currentQ] = idx;
                        renderQ();
                    };
                    
                    label.appendChild(input);
                    label.appendChild(document.createTextNode(String.fromCharCode(65 + idx) + '. ' + opt));
                    optionsContainer.appendChild(label);
                });
                
                prevBtn.disabled = currentQ === 0;
                if (currentQ === CBT_QUESTIONS.length - 1) {
                    nextBtn.style.display = 'none';
                    submitBtn.style.display = 'inline-block';
                } else {
                    nextBtn.style.display = 'inline-block';
                    submitBtn.style.display = 'none';
                }
            }
            
            if(nextBtn) nextBtn.onclick = () => { if(currentQ < CBT_QUESTIONS.length - 1) { currentQ++; renderQ(); } };
            if(prevBtn) prevBtn.onclick = () => { if(currentQ > 0) { currentQ--; renderQ(); } };
            if(submitBtn) submitBtn.onclick = () => {
                let score = 0;
                selectedAnswers.forEach((ans, idx) => { if(ans === CBT_QUESTIONS[idx].correct) score++; });
                
                // Hide controls and question, show results
                const container = document.getElementById('cbt-question-container');
                if(container) container.style.display = 'none';
                document.getElementById('cbt-results').style.display = 'block';
                
                const percentage = Math.round((score / CBT_QUESTIONS.length) * 100);
                document.getElementById('cbt-score-display').innerText = percentage + '%';
                if(percentage >= 80) {
                    document.getElementById('cbt-score-display').style.color = 'var(--success)';
                } else if(percentage >= 50) {
                    document.getElementById('cbt-score-display').style.color = 'var(--warning)';
                } else {
                    document.getElementById('cbt-score-display').style.color = 'var(--danger)';
                }
                
                if(window.cbtTimer) clearInterval(window.cbtTimer);
            };
            
            renderQ();
            
            // Timer setup
            let timeLeft = 30 * 60; // 30 mins
            const timerEl = document.getElementById('cbt-timer');
            if(window.cbtTimer) clearInterval(window.cbtTimer);
            window.cbtTimer = setInterval(() => {
                timeLeft--;
                if(timeLeft <= 0) {
                    clearInterval(window.cbtTimer);
                    if(submitBtn) submitBtn.click();
                } else {
                    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                    const s = (timeLeft % 60).toString().padStart(2, '0');
                    if(timerEl) timerEl.innerText = `00:${m}:${s}`;
                }
            }, 1000);
        }
        
        // Setup back button for topic pages (excluding the CBT exam module)
        if (page.includes('/') && page !== 'exams/cbt') {
            const layoutHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <button id="backToSubjectBtn" class="btn btn-outline">
                        <i class='bx bx-left-arrow-alt'></i> Back to Subject
                    </button>
                </div>
            `;
            // Prepend a back button dynamically if it's a sub-page
            main.innerHTML = layoutHTML + main.innerHTML;
            
            document.getElementById('backToSubjectBtn').addEventListener('click', () => {
                const parentSubject = page.split('/')[0];
                loadPage(parentSubject);
            });
        }
    }

    async function loadPage(page) {
        try {
            // Validate page parameter
            if (!page || typeof page !== 'string') {
                console.error('Invalid page parameter:', page);
                return;
            }

            showLoader();

            // Clear any running timers
            if(window.cbtTimer) {
                clearInterval(window.cbtTimer);
                window.cbtTimer = null;
            }

            // Save current page to localStorage for reload persistence
            try {
                localStorage.setItem('lastPage', page);
            } catch (storageError) {
                console.warn('Failed to save page to localStorage:', storageError);
            }

            // Update active navigation with null checks
            // Only update sidebar if it's a top-level page
            const isSubPage = page.includes('/');
            if (navButtons && navButtons.length > 0 && !isSubPage) {
                navButtons.forEach(btn => {
                    if (btn && btn.getAttribute) {
                        btn.classList.toggle("active", btn.getAttribute("data-target") === page);
                    }
                });
            }

            // Add fade-out transition to current content
            if (main) {
                main.classList.add('page-fade-out');

                // Wait for fade-out animation to complete
                await new Promise(resolve => setTimeout(resolve, 200));

                // Load page content
                const response = await fetch(`./Pages/${page}.html`);
                if (response.ok) {
                    const content = await response.text();
                    main.innerHTML = content;

                    // Reset scroll position to top for each new page - force immediate reset
                    if(scrollContainer) scrollContainer.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;

                    // Force a layout recalculation to ensure scroll reset
                    main.offsetHeight;

                    // Remove fade-out and add fade-in transition
                    main.classList.remove('page-fade-out');
                    main.classList.add('page-fade-in');

                    // Initialize page-specific functionality
                    try {
                        await initializePage(page);
                    } catch (initError) {
                        console.error('Error initializing page:', initError);
                    }

                    // Remove fade-in class after animation completes
                    setTimeout(() => {
                        if (main) {
                            main.classList.remove('page-fade-in');
                        }
                    }, 300);

                    // Force style recalculation to ensure CSS is applied
                    if (main) {
                        main.offsetHeight; // Trigger reflow
                        window.getComputedStyle(main).opacity; // Force style recalculation
                    }
                } else {
                    main.innerHTML = '<div class="glass-card padding-2 text-center" style="border-color: var(--danger);"><i class="bx bx-error-circle text-danger" style="font-size: 3rem;"></i><h3 style="margin: 1rem 0;">Page not found</h3><p style="color:var(--text-secondary);">Direct file access (file://) does not support dynamic fetches. Start a local server to view this properly.</p></div>';
                    if(scrollContainer) scrollContainer.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    main.offsetHeight;
                    main.classList.remove('page-fade-out');
                    main.classList.add('page-fade-in');
                }
            }

            hideLoader();
        } catch (error) {
            console.error('Error loading page:', error);
            if (main) {
                main.innerHTML = '<div class="glass-card padding-2 text-center"><h3 class="text-danger">Error loading page</h3></div>';
                if(scrollContainer) scrollContainer.scrollTop = 0;
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                main.offsetHeight;
                main.classList.remove('page-fade-out');
            }
            hideLoader();
        }
    }

    // Add click listeners to sidebar links
    navButtons.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if (item.classList.contains('active')) return;
            loadPage(targetId);

            if (sidebar && window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    const mobileOpenBtn = document.getElementById('mobileOpenNav');
    const mobileCloseBtn = document.getElementById('mobileCloseNav');
    if (mobileOpenBtn && sidebar) mobileOpenBtn.addEventListener('click', () => sidebar.classList.add('open'));
    if (mobileCloseBtn && sidebar) mobileCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    // Global Exposure and Initialization
    window.loadPage = loadPage;
    const initialPage = localStorage.getItem('lastPage') || 'dashboard';
    loadPage(initialPage);
});
