const idTema = 1;       // <-- aquí pones el tema actual
const idUsuario = 1;    // <-- usuario logueado (ejemplo)

const repliesContainer = document.querySelector(".forum-post-replies");

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function renderReplies(replies, level = 0) {
  let html = "";

  replies.forEach(r => {
    const avatar = r.url_avatar ? r.url_avatar : "img/avatar/01.jpg";
    const nombre = r.nombre_completo ? r.nombre_completo : r.nombre_usuario;

    html += `
      <div class="reply-item" style="margin-left:${level * 40}px; margin-top:15px;">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <img src="${avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
          <div style="flex:1;">
            <p style="margin:0; font-weight:bold;">${escapeHTML(nombre)}</p>
            <p style="margin:5px 0;">${escapeHTML(r.contenido)}</p>

            <button class="reply-btn" data-reply-id="${r.id_respuesta}" style="border:none; background:none; color:#3b82f6; cursor:pointer;">
              Responder
            </button>

            <div class="reply-form" id="form-${r.id_respuesta}" style="display:none; margin-top:10px;">
              <textarea style="width:100%; padding:8px;" rows="2" placeholder="Escribe tu respuesta..."></textarea>
              <button class="send-reply" data-parent-id="${r.id_respuesta}" style="margin-top:6px;">
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (r.children && r.children.length > 0) {
      html += renderReplies(r.children, level + 1);
    }
  });

  return html;
}

async function loadReplies() {
  const res = await fetch(`get_replies.php?id_tema=${idTema}`);
  const data = await res.json();

  if (!data.ok) {
    repliesContainer.innerHTML = "<p>Error cargando respuestas</p>";
    return;
  }

  repliesContainer.innerHTML = `
    <h4 style="margin-top:25px;">Respuestas</h4>
    ${renderReplies(data.data)}
  `;

  attachEvents();
}

function attachEvents() {
  document.querySelectorAll(".reply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.replyId;
      const form = document.getElementById(`form-${id}`);
      form.style.display = form.style.display === "none" ? "block" : "none";
    });
  });

  document.querySelectorAll(".send-reply").forEach(btn => {
    btn.addEventListener("click", async () => {
      const parentId = btn.dataset.parentId;
      const form = btn.parentElement;
      const textarea = form.querySelector("textarea");
      const contenido = textarea.value.trim();

      if (!contenido) return;

      const fd = new FormData();
      fd.append("id_tema", idTema);
      fd.append("id_usuario", idUsuario);
      fd.append("contenido", contenido);
      fd.append("id_respuesta_padre", parentId);

      const res = await fetch("add_reply.php", {
        method: "POST",
        body: fd
      });

      const data = await res.json();

      if (data.ok) {
        textarea.value = "";
        loadReplies();
      } else {
        alert("Error: " + data.error);
      }
    });
  });
}

loadReplies();
