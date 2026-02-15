/**
 * =============================================
 *  SISTEMA DE ASISTENCIA DE EVENTOS
 * =============================================
 *  Permite a los usuarios confirmar, marcar
 *  como "tal vez" o cancelar su asistencia a
 *  eventos. Usa PHP API con base de datos.
 *  Fallback a localStorage si la API no responde.
 * =============================================
 */

(function () {
    'use strict';

    /* ── Constantes ───────────────────────────── */
    var STORAGE_KEY = 'vikinger_event_attendance';
    var API_URL = 'event_attendance.php';

    // Estados posibles
    var STATUS = {
        NONE: 'none',
        GOING: 'going',
        MAYBE: 'maybe',
        NOT_GOING: 'not_going'
    };

    // Etiquetas de texto
    var LABELS = {
        none: 'Confirmar Asistencia',
        going: '✓ Asistiré',
        maybe: '⏳ Tal vez',
        not_going: '✗ No Asistiré'
    };

    // Clases CSS para cada estado
    var STATUS_CLASSES = {
        none: '',
        going: 'ea-status-going',
        maybe: 'ea-status-maybe',
        not_going: 'ea-status-not-going'
    };

    /* ── Estado local (cache) ─────────────────── */

    function loadLocalState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveLocalState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { /* silently fail */ }
    }

    function getEventStateLocal(eventName) {
        var state = loadLocalState();
        return state[eventName] || { status: STATUS.NONE };
    }

    function setEventStateLocal(eventName, status) {
        var state = loadLocalState();
        state[eventName] = { status: status };
        saveLocalState(state);
    }

    /* ── API Backend ──────────────────────────── */

    /**
     * Obtener estado de asistencia desde el servidor.
     */
    function fetchAttendance(eventName, callback) {
        fetch(API_URL + '?evento=' + encodeURIComponent(eventName))
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.success) {
                    // Actualizar cache local
                    setEventStateLocal(eventName, data.mi_estado);
                    callback(null, data);
                } else {
                    callback(data.error || 'Error desconocido');
                }
            })
            .catch(function (err) {
                console.warn('[Asistencia] API no disponible, usando localStorage:', err.message);
                // Fallback a localStorage
                var local = getEventStateLocal(eventName);
                callback(null, {
                    mi_estado: local.status,
                    total_asistentes: 0,
                    conteos: { going: 0, maybe: 0, not_going: 0 }
                });
            });
    }

    /**
     * Enviar cambio de asistencia al servidor.
     */
    function sendAttendance(eventName, status, callback) {
        // Guardar localmente primero (optimistic update)
        setEventStateLocal(eventName, status);

        if (status === STATUS.NONE) {
            // DELETE — cancelar asistencia
            fetch(API_URL + '?evento=' + encodeURIComponent(eventName), {
                method: 'DELETE'
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (callback) callback(null, data);
                })
                .catch(function (err) {
                    console.warn('[Asistencia] Error al cancelar, guardado localmente:', err.message);
                    if (callback) callback(null, { mi_estado: status, total_asistentes: 0 });
                });
        } else {
            // POST — registrar/actualizar
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ evento: eventName, estado: status })
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (callback) callback(null, data);
                })
                .catch(function (err) {
                    console.warn('[Asistencia] Error al guardar, guardado localmente:', err.message);
                    if (callback) callback(null, { mi_estado: status, total_asistentes: 0 });
                });
        }
    }

    /* ── Utilidades DOM ───────────────────────── */

    function getCardEventName(card) {
        var titleEl = card.querySelector('.event-preview-title');
        return titleEl ? titleEl.textContent.trim() : null;
    }

    function getPopupEventName() {
        var popup = document.querySelector('.popup-event-information');
        if (!popup) return null;
        var titleEl = popup.querySelector('.popup-event-title');
        return titleEl ? titleEl.textContent.trim() : null;
    }

    function getAssistCountEl(card) {
        var metas = card.querySelectorAll('.meta-line-text');
        for (var i = 0; i < metas.length; i++) {
            if (metas[i].textContent.indexOf('will assist') !== -1 ||
                metas[i].textContent.indexOf('asistir') !== -1) {
                return metas[i];
            }
        }
        return null;
    }

    function parseCount(text) {
        var match = text.match(/\+?(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    }

    /* ── Crear botones de asistencia (card) ───── */

    function createCardButton(eventName) {
        var evState = getEventStateLocal(eventName);

        var btn = document.createElement('button');
        btn.className = 'ea-card-btn';
        btn.setAttribute('data-event', eventName);
        btn.setAttribute('data-status', evState.status);
        updateCardButtonUI(btn, evState.status);

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var current = btn.getAttribute('data-status');
            var next;

            // Ciclo: none → going → maybe → not_going → none
            switch (current) {
                case STATUS.NONE: next = STATUS.GOING; break;
                case STATUS.GOING: next = STATUS.MAYBE; break;
                case STATUS.MAYBE: next = STATUS.NOT_GOING; break;
                case STATUS.NOT_GOING: next = STATUS.NONE; break;
                default: next = STATUS.GOING;
            }

            // Optimistic UI update
            btn.setAttribute('data-status', next);
            updateCardButtonUI(btn, next);
            showFeedback(btn);

            // Enviar al server
            sendAttendance(eventName, next, function (err, data) {
                if (data && data.total_asistentes !== undefined) {
                    updateAllCardCountersFromServer(eventName, data.total_asistentes);
                } else {
                    updateAllCardCounters(eventName);
                }
                updatePopupAttendanceUI();
            });
        });

        return btn;
    }

    function updateCardButtonUI(btn, status) {
        btn.textContent = LABELS[status] || LABELS.none;

        Object.keys(STATUS_CLASSES).forEach(function (key) {
            if (STATUS_CLASSES[key]) {
                btn.classList.remove(STATUS_CLASSES[key]);
            }
        });

        if (STATUS_CLASSES[status]) {
            btn.classList.add(STATUS_CLASSES[status]);
        }
    }

    /* ── Crear panel de asistencia (popup) ────── */

    function createPopupAttendancePanel() {
        var popup = document.querySelector('.popup-event-information');
        if (!popup) return null;

        var existing = popup.querySelector('.ea-popup-panel');
        if (existing) return existing;

        var panel = document.createElement('div');
        panel.className = 'ea-popup-panel';

        var title = document.createElement('p');
        title.className = 'popup-event-subtitle';
        title.textContent = 'Tu Asistencia';

        var btnContainer = document.createElement('div');
        btnContainer.className = 'ea-popup-btn-group';

        var btnGoing = document.createElement('button');
        btnGoing.className = 'ea-popup-btn ea-popup-btn-going';
        btnGoing.innerHTML = '<span class="ea-btn-icon">✓</span><span class="ea-btn-label">Asistiré</span>';
        btnGoing.setAttribute('data-status', STATUS.GOING);

        var btnMaybe = document.createElement('button');
        btnMaybe.className = 'ea-popup-btn ea-popup-btn-maybe';
        btnMaybe.innerHTML = '<span class="ea-btn-icon">⏳</span><span class="ea-btn-label">Tal vez</span>';
        btnMaybe.setAttribute('data-status', STATUS.MAYBE);

        var btnNotGoing = document.createElement('button');
        btnNotGoing.className = 'ea-popup-btn ea-popup-btn-not-going';
        btnNotGoing.innerHTML = '<span class="ea-btn-icon">✗</span><span class="ea-btn-label">No Asistiré</span>';
        btnNotGoing.setAttribute('data-status', STATUS.NOT_GOING);

        btnContainer.appendChild(btnGoing);
        btnContainer.appendChild(btnMaybe);
        btnContainer.appendChild(btnNotGoing);

        var statusIndicator = document.createElement('div');
        statusIndicator.className = 'ea-status-indicator';
        statusIndicator.innerHTML = '<span class="ea-status-dot"></span><span class="ea-status-label">Sin confirmar</span>';

        panel.appendChild(title);
        panel.appendChild(btnContainer);
        panel.appendChild(statusIndicator);

        var removeBtn = popup.querySelector('.popup-event-button');
        if (removeBtn) {
            removeBtn.parentNode.insertBefore(panel, removeBtn);
        } else {
            var popupInfo = popup.querySelector('.popup-event-info');
            if (popupInfo) popupInfo.appendChild(panel);
        }

        [btnGoing, btnMaybe, btnNotGoing].forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var eventName = getPopupEventName();
                if (!eventName) return;

                var clickedStatus = btn.getAttribute('data-status');
                var currentState = getEventStateLocal(eventName);

                var newStatus = (currentState.status === clickedStatus) ? STATUS.NONE : clickedStatus;

                // Optimistic UI update
                setEventStateLocal(eventName, newStatus);
                updatePopupAttendanceUI();
                updateAllCardButtons(eventName);
                showPopupFeedback(panel);

                // Enviar al server
                sendAttendance(eventName, newStatus, function (err, data) {
                    if (data && data.total_asistentes !== undefined) {
                        updateAllCardCountersFromServer(eventName, data.total_asistentes);
                    } else {
                        updateAllCardCounters(eventName);
                    }
                });
            });
        });

        return panel;
    }

    function updatePopupAttendanceUI() {
        var popup = document.querySelector('.popup-event-information');
        if (!popup) return;

        var panel = popup.querySelector('.ea-popup-panel');
        if (!panel) return;

        var eventName = getPopupEventName();
        if (!eventName) return;

        var evState = getEventStateLocal(eventName);
        var btns = panel.querySelectorAll('.ea-popup-btn');
        var statusLabel = panel.querySelector('.ea-status-label');
        var statusDot = panel.querySelector('.ea-status-dot');

        btns.forEach(function (btn) {
            var btnStatus = btn.getAttribute('data-status');
            if (btnStatus === evState.status) {
                btn.classList.add('ea-active');
            } else {
                btn.classList.remove('ea-active');
            }
        });

        if (statusLabel && statusDot) {
            statusDot.className = 'ea-status-dot';

            switch (evState.status) {
                case STATUS.GOING:
                    statusLabel.textContent = '¡Confirmo asistencia!';
                    statusDot.classList.add('ea-dot-going');
                    break;
                case STATUS.MAYBE:
                    statusLabel.textContent = 'Quizás asista';
                    statusDot.classList.add('ea-dot-maybe');
                    break;
                case STATUS.NOT_GOING:
                    statusLabel.textContent = 'No asistiré a este evento';
                    statusDot.classList.add('ea-dot-not-going');
                    break;
                default:
                    statusLabel.textContent = 'Sin confirmar';
                    statusDot.classList.add('ea-dot-none');
            }
        }
    }

    /* ── Actualizar contadores ────────────────── */

    function updateAllCardCountersFromServer(eventName, totalFromServer) {
        var cards = document.querySelectorAll('.event-preview');
        cards.forEach(function (card) {
            var name = getCardEventName(card);
            if (name === eventName) {
                var assistEl = getAssistCountEl(card);
                if (!assistEl) return;

                if (totalFromServer > 0) {
                    assistEl.textContent = '+' + totalFromServer + ' asistirán';
                } else {
                    assistEl.textContent = 'sin asistentes';
                }
            }
        });
    }

    function updateAllCardCounters(eventName) {
        var cards = document.querySelectorAll('.event-preview');
        cards.forEach(function (card) {
            var name = getCardEventName(card);
            if (name === eventName) {
                updateCardCounter(card, eventName);
            }
        });
    }

    function updateCardCounter(card, eventName) {
        var assistEl = getAssistCountEl(card);
        if (!assistEl) return;

        var evState = getEventStateLocal(eventName);

        if (!assistEl.hasAttribute('data-base-count')) {
            assistEl.setAttribute('data-base-count', parseCount(assistEl.textContent));
        }

        var baseCount = parseInt(assistEl.getAttribute('data-base-count'), 10);
        var addOne = (evState.status === STATUS.GOING || evState.status === STATUS.MAYBE) ? 1 : 0;
        var total = baseCount + addOne;

        if (total > 0) {
            assistEl.textContent = '+' + total + ' asistirán';
        } else {
            assistEl.textContent = 'sin asistentes';
        }
    }

    /* ── Actualizar botones de cards ──────────── */

    function updateAllCardButtons(eventName) {
        var cards = document.querySelectorAll('.event-preview');
        cards.forEach(function (card) {
            var name = getCardEventName(card);
            if (name === eventName) {
                var btn = card.querySelector('.ea-card-btn');
                if (btn) {
                    var evState = getEventStateLocal(eventName);
                    btn.setAttribute('data-status', evState.status);
                    updateCardButtonUI(btn, evState.status);
                }
            }
        });
    }

    /* ── Feedback visual ──────────────────────── */

    function showFeedback(element) {
        element.classList.add('ea-animate');
        setTimeout(function () {
            element.classList.remove('ea-animate');
        }, 600);
    }

    function showPopupFeedback(panel) {
        var indicator = panel.querySelector('.ea-status-indicator');
        if (indicator) {
            indicator.classList.add('ea-animate');
            setTimeout(function () {
                indicator.classList.remove('ea-animate');
            }, 600);
        }
    }

    /* ── Inicialización ───────────────────────── */

    function initCards() {
        var cards = document.querySelectorAll('.event-preview');
        cards.forEach(function (card) {
            var eventName = getCardEventName(card);
            if (!eventName) return;

            var existingBtn = card.querySelector('.button.white-tertiary');
            if (!existingBtn) {
                existingBtn = card.querySelector('.button.white');
            }

            var wrapper = document.createElement('div');
            wrapper.className = 'ea-card-actions';

            var attendBtn = createCardButton(eventName);
            wrapper.appendChild(attendBtn);

            if (existingBtn && existingBtn.parentNode) {
                existingBtn.parentNode.insertBefore(wrapper, existingBtn);
            }

            // Cargar estado real desde el servidor
            fetchAttendance(eventName, function (err, data) {
                if (!err && data) {
                    var btn = card.querySelector('.ea-card-btn');
                    if (btn) {
                        btn.setAttribute('data-status', data.mi_estado);
                        updateCardButtonUI(btn, data.mi_estado);
                    }
                    if (data.total_asistentes !== undefined && data.total_asistentes > 0) {
                        updateAllCardCountersFromServer(eventName, data.total_asistentes);
                    } else {
                        updateCardCounter(card, eventName);
                    }
                }
            });
        });
    }

    function initPopupListeners() {
        var triggers = document.querySelectorAll('.popup-event-information-trigger');
        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                setTimeout(function () {
                    createPopupAttendancePanel();

                    // Cargar estado real desde el servidor para el popup
                    var eventName = getPopupEventName();
                    if (eventName) {
                        fetchAttendance(eventName, function (err, data) {
                            if (!err && data) {
                                setEventStateLocal(eventName, data.mi_estado);
                                updatePopupAttendanceUI();
                            }
                        });
                    }
                }, 300);
            });
        });
    }

    /* ── Boot ──────────────────────────────────── */
    function boot() {
        initCards();
        initPopupListeners();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
