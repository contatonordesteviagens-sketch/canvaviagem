(function () {
  var SUPABASE_URL = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";
  var containers = document.querySelectorAll("[data-canva-viagem-form]");
  if (!containers.length) return;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function defaultForm(embedKey) {
    return {
      id: embedKey,
      name: "Formulario principal",
      fields: [
        { id: "nome", label: "Nome completo", type: "text", placeholder: "Ex: Maria Silva", required: true, visible: true, order: 1, width: "half" },
        { id: "wpp", label: "WhatsApp", type: "tel", placeholder: "(00) 00000-0000", required: true, visible: true, order: 2, width: "half" },
        { id: "email", label: "E-mail", type: "email", placeholder: "seu@email.com", required: true, visible: true, order: 3, width: "full" },
        { id: "destino", label: "Destino de interesse", type: "text", placeholder: "Ex: Cancun, Gramado, Europa", required: false, visible: true, order: 4, width: "full" },
        { id: "obs", label: "Observacoes", type: "textarea", placeholder: "Datas, passageiros, preferencias...", required: false, visible: true, order: 5, width: "full" }
      ],
      settings: {
        buttonLabel: "Enviar pelo WhatsApp",
        successMessage: "Solicitacao recebida. Nossa equipe vai entrar em contato em breve.",
        primaryColor: "#F59E0B",
        backgroundColor: "#F8FAFC",
        textColor: "#0F172A",
        fieldBackgroundColor: "#FFFFFF",
        fieldTextColor: "#0F172A",
        fieldBorderColor: "#E2E8F0",
        buttonTextColor: "#111827"
      }
    };
  }

  function safeColor(value, fallback) {
    var text = String(value || "").trim();
    if (/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(text)) return text;
    if (/^rgba?\([\d\s.,%]+\)$/.test(text)) return text;
    return fallback;
  }

  function getSessionId() {
    var key = "cv_embed_session_id";
    try {
      var existing = window.localStorage.getItem(key);
      if (existing) return existing.slice(0, 100);
      var created = "cv_embed_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      window.localStorage.setItem(key, created);
      return created.slice(0, 100);
    } catch (_) {
      return ("cv_embed_" + Date.now() + "_" + Math.random().toString(36).slice(2)).slice(0, 100);
    }
  }

  function decodeInlineConfig(container) {
    var raw = container.getAttribute("data-canva-viagem-config");
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(escape(window.atob(raw))));
    } catch (_) {
      return null;
    }
  }

  function withMeta(formData, embedKey, ownerId) {
    var fallback = defaultForm(embedKey);
    var merged = formData && typeof formData === "object" ? formData : fallback;
    merged.id = merged.id || embedKey;
    merged.embed_key = merged.embed_key || embedKey;
    merged.owner_id = merged.owner_id || merged.agency_id || ownerId || "";
    merged.fields = Array.isArray(merged.fields) && merged.fields.length ? merged.fields : fallback.fields;
    merged.settings = merged.settings || fallback.settings;
    return merged;
  }

  function renderField(field) {
    if (field.visible === false) return "";
    var required = field.required ? " required" : "";
    var placeholder = field.placeholder ? ' placeholder="' + escapeHtml(field.placeholder) + '"' : "";
    var width = field.width === "half" ? " cv-field-half" : " cv-field-full";
    var label = '<label class="cv-field' + width + '"><span>' + escapeHtml(field.label) + (field.required ? " *" : "") + "</span>";
    var name = escapeHtml(field.id);

    if (field.type === "textarea") {
      return label + '<textarea name="' + name + '"' + placeholder + required + "></textarea></label>";
    }

    if (field.type === "select" || field.type === "radio") {
      var options = Array.isArray(field.options) ? field.options : [];
      return label + '<select name="' + name + '"' + required + '><option value="">' + escapeHtml(field.placeholder || "Selecione...") + "</option>" + options.map(function (option) {
        return "<option>" + escapeHtml(option) + "</option>";
      }).join("") + "</select></label>";
    }

    if (field.type === "checkbox") {
      return '<label class="cv-choice cv-field-full"><input type="checkbox" name="' + name + '" value="sim"' + required + "> <span>" + escapeHtml(field.label) + "</span></label>";
    }

    var inputType = ["tel", "email", "number", "date"].indexOf(field.type) >= 0 ? field.type : "text";
    return label + '<input type="' + inputType + '" name="' + name + '"' + placeholder + required + "></label>";
  }

  function formPayload(form) {
    var payload = {};
    Array.prototype.forEach.call(new FormData(form).entries(), function (entry) {
      payload[entry[0]] = entry[1];
    });
    return payload;
  }

  function normalize(payload) {
    return {
      name: payload.nome || payload.name || payload.nome_completo || "",
      phone: payload.wpp || payload.whatsapp || payload.phone || payload.telefone || "",
      email: payload.email || "",
      interest: payload.destino || payload.interest || payload.destino_interesse || "Formulario externo",
      status: "novo"
    };
  }

  function submitAnalyticsFallback(formData, payload, normalized) {
    var ownerId = formData.owner_id || formData.agency_id;
    if (!ownerId) return Promise.reject(new Error("missing owner"));

    return fetch(SUPABASE_URL + "/rest/v1/analytics_events", {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        user_id: ownerId,
        session_id: getSessionId(),
        event_type: "lead_captured",
        url_path: window.location.href,
        event_data: {
          ...normalized,
          status: "novo",
          source: "embed_fallback",
          form_id: formData.id,
          embed_key: formData.embed_key || formData.id,
          source_url: window.location.href,
          source_domain: window.location.hostname,
          form_payload: payload
        }
      })
    }).then(function (res) {
      if (!res.ok) throw new Error("analytics fallback failed");
    });
  }

  function render(container, formData) {
    var settings = formData.settings || {};
    var fields = (formData.fields || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    var accent = safeColor(settings.primaryColor, "#F59E0B");
    var background = safeColor(settings.backgroundColor, "#F8FAFC");
    var text = safeColor(settings.textColor, "#0F172A");
    var fieldBg = safeColor(settings.fieldBackgroundColor, "#FFFFFF");
    var fieldText = safeColor(settings.fieldTextColor, "#0F172A");
    var fieldBorder = safeColor(settings.fieldBorderColor, "#E2E8F0");
    var buttonText = safeColor(settings.buttonTextColor, "#111827");
    container.innerHTML =
      '<style>.cv-form-wrap{font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;background:' + background + ';border:1px solid ' + fieldBorder + ';border-radius:28px;padding:26px;box-shadow:0 24px 60px rgba(15,23,42,.14);max-width:760px;color:' + text + ';-webkit-font-smoothing:antialiased}.cv-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.cv-field{display:block;min-width:0}.cv-field-full{grid-column:1/-1}.cv-field span{display:block;margin-bottom:8px;font-size:11px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:' + text + ';opacity:.62}.cv-field input,.cv-field select,.cv-field textarea{box-sizing:border-box;width:100%;border:1.5px solid ' + fieldBorder + ';border-radius:18px;padding:15px 16px;font:650 16px Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;color:' + fieldText + ';background:' + fieldBg + ';outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.55);transition:border-color .18s,box-shadow .18s,transform .18s;-webkit-appearance:none;appearance:none}.cv-field input[type=date]{min-height:54px;color-scheme:light}.cv-field select{background-image:linear-gradient(45deg,transparent 50%,' + text + ' 50%),linear-gradient(135deg,' + text + ' 50%,transparent 50%);background-position:calc(100% - 20px) 22px,calc(100% - 14px) 22px;background-size:6px 6px,6px 6px;background-repeat:no-repeat;padding-right:38px}.cv-field textarea{min-height:108px;resize:vertical}.cv-field input:focus,.cv-field select:focus,.cv-field textarea:focus{border-color:' + accent + ';box-shadow:0 0 0 4px color-mix(in srgb,' + accent + ' 20%,transparent),inset 0 1px 0 rgba(255,255,255,.55)}.cv-choice{display:flex;align-items:center;gap:10px;color:' + text + ';border:1.5px solid ' + fieldBorder + ';border-radius:18px;background:' + fieldBg + ';padding:14px 16px}.cv-choice input{accent-color:' + accent + '}.cv-submit{width:100%;margin-top:18px;border:0;border-radius:20px;background:' + accent + ';color:' + buttonText + ';padding:16px 18px;font:900 16px Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;cursor:pointer;box-shadow:0 16px 34px rgba(15,23,42,.16);transition:transform .18s,box-shadow .18s}.cv-submit:hover{transform:translateY(-1px);box-shadow:0 20px 42px rgba(15,23,42,.20)}.cv-submit:disabled{cursor:wait;opacity:.72;transform:none}.cv-msg{display:none;margin-top:14px;border-radius:18px;background:#ecfdf5;color:#065f46;padding:13px 15px;font-size:14px;font-weight:800}.cv-msg.show{display:block}@media(max-width:640px){.cv-form-wrap{padding:18px;border-radius:24px}.cv-form-grid{grid-template-columns:1fr;gap:12px}.cv-field-half{grid-column:1/-1}.cv-field input,.cv-field select,.cv-field textarea{font-size:16px;border-radius:17px;padding:15px}.cv-submit{border-radius:18px}}</style>' +
      '<form class="cv-form-wrap"><div class="cv-form-grid">' + fields.map(renderField).join("") + '</div><button class="cv-submit" type="submit">' + escapeHtml(settings.buttonLabel || "Enviar pelo WhatsApp") + '</button><div class="cv-msg">' + escapeHtml(settings.successMessage || "Solicitacao recebida.") + "</div></form>";

    var form = container.querySelector("form");
    var button = container.querySelector(".cv-submit");
    var msg = container.querySelector(".cv-msg");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      button.disabled = true;
      button.textContent = "Enviando...";
      var payload = formPayload(form);
      var normalized = normalize(payload);
      fetch(SUPABASE_URL + "/functions/v1/submit-crm-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: formData.id,
          embed_key: formData.embed_key || formData.id,
          payload: payload,
          normalized: normalized,
          source_url: window.location.href,
          source_domain: window.location.hostname,
          user_agent: navigator.userAgent
        })
      }).then(function (res) {
        if (!res.ok) throw new Error("submit failed");
      }).catch(function () {
        return submitAnalyticsFallback(formData, payload, normalized);
      }).then(function () {
        form.reset();
        msg.classList.add("show");
      }).catch(function () {
        alert("Nao foi possivel enviar agora. Tente novamente em instantes.");
      }).finally(function () {
        button.disabled = false;
        button.textContent = settings.buttonLabel || "Enviar pelo WhatsApp";
      });
    });
  }

  Array.prototype.forEach.call(containers, function (container) {
    var embedKey = container.getAttribute("data-canva-viagem-form");
    var ownerId = container.getAttribute("data-canva-viagem-owner") || "";
    var inlineConfig = decodeInlineConfig(container);
    fetch(SUPABASE_URL + "/functions/v1/get-crm-form?form_id=" + encodeURIComponent(embedKey))
      .then(function (res) { return res.ok ? res.json() : inlineConfig || defaultForm(embedKey); })
      .then(function (data) { render(container, withMeta(data, embedKey, ownerId)); })
      .catch(function () { render(container, withMeta(inlineConfig || defaultForm(embedKey), embedKey, ownerId)); });
  });
})();
