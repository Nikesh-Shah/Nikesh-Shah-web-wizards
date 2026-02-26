(function () {
  'use strict';

  // grab the root element and the theme button
  const html = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const mmThemeBtn = document.getElementById('mm-theme-toggle');
  const STORAGE_KEY = 'sachetana-theme';

  // restore whatever theme the user picked last time
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) html.setAttribute('data-theme', saved);

  function applyTheme() {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  // flip between dark and light when either button is clicked
  themeBtn.addEventListener('click', applyTheme);
  mmThemeBtn.addEventListener('click', applyTheme);

  // wait for the page to fully load, then hide the preloader after a short delay
  window.addEventListener('load', function () {
    const pre = document.getElementById('preloader');
    setTimeout(function () {
      pre.classList.add('done');
    }, 2800);
  });

  // keep a reference to the navbar and track the last scroll position
  var navbar = document.getElementById('navbar');
  var lastScroll = 0;

  window.addEventListener('scroll', function () {
    var st = window.scrollY;

    // add a background blur once the user has scrolled a bit
    if (st > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // hide the navbar when scrolling down, bring it back when scrolling up
    if (st > 300) {
      if (st > lastScroll + 5) {
        navbar.classList.add('hidden');
      } else if (st < lastScroll - 5) {
        navbar.classList.remove('hidden');
      }
    } else {
      navbar.classList.remove('hidden');
    }
    lastScroll = st;
  });

  // mobile menu elements
  var navToggle = document.getElementById('nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var mmClose = document.getElementById('mm-close');
  var mmLinks = mobileMenu.querySelectorAll('.mm-links a');

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    navToggle.classList.add('open');
    document.body.style.overflow = 'hidden'; // lock the background while menu is open
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', function () {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });
  mmClose.addEventListener('click', closeMenu);

  // close the menu automatically when any link inside it is tapped
  mmLinks.forEach(function (a) { a.addEventListener('click', closeMenu); });

  // smooth-scroll to a section when an anchor link is clicked
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      // subtract 80 px so the fixed navbar doesn't cover the section heading
      var top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  // reveal elements with a fade-in as they enter the viewport
  var reveals = document.querySelectorAll('.reveal');
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target); // only animate once, then stop watching
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(function (el) { revealObs.observe(el); });

  // animate each stat counter from 0 up to its target value when it scrolls into view
  var statCards = document.querySelectorAll('.stat-card');
  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var card = entry.target;
      var target = parseFloat(card.getAttribute('data-target'));
      var counterEl = card.querySelector('.counter');
      if (!counterEl || counterEl.dataset.done) return;
      counterEl.dataset.done = '1';

      var isFloat = target % 1 !== 0;
      var duration = 2000;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - (1 - progress) * (1 - progress); // ease-out quad curve
        var current = eased * target;
        counterEl.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      counterObs.unobserve(card);
    });
  }, { threshold: 0.4 });

  statCards.forEach(function (c) { counterObs.observe(c); });

  // password strength checker — runs on every keystroke
  var pwInput  = document.getElementById('pw-input');
  var pwBar    = document.getElementById('pw-bar');
  var pwLabel  = document.getElementById('pw-label');
  var pwToggle = document.getElementById('pw-toggle-vis');

  var strengthLevels = [
    { label: 'Very Weak',   color: '#EF4444', width: '10%'  },
    { label: 'Weak',        color: '#F97316', width: '25%'  },
    { label: 'Fair',        color: '#EAB308', width: '50%'  },
    { label: 'Strong',      color: '#22C55E', width: '75%'  },
    { label: 'Very Strong', color: '#10B981', width: '100%' }
  ];

  // award points for length, mixed case, digits, and special characters
  function calcStrength(pw) {
    var score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  pwInput.addEventListener('input', function () {
    var val = this.value;
    if (!val) {
      pwBar.style.width      = '0%';
      pwBar.style.background = 'transparent';
      pwLabel.textContent    = 'Enter a password to test';
      pwLabel.style.color    = '';
      return;
    }
    var idx = calcStrength(val);
    var lvl = strengthLevels[idx];
    pwBar.style.width      = lvl.width;
    pwBar.style.background = lvl.color;
    pwLabel.textContent    = lvl.label;
    pwLabel.style.color    = lvl.color;
  });

  // toggle between showing and hiding the password characters
  pwToggle.addEventListener('click', function () {
    var isPass    = pwInput.type === 'password';
    pwInput.type  = isPass ? 'text' : 'password';
    var openEye   = this.querySelector('.eye-open');
    var closedEye = this.querySelector('.eye-closed');
    if (isPass) {
      openEye.style.display   = 'none';
      closedEye.style.display = 'block';
    } else {
      openEye.style.display   = 'block';
      closedEye.style.display = 'none';
    }
  });

  // quiz questions — Nepal-specific cybersecurity scenarios
  var quizData = [
    {
      q: "You receive an SMS claiming to be from eSewa asking you to click a link to 'verify your account'. What should you do?",
      opts: [
        "Click the link and enter your credentials immediately",
        "Forward the message to 10 friends for bonus balance",
        "Ignore and delete it — eSewa never asks for credentials via SMS",
        "Reply with your eSewa PIN to confirm"
      ],
      correct: 2,
      explain: "eSewa, Khalti, and banks never request sensitive information via SMS or links. Always open the official app directly to check your account."
    },
    {
      q: "Which Nepal law specifically protects your right to digital privacy?",
      opts: [
        "Consumer Protection Act 2054",
        "Privacy Act 2075 BS",
        "Tourism Act 2035",
        "Company Act 2063"
      ],
      correct: 1,
      explain: "The Privacy Act 2075 BS (2018 AD) explicitly protects personal data and digital privacy of all Nepali citizens."
    },
    {
      q: "What is the emergency helpline number for reporting cybercrime in Nepal?",
      opts: ["100", "1930", "102", "112"],
      correct: 1,
      explain: "Nepal Police Cyber Bureau operates the 1930 helpline specifically for cybercrime reporting, available 24/7."
    },
    {
      q: "Which of these is the strongest password?",
      opts: ["nepal123", "password", "K@thmand!2024#nP", "12345678"],
      correct: 2,
      explain: "K@thmand!2024#nP is strong because it uses 16+ characters, mixed case, numbers, and special symbols. Simple words and number sequences are cracked in seconds."
    },
    {
      q: "What does 2FA (Two-Factor Authentication) do?",
      opts: [
        "Makes your internet speed 2x faster",
        "Adds a second layer of security beyond your password",
        "Encrypts your phone in 2 minutes",
        "Blocks all advertisements"
      ],
      correct: 1,
      explain: "2FA requires a second verification step (like an SMS code or authenticator app) making it much harder for attackers to access your accounts even if they have your password."
    },
    {
      q: "A Facebook page promises NRs 50,000 if you share a post and enter your bank details. What is this?",
      opts: [
        "A legitimate bank promotion",
        "A government digital subsidy programme",
        "A phishing/social engineering scam",
        "A reward from Facebook Nepal"
      ],
      correct: 2,
      explain: "This is a social engineering scam. No legitimate entity asks for bank details through Facebook posts. Such scams target Nepali users daily."
    },
    {
      q: "What should you do if someone threatens to share your private photos online?",
      opts: [
        "Pay them whatever they ask",
        "Delete all your social media accounts",
        "Report to Nepal Police Cyber Bureau (1930) and save evidence",
        "Ignore it, nothing can be done"
      ],
      correct: 2,
      explain: "Immediately report to Nepal Police Cyber Bureau at 1930. Save all evidence (screenshots, messages). This is a criminal offense under Nepal's Electronic Transaction Act."
    }
  ];

  // track which question we're on, the running score, and whether the user has answered yet
  var quizState = { current: 0, score: 0, answered: false };

  var startScreen   = document.getElementById('quiz-start');
  var activeScreen  = document.getElementById('quiz-active');
  var resultsScreen = document.getElementById('quiz-results');
  var beginBtn      = document.getElementById('quiz-begin');
  var nextBtn       = document.getElementById('q-next');
  var restartBtn    = document.getElementById('quiz-restart');
  var qQuestion     = document.getElementById('q-question');
  var qOptions      = document.getElementById('q-options');
  var qFeedback     = document.getElementById('q-feedback');
  var qCurrent      = document.getElementById('q-current');
  var qpBar         = document.getElementById('qp-bar');

  // hide all three quiz screens then show just the one we need
  function showScreen(screen) {
    startScreen.style.display   = 'none';
    activeScreen.style.display  = 'none';
    resultsScreen.style.display = 'none';
    screen.style.display        = 'block';
  }

  function loadQuestion() {
    var idx  = quizState.current;
    var data = quizData[idx];
    quizState.answered = false;

    qCurrent.textContent  = idx + 1;
    qpBar.style.width     = ((idx) / quizData.length * 100) + '%';
    qQuestion.textContent = data.q;
    qFeedback.style.display = 'none';
    nextBtn.style.display   = 'none';
    qOptions.innerHTML      = '';

    data.opts.forEach(function (opt, i) {
      var btn         = document.createElement('button');
      btn.className   = 'q-option';
      btn.textContent = opt;
      btn.addEventListener('click', function () { selectOption(i); });
      qOptions.appendChild(btn);
    });
  }

  function selectOption(idx) {
    if (quizState.answered) return;
    quizState.answered = true;

    var data    = quizData[quizState.current];
    var optBtns = qOptions.querySelectorAll('.q-option');

    // colour the correct answer green and the wrong pick red
    optBtns.forEach(function (btn, i) {
      btn.classList.add('disabled');
      if (i === data.correct)                btn.classList.add('correct');
      if (i === idx && idx !== data.correct) btn.classList.add('wrong');
    });

    if (idx === data.correct) quizState.score++;

    qFeedback.textContent   = data.explain;
    qFeedback.style.display = 'block';

    // swap the button label to "See Results" on the final question
    if (quizState.current === quizData.length - 1) {
      nextBtn.innerHTML = 'See Results <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    nextBtn.style.display = 'inline-flex';
  }

  nextBtn.addEventListener('click', function () {
    quizState.current++;
    if (quizState.current >= quizData.length) {
      showResults();
    } else {
      loadQuestion();
    }
  });

  function showResults() {
    showScreen(resultsScreen);
    qpBar.style.width = '100%';

    var score   = quizState.score;
    var total   = quizData.length;
    var percent = Math.round((score / total) * 100);

    document.getElementById('result-score-num').textContent   = score;
    document.getElementById('result-score-total').textContent = total;

    // pick an icon, title, and message based on how well the user did
    var icon, title, desc;
    if (percent >= 85) {
      icon  = '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>';
      title = 'Cyber Guardian!';
      desc  = 'Outstanding! You have excellent cybersecurity awareness. Share this knowledge with others.';
    } else if (percent >= 57) {
      icon  = '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#EAB308" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
      title = 'Getting There!';
      desc  = 'Good effort! Review the sections above to strengthen your weak areas.';
    } else {
      icon  = '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      title = 'Stay Alert!';
      desc  = "You're vulnerable online. Please read through all sections carefully and retake the quiz.";
    }

    document.getElementById('result-icon').innerHTML    = icon;
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-desc').textContent  = desc;
  }

  beginBtn.addEventListener('click', function () {
    quizState.current = 0;
    quizState.score   = 0;
    showScreen(activeScreen);
    loadQuestion();
  });

  restartBtn.addEventListener('click', function () {
    quizState.current = 0;
    quizState.score   = 0;
    nextBtn.innerHTML = 'Next Question <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    showScreen(activeScreen);
    loadQuestion();
  });

  // detailed content for each threat card modal
  var modalData = {
    phishing: {
      title: 'Phishing Attacks in Nepal',
      text: 'Phishing is the most prevalent cybercrime in Nepal. Attackers create convincing replicas of trusted websites — NIC Asia Bank, eSewa, Khalti, Nepal Government portals, and NTC/Ncell pages — to trick users into entering login credentials, OTPs, and personal details. SMS phishing (smishing) is especially widespread, with messages claiming lottery wins, account suspensions, or KYC update requirements.',
      tips: [
        'Never click links in unexpected SMS or emails — open apps directly',
        'Check the URL carefully — look for https and exact domain spelling',
        'Banks and eSewa/Khalti never ask for PINs, passwords, or OTPs via messages',
        'Enable SMS transaction alerts for your bank accounts',
        'Report suspicious messages to Nepal Police Cyber Bureau at 1930'
      ]
    },
    social: {
      title: 'Social Media Scams',
      text: 'Facebook and WhatsApp are the primary platforms for social engineering scams in Nepal. Common tactics include fake lottery pages ("You won NRs 5 Lakh!"), fraudulent job offers requiring "processing fees," romance scams targeting young adults, and investment schemes on Instagram promising unrealistic returns. Cloned profiles are also used to scam victims\' friends and family.',
      tips: [
        'Never send money to someone you\'ve only met online',
        'Verify job offers directly with the company — legitimate jobs never charge fees',
        'Be skeptical of "too good to be true" offers and prizes',
        'Set your social media profiles to private and limit public information',
        'If a friend\'s account sends unusual requests, verify by calling them directly'
      ]
    },
    banking: {
      title: 'Mobile Banking Fraud',
      text: 'With over 1.8 million mobile banking users in Nepal, financial fraud has surged dramatically. Attackers conduct vishing calls (voice phishing) posing as bank or eSewa customer support, requesting OTPs, PINs, and account details under pretexts like "account verification" or "suspicious activity." SIM swap attacks are also on the rise, where criminals obtain a duplicate SIM card to intercept banking OTPs.',
      tips: [
        'Never share OTPs, PINs, or passwords — bank staff will NEVER ask for them',
        'Use biometric or strong PIN locks on all banking apps',
        'Enable transaction notifications for real-time alerts',
        'Regularly check your bank statements for unauthorized transactions',
        'Register a complaint immediately if you lose your SIM card or phone',
        'Use official app stores only — never download banking apps from links'
      ]
    },
    identity: {
      title: 'Identity Theft in Nepal',
      text: 'Your citizenship number, passport data, and personal details can be stolen from data breaches, social media oversharing, or physical document theft. Criminals use this information for fraudulent loan applications, unauthorized SIM registrations, fake social media accounts, and even legal impersonation. Identity theft cases are increasing as more services move online in Nepal.',
      tips: [
        'Never share photos of your citizenship card or passport on social media',
        'Use strong, unique passwords for government portals and banking',
        'Regularly monitor your bank and mobile accounts for unusual activity',
        'Shred physical documents before disposing of them',
        'Enable login alerts on all accounts to detect unauthorized access',
        'Report identity theft immediately to the police and your bank'
      ]
    },
    harassment: {
      title: 'Cyber Harassment in Nepal',
      text: 'Online harassment is a growing crisis in Nepal, particularly affecting women and young people. Common forms include cyberstalking, sending threatening messages, non-consensual sharing of intimate images (revenge porn), creating fake profiles, doxing (publishing private information), and online bullying. Many victims suffer silently due to social stigma and lack of awareness about available legal protections.',
      tips: [
        'Document everything — take screenshots with dates and times',
        'Block and report the harasser on the platform',
        'Report to Nepal Police Cyber Bureau at 1930 — all reports are confidential',
        'Do not engage with or respond to the harasser',
        'Review your privacy settings and limit who can contact you',
        'Reach out to support organizations like WOREC Nepal or Maiti Nepal'
      ]
    },
    malware: {
      title: 'Malware & Ransomware',
      text: 'Many Nepali users download apps from unofficial sources, exposing their devices to malware that can steal contacts, photos, banking credentials, and even lock the device for ransom. "Modded" apps (cracked versions of paid apps), fake antivirus tools, and pirated software are primary infection vectors. Small businesses and organizations are increasingly targeted by ransomware attacks.',
      tips: [
        'Only download apps from Google Play Store or Apple App Store',
        'Never install APK files from unknown sources or links',
        'Keep your device OS and apps updated with the latest patches',
        'Install a reputable antivirus app from a known security company',
        'Be cautious with USB drives and external storage from others',
        'Back up important data regularly to a separate secure location'
      ]
    }
  };

  var modalOverlay  = document.getElementById('threat-modal');
  var modalCloseBtn = document.getElementById('modal-close');
  var threatCards   = document.querySelectorAll('.threat-card[data-modal]');

  function openModal(key) {
    var data = modalData[key];
    if (!data) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-text').textContent  = data.text;

    // build the tips list dynamically from the data object
    var tipsList = document.getElementById('modal-tips-list');
    tipsList.innerHTML = '';
    data.tips.forEach(function (tip) {
      var li         = document.createElement('li');
      li.textContent = tip;
      tipsList.appendChild(li);
    });

    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // open the relevant modal when any threat card is clicked
  threatCards.forEach(function (card) {
    card.addEventListener('click', function () {
      openModal(this.getAttribute('data-modal'));
    });
  });

  modalCloseBtn.addEventListener('click', closeModal);

  // clicking the dark backdrop behind the modal also closes it
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  // Escape key closes the modal for keyboard users
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // encode the URL and default share text once, then reuse for all three buttons
  var shareURL  = encodeURIComponent(window.location.href);
  var shareText = encodeURIComponent('Sachetana — Secure Minds. Safer Digital Nepal. Learn about cybersecurity and digital rights.');

  document.getElementById('share-fb').addEventListener('click', function () {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareURL, '_blank', 'width=600,height=400');
  });
  document.getElementById('share-wa').addEventListener('click', function () {
    window.open('https://wa.me/?text=' + shareText + '%20' + shareURL, '_blank');
  });
  document.getElementById('share-tw').addEventListener('click', function () {
    window.open('https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareURL, '_blank', 'width=600,height=400');
  });

  // newsletter form — client-side email validation only, no backend
  var nlForm  = document.getElementById('nl-form');
  var nlEmail = document.getElementById('nl-email');
  var nlMsg   = document.getElementById('nl-msg');

  nlForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email    = nlEmail.value.trim();
    var emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailReg.test(email)) {
      nlMsg.textContent = 'Please enter a valid email address.';
      nlMsg.className   = 'nl-message error';
      return;
    }

    nlMsg.textContent = 'Thank you! You\'ll receive cybersecurity updates soon.';
    nlMsg.className   = 'nl-message success';
    nlEmail.value     = '';

    // auto-clear the success message after 5 seconds
    setTimeout(function () {
      nlMsg.textContent = '';
      nlMsg.className   = 'nl-message';
    }, 5000);
  });

  // highlight the nav link that matches the section currently visible on screen
  var sections = document.querySelectorAll('section[id]');
  var navA     = document.querySelectorAll('.nav-link');

  function activateNav() {
    var scrollY = window.scrollY + 160;
    sections.forEach(function (section) {
      var top    = section.offsetTop;
      var height = section.offsetHeight;
      var id     = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navA.forEach(function (a) {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + id) a.classList.add('active');
        });
      }
    });
  }
  window.addEventListener('scroll', activateNav);

  // fill the thin progress bar at the top as the user reads through the page
  var progressBar = document.getElementById('read-progress');
  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && docHeight > 0) {
      progressBar.style.width = ((scrollTop / docHeight) * 100) + '%';
    }
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  // show the back-to-top button once the user is 500 px down the page
  var bttBtn = document.getElementById('back-to-top');
  if (bttBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        bttBtn.classList.add('visible');
      } else {
        bttBtn.classList.remove('visible');
      }
    });
    bttBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // FAQ accordion — only one answer stays open at a time
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn    = item.querySelector('.faq-q');
    var answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';

      // close every item first, then open the clicked one if it was shut
      faqItems.forEach(function (other) {
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-a').classList.remove('open');
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });

  // trigger the browser's print dialog for the security checklist
  var printBtn = document.getElementById('print-checklist');
  if (printBtn) {
    printBtn.addEventListener('click', function () { window.print(); });
  }

  // chatbot DOM references
  var cbFab         = document.getElementById('chatbot-fab');
  var cbPanel       = document.getElementById('chatbot-panel');
  var cbClose       = document.getElementById('cb-close');
  var cbForm        = document.getElementById('cb-form');
  var cbInput       = document.getElementById('cb-input');
  var cbMessages    = document.getElementById('cb-messages');
  var cbSuggestions = document.getElementById('cb-suggestions');
  var cbBadge       = cbFab.querySelector('.cb-badge');
  var cbOpened      = false; // used to show the welcome message only once

  // keyword-to-response knowledge base for common Nepal cybersecurity topics
  var cbKnowledge = [
    {
      patterns: ['phishing', 'fake email', 'fake sms', 'fake link', 'smishing', 'vishing'],
      response: '🛡️ <strong>Phishing</strong> is when attackers impersonate trusted entities (like banks, eSewa, NTC) to steal your credentials.\n\n<strong>How to stay safe:</strong>\n• Never click links in unexpected SMS or emails\n• Verify URLs — check for https and correct spelling\n• Banks never ask for PINs or OTPs via messages\n• Report to Nepal Police Cyber Bureau at <strong>1930</strong>'
    },
    {
      patterns: ['password', 'strong password', 'password manager', 'password strength'],
      response: '🔐 <strong>Creating Strong Passwords:</strong>\n\n• Use at least 12-16 characters\n• Mix uppercase, lowercase, numbers & symbols\n• Never use personal info (name, birthday)\n• Use a unique password for each account\n• Consider a password manager\n• Example of strong: <strong>K@thmand!2024#nP</strong>\n\n💡 Try our Password Strength Checker in the Practices section!'
    },
    {
      patterns: ['digital right', 'rights', 'privacy act', 'privacy law', 'nepal law', 'my right', 'constitution'],
      response: '⚖️ <strong>Your Digital Rights in Nepal:</strong>\n\n1. <strong>Right to Privacy</strong> — Privacy Act 2075 BS\n2. <strong>Right to Digital Expression</strong> — Constitution 2072\n3. <strong>Right to Information</strong> — RTI Act 2064\n4. <strong>Protection from Cybercrime</strong> — ETA 2063\n5. <strong>Right to Digital Inclusion</strong> — Digital Nepal Framework\n\nYour data, messages & online activities are legally protected!'
    },
    {
      patterns: ['report', 'cybercrime', 'report crime', 'cyber bureau', '1930', 'police', 'help', 'emergency'],
      response: '🚨 <strong>Report Cybercrime in Nepal:</strong>\n\n• Call <strong>1930</strong> — Nepal Police Cyber Bureau (24/7)\n• Visit: <strong>cybercrime.police.gov.np</strong>\n• File an FIR at your local police station\n\n<strong>Important:</strong> Save all evidence — screenshots, messages, call logs — before reporting. All reports are confidential.'
    },
    {
      patterns: ['2fa', 'two factor', 'two-factor', 'authentication', 'otp'],
      response: '🔑 <strong>Two-Factor Authentication (2FA):</strong>\n\n2FA adds an extra security layer beyond your password.\n\n<strong>How it works:</strong>\n• After entering your password, a second code is required\n• This code comes via SMS, email, or an authenticator app\n\n<strong>Enable 2FA on:</strong>\n• Email accounts (Gmail, Yahoo)\n• eSewa, Khalti, banking apps\n• Social media (Facebook, Instagram)\n\n💡 Authenticator apps are more secure than SMS codes.'
    },
    {
      patterns: ['social media', 'facebook', 'instagram', 'whatsapp', 'tiktok', 'scam', 'fake account', 'lottery'],
      response: '📱 <strong>Social Media Safety:</strong>\n\n<strong>Common scams in Nepal:</strong>\n• Fake lottery winners on Facebook\n• WhatsApp job offer scams\n• Instagram "investment" schemes\n• Cloned friend profiles asking for money\n\n<strong>Stay safe:</strong>\n• Set profiles to private\n• Never send money to online-only contacts\n• Verify offers directly with the company\n• If a friend sends unusual requests, call them first'
    },
    {
      patterns: ['malware', 'virus', 'ransomware', 'hack', 'hacked', 'infected'],
      response: '🦠 <strong>Malware & Ransomware Protection:</strong>\n\n<strong>Prevention:</strong>\n• Only download apps from Play Store / App Store\n• Never install APK files from unknown sources\n• Keep your OS and apps updated\n• Install reputable antivirus software\n• Be cautious with USB drives from others\n\n<strong>If infected:</strong>\n• Disconnect from the internet\n• Don\'t pay ransomware demands\n• Restore from a backup\n• Report to Nepal Police Cyber Bureau (1930)'
    },
    {
      patterns: ['esewa', 'khalti', 'mobile banking', 'banking fraud', 'bank', 'financial', 'money'],
      response: '🏦 <strong>Mobile Banking Safety:</strong>\n\n• Never share OTPs, PINs, or passwords with ANYONE\n• Bank staff will NEVER call and ask for your credentials\n• Use biometric locks on banking apps\n• Enable transaction notifications\n• Avoid using public WiFi for financial transactions\n• Download banking apps only from official stores\n\n🚨 If you suspect fraud, immediately call your bank and report to <strong>1930</strong>.'
    },
    {
      patterns: ['wifi', 'public wifi', 'vpn', 'network', 'internet safety'],
      response: '📶 <strong>WiFi & Network Security:</strong>\n\n• <strong>Avoid public WiFi</strong> for banking and sensitive activities\n• Use a VPN when on public networks\n• Change your home router\'s default password\n• Use WPA3 or WPA2 encryption at home\n• Disable auto-connect to open WiFi networks\n• Keep your router firmware updated\n\n💡 Public WiFi in cafes and airports is a common target for hackers.'
    },
    {
      patterns: ['harassment', 'bully', 'cyberbully', 'stalking', 'revenge porn', 'blackmail', 'threat', 'intimate image'],
      response: '🛑 <strong>Dealing with Cyber Harassment:</strong>\n\n<strong>If you\'re being harassed:</strong>\n1. Do NOT engage with the harasser\n2. Screenshot everything with dates & times\n3. Block and report on the platform\n4. Report to Nepal Police Cyber Bureau: <strong>1930</strong>\n5. Support: WOREC Nepal, Maiti Nepal\n\nThis is a criminal offense under Nepal\'s Electronic Transaction Act. All police reports are <strong>confidential</strong>.'
    },
    {
      patterns: ['identity theft', 'citizenship', 'personal data', 'data breach', 'stolen identity'],
      response: '🆔 <strong>Protecting Your Identity:</strong>\n\n• Never share citizenship/passport photos on social media\n• Use unique passwords for government portals\n• Monitor bank accounts for unusual activity\n• Enable login alerts on all accounts\n• Shred physical documents before disposing\n\n<strong>If stolen:</strong>\n• Report to police immediately\n• Notify your bank\n• Change all passwords\n• Monitor your accounts closely'
    },
    {
      patterns: ['child', 'kids', 'children', 'parental', 'minor', 'young'],
      response: '👨‍👩‍👧‍👦 <strong>Protecting Children Online:</strong>\n\n• Have open conversations about online safety\n• Use parental controls and content filters\n• Monitor online activity without invading privacy\n• Teach them to never share personal information\n• Set screen time limits\n• Know who they\'re talking to online\n• Educate about cyberbullying and what to do\n\n🚨 Report child exploitation to Nepal Police Cyber Bureau: <strong>1930</strong>'
    },
    {
      patterns: ['sachetana', 'about', 'what is this', 'who are you', 'what do you do'],
      response: '🇳🇵 <strong>About Sachetana (सचेतना):</strong>\n\nSachetana means "consciousness" and "awareness" in Nepali. This platform empowers every Nepali citizen with:\n\n• Cybersecurity awareness & education\n• Knowledge of digital rights under Nepal law\n• Practical safe digital habits\n• Quiz to test your knowledge\n\nOur mission: <strong>Secure Minds. Safer Digital Nepal.</strong>'
    },
    {
      patterns: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'greet'],
      response: 'नमस्ते! 🙏 Welcome to Sachetana\'s Cybersecurity Assistant.\n\nI can help you with:\n• Understanding cyber threats in Nepal\n• Your digital rights under Nepal law\n• Creating strong passwords\n• Reporting cybercrime\n• Staying safe on social media\n• Mobile banking safety\n\nAsk me anything about cybersecurity!'
    }
  ];

  // fallback replies for questions outside the cybersecurity scope
  var cbOffTopicResponses = [
    'I\'m specifically designed to help with <strong>cybersecurity topics only</strong>. Try asking about phishing, passwords, digital rights, or reporting cybercrime in Nepal.',
    'That\'s outside my expertise! I\'m a <strong>cybersecurity assistant</strong>. I can help with online safety, digital rights, password security, and cyber threats in Nepal.',
    'I can only answer <strong>cybersecurity-related questions</strong>. Here are some topics I know well:\n• Phishing & online scams\n• Password security\n• Digital rights in Nepal\n• Reporting cybercrime\n• Social media safety',
    'Sorry, I\'m trained exclusively on <strong>cybersecurity and digital safety</strong>. Try asking: "How do I create a strong password?" or "How to report cybercrime in Nepal?"'
  ];

  // scan the user message for any known pattern and return the matching reply
  function matchResponse(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < cbKnowledge.length; i++) {
      for (var j = 0; j < cbKnowledge[i].patterns.length; j++) {
        if (lower.indexOf(cbKnowledge[i].patterns[j]) !== -1) {
          return cbKnowledge[i].response;
        }
      }
    }
    return null;
  }

  function addMessage(text, sender) {
    var div       = document.createElement('div');
    div.className = 'cb-msg ' + sender;
    div.innerHTML = text.replace(/\n/g, '<br>');
    cbMessages.appendChild(div);
    cbMessages.scrollTop = cbMessages.scrollHeight;
  }

  // show three bouncing dots while the bot is "thinking"
  function addTyping() {
    var div       = document.createElement('div');
    div.className = 'cb-typing';
    div.id        = 'cb-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    cbMessages.appendChild(div);
    cbMessages.scrollTop = cbMessages.scrollHeight;
  }

  function removeTyping() {
    var el = document.getElementById('cb-typing-indicator');
    if (el) el.remove();
  }

  // add a short random delay before replying so the bot feels more natural
  function botReply(userText) {
    addTyping();
    var response = matchResponse(userText);
    var delay    = 600 + Math.random() * 600;

    setTimeout(function () {
      removeTyping();
      if (response) {
        addMessage(response, 'bot');
      } else {
        var idx = Math.floor(Math.random() * cbOffTopicResponses.length);
        addMessage(cbOffTopicResponses[idx], 'bot');
      }
    }, delay);
  }

  function toggleChatbot() {
    var isOpen = cbPanel.classList.contains('open');
    if (isOpen) {
      cbPanel.classList.remove('open');
      cbPanel.setAttribute('aria-hidden', 'true');
      cbFab.classList.remove('active');
    } else {
      cbPanel.classList.add('open');
      cbPanel.setAttribute('aria-hidden', 'false');
      cbFab.classList.add('active');
      cbBadge.classList.add('hidden');
      cbInput.focus();

      // show the greeting message only the very first time the panel opens
      if (!cbOpened) {
        cbOpened = true;
        setTimeout(function () {
          addMessage('नमस्ते! 🙏 I\'m your <strong>Cybersecurity Assistant</strong>.\n\nAsk me anything about online safety, cyber threats, digital rights in Nepal, or safe digital practices. I can only help with cybersecurity topics.', 'bot');
        }, 400);
      }
    }
  }

  cbFab.addEventListener('click', toggleChatbot);
  cbClose.addEventListener('click', toggleChatbot);

  cbForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = cbInput.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    cbInput.value = '';
    botReply(text);
  });

  // handle clicks on the quick-reply chip buttons below the input
  cbSuggestions.addEventListener('click', function (e) {
    var chip = e.target.closest('.cb-chip');
    if (!chip) return;
    var q = chip.getAttribute('data-q');
    addMessage(q, 'user');
    botReply(q);
  });

})();
