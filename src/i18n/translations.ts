export type Language = 'hi' | 'en';

export interface TranslationDictionary {
  // Navigation & Wordmark
  appName: string;
  classBadge: string;
  tagline: string;
  nav_practice: string;
  nav_map: string;
  nav_vault: string;
  nav_settings: string;
  // Guided Student Onboarding Tour & Header button
  nav_tour_btn: string;
  tour_modal_badge: string;
  tour_modal_title: string;
  tour_step1_badge: string;
  tour_step1_title: string;
  tour_step1_desc: string;
  tour_step2_badge: string;
  tour_step2_title: string;
  tour_step2_desc: string;
  tour_step3_badge: string;
  tour_step3_title: string;
  tour_step3_desc: string;
  tour_finish_btn: string;
  tour_next_btn: string;
  tour_prev_btn: string;
  tour_skip_btn: string;

  // Step 2 Socratic Feedback & Anti-guessing
  step2_choose_first_msg: string;
  step2_unlock_rule_btn: string;
  step2_see_rule_btn: string;
  step2_socratic_why_not: string;
  step2_socratic_tip: string;

  // Backup Reminder Alert
  backup_reminder_title: string;
  backup_reminder_desc: string;
  backup_reminder_btn: string;
  backup_reminder_dismiss: string;
  badge_offline: string;
  btn_install: string;
  lang_toggle_btn: string;

  // Ribbon & Footer
  ribbon_title: string;
  ribbon_rounds: string;
  ribbon_errors: string;
  ribbon_student: string;
  footer_brand: string;
  footer_offline: string;
  footer_audience: string;

  // Stepper Pills
  step1_pill: string;
  step2_pill: string;
  step3_pill: string;
  step4_pill: string;
  step5_pill: string;
  step_progress_prefix: string;
  step_complete_suffix: string;

  // Practice Header
  topic_choose_another: string;

  // Step 1: Notice
  step1_badge: string;
  step1_heading: string;
  step1_example_label: string;
  step1_listen_btn: string;
  step1_next_btn: string;

  // Step 2: Hypothesize
  step2_badge: string;
  step2_heading: string;
  step2_correct_alert: string;
  step2_try_again_alert: string;
  step2_next_btn: string;

  // Step 3: Clarify
  step3_badge: string;
  step3_heading: string;
  step3_golden_rule: string;
  step3_why_works: string;
  step3_quick_examples: string;
  step3_next_btn: string;

  // Step 4: Sentence Builder
  step4_badge: string;
  step4_heading: string;
  step4_placeholder: string;
  step4_check_btn: string;
  step4_escape_btn: string;
  step4_save_btn: string;
  step4_saved_btn: string;
  step4_perfect_msg: string;
  step4_fix_found: string;
  step4_fixes_found: string;
  step4_fix_btn: string;
  step4_no_error: string;
  step4_note_label: string;
  step4_note_placeholder: string;
  step4_next_btn: string;

  // Step 5: Super Revision (FSRS)
  step5_badge: string;
  step5_heading: string;
  step5_desc: string;
  step5_stat_retention: string;
  step5_stat_reviews: string;
  step5_stat_next_due: string;
  fsrs_again_label: string;
  fsrs_again_sub: string;
  fsrs_hard_label: string;
  fsrs_hard_sub: string;
  fsrs_good_label: string;
  fsrs_good_sub: string;
  fsrs_easy_label: string;
  fsrs_easy_sub: string;
  step5_complete_btn: string;

  // Genie Avatar
  genie_title: string;
  genie_subtitle: string;
  genie_tap_tip: string;
  genie_chip_rule: string;
  genie_chip_mistake: string;
  genie_chip_example: string;
  genie_chip_mic: string;
  genie_input_placeholder: string;
  genie_send_btn: string;
  genie_thinking: string;
  genie_pause_btn: string;
  genie_resume_btn: string;
  genie_paused_badge: string;
  genie_drag_tooltip: string;
  genie_lamp_tuck: string;
  genie_lamp_tip: string;
  genie_ask_btn: string;

  // Learning Map
  map_title: string;
  map_subtitle: string;
  map_filter_all: string;
  map_status_mastered: string;
  map_status_practicing: string;
  map_status_start: string;
  map_stats_total: string;
  map_stats_mastered: string;
  map_stats_due: string;

  // Mistake Vault
  vault_title: string;
  vault_subtitle: string;
  vault_empty_title: string;
  vault_empty_desc: string;
  vault_clear_btn: string;
  vault_original_label: string;
  vault_corrected_label: string;
  vault_rule_label: string;
  vault_retry_btn: string;
  vault_confirm_clear: string;

  // Topic Modal
  modal_title: string;
  modal_subtitle: string;
  modal_search_placeholder: string;
  modal_close: string;

  // Settings
  settings_title: string;
  settings_subtitle: string;
  profile_title: string;
  profile_name_label: string;
  profile_class_label: string;
  profile_class_val: string;
  stats_title: string;
  stats_rounds: string;
  stats_errors: string;
  stats_reviews: string;
  voice_title: string;
  voice_badge: string;
  voice_desc: string;
  voice_active_label: string;
  voice_test_btn: string;
  voice_tips_title: string;
  motion_title: string;
  motion_desc: string;
  motion_steady: string;
  motion_seconds_suffix: string;
  dev_gate_title: string;
  dev_gate_badge: string;
  dev_gate_desc: string;
  dev_pin_placeholder: string;
  dev_unlock_btn: string;
  dev_lock_btn: string;
  dev_hint: string;
  dev_active_badge: string;
  dev_console_title: string;
  dev_console_desc: string;

  // Toasts
  toast_escape: string;
  toast_saved: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  hi: {
    // Navigation & Wordmark
    appName: 'ELLA Grammar Studio',
    classBadge: 'Class 6–10',
    tagline: 'खेल-खेल में आसान इंग्लिश ग्रामर • बिना रटे समझें',
    nav_practice: 'डेली प्रैक्टिस',
    nav_map: 'लर्निंग मैप (21 टॉपिक्स)',
    nav_vault: 'मिस्टेक वॉल्ट',
    nav_settings: 'सेटिंग्स',
    nav_tour_btn: 'गाइड',
    badge_offline: '100% ऑफ़लाइन',
    btn_install: 'ऐप इंस्टॉल करें',
    lang_toggle_btn: 'English',

    // Guided Student Onboarding Tour
    tour_modal_badge: '30-सेकंड गाइड • ELLA कैसे काम करती है?',
    tour_modal_title: 'बिना रटे इंग्लिश ग्रामर सीखें!',
    tour_step1_badge: 'कदम 1/3 • आगमन विधि (Inductive Learning)',
    tour_step1_title: 'नियम रटने की कोई ज़रूरत नहीं!',
    tour_step1_desc: 'स्कूल में अक्सर कठिन नियमों की परिभाषा रटने को दी जाती है। ELLA में आप पहले असली उदाहरण देखकर खुद पैटर्न खोजते हैं — जैसे एक वैज्ञानिक करता है!',
    tour_step2_badge: 'कदम 2/3 • 5-स्टेप जादुई चक्र',
    tour_step2_title: '5 आसान कदमों में पक्की मास्टरी',
    tour_step2_desc: '1. फर्क पहचानें → 2. अंदाज़ा लगाएँ → 3. सीक्रेट फॉर्मूला समझें → 4. अपना वाक्य बनाएँ (0ms ऑफ़लाइन चेकर) → 5. स्मार्ट FSRS मेमोरी रिवीजन!',
    tour_step3_badge: 'कदम 3/3 • एला जिनी व जादुई चिराग',
    tour_step3_title: 'गलतियाँ सीखने का सबसे बड़ा मौका हैं',
    tour_step3_desc: 'यहाँ गलतियों पर कोई डांट या लाल स्याही नहीं! एला जिनी आपकी दोस्ताना AI टीचर है जो कभी नाराज़ नहीं होती। किसी भी वक्त चिराग पर टैप करके सवाल पूछें।',
    tour_finish_btn: '🎉 समझ गया! अभ्यास शुरू करें',
    tour_next_btn: 'आगे बढ़ें →',
    tour_prev_btn: '← वापस',
    tour_skip_btn: 'छोड़ें (Skip)',

    // Step 2 Socratic Feedback & Anti-guessing
    step2_choose_first_msg: 'आगे बढ़ने के लिए ऊपर से एक विकल्प चुनें',
    step2_unlock_rule_btn: 'शानदार! सीक्रेट नियम खोलें →',
    step2_see_rule_btn: 'नियम देखें और समझें →',
    step2_socratic_why_not: '💡 क्यों नहीं? (सोचने का संकेत)',
    step2_socratic_tip: 'गलत अंदाज़ा भी सीखने का हिस्सा है! ध्यान दें कि क्या आप स्पेलिंग (अक्षर) के चक्कर में उच्चारण (ध्वनि) को भूल रहे हैं?',

    // Backup Reminder Alert
    backup_reminder_title: '💾 अपनी प्रोग्रेस सुरक्षित रखें',
    backup_reminder_desc: 'फोन क्लीनर ऐप्स कभी-कभी ब्राउज़र का डेटा साफ़ कर देते हैं। अपनी 100% ऑफ़लाइन पढ़ाई को सुरक्षित रखने के लिए 1-क्लिक बैकअप फ़ाइल डाउनलोड करें।',
    backup_reminder_btn: 'बैकअप डाउनलोड करें',
    backup_reminder_dismiss: 'बाद में',

    // Ribbon & Footer
    ribbon_title: 'डेली इंग्लिश प्रैक्टिस',
    ribbon_rounds: 'प्रैक्टिस राउंड्स:',
    ribbon_errors: 'फिक्स की गई गलतियाँ:',
    ribbon_student: 'स्टूडेंट:',
    footer_brand: 'ELLA Grammar Studio v3.0',
    footer_offline: '100% ऑफ़लाइन PWA • सुरक्षित व मुफ़्त',
    footer_audience: 'कक्षा 6–10 के विद्यार्थियों के लिए सरल, आकर्षक व 100% मुफ़्त',

    // Stepper Pills
    step1_pill: '1. फर्क पहचानें',
    step2_pill: '2. अंदाज़ा लगाएँ',
    step3_pill: '3. सीक्रेट फॉर्मूला',
    step4_pill: '4. वाक्य बनाएँ',
    step5_pill: '5. सुपर रिवीजन',
    step_progress_prefix: 'कदम',
    step_complete_suffix: 'पूर्ण',

    // Practice Header
    topic_choose_another: 'पाठ्यक्रम से दूसरा विषय चुनें',

    // Step 1: Notice
    step1_badge: 'कदम 1 • फर्क पहचानें (Spot the Difference)',
    step1_heading: 'ध्यान से देखें और अंतर समझें',
    step1_example_label: 'उदाहरण',
    step1_listen_btn: 'सुनें',
    step1_next_btn: 'अगला कदम: अंदाज़ा लगाएँ →',

    // Step 2: Hypothesize
    step2_badge: 'कदम 2 • नियम का अंदाज़ा लगाएँ (Hypothesis)',
    step2_heading: 'जासूस बनें: क्या नियम छुपा है?',
    step2_correct_alert: 'शानदार! आपका अंदाज़ा बिल्कुल सही है!',
    step2_try_again_alert: 'थोड़ा और सोचें! सही उत्तर यह है:',
    step2_next_btn: 'अगला कदम: सीक्रेट फॉर्मूला देखें →',

    // Step 3: Clarify
    step3_badge: 'कदम 3 • सीक्रेट फॉर्मूला (Rule Discovery)',
    step3_heading: 'जादुई नियम समझें (Never Forget Formula)',
    step3_golden_rule: '✨ मुख्य नियम (The Golden Rule)',
    step3_why_works: '💡 यह नियम क्यों बना? (Why This Happens)',
    step3_quick_examples: '🎯 त्वरित उदाहरण (Quick Examples)',
    step3_next_btn: 'अगला कदम: खुद का वाक्य बनाएँ →',

    // Step 4: Sentence Builder
    step4_badge: 'कदम 4 • खुद का वाक्य बनाएँ (Sentence Builder)',
    step4_heading: 'नियम का उपयोग करके वाक्य लिखें',
    step4_placeholder: 'यहाँ अपना वाक्य टाइप करें (जैसे: My sister studies in a university)...',
    step4_check_btn: 'वाक्य चेक करें',
    step4_escape_btn: 'आसान उदाहरण चाहिए? (Escape Hatch)',
    step4_save_btn: 'प्रोग्रेस सेव करें',
    step4_saved_btn: 'सफलतापूर्वक सेव हुआ!',
    step4_perfect_msg: 'परफेक्ट! आपका वाक्य 100% सही है!',
    step4_fix_found: 'सुधार मिला',
    step4_fixes_found: 'सुधार मिले',
    step4_fix_btn: 'सुधारें',
    step4_no_error: 'वाक्य में कोई गलती नहीं है!',
    step4_note_label: 'अपने लिए नोट (वैकल्पिक):',
    step4_note_placeholder: 'जैसे: hour और honest में h साइलेंट होता है...',
    step4_next_btn: 'अगला कदम: सुपर रिवीजन →',

    // Step 5: Super Revision
    step5_badge: 'कदम 5 • सुपर रिवीजन (Spaced Repetition)',
    step5_heading: 'दिमाग में पक्का करें (Memory Lock)',
    step5_desc: 'ELLA का स्मार्ट FSRS एल्गोरिदम आपकी मेमोरी के आधार पर अगली समीक्षा तय करता है ताकि आप कभी न भूलें।',
    step5_stat_retention: 'मेमोरी रिटेंशन',
    step5_stat_reviews: 'कुल समीक्षाएँ',
    step5_stat_next_due: 'अगली रिवीजन',
    fsrs_again_label: 'फिर से (Again)',
    fsrs_again_sub: 'कल पुनः अभ्यास (1 दिन)',
    fsrs_hard_label: 'कठिन (Hard)',
    fsrs_hard_sub: '2 दिन बाद समीक्षा',
    fsrs_good_label: 'अच्छा (Good)',
    fsrs_good_sub: '4 दिन बाद समीक्षा',
    fsrs_easy_label: 'आसान (Easy)',
    fsrs_easy_sub: '7+ दिन बाद समीक्षा',
    step5_complete_btn: '🎉 टॉपिक पूरा हुआ! अगला टॉपिक चुनें',

    // Genie Avatar
    genie_title: 'एला जिनी (AI टीचर)',
    genie_subtitle: 'जादुई सहायक',
    genie_tap_tip: 'टैप करें जादुई टिप के लिए',
    genie_chip_rule: '💡 नियम समझाओ',
    genie_chip_mistake: '🔍 मेरी गलती कहाँ है?',
    genie_chip_example: '✨ एक आसान उदाहरण दो',
    genie_chip_mic: '🎤 बोलकर पूछें',
    genie_input_placeholder: 'एला से कोई भी सवाल पूछें (उदा. an hour क्यों आया?)...',
    genie_send_btn: 'भेजें',
    genie_thinking: 'एला सोच रही है...',
    genie_pause_btn: 'जिनी को रोकें / पॉज़ करें',
    genie_resume_btn: 'जिनी को पुनः शुरू करें (Resume)',
    genie_paused_badge: 'पॉज़्ड (Paused)',
    genie_drag_tooltip: 'पकड़कर स्क्रीन पर कहीं भी ले जाएँ',
    genie_lamp_tuck: 'चिराग में समेटें (Tuck into Lamp)',
    genie_lamp_tip: '🪔 जादुई चिराग • टैप करें और एला से बात करें',
    genie_ask_btn: 'सवाल पूछें (Ask Ella)',

    // Learning Map
    map_title: 'लर्निंग मैप (21 टॉपिक्स)',
    map_subtitle: 'कक्षा 6–10 सीबीएसई व स्टेट बोर्ड इंग्लिश ग्रामर पाठ्यक्रम',
    map_filter_all: 'सभी 21 टॉपिक्स',
    map_status_mastered: 'मास्टर हो चुका',
    map_status_practicing: 'अभ्यास जारी',
    map_status_start: 'शुरू करें',
    map_stats_total: 'कुल टॉपिक्स',
    map_stats_mastered: 'मास्टर किए गए',
    map_stats_due: 'समीक्षा शेष',

    // Mistake Vault
    vault_title: 'मिस्टेक वॉल्ट (Mistake Vault)',
    vault_subtitle: 'यहाँ आपकी गलतियों से सीखने का मौका है - बिना किसी डर या झिझक के',
    vault_empty_title: 'वॉल्ट खाली है!',
    vault_empty_desc: 'बहुत बढ़िया! अभी आपकी कोई अनसुलझी गलती नहीं है। जब भी कोई गलती होगी, वह यहाँ सुरक्षित रहेगी।',
    vault_clear_btn: 'मिस्टेक वॉल्ट खाली करें',
    vault_original_label: 'मूल वाक्य:',
    vault_corrected_label: 'सुधारा हुआ रूप:',
    vault_rule_label: 'व्याकरण नियम:',
    vault_retry_btn: 'फिर से अभ्यास करें',
    vault_confirm_clear: 'क्या आप वाकई अपनी सारी पुरानी गलतियाँ साफ़ करना चाहते हैं?',

    // Topic Modal
    modal_title: 'विषय चुनें (Topics Library)',
    modal_subtitle: '4 स्मार्ट इंजन • 6 लेवल्स • 21 इंटरैक्टिव विषय',
    modal_search_placeholder: 'विषय खोजें (जैसे: Articles, Noun, Tenses, Modals)...',
    modal_close: 'बंद करें',

    // Settings
    settings_title: 'स्टूडेंट प्रोफ़ाइल और आवाज़ सेटिंग्स',
    settings_subtitle: 'ELLA 100% ऑफ़लाइन है। आपकी पढ़ाई की प्रोग्रेस आपकी डिवाइस पर सुरक्षित रहती है।',
    profile_title: 'स्टूडेंट प्रोफ़ाइल (Profile)',
    profile_name_label: 'स्टूडेंट का नाम (Student Name):',
    profile_class_label: 'आपकी कक्षा (Class):',
    profile_class_val: 'कक्षा 6–10 (CBSE / State Board)',
    stats_title: 'आपकी कुल प्रोग्रेस (Activity Stats)',
    stats_rounds: 'प्रैक्टिस राउंड्स',
    stats_errors: 'फिक्स की गई गलतियाँ',
    stats_reviews: 'रिवीजन टॉपिक्स',
    voice_title: 'भारतीय अंग्रेज़ी उच्चारण (Indian English Voice Engine)',
    voice_badge: 'en-IN Priority',
    voice_desc: 'ELLA में उदाहरणों और वाक्यों का उच्चारण भारतीय अंग्रेज़ी एक्सेंट (Indian English) में बोला जाता है ताकि विद्यार्थियों को सहज व स्पष्ट समझ आए।',
    voice_active_label: 'सक्रिय आवाज़:',
    voice_test_btn: 'भारतीय उच्चारण टेस्ट करें (Test Accent)',
    voice_tips_title: 'उच्चारण को और भी सजीव बनाने के सरल तरीके:',
    motion_title: 'एला जिनी मूवमेंट सेटिंग्स (Genie Motion & Flight Interval)',
    motion_desc: 'जिनी स्क्रीन पर कितनी देर बाद अपनी जगह बदले, यह आप यहाँ चुन सकते हैं। यदि आप चाहते हैं कि जिनी एक ही जगह रुकी रहे, तो "रोक कर रखें" चुनें।',
    motion_steady: 'रोक कर रखें',
    motion_seconds_suffix: 'सेकंड',
    dev_gate_title: 'शिक्षक व डेवलपर मोड (Developer Mode)',
    dev_gate_badge: 'पिन सुरक्षित',
    dev_gate_desc: 'तकनीकी सेटिंग्स (AI Key, बैकअप/रीस्टोर, डेटा वाइप और GitHub डिप्लॉयमेंट) को खोलने के लिए सिक्योरिटी कोड दर्ज करें।',
    dev_pin_placeholder: 'सिक्योरिटी पिन (Default: 1507)',
    dev_unlock_btn: 'मोड अनलॉक करें',
    dev_lock_btn: 'डेवलपर मोड लॉक करें (Lock)',
    dev_hint: 'डिफ़ॉल्ट सिक्योरिटी पिन: 1507 या ella2026',
    dev_active_badge: 'सक्रिय (Unlocked)',
    dev_console_title: 'डेवलपर व शिक्षक कंसोल (Developer Console)',
    dev_console_desc: 'यहाँ से आप Gemini AI API Key, बैकअप/रीस्टोर, डेटाबेस वाइप और GitHub डिप्लॉयमेंट प्रबंधित कर सकते हैं।',

    // Toasts
    toast_escape: 'आसान उदाहरण लोड किया गया!',
    toast_saved: 'सफलतापूर्वक सेव किया गया!',
  },

  en: {
    // Navigation & Wordmark
    appName: 'ELLA Grammar Studio',
    classBadge: 'Class 6–10',
    tagline: 'Fun English Grammar • Learn by Understanding, Not Memorizing',
    nav_practice: 'Daily Practice',
    nav_map: 'Learning Map (21 Topics)',
    nav_vault: 'Mistake Vault',
    nav_settings: 'Settings',
    nav_tour_btn: 'Tour',
    badge_offline: '100% Offline',
    btn_install: 'Install App',
    lang_toggle_btn: 'हिन्दी',

    // Guided Student Onboarding Tour
    tour_modal_badge: '30-Second Tour • How ELLA Works',
    tour_modal_title: 'Learn English Grammar by Understanding!',
    tour_step1_badge: 'Step 1/3 • Inductive Learning',
    tour_step1_title: 'No Need to Memorize Boring Rules!',
    tour_step1_desc: 'Traditional classrooms force you to memorize dry definitions. In ELLA, you look at real-life examples first and discover patterns yourself — just like a real scientist!',
    tour_step2_badge: 'Step 2/3 • The 5-Step Magic Cycle',
    tour_step2_title: 'True Mastery in 5 Simple Steps',
    tour_step2_desc: '1. Spot Differences → 2. Make a Guess → 3. Unlock the Secret Rule → 4. Build Your Own Sentence (Instant 0ms Checker) → 5. Smart FSRS Memory Review!',
    tour_step3_badge: 'Step 3/3 • Ella Genie & Her Magic Lamp',
    tour_step3_title: 'Mistakes are the Best Way to Learn',
    tour_step3_desc: 'No red pen, no scolding, and zero embarrassment! Ella the Genie is your friendly AI tutor who explains mistakes kindly. Tap the Golden Lamp anytime to ask a question.',
    tour_finish_btn: "🎉 Got it! Let's Start Practicing",
    tour_next_btn: 'Next Step →',
    tour_prev_btn: '← Back',
    tour_skip_btn: 'Skip Tour',

    // Step 2 Socratic Feedback & Anti-guessing
    step2_choose_first_msg: 'Make a guess above before continuing',
    step2_unlock_rule_btn: 'Awesome! Unlock Secret Rule →',
    step2_see_rule_btn: 'See Rule & Understand →',
    step2_socratic_why_not: '💡 Why this guess does not work',
    step2_socratic_tip: 'A wrong guess is an essential part of learning! Notice whether you are focusing on the spelling letter instead of the spoken sound.',

    // Backup Reminder Alert
    backup_reminder_title: '💾 Save Your Learning Progress',
    backup_reminder_desc: 'Phone cleaner apps can sometimes wipe browser storage. Download a 1-click JSON backup file to keep your study records 100% safe.',
    backup_reminder_btn: 'Download Backup',
    backup_reminder_dismiss: 'Later',

    // Ribbon & Footer
    ribbon_title: 'Daily English Practice',
    ribbon_rounds: 'Practice Rounds:',
    ribbon_errors: 'Fixed Errors:',
    ribbon_student: 'Student:',
    footer_brand: 'ELLA Grammar Studio v3.0',
    footer_offline: '100% Offline PWA • Safe & Free',
    footer_audience: 'Simple, engaging & 100% free for Classes 6–10',

    // Stepper Pills
    step1_pill: '1. Spot Difference',
    step2_pill: '2. Make a Guess',
    step3_pill: '3. Secret Rule',
    step4_pill: '4. Build Sentence',
    step5_pill: '5. Super Revision',
    step_progress_prefix: 'Step',
    step_complete_suffix: 'Complete',

    // Practice Header
    topic_choose_another: 'Choose Another Topic',

    // Step 1: Notice
    step1_badge: 'Step 1 • Spot the Difference (Notice)',
    step1_heading: 'Look Closely & Spot the Difference',
    step1_example_label: 'Example',
    step1_listen_btn: 'Listen',
    step1_next_btn: 'Next Step: Make a Guess →',

    // Step 2: Hypothesize
    step2_badge: 'Step 2 • Guess the Hidden Rule (Hypothesis)',
    step2_heading: 'Be a Grammar Detective: What is the Rule?',
    step2_correct_alert: 'Awesome! Your guess is 100% correct!',
    step2_try_again_alert: 'Nice try! Look closely at this clue:',
    step2_next_btn: 'Next Step: Discover the Secret Rule →',

    // Step 3: Clarify
    step3_badge: 'Step 3 • The Secret Rule (Clarify)',
    step3_heading: 'Master the Rule (Never Forget Formula)',
    step3_golden_rule: '✨ The Golden Rule',
    step3_why_works: '💡 Why This Rule Works',
    step3_quick_examples: '🎯 Quick Pattern Examples',
    step3_next_btn: 'Next Step: Build Your Own Sentence →',

    // Step 4: Sentence Builder
    step4_badge: 'Step 4 • Build Your Sentence (Sentence Builder)',
    step4_heading: 'Use the Rule to Write Your Own Sentence',
    step4_placeholder: 'Type your sentence here (e.g. My sister studies in a university)...',
    step4_check_btn: 'Check Sentence',
    step4_escape_btn: 'Need an easy example? (Help me)',
    step4_save_btn: 'Save My Progress',
    step4_saved_btn: 'Successfully Saved!',
    step4_perfect_msg: 'Perfect! Your sentence is 100% correct!',
    step4_fix_found: 'correction needed',
    step4_fixes_found: 'corrections needed',
    step4_fix_btn: 'Fix',
    step4_no_error: 'No grammar mistakes found!',
    step4_note_label: 'My personal note (optional):',
    step4_note_placeholder: 'e.g., In hour and honest, the letter h is silent...',
    step4_next_btn: 'Next Step: Super Revision →',

    // Step 5: Super Revision
    step5_badge: 'Step 5 • Super Revision (Spaced Repetition)',
    step5_heading: 'Lock It in Memory (FSRS Smart Review)',
    step5_desc: "ELLA's smart FSRS algorithm schedules your next review right before you might forget it, building lasting memory.",
    step5_stat_retention: 'Memory Retention',
    step5_stat_reviews: 'Total Reviews',
    step5_stat_next_due: 'Next Review Due',
    fsrs_again_label: 'Again',
    fsrs_again_sub: 'Review tomorrow (1 day)',
    fsrs_hard_label: 'Hard',
    fsrs_hard_sub: 'Review in 2 days',
    fsrs_good_label: 'Good',
    fsrs_good_sub: 'Review in 4 days',
    fsrs_easy_label: 'Easy',
    fsrs_easy_sub: 'Review in 7+ days',
    step5_complete_btn: '🎉 Topic Complete! Choose Next Topic',

    // Genie Avatar
    genie_title: 'Ella Genie (AI Teacher)',
    genie_subtitle: 'Magical Assistant',
    genie_tap_tip: 'Tap for a magical hint',
    genie_chip_rule: '💡 Explain the Rule',
    genie_chip_mistake: '🔍 Where is My Mistake?',
    genie_chip_example: '✨ Give an Easy Example',
    genie_chip_mic: '🎤 Speak Question',
    genie_input_placeholder: 'Ask Ella any grammar question (e.g. Why an hour?)...',
    genie_send_btn: 'Send',
    genie_thinking: 'Ella is thinking...',
    genie_pause_btn: 'Pause Genie',
    genie_resume_btn: 'Resume Genie',
    genie_paused_badge: 'Paused',
    genie_drag_tooltip: 'Drag anywhere on screen',
    genie_lamp_tuck: 'Tuck into Lamp',
    genie_lamp_tip: '🪔 Magic Lamp • Tap to talk to Ella',
    genie_ask_btn: 'Ask Ella',

    // Learning Map
    map_title: 'Learning Map (21 Topics)',
    map_subtitle: 'CBSE & State Board English Grammar Curriculum (Classes 6–10)',
    map_filter_all: 'All 21 Topics',
    map_status_mastered: 'Mastered',
    map_status_practicing: 'Practicing',
    map_status_start: 'Start Topic',
    map_stats_total: 'Total Topics',
    map_stats_mastered: 'Mastered',
    map_stats_due: 'Due for Review',

    // Mistake Vault
    vault_title: 'Mistake Vault (Error Vault)',
    vault_subtitle: 'Learn from your mistakes without fear or hesitation',
    vault_empty_title: 'Your Vault is Empty!',
    vault_empty_desc: 'Awesome job! You have zero unresolved mistakes right now. Any tricky sentences will be stored here for review.',
    vault_clear_btn: 'Clear Mistake Vault',
    vault_original_label: 'Original Sentence:',
    vault_corrected_label: 'Corrected Form:',
    vault_rule_label: 'Grammar Rule:',
    vault_retry_btn: 'Practice Again',
    vault_confirm_clear: 'Are you sure you want to clear all your saved mistakes?',

    // Topic Modal
    modal_title: 'Choose a Grammar Topic (Topics Library)',
    modal_subtitle: '4 Smart Engines • 6 Levels • 21 Interactive Topics',
    modal_search_placeholder: 'Search topic (e.g. Articles, Nouns, Tenses, Modals)...',
    modal_close: 'Close',

    // Settings
    settings_title: 'Student Profile & Speech Settings',
    settings_subtitle: 'ELLA is 100% offline. All your learning progress stays safely on your personal device.',
    profile_title: 'Student Profile',
    profile_name_label: 'Student Name:',
    profile_class_label: 'Your Class:',
    profile_class_val: 'Classes 6–10 (CBSE / State Board)',
    stats_title: 'Your Overall Progress (Activity Stats)',
    stats_rounds: 'Practice Rounds',
    stats_errors: 'Fixed Errors',
    stats_reviews: 'Review Topics',
    voice_title: 'Indian English Voice Engine',
    voice_badge: 'en-IN Priority',
    voice_desc: 'ELLA pronounces all sentences in a clear Indian English accent so students can understand easily without confusion.',
    voice_active_label: 'Active Voice:',
    voice_test_btn: 'Test Indian Accent Voice',
    voice_tips_title: 'Tips for natural Indian voice pronunciation:',
    motion_title: 'Ella Genie Motion & Flight Interval',
    motion_desc: 'Choose how often Ella the Genie glides to a new spot across your screen. Select "Keep Stationary" if you want her to stay in one place.',
    motion_steady: 'Keep Stationary',
    motion_seconds_suffix: 'seconds',
    dev_gate_title: 'Teacher & Developer Mode',
    dev_gate_badge: 'PIN Protected',
    dev_gate_desc: 'Enter security code to access advanced technical controls (Gemini AI Key, Backup/Restore, Data Reset, and GitHub deployment).',
    dev_pin_placeholder: 'Security PIN (Default: 1507)',
    dev_unlock_btn: 'Unlock Mode',
    dev_lock_btn: 'Lock Developer Mode',
    dev_hint: 'Default Security PIN: 1507 or ella2026',
    dev_active_badge: 'Active (Unlocked)',
    dev_console_title: 'Teacher & Developer Console',
    dev_console_desc: 'Manage Google Gemini AI Key, database backups, complete data wipe, and GitHub Pages deployment.',

    // Toasts
    toast_escape: 'Loaded an easy example!',
    toast_saved: 'Saved successfully!',
  },
};
