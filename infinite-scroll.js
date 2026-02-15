/**
 * =============================================
 *  INFINITE SCROLL — Newsfeed
 * =============================================
 *  Carga más posts automáticamente al hacer
 *  scroll near al fondo de la página.
 *  Basado en la entrega de Dabreiki, adaptado
 *  al DOM de newsfeed.html (Vikinger).
 * =============================================
 */

(function () {
    'use strict';

    /* ── Configuración ────────────────────────── */
    var CONTAINER_ID = 'newsfeed-items-grid';  // Contenedor de posts
    var LOADER_ID = 'infinite-scroll-loader'; // Loader animado
    var SCROLL_THRESHOLD = 300;  // px antes del fondo para disparar carga
    var ENDPOINT = 'get_posts.php';

    /* ── Estado ────────────────────────────────── */
    var page = 1;   // Página actual (empieza en 1 porque la 1 ya está cargada estáticamente)
    var loading = false;
    var noMoreData = false;

    /* ── Referencias DOM ──────────────────────── */
    var container = null;
    var loader = null;

    /* ── Funciones ────────────────────────────── */

    /**
     * Muestra/oculta el loader de carga.
     */
    function toggleLoader(show) {
        if (!loader) return;
        loader.style.display = show ? 'flex' : 'none';
        if (show) {
            loader.classList.add('infinite-scroll-active');
        } else {
            loader.classList.remove('infinite-scroll-active');
        }
    }

    /**
     * Carga la siguiente página de posts via AJAX.
     */
    function cargarPosts() {
        if (loading || noMoreData) return;
        loading = true;

        toggleLoader(true);

        // Incrementar página ANTES de fetch (page 1 ya está en el HTML estático)
        page++;

        fetch(ENDPOINT + '?page=' + page)
            .then(function (response) {
                if (response.status === 204) {
                    // No hay más datos
                    noMoreData = true;
                    toggleLoader(false);
                    mostrarFinMensaje();
                    loading = false;
                    return '';
                }
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.text();
            })
            .then(function (data) {
                if (data && data.trim() !== '') {
                    // Insertar nuevos posts al final del contenedor
                    container.insertAdjacentHTML('beforeend', data);

                    // Re-inicializar hexágonos de los nuevos avatares (Vikinger)
                    if (typeof app !== 'undefined' && app.plugins && app.plugins.createHexagon) {
                        app.plugins.createHexagon({
                            container: '.hexagon-image-30-32[data-src]',
                            width: 30,
                            height: 32,
                            roundedCorners: true,
                            roundedCornerRadius: 1,
                            clip: true
                        });
                    }
                }

                toggleLoader(false);
                loading = false;
            })
            .catch(function (error) {
                console.error('[Infinite Scroll] Error cargando posts:', error);
                toggleLoader(false);
                loading = false;
            });
    }

    /**
     * Muestra un mensaje cuando ya no hay más posts.
     */
    function mostrarFinMensaje() {
        if (!container) return;

        var msg = document.createElement('div');
        msg.className = 'infinite-scroll-end-msg';
        msg.innerHTML = '<p>🎉 ¡Has visto todos los posts!</p>';
        container.parentNode.insertBefore(msg, container.nextSibling);
    }

    /**
     * Listener de scroll con throttle básico.
     */
    var scrollTimeout = null;
    function onScroll() {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(function () {
            scrollTimeout = null;

            var scrollPos = window.innerHeight + window.scrollY;
            var docHeight = document.body.offsetHeight;
            var distToBottom = docHeight - scrollPos;

            if (distToBottom <= SCROLL_THRESHOLD) {
                cargarPosts();
            }
        }, 100);
    }

    /* ── Inicialización ───────────────────────── */

    function init() {
        container = document.getElementById(CONTAINER_ID);
        loader = document.getElementById(LOADER_ID);

        if (!container) {
            // No estamos en la página del newsfeed
            return;
        }

        // Escuchar scroll
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ── Boot ──────────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
