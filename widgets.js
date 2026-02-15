/*
 * Widget Functionality
 * Handles the "What's on your mind?" widget interactions.
 */

document.addEventListener('DOMContentLoaded', function () {
  const postTrigger = document.querySelector('#quick-post-trigger');
  const postInput = document.querySelector('#quick-post-text');
  const feedContainer = document.querySelector('#newsfeed-items-grid');

  if (postTrigger && postInput && feedContainer) {
    postTrigger.addEventListener('click', function () {
      const content = postInput.value.trim();

      if (content === '') {
        return; // Don't post empty content
      }

      // Deshabilitar botón mientras se envía
      postTrigger.classList.add('disabled');
      postTrigger.style.pointerEvents = 'none';
      postTrigger.textContent = 'Publicando...';

      // Enviar al servidor via API
      fetch('create_post.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: content })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var fecha = (data.success && data.post) ? data.post.fecha : 'Just now';
          renderNewPost(content, fecha);
        })
        .catch(function (err) {
          console.warn('[Widget] API no disponible, post solo visual:', err.message);
          renderNewPost(content, 'Just now');
        })
        .finally(function () {
          postTrigger.classList.remove('disabled');
          postTrigger.style.pointerEvents = '';
          postTrigger.textContent = 'Post';
          postInput.value = '';
          postInput.focus();
        });
    });

    /**
     * Renderiza un nuevo post en el feed.
     * Usa un template ligero SIN hexágonos SVG para evitar
     * conflictos de recursión con app.plugins.createHexagon().
     * Se usa una imagen circular estándar en su lugar.
     */
    function renderNewPost(content, fecha) {
      var newPostHTML =
        '<div class="widget-box no-padding">' +
        '<div class="widget-box-settings">' +
        '<div class="post-settings-wrap">' +
        '<div class="post-settings">' +
        '<svg class="post-settings-icon icon-more-dots">' +
        '<use xlink:href="#svg-more-dots"></use>' +
        '</svg>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="widget-box-status">' +
        '<div class="widget-box-status-content">' +
        '<div class="user-status">' +
        '<a class="user-status-avatar" href="profile-timeline.html">' +
        '<div class="user-avatar small no-outline">' +
        '<div class="user-avatar-content">' +
        '<img src="img/avatar/01.jpg" alt="avatar" ' +
        'style="width:30px;height:32px;border-radius:50%;object-fit:cover;">' +
        '</div>' +
        '</div>' +
        '</a>' +

        '<p class="user-status-title medium">' +
        '<a class="bold" href="profile-timeline.html">Marina Valentine</a>' +
        ' posted a status update' +
        '</p>' +

        '<p class="user-status-text small">' + fecha + '</p>' +
        '</div>' +

        '<p class="widget-box-status-text">' + escapeHTML(content) + '</p>' +
        '</div>' +

        '<div class="post-options">' +
        '<div class="post-option-wrap">' +
        '<div class="post-option">' +
        '<svg class="post-option-icon icon-thumbs-up">' +
        '<use xlink:href="#svg-thumbs-up"></use>' +
        '</svg>' +
        '<p class="post-option-text">React!</p>' +
        '</div>' +
        '</div>' +

        '<div class="post-option">' +
        '<svg class="post-option-icon icon-comment">' +
        '<use xlink:href="#svg-comment"></use>' +
        '</svg>' +
        '<p class="post-option-text">Comment</p>' +
        '</div>' +

        '<div class="post-option">' +
        '<svg class="post-option-icon icon-share">' +
        '<use xlink:href="#svg-share"></use>' +
        '</svg>' +
        '<p class="post-option-text">Share</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

      feedContainer.insertAdjacentHTML('afterbegin', newPostHTML);
    }

    /**
     * Escapea HTML para prevenir XSS en el contenido del usuario.
     */
    function escapeHTML(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

  } else {
    console.warn('Widgets: Required elements not found', { postTrigger: postTrigger, postInput: postInput, feedContainer: feedContainer });
  }
});
