/* =========================================================
   FAIL-SAFE LOADER
========================================================= */

(function hideLearnMateLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("hidden");
})();

/* =========================================================
   LEARNMATE
   Main JavaScript
========================================================= */

/* =========================================================
   COLLAPSIBLE LEARNMATE MENU
========================================================= */

function openSideMenu() {
    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");
    const toggle = document.getElementById("menuToggleButton");

    if (!menu || !overlay) return;

    menu.classList.add("open");
    overlay.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
}

function closeSideMenu() {
    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");
    const toggle = document.getElementById("menuToggleButton");

    if (!menu || !overlay) return;

    menu.classList.remove("open");
    overlay.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
}

function toggleSideMenu() {
    const menu = document.getElementById("sideMenu");
    if (menu && menu.classList.contains("open")) {
        closeSideMenu();
    } else {
        openSideMenu();
    }
}

function showComingSoon(featureName) {
    const message = `${featureName} is part of the LearnMate roadmap and will be added later.`;
    alert(message);
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeSideMenu();
    }
});

/* =========================================================
   VIEW MANAGEMENT
========================================================= */

function showView(viewId) {

    const currentView = document.querySelector(".view.active");

    if (currentView && currentView.id === viewId) {
        return;
    }

    const transition = document.getElementById("pageTransition");

    transition.classList.remove("active");

    void transition.offsetWidth;

    transition.classList.add("active");

    setTimeout(() => {

        document.querySelectorAll(".view").forEach(view => {
            view.classList.remove("active");
        });

        const target = document.getElementById(viewId);

        if (target) {
            target.classList.add("active");
        }

        // The calculator is a subject tool, so keep its navigation button
        // visible only while the student is in a relevant subject context.
        const calculatorContextViews = new Set([
            "workspace-view",
            "materials-view",
            "lesson-view",
            "practice-setup-view",
            "test-view",
            "review-view",
            "calculator-view"
        ]);

        const calculatorAllowedHere =
            calculatorContextViews.has(viewId) &&
            subjectUsesCalculator();

        const calculatorNavButton =
            document.getElementById("calculatorNavButton");

        if (calculatorNavButton) {
            calculatorNavButton.hidden = !calculatorAllowedHere;
            calculatorNavButton.setAttribute(
                "aria-hidden",
                String(!calculatorAllowedHere)
            );
        }

        const testCalculatorButton =
            document.getElementById("testCalculatorButton");

        if (testCalculatorButton) {
            testCalculatorButton.hidden =
                !(viewId === "test-view" && subjectUsesCalculator());
        }

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });

    }, 180);
}







/* =========================================================
   GLOBAL STATE
========================================================= */

let currentSubject = null;

let currentQuestions = [];
let currentQuestionIndex = 0;

let userAnswers = [];
let skippedQuestions = [];

let quizSubmitted = false;

let timerInterval = null;
let remainingSeconds = 20 * 60;

let lastCompletedQuiz = null;

let showingAllSubjects = false;

let calculatorReturnView = "home-view";

const NOTIFICATIONS_KEY = "learnmate_notifications_v1";
const REMINDERS_KEY = "learnmate_reminders_v1";
const SETTINGS_KEY = "learnmate_settings_v1";


/* =========================================================
   SUBJECT CALCULATOR ACCESS
========================================================= */

// Subjects where a calculator is useful for the current frontend.
// This controls both the main Calculator navigation button and the
// calculator button inside a practice test.
const calculatorSubjects = new Set([
    "Mathematics",
    "Physics",
    "Chemistry",
    "Accounting",
    "Economics",
    "Geography",
    "Biology",
    "Agricultural Science",
    "Computer Science"
]);

function subjectUsesCalculator(subjectName = currentSubject) {
    return Boolean(subjectName && calculatorSubjects.has(subjectName));
}

function updateCalculatorVisibility() {
    const headerButton = document.getElementById("calculatorNavButton");
    const testButton = document.getElementById("testCalculatorButton");

    const allowed = subjectUsesCalculator();

    // The menu Calculator is a general LearnMate utility, so it should
    // always be available. The calculator inside a practice test remains
    // restricted to subjects where calculation is useful.
    if (headerButton) {
        headerButton.hidden = false;
        headerButton.setAttribute("aria-hidden", "false");
    }

    if (testButton) {
        testButton.hidden = !allowed;
    }
}


/* =========================================================
   SUBJECTS
========================================================= */

const subjects = [
    {
        name: "English Language",
        icon: "📖",
        description: "English Language develops the ability to read, write, speak and understand English clearly. It covers grammar, vocabulary, comprehension, communication and effective use of language in everyday and academic situations."
    },

    {
        name: "Mathematics",
        icon: "🧮",
        description: "Mathematics is a subject concerned with numbers, quantities, patterns, shapes and logical relationships. It develops calculation, reasoning, problem-solving and the ability to use mathematical ideas in real-life situations."
    },

    {
        name: "Biology",
        icon: "🧬",
        description: "Biology is the study of living things and how they function, grow, reproduce and interact with their environment. It includes cells, genetics, ecology, evolution and major life processes."
    },

    {
        name: "Chemistry",
        icon: "⚗️",
        description: "Chemistry is the study of matter, its properties, composition and the changes it undergoes. It helps us understand atoms, elements, compounds, chemical bonding, reactions, acids, bases and chemical calculations."
    },

    {
        name: "Physics",
        icon: "⚡",
        description: "Physics studies matter, energy and the laws that describe how the physical world works. It covers motion, forces, energy, electricity, waves, heat, light and other physical phenomena."
    },

    {
        name: "Geography",
        icon: "🌍",
        description: "Geography is the study of places, people, environments and the relationships between them. It examines physical features, climate, population, settlements, resources and human activities."
    },

    {
        name: "Government",
        icon: "🏛️",
        description: "Government examines how societies are organized and governed. It covers political institutions, constitutions, democracy, citizenship, leadership, public administration and political processes."
    },

    {
        name: "Economics",
        icon: "📈",
        description: "Economics studies how people and societies use limited resources to satisfy human needs and wants. It covers production, consumption, markets, demand, supply, prices, money and economic systems."
    },

    {
        name: "Literature",
        icon: "📚",
        description: "Literature is the study and appreciation of creative works such as prose, poetry and drama. It develops interpretation, critical thinking and understanding of themes, characters, language and literary techniques."
    },

    {
        name: "Accounting",
        icon: "💰",
        description: "Accounting is the systematic recording, classification and interpretation of financial transactions. It helps individuals and organizations understand their financial position, performance and financial decisions."
    },

    {
        name: "Agricultural Science",
        icon: "🌱",
        description: "Agricultural Science studies the production and management of crops and animals and the resources used in farming. It includes soil, crop production, livestock, farm management, agricultural economics and sustainable practices."
    },

    {
        name: "Computer Science",
        icon: "💻",
        description: "Computer Science studies computation and how computers and software solve problems. It covers programming, algorithms, data, computer systems, networks, information and computational thinking."
    }
];


/* =========================================================
   SUBJECT CATALOGUE
========================================================= */

function renderSubjectCards(containerId, visibleSubjects) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = visibleSubjects.map(subject => `
        <article class="subject-card">
            <div class="subject-icon">${subject.icon}</div>
            <h3>${escapeHTML(subject.name)}</h3>
            <p>${escapeHTML(subject.description)}</p>
            <button type="button" class="btn btn-green explore-subject" data-subject="${escapeHTML(subject.name)}">
                Explore Subject
            </button>
        </article>
    `).join("");
}

function renderSubjects(searchTerm = "") {
    renderSubjectCards("homeSubjects", subjects.slice(0, 4));

    const search = String(searchTerm).trim().toLowerCase();
    const matches = subjects.filter(subject =>
        !search ||
        subject.name.toLowerCase().includes(search) ||
        subject.description.toLowerCase().includes(search)
    );

    const visible = search
        ? matches
        : (showingAllSubjects ? subjects : subjects.slice(0, 6));

    renderSubjectCards("subjectsGrid", visible);

    const toggle = document.getElementById("toggleSubjectsButton");
    if (toggle) {
        toggle.textContent = search
            ? `Showing ${matches.length} Matching Subject${matches.length === 1 ? "" : "s"}`
            : (showingAllSubjects ? "Show Fewer Subjects" : "View All Subjects");
        toggle.disabled = Boolean(search);
    }
}

/* =========================================================
   GLOBAL SEARCH
========================================================= */

function normalizeSearchText(value) {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function getGlobalSearchItems() {
    const items = [];

    subjects.forEach(subject => items.push({
        type: "Subject",
        title: subject.name,
        description: subject.description,
        keywords: `${subject.name} ${subject.description}`,
        action: () => openSubject(subject.name)
    }));

    getBookmarks().forEach(bookmark => items.push({
        type: "Bookmark",
        title: bookmark.question || "Saved question",
        description: `${bookmark.subject || "Subject"} • Saved question`,
        keywords: `${bookmark.question || ""} ${bookmark.answer || ""} ${bookmark.subject || ""}`,
        action: () => { showView("bookmarks-view"); renderBookmarks(); }
    }));

    const progressData = getProgressData();
    (progressData.tests || []).forEach((test, index) => items.push({
        type: "Practice History",
        title: `${test.subject || "Practice"} test`,
        description: `Score: ${test.score ?? "—"} • ${test.total ?? "—"} questions • Test ${index + 1}`,
        keywords: `${test.subject || ""} ${test.score || ""} ${test.total || ""} practice test`,
        action: () => { showView("progress-view"); renderProgress(); }
    }));

    return items;
}

function renderGlobalSearch(query = "") {
    const results = document.getElementById("globalSearchResults");
    const summary = document.getElementById("globalSearchSummary");
    if (!results || !summary) return;

    const clean = String(query).trim();
    if (!clean) {
        summary.textContent = "Search subjects, saved questions and practice history.";
        results.innerHTML = `<div class="global-search-empty"><strong>Start searching</strong><p>Type a subject name or another word above.</p></div>`;
        return;
    }

    const needle = normalizeSearchText(clean);
    const matches = getGlobalSearchItems().filter(item => normalizeSearchText(item.keywords).includes(needle));
    summary.textContent = matches.length
        ? `${matches.length} result${matches.length === 1 ? "" : "s"} found for “${clean}”.`
        : `No results found for “${clean}”.`;

    if (!matches.length) {
        results.innerHTML = `<div class="global-search-empty"><strong>No matches yet</strong><p>Try a subject such as Mathematics or Chemistry.</p></div>`;
        return;
    }

    results.innerHTML = matches.map((item, index) => `
        <article class="global-search-result-card">
            <span>${escapeHTML(item.type)}</span>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.description)}</p>
            <button type="button" class="btn btn-green global-search-open" data-search-index="${index}">Open</button>
        </article>
    `).join("");

    results.querySelectorAll(".global-search-open").forEach((button, index) => {
        button.addEventListener("click", () => matches[index].action());
    });
}

function openGlobalSearch(query = "") {
    showView("global-search-view");
    setTimeout(() => {
        const input = document.getElementById("globalSearchInput");
        if (!input) return;
        input.value = query;
        renderGlobalSearch(query);
        input.focus();
        input.select();
    }, 220);
}

function initializeGlobalSearch() {
    const input = document.getElementById("globalSearchInput");
    const clearButton = document.getElementById("clearGlobalSearchButton");
    input?.addEventListener("input", event => renderGlobalSearch(event.target.value));
    clearButton?.addEventListener("click", () => {
        if (input) input.value = "";
        renderGlobalSearch("");
        input?.focus();
    });
}


/* =========================================================
   SUBJECT WORKSPACE
========================================================= */

function openSubject(subjectName) {

    currentSubject = subjectName;
    updateCalculatorVisibility();

    const subject = subjects.find(
        item => item.name === subjectName
    );

    if (!subject) {
        return;
    }


    document.getElementById(
        "workspaceSubjectLabel"
    ).textContent = subjectName;


    document.getElementById(
        "workspaceTitle"
    ).textContent = subjectName;


    document.getElementById(
        "workspaceDescription"
    ).textContent = subject.description;


    const icon = document.getElementById("workspaceSubjectIcon");
    if (icon) {
        icon.textContent = subject.icon;
    }

    const workspaceContent = document.getElementById("subjectWorkspaceContent");
    if (workspaceContent) {
        workspaceContent.innerHTML = `
            <article class="subject-overview-card subject-overview-single">
                <span>ABOUT THIS SUBJECT</span>
                <h2>What is ${subject.name}?</h2>
                <p>${subject.description}</p>
                <div class="subject-overview-note">
                    <strong>Need help with a particular area?</strong>
                    <span>Ask the AI Tutor and tell it what you want to learn. It can explain the idea, give examples, guide you through questions and help you practise.</span>
                </div>
            </article>
        `;
    }

    showView("workspace-view");
}




/* =========================================================
   PRACTICE SETUP
========================================================= */

function populatePracticeSubjects() {

    const select =
        document.getElementById("practiceSubject");


    if (!select) {
        return;
    }


    select.innerHTML = subjects.map(subject => {

        return `
            <option value="${subject.name}">
                ${subject.name}
            </option>
        `;

    }).join("");
}


/* =========================================================
   RANDOM HELPERS
========================================================= */

function randomInt(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}


function shuffle(array) {

    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] =
            [copy[j], copy[i]];

    }

    return copy;
}


/* =========================================================
   ADVANCED QUESTION ENGINE
   Generates fresh, reasoning-heavy questions for every subject.
========================================================= */

function makeQuestion(text, correct, wrongAnswers) {
    const uniqueWrong = [...new Set(wrongAnswers.filter(Boolean).map(String))]
        .filter(value => String(value) !== String(correct));

    while (uniqueWrong.length < 3) {
        uniqueWrong.push(`Alternative ${uniqueWrong.length + 1}`);
    }

    return {
        text,
        options: shuffle([String(correct), ...uniqueWrong.slice(0, 3)]),
        answer: String(correct)
    };
}

function randChoice(items) {
    return items[randomInt(0, items.length - 1)];
}

function signed(n) {
    return n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}

function fraction(n, d) {
    const g = gcd(Math.abs(n), Math.abs(d));
    return `${n / g}/${d / g}`;
}

function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a || 1;
}

function percent(value) {
    return `${Math.round(value * 100) / 100}%`;
}

function generateMathQuestion() {
    const type = randomInt(1, 14);

    if (type === 1) {
        const a = randomInt(2, 12);
        const x = randomInt(-12, 15);
        const b = randomInt(-20, 20);
        const c = a * x + b;
        return makeQuestion(
            `Solve for x: ${a}x ${signed(b)} = ${c}.`,
            x,
            [x + 1, x - 1, x + 2]
        );
    }

    if (type === 2) {
        const a = randomInt(2, 9);
        const b = randomInt(1, 8);
        const x = randomInt(2, 10);
        const c = a * x + b;
        return makeQuestion(
            `Solve: ${a}(x + ${b}) = ${c}.`,
            x,
            [x + b, x - b, c / a]
        );
    }

    if (type === 3) {
        const base = randomInt(2, 5);
        const p = randomInt(2, 4);
        const q = randomInt(1, 3);
        const answer = Math.pow(base, p + q);
        return makeQuestion(
            `Simplify: ${base}^${p} × ${base}^${q}.`,
            `${base}^${p + q} = ${answer}`,
            [`${base}^${p * q}`, `${base}^${p - q}`, `${base * (p + q)}`]
        );
    }

    if (type === 4) {
        const a = randomInt(2, 8);
        const b = randomInt(2, 8);
        const c = randomInt(1, 6);
        const answer = a * b + c;
        return makeQuestion(
            `If x = ${a}, y = ${b}, evaluate xy + ${c}.`,
            answer,
            [a + b + c, a * (b + c), a * b - c]
        );
    }

    if (type === 5) {
        const total = randomInt(5, 12);
        const fav = randomInt(2, total - 1);
        const answer = fraction(fav, total);
        return makeQuestion(
            `A box has ${total} cards and ${fav} are red. One card is chosen at random. What is P(red)?`,
            answer,
            [fraction(total - fav, total), fraction(fav + 1, total), fraction(fav, total + 1)]
        );
    }

    if (type === 6) {
        const cost = randomInt(10, 40) * 100;
        const markup = randChoice([10, 15, 20, 25, 30]);
        const discount = randChoice([5, 10, 15]);
        const selling = cost * (1 + markup / 100) * (1 - discount / 100);
        const profit = selling - cost;
        return makeQuestion(
            `An item costs ₦${cost}. It is marked up ${markup}% then discounted ${discount}%. What is the profit?`,
            `₦${profit.toFixed(2)}`,
            [`₦${(cost * markup / 100).toFixed(2)}`, `₦${(selling * discount / 100).toFixed(2)}`, `₦${(selling - cost * discount / 100).toFixed(2)}`]
        );
    }

    if (type === 7) {
        const a = randomInt(2, 8);
        const b = randomInt(1, 6);
        const c = randomInt(1, 5);
        const x = randomInt(2, 8);
        const y = a * x + b * x + c;
        return makeQuestion(
            `If ${a}x + ${b}x + ${c} = ${y}, find x.`,
            x,
            [x + 1, x - 1, Math.round(y / a)]
        );
    }

    if (type === 8) {
        const first = randomInt(2, 15);
        const d = randomInt(2, 9);
        const n = randomInt(5, 12);
        const answer = first + (n - 1) * d;
        return makeQuestion(
            `An arithmetic sequence has first term ${first} and common difference ${d}. What is the ${n}th term?`,
            answer,
            [first + n * d, first + (n - 2) * d, first * n + d]
        );
    }

    if (type === 9) {
        const length = randomInt(6, 18);
        const width = randomInt(4, 12);
        const perimeter = 2 * (length + width);
        return makeQuestion(
            `A rectangle is ${length} cm long and ${width} cm wide. What is its perimeter?`,
            `${perimeter} cm`,
            [`${length * width} cm`, `${2 * length + width} cm`, `${perimeter + 4} cm`]
        );
    }

    if (type === 10) {
        const a = randomInt(2, 8);
        const b = randomInt(2, 8);
        const c = randomInt(1, 6);
        const x = randomInt(2, 7);
        const y = a * x * x + b * x + c;
        return makeQuestion(
            `If f(x) = ${a}x² + ${b}x + ${c}, find f(${x}).`,
            y,
            [a * x + b * x + c, a * x * x + b * x - c, a * x * x + c]
        );
    }

    if (type === 11) {
        const speed = randomInt(4, 12) * 5;
        const time = randomInt(2, 8);
        const distance = speed * time;
        return makeQuestion(
            `A car travels at ${speed} km/h for ${time} hours. How far does it travel?`,
            `${distance} km`,
            [`${speed + time} km`, `${distance / 2} km`, `${speed * (time + 1)} km`]
        );
    }

    if (type === 12) {
        const radius = randomInt(2, 9);
        const area = Math.round(Math.PI * radius * radius * 100) / 100;
        return makeQuestion(
            `Using π ≈ 3.142, find the area of a circle with radius ${radius} cm.`,
            `${Math.round(3.142 * radius * radius * 100) / 100} cm²`,
            [`${Math.round(3.142 * radius * 2 * 100) / 100} cm²`, `${Math.round(area / 2 * 100) / 100} cm²`, `${Math.round(3.142 * radius * 100) / 100} cm²`]
        );
    }

    if (type === 13) {
        const a = randomInt(2, 6);
        const b = randomInt(2, 6);
        const c = randomInt(1, 5);
        const answer = a * b + a * c;
        return makeQuestion(
            `Factorise: ${a * b}x + ${a * c}.`,
            `${a}(${b}x + ${c})`,
            [`${b}(${a}x + ${c})`, `${a}(${b}x - ${c})`, `${a * b}(x + ${c})`]
        );
    }

    const principal = randomInt(2, 10) * 1000;
    const rate = randChoice([5, 8, 10, 12]);
    const years = randomInt(2, 5);
    const interest = principal * rate * years / 100;
    return makeQuestion(
        `Find the simple interest on ₦${principal} at ${rate}% per year for ${years} years.`,
        `₦${interest}`,
        [`₦${principal * rate / 100}`, `₦${interest + principal}`, `₦${principal * years}`]
    );
}

/* ---------------------------------------------------------
   GENERAL SUBJECT GENERATORS
--------------------------------------------------------- */

const questionGenerators = {
    "English Language": [
        () => makeQuestion("Choose the sentence with correct subject–verb agreement.", "Neither the teacher nor the students are ready.", ["Neither the teacher nor the students is ready.", "Neither the teacher nor the students was ready.", "Neither the teacher nor the students be ready."]),
        () => makeQuestion("In the sentence 'The evidence was compelling', what does 'compelling' mean?", "Convincing", ["Confusing", "Incomplete", "Ordinary"]),
        () => makeQuestion("Choose the option that best completes: If I had known, I ___ earlier.", "would have come", ["will come", "would come", "had come"]),
        () => makeQuestion("Which option is closest in meaning to 'mitigate' in a formal context?", "Reduce the severity of", ["Increase suddenly", "Explain fully", "Remove completely"]),
        () => makeQuestion("Identify the figure of speech: 'The wind whispered through the trees.'", "Personification", ["Hyperbole", "Oxymoron", "Litotes"]),
        () => makeQuestion("Which sentence is grammatically correct?", "Hardly had he arrived when the meeting began.", ["Hardly he had arrived when the meeting began.", "Hardly had he arrived than the meeting began.", "Hardly he arrived when the meeting began."]),
        () => makeQuestion("Choose the best antonym for 'reluctant'.", "Willing", ["Uncertain", "Careless", "Silent"]),
        () => makeQuestion("What is the grammatical function of 'because she was ill' in a sentence?", "Adverbial clause of reason", ["Noun clause", "Adjectival clause", "Main clause"]),
        () => makeQuestion("Choose the correctly punctuated sentence.", "Although it rained, the match continued.", ["Although, it rained the match continued.", "Although it rained the match, continued.", "Although it rained; the match continued."]),
        () => makeQuestion("Which word is formed by adding a prefix to 'legal'?", "Illegal", ["Legally", "Legality", "Legislation"])
    ],

    "Biology": [
        () => { const p=3, q=1; return makeQuestion(`A heterozygous tall plant (Tt) is crossed with another Tt plant. What fraction of offspring are expected to be short?`, "1/4", ["1/2", "3/4", "1/8"]); },
        () => makeQuestion("Why does an increase in temperature above an enzyme's optimum usually reduce its activity?", "The enzyme's active site is altered by denaturation.", ["Substrate becomes a vitamin.", "The enzyme gains unlimited active sites.", "Water stops being a solvent."]),
        () => makeQuestion("Which process produces genetically different gametes through exchange of chromosome segments?", "Crossing over", ["Binary fission", "Transcription", "Translation"]),
        () => makeQuestion("A plant kept in darkness for several days is destarched mainly to ensure that later starch tests measure:", "Starch produced during the experiment", ["All stored proteins", "Only chlorophyll", "Mineral salts in the roots"]),
        () => makeQuestion("Why is the small intestine well suited for absorption?", "It has villi that greatly increase surface area.", ["It has no blood supply.", "It prevents all diffusion.", "It contains no digestive enzymes."]),
        () => makeQuestion("Which relationship benefits both organisms?", "Mutualism", ["Parasitism", "Predation", "Competition"]),
        () => makeQuestion("During aerobic respiration, most ATP is produced during:", "The electron transport chain", ["Glycolysis only", "Digestion", "DNA replication"]),
        () => makeQuestion("A population growing rapidly in a habitat will eventually slow mainly because:", "Limiting factors become more important", ["All mutations disappear", "Predators become producers", "Resources become unlimited"]),
        () => makeQuestion("Which blood vessel carries oxygenated blood from the lungs to the heart?", "Pulmonary vein", ["Pulmonary artery", "Aorta", "Vena cava"]),
        () => makeQuestion("What is the main advantage of a large number of alveoli in the lungs?", "They provide a large surface for gas exchange.", ["They prevent blood flow.", "They produce red blood cells.", "They digest proteins."])
    ],

    "Chemistry": [
        () => { const m=2, M=44; return makeQuestion(`How many moles are present in ${m*M} g of CO₂? (Mr of CO₂ = 44)`, `${m} mol`, [`${m+1} mol`, `${m/2} mol`, `${M} mol`]); },
        () => makeQuestion("Why does increasing pressure favour the side with fewer gas molecules in a reversible reaction?", "The system reduces pressure by favouring fewer gas particles.", ["Temperature becomes zero.", "Catalysts are consumed.", "Atoms lose their nuclei."]),
        () => makeQuestion("Which observation most strongly indicates that a chemical reaction has occurred?", "Formation of a new insoluble substance", ["Ice melting", "Water evaporating", "Sugar dissolving unchanged"]),
        () => makeQuestion("In electrolysis of molten sodium chloride, sodium ions move toward the:", "Cathode", ["Anode", "Salt bridge", "Electrolyte surface"]),
        () => makeQuestion("Which compound contains both ionic and covalent bonding?", "Sodium hydroxide, NaOH", ["Chlorine, Cl₂", "Methane, CH₄", "Magnesium, Mg"]),
        () => makeQuestion("A catalyst increases reaction rate because it:", "Provides an alternative pathway with lower activation energy", ["Raises the products' mass", "Changes the equilibrium constant", "Is permanently consumed"]),
        () => makeQuestion("What happens to pH when a small amount of strong acid is added to a neutral solution?", "The pH decreases below 7", ["The pH becomes exactly 14", "The pH must remain 7", "The pH becomes negative in every case"]),
        () => makeQuestion("Which homologous series contains the functional group –OH?", "Alcohols", ["Alkenes", "Alkanes", "Carboxylic acids"]),
        () => makeQuestion("Why does atomic radius generally decrease across a period?", "Nuclear attraction increases while electrons are added to the same main shell.", ["Nuclear charge decreases", "New shells are always added", "Neutrons repel electrons strongly"]),
        () => makeQuestion("If 0.5 mol of a solute is dissolved to make 2 L of solution, what is its concentration?", "0.25 mol/L", ["1.0 mol/L", "2.5 mol/L", "4.0 mol/L"])
    ],

    "Physics": [
        () => { const m=4, a=3; return makeQuestion(`A ${m} kg object accelerates at ${a} m/s². What net force acts on it?`, `${m*a} N`, [`${m+a} N`, `${m/a} N`, `${m*a*a} N`]); },
        () => makeQuestion("A car increases velocity from 10 m/s to 30 m/s in 5 s. What is its acceleration?", "4 m/s²", ["2 m/s²", "6 m/s²", "8 m/s²"]),
        () => makeQuestion("Why does a passenger move forward when a moving bus stops suddenly?", "Inertia tends to keep the passenger moving.", ["Gravity increases", "Mass disappears", "Friction becomes zero"]),
        () => makeQuestion("Two resistors of 4 Ω and 6 Ω are connected in series. What is their total resistance?", "10 Ω", ["2.4 Ω", "5 Ω", "24 Ω"]),
        () => makeQuestion("A 12 V battery is connected across a 4 Ω resistor. What current flows?", "3 A", ["0.33 A", "8 A", "48 A"]),
        () => makeQuestion("Which change increases the frequency of a wave while its speed remains constant?", "Decrease its wavelength", ["Increase its amplitude", "Increase its wavelength", "Decrease its energy only"]),
        () => makeQuestion("A 2 kg object moving at 5 m/s has what momentum?", "10 kg·m/s", ["2.5 kg·m/s", "7 kg·m/s", "25 kg·m/s"]),
        () => makeQuestion("Why does a convex lens converge parallel rays?", "Refraction bends the rays toward the principal focus.", ["Reflection reverses every ray", "Diffraction blocks the rays", "The lens creates light"]),
        () => makeQuestion("If a machine does 600 J of work in 20 s, its power is:", "30 W", ["12 W", "300 W", "12000 W"]),
        () => makeQuestion("Which quantity remains conserved in an isolated collision?", "Total momentum", ["Each object's kinetic energy always", "Velocity of each object", "Force on each object"])
    ],

    "Geography": [
        () => makeQuestion("A map scale of 1:50,000 means 1 cm on the map represents:", "500 m on the ground", ["50 m", "5 km", "50 km"]),
        () => makeQuestion("Why is a coastal area often cooler during the day than nearby inland areas?", "Water heats more slowly than land.", ["Land has no sunlight", "Water has no mass", "Air cannot move near coasts"]),
        () => makeQuestion("Which process involves the breakdown of rocks in place without removal?", "Weathering", ["Erosion", "Deposition", "Transportation"]),
        () => makeQuestion("A population of 80,000 occupies 200 km². What is the population density?", "400 people/km²", ["40", "160", "16,000"]),
        () => makeQuestion("Which river feature is most associated with deposition on the inside of a meander?", "Point bar", ["Waterfall", "V-shaped gorge", "Interlocking spur"]),
        () => makeQuestion("Why does relief rainfall occur on the windward side of mountains?", "Rising air cools and condenses as it is forced upward.", ["Air becomes hotter and drier", "Mountains create ocean currents", "Clouds avoid high land"]),
        () => makeQuestion("Which factor most directly influences the type of natural vegetation in an area?", "Climate", ["Longitude alone", "Road density", "Political boundaries"]),
        () => makeQuestion("A high birth rate combined with a falling death rate usually causes:", "Rapid population growth", ["Population decline", "Zero migration", "Immediate ageing"]),
        () => makeQuestion("Which activity is most likely to cause soil erosion on steep farmland?", "Continuous cultivation without adequate soil conservation", ["Contour planting", "Terracing", "Planting cover crops"]),
        () => makeQuestion("What is the main purpose of contour lines on a topographic map?", "To show the shape and elevation of the land", ["To show political parties", "To measure rainfall directly", "To mark only rivers"])
    ],

    "Government": [
        () => makeQuestion("The principle of separation of powers is mainly intended to:", "Prevent excessive concentration of governmental power", ["Abolish elections", "Give courts legislative power", "Remove constitutional limits"]),
        () => makeQuestion("Which institution primarily makes laws in a constitutional democracy?", "Legislature", ["Judiciary", "Civil service", "Police"]),
        () => makeQuestion("A constitution that is difficult to amend is commonly described as:", "Rigid", ["Flexible", "Unitary", "Conventional"]),
        () => makeQuestion("Why are pressure groups different from political parties?", "Pressure groups seek to influence policy without primarily seeking governmental office.", ["They never communicate with government", "They conduct all elections", "They are always part of the legislature"]),
        () => makeQuestion("Federalism divides governmental powers between:", "Central and regional/state governments", ["Judges and lawyers only", "Citizens and voters only", "Political parties only"]),
        () => makeQuestion("The principle of judicial independence means judges should:", "Decide cases without improper political interference", ["Make election promises", "Control the legislature", "Write party manifestos"]),
        () => makeQuestion("A referendum allows citizens to:", "Vote directly on a specific public question", ["Appoint every civil servant", "Replace all courts", "Write every law individually"]),
        () => makeQuestion("What is a major function of an opposition party in a legislature?", "Scrutinising and challenging government policies", ["Abolishing elections", "Controlling the judiciary", "Preventing public debate"]),
        () => makeQuestion("Universal adult suffrage means:", "Eligible adult citizens have the right to vote", ["Only property owners vote", "Only civil servants vote", "Only legislators vote"]),
        () => makeQuestion("Why is constitutionalism important?", "It limits governmental power through constitutional rules.", ["It removes all legal limits", "It guarantees one-party rule", "It prevents courts from interpreting laws"])
    ],

    "Economics": [
        () => makeQuestion("If price rises by 10% and quantity demanded falls by 20%, demand is:", "Elastic", ["Perfectly inelastic", "Unitary", "Perfectly elastic"]),
        () => makeQuestion("Opportunity cost is best defined as:", "The value of the next best alternative forgone", ["Total money spent", "Accounting profit only", "The cost of all alternatives"]),
        () => makeQuestion("If marginal cost is below average cost, average cost will generally:", "Fall", ["Rise", "Become zero", "Remain unchanged in every case"]),
        () => makeQuestion("Inflation caused by rising production costs is called:", "Cost-push inflation", ["Demand-pull inflation", "Deflation", "Imported unemployment"]),
        () => makeQuestion("A subsidy to producers generally shifts the supply curve:", "To the right", ["To the left", "Vertically upward only", "It cannot affect supply"]),
        () => makeQuestion("Which market structure has many firms selling differentiated products?", "Monopolistic competition", ["Monopoly", "Perfect monopoly", "Duopoly only"]),
        () => makeQuestion("If nominal income rises 5% while prices rise 8%, real purchasing power will generally:", "Fall", ["Rise", "Stay exactly unchanged", "Become zero"]),
        () => makeQuestion("Which is a likely effect of a binding maximum price below equilibrium?", "A shortage", ["A surplus", "No effect on quantity", "Guaranteed higher supply"]),
        () => makeQuestion("The balance of payments records a country's:", "Economic transactions with the rest of the world", ["Only government salaries", "Only domestic taxes", "Only household spending"]),
        () => makeQuestion("A progressive tax takes a higher proportion of income as income increases. This is mainly intended to:", "Increase the relative tax burden on higher incomes", ["Make all tax rates identical", "Eliminate government revenue", "Tax only consumption"])
    ],

    "Literature": [
        () => makeQuestion("A statement in which the intended meaning differs sharply from the literal words may be:", "Irony", ["Alliteration", "Onomatopoeia", "Rhyme"]),
        () => makeQuestion("The narrator's attitude toward events in a story is called:", "Tone", ["Setting", "Plot", "Meter"]),
        () => makeQuestion("A character who opposes the protagonist is the:", "Antagonist", ["Narrator", "Speaker", "Audience"]),
        () => makeQuestion("Repeated use of a consonant sound at the beginning of nearby words is:", "Alliteration", ["Assonance", "Metaphor", "Enjambment"]),
        () => makeQuestion("When a poem continues a sentence beyond the end of a line without punctuation, it uses:", "Enjambment", ["Caesura", "Allusion", "Soliloquy"]),
        () => makeQuestion("A dramatic speech delivered by a character alone on stage to reveal thoughts is a:", "Soliloquy", ["Dialogue", "Aside only", "Stage direction"]),
        () => makeQuestion("The setting of a literary work includes:", "Time and place", ["Only the protagonist", "Only the conflict", "Only the theme"]),
        () => makeQuestion("A deliberate exaggeration for emphasis is:", "Hyperbole", ["Irony", "Paradox", "Euphemism"]),
        () => makeQuestion("A conflict between a character and an opposing social system is mainly:", "Character versus society", ["Character versus self", "Character versus nature", "Plot versus setting"]),
        () => makeQuestion("A recurring image, object, or idea that carries symbolic meaning is a:", "Motif", ["Footnote", "Stage cue", "Rhyme scheme"])
    ],

    "Accounting": [
        () => makeQuestion("If assets are ₦500,000 and liabilities are ₦180,000, capital is:", "₦320,000", ["₦680,000", "₦180,000", "₦500,000"]),
        () => makeQuestion("A credit purchase of goods is first recorded in the:", "Purchases journal/day book", ["Sales journal", "Cash book", "Petty cash book"]),
        () => makeQuestion("Depreciation is best described as:", "The systematic allocation of an asset's depreciable amount over its useful life", ["An increase in cash", "A liability repayment", "A capital injection"]),
        () => makeQuestion("A trial balance is mainly prepared to test:", "The arithmetical equality of debit and credit balances", ["Profit in every respect", "Cash theft", "Market value of assets"]),
        () => makeQuestion("A bank reconciliation may show an unpresented cheque because:", "It has been issued but not yet presented to the bank", ["It was never recorded by the business", "The bank has destroyed it", "It is always a cash sale"]),
        () => makeQuestion("Which transaction increases both an asset and a liability?", "Buying equipment on credit", ["Paying a creditor in cash", "Owner withdrawing cash", "Receiving cash from a debtor"]),
        () => makeQuestion("Gross profit equals:", "Sales minus cost of goods sold", ["Sales minus all expenses", "Assets minus liabilities", "Capital plus drawings"]),
        () => makeQuestion("If current assets are ₦300,000 and current liabilities are ₦150,000, the current ratio is:", "2:1", ["1:2", "3:2", "4:1"]),
        () => makeQuestion("Drawings by the owner normally:", "Reduce owner's capital", ["Increase liabilities", "Increase sales revenue", "Increase gross profit"]),
        () => makeQuestion("An error where a transaction is completely omitted from the books is an:", "Error of omission", ["Error of principle", "Compensating error", "Error of commission"])
    ],

    "Agricultural Science": [
        () => makeQuestion("Which practice best reduces soil erosion on steep farmland?", "Terracing", ["Continuous bare fallowing", "Up-and-down slope ploughing", "Removing all vegetation"]),
        () => makeQuestion("Why is crop rotation useful?", "It can improve soil fertility and reduce pest and disease build-up.", ["It guarantees no weeds", "It prevents all rainfall", "It removes all soil organisms"]),
        () => makeQuestion("Which soil property most directly affects how easily roots obtain water?", "Water-holding capacity", ["Soil colour only", "Wind speed", "Farm size"]),
        () => makeQuestion("Artificial selection in livestock aims to:", "Breed animals with desirable inherited traits", ["Eliminate reproduction", "Prevent feeding", "Increase all traits equally"]),
        () => makeQuestion("A balanced ration should:", "Supply nutrients in appropriate amounts for the animal's needs", ["Contain only protein", "Contain only roughage", "Exclude water"]),
        () => makeQuestion("Which farm record helps determine whether a farm enterprise is profitable?", "Farm income and expenditure record", ["Weather diary only", "Birth certificate", "Land title alone"]),
        () => makeQuestion("Which method of irrigation applies water directly near plant roots through emitters?", "Drip irrigation", ["Flood irrigation", "Sprinkler only", "Contour drainage"]),
        () => makeQuestion("What is the main purpose of vaccination in livestock?", "To stimulate immunity against specific diseases", ["To increase soil fertility", "To replace feed", "To stop digestion"]),
        () => makeQuestion("Which factor is most important when selecting planting material?", "Viability and freedom from disease", ["Seed colour alone", "Package size only", "Price alone"]),
        () => makeQuestion("What is the major role of nitrogen in crop production?", "It supports vegetative growth and protein formation.", ["It replaces sunlight", "It prevents all pests", "It forms only root hairs"])
    ],

    "Computer Science": [
        () => makeQuestion("What is the decimal value of binary 101101?", "45", ["41", "43", "47"]),
        () => makeQuestion("Which data structure is most directly suited to undo operations?", "Stack", ["Queue", "Graph", "Heap only"]),
        () => makeQuestion("What is the main purpose of an algorithm?", "To provide a finite, ordered procedure for solving a problem", ["To store electricity", "To replace all hardware", "To guarantee zero errors"]),
        () => makeQuestion("Which SQL command retrieves data from a table?", "SELECT", ["INSERT", "DELETE", "UPDATE"]),
        () => makeQuestion("What does encapsulation in object-oriented programming primarily involve?", "Bundling data with methods and controlling access to internal state", ["Deleting all classes", "Converting code to binary manually", "Removing all data types"]),
        () => makeQuestion("Which network device forwards packets between different networks?", "Router", ["Keyboard", "Monitor", "Repeater only"]),
        () => makeQuestion("What is the worst-case time complexity of linear search through n items?", "O(n)", ["O(1)", "O(log n)", "O(n²) always"]),
        () => makeQuestion("Which normalisation goal helps reduce repeated data in relational databases?", "Reducing unnecessary redundancy", ["Increasing duplicate records", "Removing all keys", "Storing every value as text"]),
        () => makeQuestion("What does HTTPS add to ordinary HTTP?", "Encrypted communication using TLS", ["A larger monitor", "Offline storage only", "A new programming language"]),
        () => makeQuestion("In a flowchart, a diamond normally represents:", "A decision", ["Start/end", "Input/output only", "A calculation process"])
    ]
};


/* =========================================================
   ADVANCED DYNAMIC QUESTION ENGINE
   Generates parameterised, reasoning-heavy questions so the
   same wording is not the main source of the question bank.
========================================================= */

const advancedQuestionGenerators = {
    "English Language": [
        () => { const a=randChoice(["Neither the manager nor the assistants","Neither the assistants nor the manager"]); const verb=a.includes("manager nor the assistants")?"are":"is"; return makeQuestion(`Choose the correct completion: ${a} willing to approve the proposal.`, verb,[verb==="are"?"is":"are","was","has"]); },
        () => { const word=randChoice([["pragmatic","practical and realistic"],["ambiguous","open to more than one interpretation"],["inadvertent","unintentional"],["candid","frank and honest"],["obsolete","no longer useful"]]); return makeQuestion(`In formal usage, the word “${word[0]}” is closest in meaning to:`,word[1],["deliberately misleading","completely unnecessary","emotionally exaggerated"]); },
        () => { const n=randChoice(["Had the witness arrived earlier","Were the evidence available","Should the committee reject the proposal"]); const ans=n.startsWith("Had")?"the hearing might have proceeded":"the investigation could continue"; return makeQuestion(`Which completion makes the conditional construction grammatically correct? ${n}, ...`,ans,["the matter will be settled yesterday","the hearing would have proceed","the committee had decided tomorrow"]); },
        () => { const s=randChoice(["Although the evidence was incomplete, the panel reached a provisional conclusion.","The witness, who had travelled overnight, requested a short recess.","Because the roads were flooded, several students arrived late."]); return makeQuestion(`In this sentence, what is the function of the introductory clause? “${s}”`,s.startsWith("Although")?"Adverbial clause showing concession":s.startsWith("The witness")?"Relative clause modifying a noun":"Adverbial clause showing reason",["Noun clause functioning as subject","Independent main clause","Adverbial clause showing purpose"]); },
        () => { const x=randChoice(["The committee did not accept the proposal because it was poorly supported.","The students discussed the lecturer's comments after the examination.","The journalist interviewed the minister who chaired the committee."]); return makeQuestion(`Which feature makes this sentence potentially ambiguous? “${x}”`,x.includes("it was")?"The pronoun 'it' may have more than one possible antecedent":x.includes("after")?"The time reference of 'after' may require contextual interpretation":"The relative clause may attach to more than one noun",["The verb has no tense","The sentence contains no subject","The punctuation makes every meaning impossible"]); }
    ],

    "Biology": [
        () => { const p=randChoice([40,60,80]); const q=100-p; return makeQuestion(`A population's allele A frequency is ${p}%. Assuming Hardy–Weinberg equilibrium, what is the expected frequency of heterozygotes?`,`${(2*(p/100)*(q/100)*100).toFixed(1)}%`,[`${((p/100)**2*100).toFixed(1)}%`,`${((q/100)**2*100).toFixed(1)}%`,`${(p+q)/2}%`]); },
        () => { const temp=randChoice([10,20,30,40]); const rate=randChoice([2,3,4]); return makeQuestion(`An enzyme reaction produces ${rate} units/min at ${temp}°C. After a temperature change, the rate rises by 50%. What is the new rate?`,`${rate*1.5} units/min`,[`${rate+0.5} units/min`,`${rate*2} units/min`,`${rate+1.5} units/min`]); },
        () => { const parents=randChoice([["Aa","Aa"],["Bb","Bb"],["Tt","Tt"]]); const recessive=parents[0][0].toLowerCase(); return makeQuestion(`Two heterozygous individuals (${parents[0]} × ${parents[1]}) are crossed. What proportion is expected to show the recessive phenotype?`,`25%`,["0%","50%","75%"]); },
        () => { const light=randChoice(["low","moderate","high"]); const factor=randChoice(["carbon dioxide concentration","light intensity","temperature"]); return makeQuestion(`In an investigation of photosynthesis, ${factor} is varied while the other conditions are controlled. What is the dependent variable most directly measured?`,"Rate of photosynthesis",["The plant species","The controlled temperature","The volume of soil"]); },
        () => { const num=randChoice([120,180,240,300]); const survival=randChoice([30,40,50,60]); return makeQuestion(`A population initially contains ${num} organisms. After selection, ${survival}% survive to reproduce. How many reproduce?`,`${num*survival/100}`,[`${num-survival}`,`${num*survival/10}`,`${num/(survival/10)}`]); }
    ],

    "Chemistry": [
        () => { const mass=randChoice([5.85,11.7,23.4,29.25]); return makeQuestion(`NaCl has Mr = 58.5. How many moles are present in ${mass} g of NaCl?`,`${(mass/58.5).toFixed(2)} mol`,[`${(mass/29.25).toFixed(2)} mol`,`${(mass*58.5).toFixed(2)} mol`,`${(mass/100).toFixed(2)} mol`]); },
        () => { const c=randChoice([0.1,0.2,0.25,0.5]); const v=randChoice([0.1,0.2,0.5]); return makeQuestion(`What volume of ${c} mol/L solution contains ${c*v} mol of solute?`,`${v} L`,[`${v*2} L`,`${v/2} L`,`${c*v} L`]); },
        () => { const acid=randChoice([0.001,0.01,0.1]); return makeQuestion(`For a strong monoprotic acid with concentration ${acid} mol/L, what is its approximate pH?`,`pH ${Math.round(-Math.log10(acid)*100)/100}`,[`pH ${Math.round(-Math.log10(acid+0.01)*100)/100}`,`pH ${Math.round(-Math.log10(acid/10)*100)/100}`,`pH ${Math.round(-Math.log10(acid*10)*100)/100}`]); },
        () => { const n=randChoice([2,3,4]); return makeQuestion(`For a reaction with ${n} moles of gaseous reactants producing ${n-1} moles of gaseous products, increasing pressure at constant temperature generally shifts equilibrium:`,`towards the products`,["towards the reactants","equally in both directions","without affecting equilibrium"]); },
        () => { const z=randChoice([11,12,17,19]); const shell=z===11?"2,8,1":z===12?"2,8,2":z===17?"2,8,7":"2,8,8,1"; return makeQuestion(`An atom has atomic number ${z}. Which electron arrangement is correct for the neutral atom?`,shell,["2,8,8","2,7,${z-9}","2,8,${z-10}"]); }
    ],

    "Physics": [
        () => { const m=randChoice([2,3,4,5,6]); const u=randChoice([2,4,6]); const a=randChoice([1,2,3]); const t=randChoice([3,4,5]); const v=u+a*t; return makeQuestion(`A ${m} kg object starts at ${u} m/s and accelerates uniformly at ${a} m/s² for ${t} s. What is its final velocity?`,`${v} m/s`,[`${u+a} m/s`,`${a*t} m/s`,`${m*v} m/s`]); },
        () => { const r1=randChoice([2,4,6]); const r2=randChoice([3,5,8]); const v=randChoice([10,12,20]); const current=v/(r1+r2); return makeQuestion(`A ${v} V source is connected to ${r1} Ω and ${r2} Ω resistors in series. What current flows?`,`${current.toFixed(2)} A`,[`${(v/r1).toFixed(2)} A`,`${(v/r2).toFixed(2)} A`,`${(r1+r2)/v} A`]); },
        () => { const m1=randChoice([2,3,4]); const v1=randChoice([3,4,5]); const m2=randChoice([1,2,3]); const v2=randChoice([1,2,3]); const p=m1*v1+m2*v2; return makeQuestion(`Two objects move in the same direction with momenta ${m1}×${v1} and ${m2}×${v2} kg·m/s. What is their total momentum?`,`${p} kg·m/s`,[`${m1*v1-m2*v2} kg·m/s`,`${p/2} kg·m/s`,`${m1+m2} kg·m/s`]); },
        () => { const f=randChoice([50,100,200]); const d=randChoice([0.02,0.05,0.1]); return makeQuestion(`A force of ${f} N moves an object through ${d} m in the direction of the force. How much work is done?`,`${f*d} J`,[`${f/d} J`,`${f+d} J`,`${f*d*10} J`]); },
        () => { const P=randChoice([600,800,1000]); const V=randChoice([100,200,250]); return makeQuestion(`An electrical appliance uses ${P} W at ${V} V. What current does it draw?`,`${(P/V).toFixed(2)} A`,[`${(V/P).toFixed(2)} A`,`${P*V} A`,`${P/V/2} A`]); }
    ],

    "Geography": [
        () => { const scale=randChoice([25000,50000,100000]); const cm=randChoice([2,4,6,8]); return makeQuestion(`On a map with scale 1:${scale}, what ground distance is represented by ${cm} cm?`,`${(cm*scale/100000).toFixed(2)} km`,[`${(cm*scale/1000).toFixed(2)} km`,`${(cm*scale/1000000).toFixed(2)} km`,`${(cm+scale)/1000} km`]); },
        () => { const rain=randChoice([900,1200,1500]); const evap=randChoice([600,700,800]); return makeQuestion(`If annual precipitation is ${rain} mm and potential loss through evaporation is ${evap} mm, what is the remaining amount before other losses?`,`${rain-evap} mm`,[`${rain+evap} mm`,`${evap-rain} mm`,`${rain/evap} mm`]); },
        () => { const pop=randChoice([120000,250000,360000]); const area=randChoice([300,500,600]); return makeQuestion(`A region has ${pop.toLocaleString()} people and an area of ${area} km². What is its approximate population density?`,`${Math.round(pop/area)} people/km²`,[`${Math.round(area/pop)} people/km²`,`${pop*area} people/km²`,`${Math.round(pop/(area*10))} people/km²`]); },
        () => { const lat=randChoice([0,10,20,30,40]); return makeQuestion(`At approximately ${lat}° latitude, which factor most directly affects the angle at which incoming solar radiation reaches the surface?`,"Latitude",["Longitude","Rock type","Population density"]); },
        () => { const runoff=randChoice([20,30,40]); const rainfall=100; return makeQuestion(`If ${runoff}% of rainfall becomes surface runoff, what percentage infiltrates or remains available to the local system, ignoring other losses?`,`${100-runoff}%`,[`${runoff}%`,`${100+runoff}%`,`${runoff/2}%`]); }
    ],

    "Government": [
        () => { const seats=randChoice([120,180,240]); const ruling=randChoice([61,91,121]); return makeQuestion(`A legislature has ${seats} seats. A party controls ${ruling} seats. What is the most direct implication if a simple majority is required?`,`It has enough seats to pass measures requiring a simple majority`,["It automatically controls the judiciary","It can amend every constitutional provision alone","It cannot form a government"]); },
        () => { const scenario=randChoice(["the legislature investigates executive spending","a court reviews whether an executive action violates the constitution","citizens vote directly on a referendum"]); const principle=scenario.startsWith("the legislature")?"Legislative oversight":scenario.startsWith("a court")?"Judicial review":"Direct democracy"; return makeQuestion(`Which constitutional mechanism is illustrated by this example: “${scenario}”?`,principle,["Collective responsibility","Administrative decentralisation","Diplomatic immunity"]); },
        () => { const level=randChoice(["federal and state","central and local","national and regional"]); return makeQuestion(`In a federal system, constitutional authority is divided between which levels?`,level,["judiciary and legislature","political parties and pressure groups","citizens and civil servants"]); },
        () => { const turnout=randChoice([45,55,65,75]); return makeQuestion(`If ${turnout}% of registered voters cast ballots and candidate A receives 60% of valid votes, what percentage of registered voters voted for A?`,`${turnout*0.6}%`,[`${turnout+60}%`,`${60/turnout}%`,`${turnout/0.6}%`]); },
        () => { const claim=randChoice(["a minister cannot ignore a court order simply because it is politically inconvenient","a legislature may spend public funds without legal authority","an executive agency can suspend the constitution temporarily"]); return makeQuestion(`Which statement best reflects the rule of law?`,claim,["Government officials are above ordinary law","Political popularity replaces legal authority","Courts must obey executive instructions"]); }
    ],

    "Economics": [
        () => { const p1=randChoice([10,20,30]); const p2=p1+randChoice([5,10,15]); const q1=randChoice([100,200,300]); const q2=q1-randChoice([20,40,60]); const ed=((q2-q1)/((q1+q2)/2))/((p2-p1)/((p1+p2)/2)); return makeQuestion(`Price rises from ${p1} to ${p2} while quantity demanded falls from ${q1} to ${q2}. Using the midpoint method, elasticity is approximately:`,Math.abs(ed).toFixed(2),[Math.abs(ed+0.4).toFixed(2),Math.abs(ed-0.4).toFixed(2),Math.abs(ed+1).toFixed(2)]); },
        () => { const fixed=randChoice([20000,30000,40000]); const variable=randChoice([100,150,200]); const q=randChoice([100,200,300]); return makeQuestion(`A firm's fixed cost is ₦${fixed.toLocaleString()} and variable cost is ₦${(variable*q).toLocaleString()} at ${q} units. What is average total cost per unit?`,`₦${((fixed+variable*q)/q).toFixed(2)}`,[`₦${(fixed/q).toFixed(2)}`,`₦${variable.toFixed(2)}`,`₦${(fixed+variable*q).toFixed(2)}`]); },
        () => { const nominal=randChoice([500000,600000,800000]); const index=randChoice([110,125,140]); return makeQuestion(`If nominal income is ₦${nominal.toLocaleString()} and the price index is ${index}, approximate real income at base-year prices is:`,`₦${Math.round(nominal/(index/100)).toLocaleString()}`,[`₦${Math.round(nominal*(index/100)).toLocaleString()}`,`₦${Math.round(nominal/index).toLocaleString()}`,`₦${Math.round(nominal-index).toLocaleString()}`]); },
        () => { const tax=randChoice([10,15,20]); const income=randChoice([100000,200000,300000]); return makeQuestion(`A proportional tax rate of ${tax}% is applied to income of ₦${income.toLocaleString()}. How much tax is paid?`,`₦${income*tax/100}`,[`₦${income/(tax/100)}`,`₦${income-tax}`,`₦${tax}`]); },
        () => { const c=randChoice([40,50,60]); const i=randChoice([10,20,30]); return makeQuestion(`If planned consumption is C = ${c} + 0.8Y and planned investment is ${i}, what is equilibrium income when Y = C + I?`,`₋${c+i} / -0.2`,[`${c+i}`,`${(c+i)/0.2}`,`${c*i}`]); }
    ],

    "Literature": [
        () => { const device=randChoice([["“The city swallowed him whole.”","Personification"],["“The silence was deafening.”","Oxymoron"],["“He fought like a lion.”","Simile"],["“Time is a thief.”","Metaphor"]]); return makeQuestion(`Which literary device is dominant in: ${device[0]}`,device[1],["Synecdoche","Alliteration","Understatement"]); },
        () => { const tone=randChoice([["The narrator describes the corrupt official with restrained sarcasm.","Satirical"],["The speaker recalls the dead with sorrow and tenderness.","Elegiac"],["The narrator celebrates the victory with energetic confidence.","Triumphant"]]); return makeQuestion(`What tone is most strongly suggested by this description: ${tone[0]}`,tone[1],["Indifferent","Clinical","Suspicious"]); },
        () => { const effect=randChoice(["foreshadowing","dramatic irony","symbolism"]); const desc={"foreshadowing":"early clues hint at a later event","dramatic irony":"the audience knows something a character does not","symbolism":"an object carries a deeper abstract meaning"}[effect]; return makeQuestion(`Which device is being described by: ${desc}?`,effect,["Flashback","Allusion","Onomatopoeia"]); },
        () => { const lines=randChoice([12,14,16,20]); const stanzas=randChoice([3,4,5]); return makeQuestion(`A poem contains ${lines} lines arranged equally into ${stanzas} stanzas. How many lines are in each stanza?`,`${lines/stanzas}`,[`${lines-stanzas}`,`${stanzas+lines}`,`${lines/2}`]); },
        () => { const conflict=randChoice(["a protagonist choosing between loyalty and conscience","a farmer struggling against a devastating flood","a young person challenging an unjust social custom"]); const type=conflict.includes("choosing")?"character versus self":conflict.includes("flood")?"character versus nature":"character versus society"; return makeQuestion(`What type of conflict is dominant in this situation: ${conflict}?`,type,["Character versus character","Plot versus setting","Narrator versus reader"]); }
    ],

    "Accounting": [
        () => { const assets=randChoice([450000,620000,800000]); const liabilities=randChoice([120000,180000,250000]); return makeQuestion(`A business has assets of ₦${assets.toLocaleString()} and liabilities of ₦${liabilities.toLocaleString()}. What is owner's equity?`,`₦${(assets-liabilities).toLocaleString()}`,[`₦${(assets+liabilities).toLocaleString()}`,`₦${liabilities.toLocaleString()}`,`₦${assets.toLocaleString()}`]); },
        () => { const sales=randChoice([800000,1000000,1200000]); const cogs=randChoice([450000,600000,700000]); const expenses=randChoice([120000,150000,200000]); return makeQuestion(`Sales are ₦${sales.toLocaleString()}, cost of goods sold is ₦${cogs.toLocaleString()}, and operating expenses are ₦${expenses.toLocaleString()}. What is net profit?`,`₦${(sales-cogs-expenses).toLocaleString()}`,[`₦${(sales-cogs).toLocaleString()}`,`₦${(sales-expenses).toLocaleString()}`,`₦${(cogs+expenses).toLocaleString()}`]); },
        () => { const cost=randChoice([300000,450000,600000]); const rate=randChoice([10,15,20]); const years=randChoice([2,3,4]); return makeQuestion(`Using straight-line depreciation with no residual value, an asset costs ₦${cost.toLocaleString()}, depreciation is ${rate}% of cost per year, and it is held for ${years} years. What is accumulated depreciation?`,`₦${(cost*rate/100*years).toLocaleString()}`,[`₦${(cost*rate/100).toLocaleString()}`,`₦${(cost*(1-rate/100)).toLocaleString()}`,`₦${(cost*years).toLocaleString()}`]); },
        () => { const cash=randChoice([200000,350000,500000]); const debtor=randChoice([80000,120000]); const creditor=randChoice([50000,70000]); return makeQuestion(`If cash is ₦${cash.toLocaleString()}, debtors are ₦${debtor.toLocaleString()} and creditors are ₦${creditor.toLocaleString()}, what is working capital?`,`₦${(cash+debtor-creditor).toLocaleString()}`,[`₦${(cash+debtor+creditor).toLocaleString()}`,`₦${(cash-creditor).toLocaleString()}`,`₦${(debtor-creditor).toLocaleString()}`]); },
        () => { const invoice=randChoice([120000,180000,240000]); const discount=randChoice([5,10,15]); return makeQuestion(`An invoice of ₦${invoice.toLocaleString()} is subject to a ${discount}% trade discount. What amount remains after the discount?`,`₦${(invoice*(1-discount/100)).toLocaleString()}`,[`₦${(invoice*discount/100).toLocaleString()}`,`₦${(invoice*(1+discount/100)).toLocaleString()}`,`₦${(invoice-discount).toLocaleString()}`]); }
    ],

    "Agricultural Science": [
        () => { const area=randChoice([2,4,5]); const rate=randChoice([50,60,80]); return makeQuestion(`A farmer applies ${rate} kg of fertilizer per hectare to ${area} hectares. How much fertilizer is required?`,`${rate*area} kg`,[`${rate+area} kg`,`${rate/area} kg`,`${rate*area*10} kg`]); },
        () => { const feed=randChoice([20,25,30]); const protein=randChoice([12,16,20]); return makeQuestion(`A ${feed} kg feed ration contains ${protein}% crude protein. How many kilograms of protein does it supply?`,`${feed*protein/100} kg`,[`${feed+protein/100} kg`,`${protein/feed} kg`,`${feed*protein} kg`]); },
        () => { const yield1=randChoice([2,3,4]); const yield2=yield1+randChoice([1,2]); return makeQuestion(`A crop yield rises from ${yield1} tonnes/ha to ${yield2} tonnes/ha after improved management. What is the percentage increase?`,`${Math.round((yield2-yield1)/yield1*100)}%`,[`${Math.round((yield2-yield1)/yield2*100)}%`,`${(yield2-yield1)*100}%`,`${Math.round(yield2/yield1*100)}%`]); },
        () => { const herd=randChoice([80,100,120]); const rate=randChoice([5,10,15]); return makeQuestion(`A herd of ${herd} animals has a mortality rate of ${rate}%. Approximately how many animals are lost?`,`${herd*rate/100}`,[`${herd-rate}`,`${rate}`,`${herd/(rate/100)}`]); },
        () => { const spacing=randChoice([0.5,1,1.5]); const rows=randChoice([20,30,40]); const plants=randChoice([25,30,40]); return makeQuestion(`A field has ${rows} rows with ${plants} planting positions per row. How many plants are possible if every position is filled?`,`${rows*plants}`,[`${rows+plants}`,`${rows*spacing*plants}`,`${rows*plants/2}`]); }
    ],

    "Computer Science": [
        () => { const bits=randChoice([8,10,12]); return makeQuestion(`How many distinct values can be represented using ${bits} binary bits?`,`${2**bits}`,[`${bits**2}`,`${bits*2}`,`${2*bits+1}`]); },
        () => { const n=randChoice([16,32,64,128]); return makeQuestion(`What is the binary representation of decimal ${n}?`,`1${"0".repeat(Math.log2(n))}`,[`0${"1".repeat(Math.log2(n))}`,`${n.toString(2).slice(0,-1)}`,`${(n-1).toString(2)}`]); },
        () => { const nodes=randChoice([100,1000,10000]); return makeQuestion(`An algorithm performs approximately 3n + 5 operations for n = ${nodes}. How many operations is that?`,`${3*nodes+5}`,[`${3*nodes}`,`${nodes+5}`,`${3*(nodes+5)}`]); },
        () => { const base=randChoice([2,3,4]); const exp=randChoice([3,4,5]); return makeQuestion(`A complete ${base}-ary tree has branching factor ${base}. Ignoring the root, how many nodes are on level ${exp}?`,`${base**exp}`,[`${base*exp}`,`${base+exp}`,`${base**(exp-1)}`]); },
        () => { const rows=randChoice([4,8,16]); const cols=randChoice([5,10,20]); return makeQuestion(`A database table has ${rows} rows and ${cols} fields per row. How many individual field values are stored?`,`${rows*cols}`,[`${rows+cols}`,`${rows*cols*2}`,`${cols-rows}`]); }
    ]
};

/* =========================================================
   BOOKMARKS / SAVED QUESTIONS
========================================================= */

function getBookmarks() {
    try {
        const saved = JSON.parse(localStorage.getItem(BOOKMARKS_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveBookmarks(bookmarks) {
    try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch {}
}

function bookmarkId(question, subject = currentSubject) {
    return `${subject}::${questionFingerprint(question)}`;
}

function isQuestionBookmarked(question, subject = currentSubject) {
    if (!question || !subject) return false;
    return getBookmarks().some(bookmark => bookmark.id === bookmarkId(question, subject));
}

function toggleBookmark(question = currentQuestions[currentQuestionIndex], subject = currentSubject) {
    if (!question || !subject) return;

    const bookmarks = getBookmarks();
    const id = bookmarkId(question, subject);
    const existingIndex = bookmarks.findIndex(bookmark => bookmark.id === id);

    if (existingIndex >= 0) {
        bookmarks.splice(existingIndex, 1);
    } else {
        bookmarks.unshift({
            id,
            subject,
            text: question.text,
            options: [...(question.options || [])],
            answer: question.answer,
            savedAt: new Date().toISOString()
        });
    }

    saveBookmarks(bookmarks);
    updateBookmarkButton();
    renderBookmarks();
}

function updateBookmarkButton() {
    const button = document.getElementById("bookmarkQuestionButton");
    const question = currentQuestions[currentQuestionIndex];
    if (!button || !question) return;

    const saved = isQuestionBookmarked(question, currentSubject);
    button.classList.toggle("saved", saved);
    button.textContent = saved ? "★ Saved" : "☆ Save Question";
}

function removeBookmark(id) {
    saveBookmarks(getBookmarks().filter(bookmark => bookmark.id !== id));
    renderBookmarks();
    updateBookmarkButton();
}

function clearAllBookmarks() {
    const bookmarks = getBookmarks();
    if (!bookmarks.length) return;

    if (!confirm(`You have ${bookmarks.length} saved question(s).\n\nClear all saved questions?`)) return;

    saveBookmarks([]);
    renderBookmarks();
    updateBookmarkButton();
}

function renderBookmarkSubjectFilter() {
    const filter = document.getElementById("bookmarkSubjectFilter");
    if (!filter) return;

    const currentValue = filter.value || "all";
    const bookmarks = getBookmarks();
    const availableSubjects = subjects.filter(subject =>
        bookmarks.some(bookmark => bookmark.subject === subject.name)
    );

    filter.innerHTML = `
        <option value="all">All Subjects</option>
        ${availableSubjects.map(subject => `
            <option value="${escapeHTML(subject.name)}">${escapeHTML(subject.name)}</option>
        `).join("")}
    `;

    filter.value = availableSubjects.some(subject => subject.name === currentValue)
        ? currentValue
        : "all";
}

function renderBookmarks() {
    const container = document.getElementById("bookmarksContainer");
    const countElement = document.getElementById("bookmarksCount");
    const searchInput = document.getElementById("bookmarkSearch");
    const subjectFilter = document.getElementById("bookmarkSubjectFilter");
    if (!container || !countElement || !subjectFilter) return;

    renderBookmarkSubjectFilter();

    const search = (searchInput?.value || "").trim().toLowerCase();
    const subject = subjectFilter.value || "all";
    const bookmarks = getBookmarks();

    const filtered = bookmarks.filter(bookmark => {
        const matchesSubject = subject === "all" || bookmark.subject === subject;
        const searchableText = [bookmark.subject, bookmark.text, ...(bookmark.options || []), bookmark.answer]
            .join(" ").toLowerCase();
        return matchesSubject && searchableText.includes(search);
    });

    countElement.textContent = `${filtered.length} saved question${filtered.length === 1 ? "" : "s"}`;

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-bookmarks">
                <h3>${bookmarks.length ? "No matching saved questions" : "No saved questions yet"}</h3>
                <p>${bookmarks.length
                    ? "Try another search term or subject filter."
                    : "Save a difficult question during practice and it will appear here for revision."
                }</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(bookmark => `
        <article class="bookmark-card">
            <div class="bookmark-card-header">
                <div>
                    <span class="bookmark-subject">${escapeHTML(bookmark.subject)}</span>
                    <h3>${escapeHTML(bookmark.text)}</h3>
                </div>
            </div>

            <div class="bookmark-options">
                ${(bookmark.options || []).map(option => `
                    <div class="bookmark-option ${option === bookmark.answer ? "correct-option" : ""}">
                        ${escapeHTML(option)}
                    </div>
                `).join("")}
            </div>

            <div class="bookmark-answer">
                <strong>Correct answer:</strong>
                ${escapeHTML(bookmark.answer)}
            </div>

            <div class="bookmark-meta">
                Saved ${new Date(bookmark.savedAt).toLocaleString()}
            </div>

            <div class="bookmark-actions">
                <button class="btn btn-red" type="button" data-remove-bookmark="${escapeHTML(bookmark.id)}">
                    Remove
                </button>
            </div>
        </article>
    `).join("");
}

/* =========================================================
   QUESTION HISTORY / FRESHNESS
   Keeps recent questions from returning immediately.
========================================================= */

const QUESTION_HISTORY_KEY = "learnmate_question_history_v2";
const BOOKMARKS_KEY = "learnmate_bookmarks_v1";

function getQuestionHistory() {
    try {
        return JSON.parse(localStorage.getItem(QUESTION_HISTORY_KEY)) || {};
    } catch {
        return {};
    }
}

function saveQuestionHistory(history) {
    try {
        localStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(history));
    } catch {
        // Ignore storage failures; the generator still works.
    }
}

function questionFingerprint(question) {
    return String(question.text)
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function getQuestionBank(subject, count = 20) {
    if (subject === "Mathematics") {
        return Array.from({ length: Math.max(50, count * 5) }, generateMathQuestion);
    }

    const generators = advancedQuestionGenerators[subject] || questionGenerators[subject] || [];
    const bank = [];

    // Build a large candidate pool from parameterised generators. We deliberately
    // avoid the old fixed questions for subjects that have advanced generators.
    const target = Math.max(300, count * 30);
    const seen = new Set();
    let attempts = 0;

    while (bank.length < target && attempts < target * 20) {
        attempts++;
        const generator = randChoice(generators);
        if (!generator) continue;
        const question = generator();
        const fp = questionFingerprint(question);
        if (seen.has(fp)) continue;
        seen.add(fp);
        bank.push(question);
    }

    return bank;
}

function getFreshQuestions(subject, count) {
    const history = getQuestionHistory();
    const previous = new Set(history[subject] || []);
    const selected = [];
    const selectedFingerprints = new Set();

    // Generate a large candidate pool once. Rebuilding the pool inside the
    // selection loop made the old system waste randomness and hit fixed templates.
    const bank = getQuestionBank(subject, Math.max(count, 20));

    // Prefer never-seen questions first.
    const freshPool = bank.filter(q => {
        const fp = questionFingerprint(q);
        return !previous.has(fp) && !selectedFingerprints.has(fp);
    });

    shuffle(freshPool);
    for (const question of freshPool) {
        const fp = questionFingerprint(question);
        if (selectedFingerprints.has(fp)) continue;
        selected.push(question);
        selectedFingerprints.add(fp);
        if (selected.length >= count) break;
    }

    // If the browser has accumulated a very large history, use the least-recent
    // candidates rather than immediately repeating the same old questions.
    if (selected.length < count) {
        const historyArray = history[subject] || [];
        const historySet = new Set(historyArray);
        const fallback = bank.filter(q => !selectedFingerprints.has(questionFingerprint(q)));
        shuffle(fallback);
        for (const question of fallback) {
            const fp = questionFingerprint(question);
            if (selectedFingerprints.has(fp)) continue;
            selected.push(question);
            selectedFingerprints.add(fp);
            if (selected.length >= count) break;
        }
    }

    const updatedHistory = history;
    updatedHistory[subject] = [
        ...(updatedHistory[subject] || []),
        ...selected.map(questionFingerprint)
    ].slice(-1000);

    saveQuestionHistory(updatedHistory);
    return shuffle(selected.slice(0, count));
}

/* =========================================================
   START PRACTICE
========================================================= */

function startPractice() {

    const subject =
        document.getElementById(
            "practiceSubject"
        ).value;


    let count = Number(document.getElementById("questionCount").value);
    count = Math.floor(count);

    if (!Number.isFinite(count) || count < 1 || count > 100) {
        alert("Choose between 1 and 100 questions.");
        return;
    }

    const timeMinutes = Number(document.getElementById("practiceTime")?.value || 30);
    if (!Number.isFinite(timeMinutes) || timeMinutes < 1 || timeMinutes > 120) {
        alert("Choose a time between 1 and 120 minutes.");
        return;
    }

    currentSubject = subject;
    updateCalculatorVisibility();

    currentQuestions =
        getFreshQuestions(subject, count);


    currentQuestionIndex = 0;

    userAnswers =
        new Array(currentQuestions.length)
            .fill(null);


    skippedQuestions = [];

    quizSubmitted = false;

    window.practiceTimeUsedMinutes = timeMinutes;
    remainingSeconds = Math.min(120, Math.max(1, timeMinutes)) * 60;


    startTimer();

    renderQuestion();

    showView("test-view");
}


/* =========================================================
   TIMER
========================================================= */

function startTimer() {

    clearInterval(timerInterval);


    updateTimer();


    timerInterval = setInterval(() => {

        remainingSeconds--;


        updateTimer();


        if (remainingSeconds <= 0) {

            clearInterval(timerInterval);


            const timer =
                document.getElementById("timer");


            timer.textContent = "00:00";


            const status =
                document.getElementById(
                    "practiceStatus"
                );


            status.innerHTML =
                "<strong>Time is up.</strong> You can still review your answers. The test has not been automatically submitted.";

        }

    }, 1000);
}


function updateTimer() {

    const minutes =
        Math.floor(remainingSeconds / 60);


    const seconds =
        remainingSeconds % 60;


    document.getElementById(
        "timer"
    ).textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


/* =========================================================
   RENDER QUESTION
========================================================= */

function renderQuestion() {

    if (!currentQuestions.length) {
        return;
    }


    const question =
        currentQuestions[
            currentQuestionIndex
        ];


    document.getElementById(
        "testSubjectLabel"
    ).textContent = currentSubject;

    updateCalculatorVisibility();


    document.getElementById(
        "questionNumber"
    ).textContent =
        `${currentQuestionIndex + 1} of ${currentQuestions.length}`;


    document.getElementById(
        "questionText"
    ).textContent =
        question.text;


    const options =
        document.getElementById(
            "answerOptions"
        );


    const currentAnswer = userAnswers[currentQuestionIndex];
    const answerState = document.getElementById("currentAnswerState");

    if (answerState) {
        const answered = currentAnswer !== null && currentAnswer !== undefined;
        answerState.className = `current-answer-state ${answered ? "answered" : "unanswered"}`;
        answerState.textContent = answered
            ? "✓ Answered"
            : "○ Not answered";
    }

    options.innerHTML =
        question.options.map(option => {

            const selected =
                currentAnswer === option
                    ? "selected"
                    : "";

            const selectedMark =
                currentAnswer === option
                    ? '<span class="answer-selected-mark" aria-hidden="true">✓</span>'
                    : '';

            return `
                <button
                    class="answer-option ${selected}"
                    data-answer="${escapeHTML(option)}"
                    aria-pressed="${currentAnswer === option ? "true" : "false"}">
                    <span class="answer-option-text">${escapeHTML(option)}</span>
                    ${selectedMark}
                </button>
            `;

        }).join("");


    updatePracticeStatus();

    updateNavigationButtons();
    updateBookmarkButton();
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   ANSWER QUESTION
========================================================= */

function selectAnswer(answer) {

    userAnswers[currentQuestionIndex] =
        answer;


    skippedQuestions =
        skippedQuestions.filter(
            number =>
                number !== currentQuestionIndex + 1
        );


    renderQuestion();
}


/* =========================================================
   SKIP
========================================================= */

function skipCurrentQuestion() {

    const questionNumber =
        currentQuestionIndex + 1;


    if (
        !skippedQuestions.includes(
            questionNumber
        )
    ) {

        skippedQuestions.push(
            questionNumber
        );

    }


    goToNextQuestion();
}


/* =========================================================
   NEXT / PREVIOUS
========================================================= */

function goToNextQuestion() {

    if (
        currentQuestionIndex <
        currentQuestions.length - 1
    ) {

        currentQuestionIndex++;

        renderQuestion();

    }

}


function goToPreviousQuestion() {

    if (currentQuestionIndex > 0) {

        currentQuestionIndex--;

        renderQuestion();

    }

}


/* =========================================================
   TEST STATUS
========================================================= */

function updatePracticeStatus() {

    const answered =
        userAnswers.filter(
            answer => answer !== null
        ).length;


    const skipped =
        skippedQuestions.length;


    document.getElementById(
        "practiceStatus"
    ).innerHTML = `
        Answered: <strong>${answered}</strong>
        / ${currentQuestions.length}
    `;


    document.getElementById(
        "skippedStatus"
    ).innerHTML =
        skipped === 0
            ? "Skipped questions: 0"
            : `Skipped questions: ${skipped}
               — Questions: ${skippedQuestions.join(", ")}`;
}


function updateNavigationButtons() {

    const previous =
        document.getElementById(
            "previousQuestionButton"
        );


    const next =
        document.getElementById(
            "nextQuestionButton"
        );


    previous.disabled =
        currentQuestionIndex === 0;


    next.disabled =
        currentQuestionIndex ===
        currentQuestions.length - 1;
}


/* =========================================================
   SUBMIT TEST
========================================================= */

function submitTest() {

    if (quizSubmitted) {
        return;
    }


    const unanswered =
        userAnswers.filter(
            answer => answer === null
        ).length;


    if (skippedQuestions.length > 0) {

        const proceed =
            confirm(
                `You have skipped ${skippedQuestions.length} question(s): ${skippedQuestions.join(", ")}.\n\nDo you want to submit anyway?`
            );


        if (!proceed) {
            return;
        }

    }


    if (unanswered > 0) {

        const proceed =
            confirm(
                `You have ${unanswered} unanswered question(s).\n\nDo you want to submit anyway?`
            );


        if (!proceed) {
            return;
        }

    }


    quizSubmitted = true;

    clearInterval(timerInterval);


    let score = 0;


    currentQuestions.forEach(
        (question, index) => {

            if (
                userAnswers[index] ===
                question.answer
            ) {

                score++;

            }

        }
    );


    lastCompletedQuiz = {

        subject: currentSubject,

        questions: currentQuestions,

        answers: userAnswers,

        skipped: skippedQuestions,

        score,

        total: currentQuestions.length,

        timeMinutes: Number(window.practiceTimeUsedMinutes) || 30,

        date: new Date().toLocaleString()

    };

    recordTestResult({
        subject: currentSubject,
        score,
        total: currentQuestions.length
    });


    document.getElementById(
        "scoreDisplay"
    ).textContent =
        `${score} / ${currentQuestions.length}`;


    document.getElementById(
        "resultMessage"
    ).textContent =
        score === currentQuestions.length
            ? "Excellent work!"
            : "Review your answers and keep practising.";


    showView("results-view");
}


/* =========================================================
   REVIEW
========================================================= */

function reviewTest() {

    if (!lastCompletedQuiz) {
        return;
    }


    const container =
        document.getElementById(
            "reviewContainer"
        );


    container.innerHTML =
        lastCompletedQuiz.questions
            .map((question, index) => {

                const studentAnswer =
                    lastCompletedQuiz.answers[index];


                const correct =
                    studentAnswer ===
                    question.answer;


                return `
                    <div class="review-card ${correct ? "correct" : "incorrect"}">

                        <h3>
                            Question ${index + 1}
                        </h3>

                        <p>
                            <strong>${question.text}</strong>
                        </p>

                        <div class="review-answer">
                            Your answer:
                            <strong>
                                ${studentAnswer ?? "Not answered"}
                            </strong>
                        </div>

                        <div class="review-answer">
                            Correct answer:
                            <strong>
                                ${question.answer}
                            </strong>
                        </div>

                        <div class="bookmark-actions">
                            <button
                                class="bookmark-question-button ${isQuestionBookmarked(question, lastCompletedQuiz.subject) ? "saved" : ""}"
                                type="button"
                                data-review-bookmark="${index}">
                                ${isQuestionBookmarked(question, lastCompletedQuiz.subject) ? "★ Saved" : "☆ Save Question"}
                            </button>
                        </div>

                    </div>
                `;

            }).join("");


    showView("review-view");
}


/* =========================================================
   REDO TEST
========================================================= */

function redoTest() {

    if (!lastCompletedQuiz) {
        return;
    }


    currentSubject =
        lastCompletedQuiz.subject;

    updateCalculatorVisibility();

    currentQuestions =
        lastCompletedQuiz.questions;


    currentQuestionIndex = 0;


    userAnswers =
        new Array(
            currentQuestions.length
        ).fill(null);


    skippedQuestions = [];

    quizSubmitted = false;


    remainingSeconds = Math.min(120, Math.max(1, Number(lastCompletedQuiz.timeMinutes) || 30)) * 60;


    startTimer();

    renderQuestion();

    showView("test-view");
}


/* =========================================================
   NEW TEST
========================================================= */

function newTest() {

    showView("practice-setup-view");
}


/* =========================================================
   CALCULATOR
========================================================= */

function openCalculator() {

    const activeView =
        document.querySelector(
            ".view.active"
        );


    if (
        activeView &&
        activeView.id === "test-view"
    ) {

        calculatorReturnView =
            "test-view";

    } else {

        calculatorReturnView =
            activeView
                ? activeView.id
                : "home-view";

    }


    showView("calculator-view");
}


function closeCalculator() {

    showView(
        calculatorReturnView
    );
}


/* =========================================================
   CALCULATOR DISPLAY
========================================================= */

function getCalculatorDisplay() {

    return document.getElementById(
        "calculatorDisplay"
    );
}


function insertCalculatorText(text) {

    const display =
        getCalculatorDisplay();


    const start =
        display.selectionStart;


    const end =
        display.selectionEnd;


    const current =
        display.value;


    display.value =
        current.substring(0, start) +
        text +
        current.substring(end);


    const cursor =
        start + text.length;


    display.focus();

    display.setSelectionRange(
        cursor,
        cursor
    );
}


/* =========================================================
   CALCULATOR NORMALIZATION
========================================================= */

function normalizeMathExpression(expression) {

    let value =
        expression.trim();


    value =
        value.replace(/×/g, "*");

    value =
        value.replace(/÷/g, "/");

    value =
        value.replace(/−/g, "-");

    value =
        value.replace(/π/g, "PI");

    value =
        value.replace(/√/g, "sqrt");

    value =
        value.replace(/∛/g, "cbrt");

    value =
        value.replace(/²/g, "^2");

    value =
        value.replace(/³/g, "^3");

    value =
        value.replace(/ⁿ/g, "^n");


    value =
        value.replace(/\^/g, "**");


    value =
        value.replace(
            /\bsqrt\s*\(/g,
            "Math.sqrt("
        );


    value =
        value.replace(
            /\bcbrt\s*\(/g,
            "Math.cbrt("
        );


    value =
        value.replace(
            /\bsin\s*\(/g,
            "SIN("
        );


    value =
        value.replace(
            /\bcos\s*\(/g,
            "COS("
        );


    value =
        value.replace(
            /\btan\s*\(/g,
            "TAN("
        );


    value =
        value.replace(
            /\blog\s*\(/g,
            "LOG("
        );


    value =
        value.replace(
            /\bln\s*\(/g,
            "LN("
        );


    value =
        value.replace(
            /\babs\s*\(/g,
            "Math.abs("
        );


    value =
        value.replace(
            /\bPI\b/g,
            "Math.PI"
        );


    /*
        Convert our functions to JavaScript functions.
    */

    value =
        value.replace(
            /\bSIN\(/g,
            "Math.sin((Math.PI/180)*("
        );


    value =
        value.replace(
            /\bCOS\(/g,
            "Math.cos((Math.PI/180)*("
        );


    value =
        value.replace(
            /\bTAN\(/g,
            "Math.tan((Math.PI/180)*("
        );


    /*
        Add a closing parenthesis for degree
        trig functions.

        Example:
        sin(30)
        becomes
        Math.sin((Math.PI/180)*(30))
    */

    value =
        balanceTrigParentheses(value);


    value =
        value.replace(
            /\bLOG\(/g,
            "Math.log10("
        );


    value =
        value.replace(
            /\bLN\(/g,
            "Math.log("
        );


    /*
        Convert percentages.
        50% becomes (50/100)
    */

    value =
        value.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );


    return value;
}


function balanceTrigParentheses(expression) {

    let result =
        expression;


    /*
        The generated trig expression has:
        Math.sin((Math.PI/180)*(30)

        We add one closing parenthesis.
    */

    const trigCount =
        (
            expression.match(
                /Math\.(sin|cos|tan)\(/g
            ) || []
        ).length;


    const closes =
        (
            expression.match(
                /\)/g
            ) || []
        ).length;


    const opens =
        (
            expression.match(
                /\(/g
            ) || []
        ).length;


    if (
        trigCount > 0 &&
        opens > closes
    ) {

        result += ")".repeat(
            opens - closes
        );

    }


    return result;
}


/* =========================================================
   SAFE CALCULATOR EVALUATION
========================================================= */

function calculateExpression(expression) {

    if (!expression.trim()) {
        return "";
    }


    let normalized =
        normalizeMathExpression(
            expression
        );


    /*
        Only allow mathematical characters
        and known JavaScript Math functions.
    */

    const safePattern =
        /^[0-9+\-*/().,\sA-Za-z_]+$/;


    if (
        !safePattern.test(normalized)
    ) {

        throw new Error(
            "This expression contains a symbol the calculator cannot evaluate yet."
        );

    }


    /*
        Prevent arbitrary JavaScript.
    */

    const allowedNames = [
        "Math",
        "sqrt",
        "cbrt"
    ];


    const forbidden =
        [
            "constructor",
            "window",
            "document",
            "globalThis",
            "Function",
            "eval",
            "alert",
            "fetch"
        ];


    if (
        forbidden.some(
            word =>
                normalized
                    .toLowerCase()
                    .includes(word.toLowerCase())
        )
    ) {

        throw new Error(
            "Invalid mathematical expression."
        );

    }


    const result =
        Function(
            `"use strict"; return (${normalized});`
        )();


    if (
        typeof result !== "number" ||
        !Number.isFinite(result)
    ) {

        throw new Error(
            "The expression does not produce a valid number."
        );

    }


    return Number(
        result.toFixed(10)
    );
}


/* =========================================================
   MATH SOLVER
========================================================= */

function solveMathProblem() {

    const input =
        document.getElementById(
            "solverInput"
        ).value.trim();


    const result =
        document.getElementById(
            "solverResult"
        );


    if (!input) {

        result.innerHTML =
            "Enter a mathematical problem first.";

        return;
    }


    try {

        const answer =
            solveProblem(input);


        result.innerHTML =
            answer;

    } catch (error) {

        result.innerHTML = `
            <h3>Let's try another format.</h3>

            <p>
                I could not solve that expression with the
                browser solver yet.
            </p>

            <p>
                Try examples such as:
            </p>

            <div class="solver-step">
                √4
            </div>

            <div class="solver-step">
                2² + 3²
            </div>

            <div class="solver-step">
                3x + 5 = 17
            </div>

            <div class="solver-step">
                x² - 9 = 0
            </div>

            <div class="solver-step">
                sin(30)
            </div>

            <p>
                The stronger AI mathematical solver will be
                connected through the backend later.
            </p>
        `;
    }
}


/* =========================================================
   SOLVE PROBLEM
========================================================= */

function solveProblem(problem) {

    let expression =
        problem
            .replace(/\s+/g, "")
            .replace(/−/g, "-")
            .replace(/×/g, "*")
            .replace(/÷/g, "/");


    /*
        Handle √number
    */

    const rootMatch =
        expression.match(
            /^√(\d+(?:\.\d+)?)$/
        );


    if (rootMatch) {

        const number =
            Number(rootMatch[1]);


        const answer =
            Math.sqrt(number);


        return `
            <h3>Answer: ${formatNumber(answer)}</h3>

            <div class="solver-step">
                Step 1: We need the number that multiplies
                by itself to give ${number}.
            </div>

            <div class="solver-step">
                Step 2: √${number} = ${formatNumber(answer)}
            </div>
        `;
    }


    /*
        Handle ∛number
    */

    const cubeRootMatch =
        expression.match(
            /^∛(\d+(?:\.\d+)?)$/
        );


    if (cubeRootMatch) {

        const number =
            Number(cubeRootMatch[1]);


        const answer =
            Math.cbrt(number);


        return `
            <h3>Answer: ${formatNumber(answer)}</h3>

            <div class="solver-step">
                Step 1: Find the number which,
                when multiplied by itself three times,
                gives ${number}.
            </div>

            <div class="solver-step">
                Step 2: ∛${number} = ${formatNumber(answer)}
            </div>
        `;
    }


    /*
        Handle quadratic equations.
        Examples:
        x²-9=0
        x^2-9=0
        2x²+5x-3=0
    */

    const quadratic =
        solveQuadratic(expression);


    if (quadratic) {
        return quadratic;
    }


    /*
        Handle linear equations.
    */

    const linear =
        solveLinearEquation(expression);


    if (linear) {
        return linear;
    }


    /*
        Handle normal calculations.
    */

    const calculation =
        calculateExpression(
            expression
        );


    return `
        <h3>Answer: ${formatNumber(calculation)}</h3>

        <div class="solver-step">
            Step 1: Read the mathematical expression.
        </div>

        <div class="solver-step">
            Step 2: Apply the required operations.
        </div>

        <div class="solver-step">
            Step 3: The result is
            <strong>${formatNumber(calculation)}</strong>.
        </div>
    `;
}


/* =========================================================
   LINEAR EQUATION SOLVER
========================================================= */

function solveLinearEquation(expression) {

    if (
        !expression.includes("=") ||
        !/[xX]/.test(expression)
    ) {

        return null;
    }


    const parts =
        expression.split("=");


    if (parts.length !== 2) {
        return null;
    }


    const left =
        parts[0];

    const right =
        parts[1];


    /*
        Convert x² to x*x so that this
        function does not accidentally solve
        a quadratic as linear.
    */

    if (
        /x\s*(?:²|\^2)/i.test(left) ||
        /x\s*(?:²|\^2)/i.test(right)
    ) {

        return null;
    }


    const leftParsed =
        parseLinearSide(left);


    const rightParsed =
        parseLinearSide(right);


    if (
        !leftParsed ||
        !rightParsed
    ) {

        return null;
    }


    const coefficient =
        leftParsed.x -
        rightParsed.x;


    const constant =
        rightParsed.constant -
        leftParsed.constant;


    if (coefficient === 0) {

        return `
            <h3>Result</h3>

            <div class="solver-step">
                There is no single value of x that solves this equation.
            </div>
        `;
    }


    const x =
        constant / coefficient;


    return `
        <h3>Answer: x = ${formatNumber(x)}</h3>

        <div class="solver-step">
            Step 1: Keep the terms containing x on one side
            and the number-only terms on the other side.
        </div>

        <div class="solver-step">
            Step 2: Combine the like terms.
        </div>

        <div class="solver-step">
            Step 3: Divide both sides by the number multiplying x.
        </div>

        <div class="solver-step">
            Step 4: x = ${formatNumber(x)}
        </div>

        <div class="solver-step">
            Step 5: Check the answer by putting
            x = ${formatNumber(x)} back into the equation.
        </div>
    `;
}


/* =========================================================
   PARSE LINEAR SIDE
========================================================= */

function parseLinearSide(side) {

    let expression =
        side
            .replace(/\s/g, "")
            .replace(/−/g, "-");


    /*
        Add + before positive terms.
    */

    if (
        expression[0] !== "+" &&
        expression[0] !== "-"
    ) {

        expression =
            "+" + expression;

    }


    const terms =
        expression.match(
            /[+-][^+-]+/g
        );


    if (!terms) {
        return null;
    }


    let xCoefficient = 0;
    let constant = 0;


    for (const term of terms) {

        if (/x/i.test(term)) {

            const coefficientText =
                term
                    .replace(/x/gi, "");


            let coefficient;


            if (
                coefficientText === "+" ||
                coefficientText === ""
            ) {

                coefficient = 1;

            } else if (
                coefficientText === "-"
            ) {

                coefficient = -1;

            } else {

                coefficient =
                    Number(
                        coefficientText
                    );

            }


            if (!Number.isFinite(coefficient)) {
                return null;
            }


            xCoefficient += coefficient;

        } else {

            const number =
                Number(term);


            if (!Number.isFinite(number)) {
                return null;
            }


            constant += number;
        }

    }


    return {
        x: xCoefficient,
        constant
    };
}


/* =========================================================
   QUADRATIC SOLVER
========================================================= */

function solveQuadratic(expression) {

    if (
        !expression.includes("=")
    ) {
        return null;
    }


    let [left, right] =
        expression.split("=");


    left =
        left
            .replace(/²/g, "^2");


    right =
        right
            .replace(/²/g, "^2");


    if (
        !(
            /x\s*\^2/i.test(left) ||
            /x\s*\^2/i.test(right)
        )
    ) {

        return null;
    }


    /*
        Move everything to the left:
        left - right = 0
    */

    const combined =
        `${left}-(${right})`;


    const parsed =
        parseQuadraticPolynomial(
            combined
        );


    if (!parsed) {
        return null;
    }


    const {
        a,
        b,
        c
    } = parsed;


    if (a === 0) {
        return null;
    }


    const discriminant =
        b * b - 4 * a * c;


    if (discriminant < 0) {

        return `
            <h3>No real solution</h3>

            <div class="solver-step">
                First calculate:
                b² − 4ac = ${formatNumber(discriminant)}
            </div>

            <div class="solver-step">
                Because the result is negative,
                there are no real-number solutions.
            </div>
        `;
    }


    const sqrtDiscriminant =
        Math.sqrt(discriminant);


    const x1 =
        (-b + sqrtDiscriminant) /
        (2 * a);


    const x2 =
        (-b - sqrtDiscriminant) /
        (2 * a);


    if (
        Math.abs(x1 - x2) < 0.0000001
    ) {

        return `
            <h3>Answer: x = ${formatNumber(x1)}</h3>

            <div class="solver-step">
                Step 1: Identify a, b and c.
                Here a = ${a}, b = ${b}, c = ${c}.
            </div>

            <div class="solver-step">
                Step 2: Calculate b² − 4ac.
                Result = ${formatNumber(discriminant)}.
            </div>

            <div class="solver-step">
                Step 3: Use the quadratic formula.
            </div>

            <div class="solver-step">
                Step 4: x = ${formatNumber(x1)}
            </div>
        `;
    }


    return `
        <h3>
            Answers:
            x = ${formatNumber(x1)}
            or
            x = ${formatNumber(x2)}
        </h3>

        <div class="solver-step">
            Step 1: Identify a, b and c.
            Here a = ${a}, b = ${b}, c = ${c}.
        </div>

        <div class="solver-step">
            Step 2: Calculate
            b² − 4ac =
            ${formatNumber(discriminant)}.
        </div>

        <div class="solver-step">
            Step 3: Take the square root:
            √${formatNumber(discriminant)}
            =
            ${formatNumber(sqrtDiscriminant)}.
        </div>

        <div class="solver-step">
            Step 4: Apply the quadratic formula:
            x = (−b ± √(b² − 4ac)) / 2a
        </div>

        <div class="solver-step">
            Step 5:
            x₁ = ${formatNumber(x1)}
        </div>

        <div class="solver-step">
            Step 6:
            x₂ = ${formatNumber(x2)}
        </div>
    `;
}


/* =========================================================
   PARSE QUADRATIC
========================================================= */

function parseQuadraticPolynomial(expression) {

    let clean =
        expression
            .replace(/\s/g, "")
            .replace(/²/g, "^2");


    /*
        We support the common form:
        ax² + bx + c
    */

    let a = 0;
    let b = 0;
    let c = 0;


    const normalized =
        clean
            .replace(/\*/g, "");


    const terms =
        normalized.match(
            /[+-]?[^+-]+/g
        );


    if (!terms) {
        return null;
    }


    for (let term of terms) {

        if (
            /x\^2/i.test(term)
        ) {

            const coefficient =
                term
                    .replace(/x\^2/gi, "");


            if (
                coefficient === "" ||
                coefficient === "+"
            ) {

                a += 1;

            } else if (
                coefficient === "-"
            ) {

                a -= 1;

            } else {

                a += Number(
                    coefficient
                );

            }

        } else if (
            /x/i.test(term)
        ) {

            const coefficient =
                term
                    .replace(/x/gi, "");


            if (
                coefficient === "" ||
                coefficient === "+"
            ) {

                b += 1;

            } else if (
                coefficient === "-"
            ) {

                b -= 1;

            } else {

                b += Number(
                    coefficient
                );

            }

        } else {

            const number =
                Number(term);


            if (!Number.isFinite(number)) {
                return null;
            }


            c += number;
        }

    }


    if (
        !Number.isFinite(a) ||
        !Number.isFinite(b) ||
        !Number.isFinite(c)
    ) {

        return null;
    }


    return {
        a,
        b,
        c
    };
}


/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(number) {

    if (
        Math.abs(number) < 0.0000000001
    ) {

        number = 0;

    }


    return Number(
        number.toFixed(10)
    ).toString();
}


/* =========================================================
   CLEAR SOLVER
========================================================= */

function clearSolver() {

    document.getElementById(
        "solverInput"
    ).value = "";


    document.getElementById(
        "solverResult"
    ).innerHTML = "";
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

document.addEventListener(
    "click",
    event => {

        /*
            SUBJECT
        */

        const subjectButton =
            event.target.closest(
                ".explore-subject"
            );


        if (subjectButton) {

            openSubject(
                subjectButton.dataset.subject
            );

            return;
        }
/*
            ANSWER
        */

        const answerButton =
            event.target.closest(
                ".answer-option"
            );


        if (answerButton) {

            selectAnswer(
                answerButton.dataset.answer
            );

            return;
        }


        /*
            CALCULATOR SYMBOL
        */

        const calculatorSymbol =
            event.target.closest(
                "[data-symbol]"
            );


        if (calculatorSymbol) {

            insertCalculatorText(
                calculatorSymbol.dataset.symbol
            );

            return;
        }


        /*
            SOLVER SYMBOL
        */

        const solverSymbol =
            event.target.closest(
                "[data-solver-symbol]"
            );


        if (solverSymbol) {

            const input =
                document.getElementById(
                    "solverInput"
                );


            const text =
                solverSymbol.dataset.solverSymbol;


            const start =
                input.selectionStart;


            const end =
                input.selectionEnd;


            input.value =
                input.value.substring(
                    0,
                    start
                ) +
                text +
                input.value.substring(
                    end
                );


            const cursor =
                start + text.length;


            input.focus();

            input.setSelectionRange(
                cursor,
                cursor
            );


            return;
        }


        /*
            CALCULATOR KEYS
        */

        const calcButton =
            event.target.closest(
                "[data-calc]"
            );


        if (calcButton) {

            handleCalculatorKey(
                calcButton.dataset.calc
            );

        }

    }
);


/* =========================================================
   CALCULATOR KEY HANDLER
========================================================= */

function handleCalculatorKey(key) {

    const display =
        getCalculatorDisplay();


    if (key === "clear") {

        display.value = "";

        display.focus();

        return;
    }


    if (key === "backspace") {

        const start =
            display.selectionStart;


        const end =
            display.selectionEnd;


        if (start !== end) {

            display.value =
                display.value.substring(
                    0,
                    start
                ) +
                display.value.substring(
                    end
                );


            display.setSelectionRange(
                start,
                start
            );

        } else {

            const position =
                display.selectionStart;


            display.value =
                display.value.substring(
                    0,
                    Math.max(0, position - 1)
                ) +
                display.value.substring(
                    position
                );


            display.setSelectionRange(
                Math.max(0, position - 1),
                Math.max(0, position - 1)
            );

        }


        display.focus();

        return;
    }


    if (key === "=") {

        try {

            display.value =
                formatNumber(
                    calculateExpression(
                        display.value
                    )
                );

        } catch (error) {

            display.value =
                "Error";

        }


        display.focus();

        return;
    }


    insertCalculatorText(key);
}


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
            Enter must NEVER submit a practice test.
            It only calculates when the calculator
            is currently open.
        */

        const activeView =
            document.querySelector(
                ".view.active"
            );


        if (
            event.key === "Enter" &&
            activeView &&
            activeView.id ===
                "calculator-view"
        ) {

            event.preventDefault();

            handleCalculatorKey("=");

            return;
        }


        /*
            Escape from calculator returns
            to wherever the calculator was opened.
        */

        if (
            event.key === "Escape" &&
            activeView &&
            activeView.id ===
                "calculator-view"
        ) {

            closeCalculator();

        }

    }
);



/* =========================================================
   PROGRESS / ACHIEVEMENTS / GOALS
========================================================= */

const PROGRESS_KEY = "learnmate_progress_v1";
const GOALS_KEY = "learnmate_goals_v1";

function getProgressData() {
    const fallback = { tests: [], studyDays: [] };
    try {
        const data = JSON.parse(localStorage.getItem(PROGRESS_KEY));
        return { ...fallback, ...(data || {}) };
    } catch (error) {
        return fallback;
    }
}

function saveProgressData(data) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function getGoals() {
    const fallback = { tests: 3, questions: 30, studyDays: 5 };
    try {
        const data = JSON.parse(localStorage.getItem(GOALS_KEY));
        return { ...fallback, ...(data || {}) };
    } catch (error) {
        return fallback;
    }
}

function saveGoalSettings() {
    const tests = Math.max(1, Number(document.getElementById("goalTests").value) || 3);
    const questions = Math.max(1, Number(document.getElementById("goalQuestions").value) || 30);
    const studyDays = Math.max(1, Math.min(7, Number(document.getElementById("goalStudyDays").value) || 5));

    localStorage.setItem(GOALS_KEY, JSON.stringify({ tests, questions, studyDays }));
    renderProgress();
}

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

function recordStudyDay() {
    const data = getProgressData();
    const today = todayKey();

    if (!data.studyDays.includes(today)) {
        data.studyDays.push(today);
        data.studyDays = data.studyDays.slice(-365);
        saveProgressData(data);
    }
}


function recordTestResult(result) {
    const data = getProgressData();
    recordStudyDay();

    data.tests.push({
        subject: result.subject,
        score: result.score,
        total: result.total,
        questions: result.total,
        date: new Date().toISOString()
    });

    data.tests = data.tests.slice(-200);
    saveProgressData(data);

    const percentage = result.total
        ? Math.round((result.score / result.total) * 100)
        : 0;

    addNotification(
        "Practice test completed",
        `${result.subject}: ${result.score}/${result.total} (${percentage}%).`,
        percentage >= 80 ? "🏆" : percentage >= 60 ? "📈" : "📝"
    );
}

function getStudyStreak(days) {
    const set = new Set(days);
    let date = new Date();
    let streak = 0;

    while (true) {
        const key = date.toISOString().slice(0, 10);
        if (!set.has(key)) break;
        streak++;
        date.setDate(date.getDate() - 1);
    }

    return streak;
}

function getWeekStart() {
    const date = new Date();
    const day = date.getDay();
    const diff = day === 0 ? 6 : day - 1;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - diff);
    return date;
}

function getWeeklyStats(data) {
    const start = getWeekStart();
    const tests = data.tests.filter(test => new Date(test.date) >= start);
    const questions = tests.reduce((sum, test) => sum + test.questions, 0);
    const studyDays = data.studyDays.filter(day => new Date(day + "T00:00:00") >= start).length;

    return { tests: tests.length, questions, studyDays };
}

function getAchievements(data) {
    const tests = data.tests.length;
    const questions = data.tests.reduce((sum, test) => sum + test.questions, 0);
    const best = tests ? Math.max(...data.tests.map(test => (test.score / test.total) * 100)) : 0;
    const subjectsStudied = new Set(data.tests.map(test => test.subject)).size;
    const streak = getStudyStreak(data.studyDays);

    return [
        { icon: "🎯", title: "First Test", text: "Complete your first practice test.", unlocked: tests >= 1 },
        { icon: "📝", title: "Test Taker", text: "Complete 5 practice tests.", unlocked: tests >= 5 },
        { icon: "🏆", title: "Test Master", text: "Complete 10 practice tests.", unlocked: tests >= 10 },
        { icon: "💯", title: "Perfect Score", text: "Score 100% on a practice test.", unlocked: best >= 100 },
        { icon: "🧠", title: "Knowledge Builder", text: "Answer 100 practice questions.", unlocked: questions >= 100 },
        { icon: "🔥", title: "3-Day Streak", text: "Study for 3 consecutive days.", unlocked: streak >= 3 },
        { icon: "⚡", title: "7-Day Streak", text: "Study for 7 consecutive days.", unlocked: streak >= 7 },
        { icon: "🌍", title: "Multi-Subject", text: "Complete tests in 5 different subjects.", unlocked: subjectsStudied >= 5 },
        { icon: "📚", title: "Subject Explorer", text: "Complete tests in 3 different subjects.", unlocked: subjectsStudied >= 3 }
    ];
}


function getPerformanceAnalytics(data) {
    const tests = Array.isArray(data.tests) ? data.tests : [];

    const validTests = tests.filter(test =>
        Number(test.total) > 0 && Number.isFinite(Number(test.score))
    );

    const percentages = validTests.map(test =>
        Math.round((Number(test.score) / Number(test.total)) * 100)
    );

    const average = percentages.length
        ? Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length)
        : 0;

    const highest = percentages.length ? Math.max(...percentages) : 0;
    const lowest = percentages.length ? Math.min(...percentages) : 0;

    const subjectMap = {};

    validTests.forEach(test => {
        const subject = test.subject || "Unknown Subject";
        const percentage = Math.round((Number(test.score) / Number(test.total)) * 100);

        if (!subjectMap[subject]) {
            subjectMap[subject] = {
                subject,
                attempts: 0,
                totalScore: 0,
                best: 0,
                latest: percentage,
                lastDate: test.date || ""
            };
        }

        const item = subjectMap[subject];
        item.attempts += 1;
        item.totalScore += percentage;
        item.best = Math.max(item.best, percentage);

        if (!item.lastDate || new Date(test.date) >= new Date(item.lastDate)) {
            item.latest = percentage;
            item.lastDate = test.date || item.lastDate;
        }
    });

    const subjects = Object.values(subjectMap)
        .map(item => ({
            ...item,
            average: Math.round(item.totalScore / item.attempts)
        }))
        .sort((a, b) => a.average - b.average);

    const recent = validTests
        .slice(-8)
        .map((test, index, array) => ({
            label: `Test ${validTests.length - array.length + index + 1}`,
            subject: test.subject || "Subject",
            percentage: Math.round((Number(test.score) / Number(test.total)) * 100)
        }));

    const improvement = percentages.length >= 2
        ? percentages[percentages.length - 1] - percentages[0]
        : 0;

    return {
        average,
        highest,
        lowest,
        subjects,
        recent,
        improvement,
        totalAttempts: validTests.length
    };
}

function analyticsPerformanceClass(score) {
    if (score >= 80) return "strong";
    if (score >= 60) return "steady";
    return "attention";
}

function renderPerformanceAnalytics(analytics) {
    if (!analytics.totalAttempts) {
        return `
            <div class="analytics-empty">
                <div class="analytics-empty-icon">📊</div>
                <h3>Your analytics will appear here</h3>
                <p>Complete a practice test and LearnMate will start tracking your performance.</p>
            </div>
        `;
    }

    const improvementText = analytics.improvement > 0
        ? `+${analytics.improvement}% since your first recorded test`
        : analytics.improvement < 0
            ? `${analytics.improvement}% compared with your first recorded test`
            : "No change from your first recorded test yet";

    const subjectRows = analytics.subjects.map(item => `
        <div class="analytics-subject-row">
            <div class="analytics-subject-name">
                <strong>${item.subject}</strong>
                <span>${item.attempts} test${item.attempts === 1 ? "" : "s"}</span>
            </div>

            <div class="analytics-subject-bar-wrap">
                <div class="analytics-subject-bar">
                    <div class="analytics-subject-fill ${analyticsPerformanceClass(item.average)}" style="width:${item.average}%"></div>
                </div>
            </div>

            <div class="analytics-subject-score">
                <strong>${item.average}%</strong>
                <span>Best ${item.best}%</span>
            </div>
        </div>
    `).join("");

    const recentBars = analytics.recent.map(item => `
        <div class="analytics-bar-item" title="${item.subject}: ${item.percentage}%">
            <div class="analytics-bar-value">${item.percentage}%</div>
            <div class="analytics-bar-track">
                <div class="analytics-bar-fill ${analyticsPerformanceClass(item.percentage)}" style="height:${Math.max(8, item.percentage)}%"></div>
            </div>
            <span>${item.label}</span>
        </div>
    `).join("");

    const focusSubjects = analytics.subjects.slice(0, 3);
    const focusHtml = focusSubjects.length
        ? focusSubjects.map(item => `
            <div class="analytics-focus-item">
                <span>${item.subject}</span>
                <strong>${item.average}%</strong>
            </div>
        `).join("")
        : `<p class="analytics-muted">Not enough subject data yet.</p>`;

    return `
        <div class="analytics-highlight-grid">
            <div class="analytics-highlight-card">
                <span>AVERAGE SCORE</span>
                <strong>${analytics.average}%</strong>
                <small>Across ${analytics.totalAttempts} completed test${analytics.totalAttempts === 1 ? "" : "s"}</small>
            </div>

            <div class="analytics-highlight-card">
                <span>HIGHEST SCORE</span>
                <strong>${analytics.highest}%</strong>
                <small>Your best recorded result</small>
            </div>

            <div class="analytics-highlight-card">
                <span>LOWEST SCORE</span>
                <strong>${analytics.lowest}%</strong>
                <small>Useful area to review</small>
            </div>

            <div class="analytics-highlight-card">
                <span>PROGRESS</span>
                <strong>${analytics.improvement > 0 ? "+" : ""}${analytics.improvement}%</strong>
                <small>${improvementText}</small>
            </div>
        </div>

        <div class="analytics-main-grid">
            <div class="analytics-panel">
                <div class="analytics-panel-heading">
                    <div>
                        <span>SUBJECT PERFORMANCE</span>
                        <h3>How You're Performing</h3>
                    </div>
                    <small>Based on completed tests</small>
                </div>

                <div class="analytics-subject-list">
                    ${subjectRows}
                </div>
            </div>

            <div class="analytics-panel">
                <div class="analytics-panel-heading">
                    <div>
                        <span>RECENT TESTS</span>
                        <h3>Score Trend</h3>
                    </div>
                    <small>Last ${analytics.recent.length} tests</small>
                </div>

                <div class="analytics-bars">
                    ${recentBars}
                </div>
            </div>
        </div>

        <div class="analytics-focus-grid">
            <div class="analytics-panel">
                <div class="analytics-panel-heading">
                    <div>
                        <span>REVISION FOCUS</span>
                        <h3>Subjects to Review</h3>
                    </div>
                </div>
                <div class="analytics-focus-list">
                    ${focusHtml}
                </div>
            </div>

            <div class="analytics-panel analytics-tip-panel">
                <div class="analytics-panel-heading">
                    <div>
                        <span>LEARNMATE INSIGHT</span>
                        <h3>What Your Data Says</h3>
                    </div>
                </div>
                <p>
                    ${analytics.subjects.length === 1
                        ? `Keep practising ${analytics.subjects[0].subject} so LearnMate can build a stronger performance picture.`
                        : `Your subject averages make it easier to decide where to spend your next revision session. Focus first on the subjects with the lowest averages, then retest them to measure improvement.`}
                </p>
            </div>
        </div>
    `;
}

function progressBar(value, goal) {
    const percent = Math.min(100, Math.round((value / Math.max(1, goal)) * 100));
    return `<div class="goal-bar"><div style="width:${percent}%"></div></div>`;
}

function renderProgress() {
    const container = document.getElementById("progressContent");
    if (!container) return;

    const data = getProgressData();
    const goals = getGoals();
    const weekly = getWeeklyStats(data);
    const totalQuestions = data.tests.reduce((sum, test) => sum + test.questions, 0);
    const bestScore = data.tests.length
        ? Math.max(...data.tests.map(test => Math.round((test.score / test.total) * 100)))
        : 0;
    const streak = getStudyStreak(data.studyDays);
    const achievements = getAchievements(data);
    const unlocked = achievements.filter(item => item.unlocked).length;
    const analytics = getPerformanceAnalytics(data);

    container.innerHTML = `
        <div class="progress-summary-grid progress-section">
            <div class="progress-summary-card"><strong>${data.tests.length}</strong><span>Tests Completed</span></div>
            <div class="progress-summary-card"><strong>${totalQuestions}</strong><span>Questions Answered</span></div>
            <div class="progress-summary-card"><strong>${streak} 🔥</strong><span>Current Study Streak</span></div>
            <div class="progress-summary-card"><strong>${bestScore}%</strong><span>Best Score</span></div>
        </div>

        <div class="progress-section analytics-section">
            <div class="progress-section-heading">
                <span>PERFORMANCE ANALYTICS</span>
                <h2>Better Results, Better Understanding</h2>
                <p class="analytics-section-intro">See your average score, subject performance and recent score trend without changing your existing practice system.</p>
            </div>
            ${renderPerformanceAnalytics(analytics)}
        </div>

        <div class="progress-section">
            <div class="progress-section-heading">
                <span>THIS WEEK</span>
                <h2>Weekly Goals</h2>
            </div>

            <div class="goals-grid">
                <div class="goal-card">
                    <div class="goal-header"><strong>Practice Tests</strong><span>${weekly.tests} / ${goals.tests}</span></div>
                    ${progressBar(weekly.tests, goals.tests)}
                    <small>Complete practice tests this week.</small>
                </div>

                <div class="goal-card">
                    <div class="goal-header"><strong>Questions</strong><span>${weekly.questions} / ${goals.questions}</span></div>
                    ${progressBar(weekly.questions, goals.questions)}
                    <small>Answer practice questions this week.</small>
                </div>

                <div class="goal-card">
                    <div class="goal-header"><strong>Study Days</strong><span>${weekly.studyDays} / ${goals.studyDays}</span></div>
                    ${progressBar(weekly.studyDays, goals.studyDays)}
                    <small>Study on different days this week.</small>
                </div>
            </div>

            <div class="goal-settings">
                <h3>Set Your Weekly Goals</h3>
                <div class="goal-input-grid">
                    <label>Tests<input id="goalTests" type="number" min="1" value="${goals.tests}"></label>
                    <label>Questions<input id="goalQuestions" type="number" min="1" value="${goals.questions}"></label>
                    <label>Study Days<input id="goalStudyDays" type="number" min="1" max="7" value="${goals.studyDays}"></label>
                </div>
                <button class="btn btn-green" id="saveGoalsButton">Save Goals</button>
                <span id="goalsSavedMessage" class="goals-saved-message"></span>
            </div>
        </div>

        <div class="progress-section">
            <div class="progress-section-heading">
                <span>ACHIEVEMENTS</span>
                <h2>${unlocked} / ${achievements.length} Unlocked</h2>
            </div>

            <div class="achievement-grid">
                ${achievements.map(item => `
                    <div class="achievement-card ${item.unlocked ? "unlocked" : "locked"}">
                        <div class="achievement-icon">${item.icon}</div>
                        <div>
                            <h3>${item.title}</h3>
                            <p>${item.text}</p>
                            <strong>${item.unlocked ? "UNLOCKED ✓" : "LOCKED"}</strong>
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;

    document.getElementById("saveGoalsButton").addEventListener("click", () => {
        saveGoalSettings();
        const message = document.getElementById("goalsSavedMessage");
        if (message) message.textContent = "Goals saved ✓";
    });
}



/* =========================================================
   NOTIFICATIONS & STUDY REMINDERS
========================================================= */

function getNotifications() {
    try {
        const saved = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveNotifications(notifications) {
    try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 100)));
    } catch {}
}

function addNotification(title, message, icon = "🔔") {
    if (!getLearnMateSettings().notificationsEnabled) return;

    const notifications = getNotifications();

    notifications.unshift({
        id: `notification_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title,
        message,
        icon,
        createdAt: new Date().toISOString(),
        read: false
    });

    saveNotifications(notifications);
    updateNotificationBadge();
    renderNotifications();
}

function updateNotificationBadge() {
    const badge = document.getElementById("notificationBadge");
    if (!badge) return;

    const unread = getNotifications().filter(item => !item.read).length;
    badge.textContent = unread > 99 ? "99+" : String(unread);
    badge.hidden = unread === 0;
}

function formatNotificationTime(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";

    const diff = Math.max(0, Date.now() - date.getTime());
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString();
}

function renderNotifications() {
    const container = document.getElementById("notificationsContainer");
    if (!container) return;

    let notifications = getNotifications();

    if (!notifications.length) {
        container.innerHTML = `
            <div class="empty-notifications">
                <strong>No notifications yet</strong>
                <span>LearnMate will show reminders and important study activity here.</span>
            </div>
        `;
        updateNotificationBadge();
        return;
    }

    container.innerHTML = notifications.map(item => `
        <article class="notification-item ${item.read ? "" : "unread"}">
            <div class="notification-icon">${item.icon || "🔔"}</div>
            <div>
                <h3>${escapeHTML(item.title)}</h3>
                <p>${escapeHTML(item.message)}</p>
            </div>
            <span class="notification-time">${formatNotificationTime(item.createdAt)}</span>
        </article>
    `).join("");

    updateNotificationBadge();
}

function markAllNotificationsRead() {
    const notifications = getNotifications().map(item => ({
        ...item,
        read: true
    }));

    saveNotifications(notifications);
    renderNotifications();
    updateNotificationBadge();
}

function getReminders() {
    try {
        const saved = JSON.parse(localStorage.getItem(REMINDERS_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveReminders(reminders) {
    try {
        localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders.slice(0, 50)));
    } catch {}
}

function reminderDateTime(reminder) {
    return new Date(`${reminder.date}T${reminder.time}:00`);
}

function convert12HourTo24Hour(hour, minute, amPm) {
    let h = Number(hour);
    let m = Number(minute);

    if (!Number.isInteger(h) || h < 1 || h > 12) return null;
    if (!Number.isInteger(m) || m < 0 || m > 59) return null;

    if (amPm === "AM") {
        if (h === 12) h = 0;
    } else if (amPm === "PM") {
        if (h !== 12) h += 12;
    } else {
        return null;
    }

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatTimeForPicker(time) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time || "");
    if (!match) return { hour: 6, minute: 0, amPm: "PM" };

    let hour24 = Number(match[1]);
    const minute = Number(match[2]);
    const amPm = hour24 >= 12 ? "PM" : "AM";
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;

    return { hour: hour12, minute, amPm };
}

function formatReminderDate(reminder) {
    const date = reminderDateTime(reminder);
    if (Number.isNaN(date.getTime())) return "Invalid date";

    const dateText = date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    const timeText = date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    const repeatText = reminder.repeat === "daily"
        ? " • Daily"
        : reminder.repeat === "weekly"
            ? " • Weekly"
            : "";

    return `${dateText} at ${timeText}${repeatText}`;
}

function addStudyReminder(event) {
    event.preventDefault();

    const titleInput = document.getElementById("reminderTitle");
    const dateInput = document.getElementById("reminderDate");
    const hourInput = document.getElementById("reminderHour");
    const minuteInput = document.getElementById("reminderMinute");
    const amPmInput = document.getElementById("reminderAmPm");
    const repeatInput = document.getElementById("reminderRepeat");

    if (!titleInput || !dateInput || !hourInput || !minuteInput || !amPmInput || !repeatInput) return;

    const date = dateInput.value;
    const hour = hourInput.value;
    const minute = minuteInput.value;
    const amPm = amPmInput.value;
    const time = convert12HourTo24Hour(hour, minute, amPm);
    const title = titleInput.value.trim();

    if (!title || !date || !time) {
        alert("Please enter a valid time using the hour, minute and AM/PM selector.");
        return;
    }

    const scheduled = new Date(`${date}T${time}:00`);
    if (Number.isNaN(scheduled.getTime()) || scheduled.getTime() <= Date.now()) {
        alert("Please choose a future date and time for the reminder.");
        return;
    }

    const reminders = getReminders();

    reminders.unshift({
        id: `reminder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title,
        date,
        time,
        repeat: repeatInput.value,
        enabled: true,
        createdAt: new Date().toISOString()
    });

    saveReminders(reminders);

    addNotification(
        "Study reminder created",
        `${title} is scheduled for ${scheduled.toLocaleString()}.`,
        "⏰"
    );

    event.target.reset();
    setMinimumReminderDate();
    renderReminders();
}

function deleteStudyReminder(id) {
    saveReminders(getReminders().filter(reminder => reminder.id !== id));
    renderReminders();
}

function toggleStudyReminder(id) {
    const reminders = getReminders().map(reminder =>
        reminder.id === id
            ? { ...reminder, enabled: !reminder.enabled }
            : reminder
    );

    saveReminders(reminders);
    renderReminders();
}

function renderReminders() {
    const container = document.getElementById("remindersContainer");
    const count = document.getElementById("reminderCount");
    if (!container) return;

    const reminders = getReminders().sort((a, b) =>
        reminderDateTime(a).getTime() - reminderDateTime(b).getTime()
    );

    if (count) count.textContent = `${reminders.length} reminder${reminders.length === 1 ? "" : "s"}`;

    if (!reminders.length) {
        container.innerHTML = `
            <div class="empty-reminders">
                <strong>No study reminders</strong>
                <span>Create one above to plan your next revision session.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = reminders.map(reminder => `
        <article class="reminder-card ${reminder.enabled ? "" : "disabled"}">
            <div class="reminder-card-top">
                <div>
                    <h3>⏰ ${escapeHTML(reminder.title)}</h3>
                    <p>${formatReminderDate(reminder)}</p>
                </div>
                <strong>${reminder.enabled ? "ON" : "OFF"}</strong>
            </div>
            <div class="reminder-card-actions">
                <button class="reminder-action-button" data-toggle-reminder="${reminder.id}">
                    ${reminder.enabled ? "Turn Off" : "Turn On"}
                </button>
                <button class="reminder-action-button" data-delete-reminder="${reminder.id}">
                    Delete
                </button>
            </div>
        </article>
    `).join("");
}

function checkDueReminders() {
    const now = Date.now();
    const reminders = getReminders();
    let changed = false;

    reminders.forEach(reminder => {
        if (!reminder.enabled) return;

        const scheduled = reminderDateTime(reminder);
        if (Number.isNaN(scheduled.getTime()) || scheduled.getTime() > now) return;

        addNotification(
            "Study time",
            `It's time for: ${reminder.title}`,
            "📚"
        );

        if (reminder.repeat === "daily") {
            scheduled.setDate(scheduled.getDate() + 1);
            reminder.date = scheduled.toISOString().slice(0, 10);
            reminder.time = scheduled.toTimeString().slice(0, 5);
        } else if (reminder.repeat === "weekly") {
            scheduled.setDate(scheduled.getDate() + 7);
            reminder.date = scheduled.toISOString().slice(0, 10);
            reminder.time = scheduled.toTimeString().slice(0, 5);
        } else {
            reminder.enabled = false;
        }

        changed = true;
    });

    if (changed) {
        saveReminders(reminders);
        renderReminders();
    }
}

function setMinimumReminderDate() {
    const input = document.getElementById("reminderDate");
    if (!input) return;

    const now = new Date();
    input.min = now.toISOString().slice(0, 10);
}

function seedNotificationSystem() {
    const notifications = getNotifications();

    if (!notifications.length) {
        saveNotifications([{
            id: `notification_welcome_${Date.now()}`,
            title: "Welcome to LearnMate reminders",
            message: "Set a study reminder so you know when it is time to revise.",
            icon: "📚",
            createdAt: new Date().toISOString(),
            read: false
        }]);
    }

    setMinimumReminderDate();
    updateNotificationBadge();
}

/* =========================================================
   BUTTON EVENTS
========================================================= */

const toggleSubjectsButton = document.getElementById("toggleSubjectsButton");
if (toggleSubjectsButton) {
    toggleSubjectsButton.addEventListener("click", () => {
        const input = document.getElementById("subjectSearch");
        if (input && input.value.trim()) return;
        showingAllSubjects = !showingAllSubjects;
        renderSubjects();
    });
}

const subjectSearchInput = document.getElementById("subjectSearch");
if (subjectSearchInput) {
    subjectSearchInput.addEventListener("input", event => renderSubjects(event.target.value));
}

document.addEventListener("click", event => {
    const subjectButton = event.target.closest(".explore-subject");
    if (subjectButton) {
        openSubject(subjectButton.dataset.subject);
        return;
    }

    const reminderToggle = event.target.closest("[data-toggle-reminder]");
    if (reminderToggle) {
        toggleStudyReminder(reminderToggle.dataset.toggleReminder);
        return;
    }

    const reminderDelete = event.target.closest("[data-delete-reminder]");
    if (reminderDelete) {
        deleteStudyReminder(reminderDelete.dataset.deleteReminder);
        return;
    }
});

document.getElementById("workspacePracticeButton")?.addEventListener("click", () => {
    const select = document.getElementById("practiceSubject");
    if (select) select.value = currentSubject;
    showView("practice-setup-view");
});

document.getElementById("workspaceTutorButton")?.addEventListener("click", () => showView("ai-view"));
document.getElementById("startPracticeButton")?.addEventListener("click", startPractice);
document.getElementById("previousQuestionButton")?.addEventListener("click", goToPreviousQuestion);
document.getElementById("nextQuestionButton")?.addEventListener("click", goToNextQuestion);
document.getElementById("skipQuestionButton")?.addEventListener("click", skipCurrentQuestion);
document.getElementById("submitTestButton")?.addEventListener("click", submitTest);

/* =========================================================
   INITIALIZE
========================================================= */

populatePracticeSubjects();

renderSubjects();

renderProgress();
renderBookmarks();
seedNotificationSystem();
renderNotifications();
renderReminders();
renderStudentProfile();
renderSettings();
initializeGlobalSearch();
checkDueReminders();
setInterval(checkDueReminders, 30000);


/* =========================================================
   LOADER
========================================================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            document.getElementById(
                "loader"
            ).classList.add("hidden");

        }, 500);

    }
);

/* =========================================================
   PWA INSTALL
========================================================= */

let deferredInstallPrompt = null;

function showInstallMessage(message) {
    const el = document.getElementById("installAppMessage");
    if (!el) return;
    el.textContent = message;
    setTimeout(() => {
        if (el) el.textContent = "";
    }, 3000);
}

function isLearnMateInstalled() {
    return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updateInstallButton() {
    const button = document.getElementById("installAppButton");
    if (!button) return;

    if (isLearnMateInstalled()) {
        button.hidden = true;
        return;
    }

    button.hidden = !deferredInstallPrompt;
}

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButton();
});

window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallButton();
    showInstallMessage("LearnMate installed ✓");
});

document.getElementById("installAppButton")?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
        showInstallMessage("Open LearnMate in a supported browser to install it as an app.");
        return;
    }

    deferredInstallPrompt.prompt();
    const result = await deferredInstallPrompt.userChoice;

    if (result.outcome === "accepted") {
        showInstallMessage("Installing LearnMate…");
    } else {
        showInstallMessage("Installation cancelled.");
    }

    deferredInstallPrompt = null;
    updateInstallButton();
});

updateInstallButton();


/* =========================================================
   CONNECTION STATUS / OFFLINE-FIRST UI
========================================================= */

function updateConnectionStatus() {
    const status = document.getElementById("connectionStatus");
    const text = document.getElementById("connectionStatusText");
    if (!status || !text) return;

    const online = navigator.onLine;
    status.classList.toggle("offline", !online);
    text.textContent = online
        ? "Online • LearnMate is connected"
        : "Offline • Saved features remain available; AI Tutor needs internet";
}

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
updateConnectionStatus();

/* Keep the browser theme colour aligned with the user's selected theme. */
function updateThemeColorMeta() {
    const meta = document.getElementById("themeColorMeta");
    if (!meta) return;
    meta.setAttribute("content", document.body.classList.contains("dark-mode") ? "#171717" : "#16a34a");
}

updateConnectionStatus();
updateThemeColorMeta();
