(function () {
  "use strict";

  const clone = (value) => {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  };

  const sourceStates = {
    primary: clone(window.FABRICA_STATE || {}),
    alternative: clone(window.FABRICA_STATE_ALTERNATIVE || window.FABRICA_STATE || {})
  };

  const FALLBACK_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d9edf0"/><stop offset="1" stop-color="#f3e9d7"/></linearGradient></defs>
      <rect width="1200" height="800" fill="url(#g)"/>
      <path d="M0 590C190 510 334 650 520 570s318-116 680 12v218H0z" fill="#526b4a" fill-opacity=".35"/>
      <circle cx="910" cy="190" r="86" fill="#e16f52" fill-opacity=".55"/>
    </svg>
  `)}`;

  let activeSource = "primary";
  let state = clone(sourceStates[activeSource]);
  let editing = false;
  let pendingImagePath = "";
  let revealObserver = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function getPath(object, path) {
    return String(path)
      .split(".")
      .reduce((value, key) => (value == null ? undefined : value[key]), object);
  }

  function setPath(object, path, value) {
    const keys = String(path).split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((cursor, key, index) => {
      if (cursor[key] == null) {
        cursor[key] = /^\d+$/.test(keys[index + 1] || "") ? [] : {};
      }
      return cursor[key];
    }, object);
    target[lastKey] = value;
  }

  function announce(message) {
    const output = $("#editor-status");
    if (output) output.textContent = message;
  }

  function create(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = String(text);
    return element;
  }

  function initials(name) {
    return String(name || "Agência")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  function logoSource(rawValue) {
    const value = String(rawValue || "").trim();
    if (!value) return "";
    if (/^(data:|https?:|blob:)/i.test(value)) return value;
    return `data:image/png;base64,${value}`;
  }

  function fullWhatsAppNumber() {
    const local = String(state.whatsapp || "").replace(/\D/g, "");
    const dialCode = String(state.whatsappDialCode || "55").replace(/\D/g, "");
    if (!local) return "";
    const alreadyHasDialCode = local.startsWith(dialCode) && local.length > 11;
    return alreadyHasDialCode ? local : `${dialCode}${local}`;
  }

  function formattedPhone() {
    const full = fullWhatsAppNumber();
    if (!full) return "WhatsApp não informado";
    if (full.startsWith("55") && full.length >= 12) {
      const local = full.slice(2);
      const area = local.slice(0, 2);
      const number = local.slice(2);
      const splitAt = number.length === 9 ? 5 : 4;
      return `+55 (${area}) ${number.slice(0, splitAt)}-${number.slice(splitAt)}`;
    }
    return `+${full}`;
  }

  function safeImage(img, src, alt) {
    img.alt = alt || "Imagem da agência de viagens";
    img.dataset.fallbackApplied = "false";
    img.addEventListener(
      "error",
      () => {
        if (img.dataset.fallbackApplied === "true") return;
        img.dataset.fallbackApplied = "true";
        img.src = FALLBACK_IMAGE;
      },
      { once: true }
    );
    img.src = src || FALLBACK_IMAGE;
  }

  function applyTheme() {
    const root = document.documentElement;
    root.style.setProperty("--primary", state.primaryColor || "#E16F52");
    root.style.setProperty("--secondary", state.secondaryColor || "#526B4A");
    root.style.setProperty("--surface", state.backgroundColor || "#F3E9D7");
    const font = String(state.fontFamily || "Onest").replace(/[;'{}]/g, "");
    root.style.setProperty("--font-body", `"${font}", system-ui, sans-serif`);

    const primaryInput = $("#primary-color");
    const secondaryInput = $("#secondary-color");
    const backgroundInput = $("#background-color");
    if (primaryInput) primaryInput.value = state.primaryColor || "#E16F52";
    if (secondaryInput) secondaryInput.value = state.secondaryColor || "#526B4A";
    if (backgroundInput) backgroundInput.value = state.backgroundColor || "#F3E9D7";
  }

  function renderBindings() {
    $$('[data-bind]').forEach((element) => {
      const value = getPath(state, element.dataset.bind);
      element.textContent = value == null ? "" : String(value);
    });
  }

  function renderIdentity() {
    document.title = `${state.agencyName || "Agência de viagens"} — viagens com curadoria`;

    const logo = $("#brand-logo");
    const mark = $("#brand-mark");
    const footerMark = $("#footer-mark");
    const source = logoSource(state.logoBase64);
    const markText = initials(state.agencyName);

    if (source) {
      logo.hidden = false;
      mark.hidden = true;
      logo.alt = `Logo ${state.agencyName || "da agência"}`;
      logo.src = source;
    } else {
      logo.hidden = true;
      mark.hidden = false;
      mark.textContent = markText;
    }
    footerMark.textContent = markText;

    const email = String(state.agencyEmail || "").trim();
    ["#about-email", "#contact-email", "#footer-email"].forEach((selector) => {
      const link = $(selector);
      if (link) link.href = email ? `mailto:${email}` : "#contato";
    });

    const phone = $("#contact-phone");
    const fullPhone = fullWhatsAppNumber();
    phone.textContent = formattedPhone();
    phone.href = fullPhone ? `https://wa.me/${fullPhone}` : "#contato";
    $("#footer-year").textContent = `${new Date().getFullYear()} · ${state.city || "Brasil"}`;
  }

  function renderHeroAndAboutImages() {
    safeImage(
      $("#hero-image"),
      getPath(state, "siteContent.heroImageUrl"),
      `Paisagem escolhida por ${state.agencyName || "esta agência"}`
    );
    safeImage(
      $("#about-image"),
      getPath(state, "siteContent.aboutImageUrl"),
      `Equipe da ${state.agencyName || "agência"}`
    );
  }

  function renderStats() {
    const list = $("#stats-list");
    list.replaceChildren();
    const stats = Array.isArray(state.siteContent?.stats) ? state.siteContent.stats : [];
    stats.forEach((item, index) => {
      const wrapper = create("span", "stat");
      const number = create("strong", "", item?.num || "—");
      const label = create("span", "", item?.label || "diferencial");
      number.dataset.editKey = `siteContent.stats.${index}.num`;
      label.dataset.editKey = `siteContent.stats.${index}.label`;
      wrapper.append(number, label);
      list.append(wrapper);
    });
  }

  function imageEditButton(path) {
    const button = create("button", "image-edit-button", "Trocar imagem");
    button.type = "button";
    button.dataset.editImage = path;
    button.hidden = !editing;
    return button;
  }

  function renderPackages() {
    const list = $("#packages-list");
    const empty = $("#packages-empty");
    list.replaceChildren();

    const packages = (Array.isArray(state.selectedPackages) ? state.selectedPackages : [])
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => item && !item.isDraft);

    list.dataset.count = String(Math.min(packages.length, 6));
    empty.hidden = packages.length !== 0;
    list.hidden = packages.length === 0;

    packages.forEach(({ item: trip, originalIndex }, visualIndex) => {
      const path = `selectedPackages.${originalIndex}`;
      const card = create("article", "journey-card editable-image reveal");
      card.dataset.imageKey = `${path}.imageUrl`;

      const image = create("img", "journey-card__image");
      safeImage(image, trip.imageUrl, trip.title || "Destino de viagem");
      const overlay = create("div", "journey-card__overlay");
      overlay.setAttribute("aria-hidden", "true");
      const number = create("span", "journey-card__number", String(visualIndex + 1).padStart(2, "0"));
      const editButton = imageEditButton(`${path}.imageUrl`);

      const body = create("div", "journey-card__body");
      const copy = create("div", "journey-card__copy");
      const title = create("h3", "", trip.title || "Nova experiência");
      title.dataset.editKey = `${path}.title`;
      const description = create("p", "", trip.description || "Descrição disponível em breve.");
      description.dataset.editKey = `${path}.description`;
      copy.append(title, description);

      const price = create("div", "journey-card__price");
      price.append(create("small", "", "a partir de"));
      const priceValue = create("strong", "", trip.price || "Sob consulta");
      priceValue.dataset.editKey = `${path}.price`;
      price.append(priceValue);

      const action = create("a", "journey-card__action", trip.ctaLabel || "Pedir roteiro");
      action.href = "#contato";
      action.dataset.packageCta = trip.title || "";
      action.dataset.editKey = `${path}.ctaLabel`;

      body.append(copy, price, action);
      card.append(image, overlay, number, editButton, body);
      list.append(card);
    });
  }

  function renderProcess() {
    const list = $("#process-list");
    list.replaceChildren();
    const steps = Array.isArray(state.siteContent?.processoSteps) ? state.siteContent.processoSteps : [];
    steps.forEach((step, index) => {
      const item = create("li", "process-step reveal");
      const number = create("span", "process-step__num", step?.num || String(index + 1).padStart(2, "0"));
      const title = create("h3", "", step?.title || "Nova etapa");
      const description = create("p", "", step?.desc || "Descreva esta etapa.");
      number.dataset.editKey = `siteContent.processoSteps.${index}.num`;
      title.dataset.editKey = `siteContent.processoSteps.${index}.title`;
      description.dataset.editKey = `siteContent.processoSteps.${index}.desc`;
      item.append(number, title, description);
      list.append(item);
    });
  }

  function renderFeatures() {
    const list = $("#feature-list");
    list.replaceChildren();
    const features = Array.isArray(state.siteContent?.equipeFeatures) ? state.siteContent.equipeFeatures : [];
    features.forEach((feature, index) => {
      const item = create("div", "feature-line");
      const icon = create("span", "feature-line__icon", feature?.icon || "✦");
      const copy = create("div");
      const title = create("strong", "", feature?.title || "Diferencial");
      const description = create("p", "", feature?.desc || "Descreva este diferencial.");
      icon.dataset.editKey = `siteContent.equipeFeatures.${index}.icon`;
      title.dataset.editKey = `siteContent.equipeFeatures.${index}.title`;
      description.dataset.editKey = `siteContent.equipeFeatures.${index}.desc`;
      copy.append(title, description);
      item.append(icon, copy);
      list.append(item);
    });
  }

  function renderGallery() {
    const list = $("#gallery-list");
    list.replaceChildren();
    const images = Array.isArray(state.siteContent?.galleryImages) ? state.siteContent.galleryImages : [];
    const fallbackCaptions = ["Horizontes que respiram", "Sabores com história", "Caminhos fora do óbvio"];
    if (!Array.isArray(state.siteContent?.galleryCaptions)) {
      setPath(state, "siteContent.galleryCaptions", fallbackCaptions.slice());
    }

    images.forEach((source, index) => {
      const item = create("figure", "gallery-item editable-image reveal");
      item.dataset.imageKey = `siteContent.galleryImages.${index}`;
      const image = create("img");
      image.loading = "lazy";
      safeImage(image, source, `Inspiração de viagem ${index + 1}`);
      const caption = create(
        "figcaption",
        "gallery-item__caption",
        `${String(index + 1).padStart(2, "0")} / ${state.siteContent.galleryCaptions[index] || "Momento de viagem"}`
      );
      caption.dataset.galleryIndex = String(index);
      caption.dataset.editKey = `siteContent.galleryCaptions.${index}`;
      item.append(image, imageEditButton(`siteContent.galleryImages.${index}`), caption);
      list.append(item);
    });
  }

  function renderTestimonials() {
    const list = $("#testimonials-list");
    list.replaceChildren();
    const testimonials = Array.isArray(state.depoimentos) ? state.depoimentos : [];
    testimonials.forEach((testimonial, index) => {
      const article = create("article", "story reveal");
      const quote = document.createElement("blockquote");
      quote.textContent = testimonial?.text || "Uma experiência para lembrar.";
      quote.dataset.editKey = `depoimentos.${index}.text`;
      const cite = create("cite", "", testimonial?.name || "Viajante");
      cite.dataset.editKey = `depoimentos.${index}.name`;
      article.append(quote, cite);
      list.append(article);
    });
  }

  function renderFaq() {
    const list = $("#faq-list");
    list.replaceChildren();
    const questions = Array.isArray(state.siteContent?.faq) ? state.siteContent.faq : [];
    questions.forEach((question, index) => {
      const details = create("details", "faq-item");
      const summary = create("summary", "", question?.q || "Nova pergunta");
      const answer = create("p", "", question?.a || "Adicione a resposta.");
      summary.dataset.editKey = `siteContent.faq.${index}.q`;
      answer.dataset.editKey = `siteContent.faq.${index}.a`;
      details.append(summary, answer);
      list.append(details);
    });
  }

  function fieldOptions(field) {
    if (Array.isArray(field.options) && field.options.length) {
      return field.options.map((option) =>
        typeof option === "string" ? { label: option, value: option } : option
      );
    }
    const packageTitles = (Array.isArray(state.selectedPackages) ? state.selectedPackages : [])
      .filter((item) => item && !item.isDraft)
      .map((item) => item.title)
      .filter(Boolean);
    const destinations = Array.isArray(state.destinos) ? state.destinos : [];
    return Array.from(new Set([...packageTitles, ...destinations])).map((value) => ({ label: value, value }));
  }

  function renderForm() {
    const form = state.crmForm || {};
    const titleElement = $("#form-title");
    const descriptionElement = $("#form-description");
    const submitElement = $("#form-submit");
    titleElement.textContent = form.title || "Vamos desenhar sua viagem?";
    titleElement.dataset.editKey = "crmForm.title";
    descriptionElement.textContent = form.description || "Conte um pouco do que você procura.";
    descriptionElement.dataset.editKey = "crmForm.description";
    const submitLabel = create("span", "", form.submitLabel || "Enviar para a agência");
    submitLabel.dataset.editKey = "crmForm.submitLabel";
    submitElement.replaceChildren(submitLabel);
    $("#form-success").hidden = true;

    const fieldsRoot = $("#form-fields");
    fieldsRoot.replaceChildren();
    const fields = (Array.isArray(form.fields) ? form.fields : [])
      .map((field, originalIndex) => ({ field, originalIndex }))
      .filter(({ field }) => field && field.visible !== false)
      .sort((a, b) => Number(a.field.order || 0) - Number(b.field.order || 0));

    fields.forEach(({ field, originalIndex }) => {
      const wrapper = create("div", `form-field${field.width === "full" ? " form-field--full" : ""}`);
      const id = `lead-${String(field.id || field.crmKey || "field").replace(/[^a-z0-9_-]/gi, "-")}`;
      const label = create("label");
      label.htmlFor = id;
      const labelText = create("span", "form-field__label-text", field.label || "Campo");
      labelText.dataset.editKey = `crmForm.fields.${originalIndex}.label`;
      label.append(labelText);
      if (field.required) {
        const requiredMark = create("span", "", " *");
        requiredMark.setAttribute("aria-hidden", "true");
        label.append(requiredMark);
      }

      let control;
      if (field.type === "textarea") {
        control = document.createElement("textarea");
      } else if (field.type === "select") {
        control = document.createElement("select");
        const placeholder = create("option", "", field.placeholder || "Selecione uma opção");
        placeholder.value = "";
        control.append(placeholder);
        fieldOptions(field).forEach((option) => {
          const element = create("option", "", option.label ?? option.value);
          element.value = option.value ?? option.label;
          control.append(element);
        });
      } else {
        control = document.createElement("input");
        const allowedTypes = new Set(["text", "email", "tel", "number", "date", "url"]);
        control.type = allowedTypes.has(field.type) ? field.type : "text";
      }

      control.id = id;
      control.name = field.crmKey || field.id || id;
      control.dataset.fieldId = field.id || "";
      control.dataset.crmKey = field.crmKey || field.id || id;
      control.placeholder = field.placeholder || "";
      control.required = Boolean(field.required);
      if (control.type === "number") control.min = "1";
      const autocomplete = { name: "name", email: "email", phone: "tel", tel: "tel" }[control.dataset.crmKey];
      if (autocomplete) control.autocomplete = autocomplete;
      wrapper.append(label, control);
      fieldsRoot.append(wrapper);
    });
  }

  function applySectionVisibility() {
    const siteShell = $("#site-shell");
    $$('[data-hidden-by-config="true"]', siteShell).forEach((element) => {
      element.hidden = element.dataset.hiddenBeforeConfig === "true";
      delete element.dataset.hiddenByConfig;
      delete element.dataset.hiddenBeforeConfig;
    });
    const sections = state.siteContent?.sections || {};
    const mapping = {
      hero: "#inicio",
      destinos: "#viagens",
      processo: "#como-funciona",
      porQue: "#sobre",
      depoimentos: "#historias",
      orcamento: "#contato",
      faq: ".faq"
    };
    Object.entries(mapping).forEach(([key, selector]) => {
      const element = $(selector);
      if (element) element.hidden = sections[key] === false;
    });
    const gallery = $(".gallery");
    if (gallery) gallery.hidden = !(state.siteContent?.galleryImages || []).length;

    const hiddenElements = new Set(
      (Array.isArray(state.siteContent?.hiddenElements) ? state.siteContent.hiddenElements : []).map(String)
    );
    $$("[id], [data-element-id]", siteShell).forEach((element) => {
      const key = element.dataset.elementId || element.id;
      if (hiddenElements.has(key)) {
        element.dataset.hiddenBeforeConfig = String(element.hidden);
        element.hidden = true;
        element.dataset.hiddenByConfig = "true";
      }
    });
  }

  function applyEditingState() {
    document.body.classList.toggle("is-editing", editing);
    const button = $('[data-action="toggle-edit"]');
    button.setAttribute("aria-pressed", String(editing));
    button.textContent = editing ? "Concluir edição" : "Editar esta prévia";
    $$('[data-edit-key]').forEach((element) => {
      element.contentEditable = editing ? "true" : "false";
      element.spellcheck = true;
    });
    $$('[data-edit-image]').forEach((element) => {
      element.hidden = !editing;
    });
    const formSubmit = $("#form-submit");
    if (formSubmit) formSubmit.type = editing ? "button" : "submit";
  }

  function setupRevealAnimations() {
    if (revealObserver) revealObserver.disconnect();
    const elements = $$(".reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px" }
    );
    elements.forEach((element) => revealObserver.observe(element));
  }

  function render() {
    applyTheme();
    renderBindings();
    renderIdentity();
    renderHeroAndAboutImages();
    renderStats();
    renderPackages();
    renderProcess();
    renderFeatures();
    renderGallery();
    renderTestimonials();
    renderFaq();
    renderForm();
    applySectionVisibility();
    applyEditingState();
    setupRevealAnimations();
  }

  function clearErrors() {
    $$(".field-error", $("#lead-form")).forEach((element) => element.remove());
    $$('[aria-invalid="true"]', $("#lead-form")).forEach((element) => element.removeAttribute("aria-invalid"));
  }

  function validateForm() {
    clearErrors();
    const controls = $$('input, select, textarea', $("#lead-form"));
    let firstInvalid = null;
    controls.forEach((control) => {
      const empty = control.required && !String(control.value || "").trim();
      const invalidValue = Boolean(control.value) && !control.validity.valid;
      if (!empty && !invalidValue) return;
      control.setAttribute("aria-invalid", "true");
      let message = "Revise o valor informado.";
      if (empty) message = "Preencha este campo.";
      else if (control.validity.typeMismatch && control.type === "email") message = "Informe um e-mail válido.";
      else if (control.validity.rangeUnderflow) message = `Informe um valor igual ou maior que ${control.min}.`;
      const error = create("small", "field-error", message);
      control.closest(".form-field").append(error);
      if (!firstInvalid) firstInvalid = control;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function formPayload() {
    const fields = {};
    $$('input, select, textarea', $("#lead-form")).forEach((control) => {
      fields[control.dataset.crmKey || control.name] = control.value;
    });
    return {
      event_type: "lead_captured",
      event_data: {
        ...fields,
        agency_id: state.projectId || "preview_without_project_id",
        agency_name: state.agencyName || "",
        source: "site_horizonte_preview",
        status: "novo",
        captured_at: new Date().toISOString()
      }
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    const payload = formPayload();
    const success = $("#form-success");
    success.textContent = "Simulação concluída: o payload foi montado somente neste navegador e nenhum dado foi enviado à agência ou ao CRM.";
    success.hidden = false;
    $("#payload-output").textContent = JSON.stringify(payload, null, 2);
    $("#payload-drawer").hidden = false;
    $("#payload-drawer").focus?.();
    announce("Payload validado localmente — nenhum dado foi enviado");
  }

  function handleEditableBlur(event) {
    const element = event.target.closest?.("[data-edit-key]");
    if (!editing || !element) return;
    let value = element.textContent.trim();
    const galleryIndex = element.dataset.galleryIndex;
    if (galleryIndex != null) {
      value = value.replace(/^\d{2}\s*\/\s*/, "").trim();
      element.textContent = `${String(Number(galleryIndex) + 1).padStart(2, "0")} / ${value}`;
    }
    const editedPath = element.dataset.editKey;
    setPath(state, editedPath, value);
    renderBindings();
    if (["agencyName", "agencyEmail", "city", "whatsapp"].includes(editedPath)) renderIdentity();
    if (editedPath.startsWith("selectedPackages.")) {
      renderPackages();
      renderForm();
      applyEditingState();
      setupRevealAnimations();
    }
    announce(`Alteração aplicada: ${editedPath}`);
  }

  function handleImageSelection(event) {
    const file = event.target.files?.[0];
    if (!file || !pendingImagePath) return;
    if (!file.type.startsWith("image/")) {
      announce("Escolha um arquivo de imagem válido");
      event.target.value = "";
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      announce("Para esta prévia, use uma imagem de até 6 MB");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setPath(state, pendingImagePath, reader.result);
      const changedPath = pendingImagePath;
      pendingImagePath = "";
      event.target.value = "";
      render();
      announce(`Imagem atualizada: ${changedPath}`);
    });
    reader.readAsDataURL(file);
  }

  document.addEventListener("click", (event) => {
    const action = event.target.closest?.("[data-action]");
    if (action) {
      const name = action.dataset.action;
      if (name === "toggle-edit") {
        editing = !editing;
        applyEditingState();
        announce(editing ? "Modo de edição ativo: clique em textos ou imagens" : "Edições mantidas nesta prévia");
      }
      if (name === "simulate-sync") {
        activeSource = activeSource === "primary" ? "alternative" : "primary";
        state = clone(sourceStates[activeSource]);
        $("#lead-form").reset();
        $("#payload-drawer").hidden = true;
        render();
        announce(`Sincronização simulada: ${state.agencyName}`);
      }
      if (name === "edit-logo") {
        pendingImagePath = "logoBase64";
        $("#image-file-input").click();
      }
      if (name === "reset") {
        state = clone(sourceStates[activeSource]);
        $("#payload-drawer").hidden = true;
        render();
        announce("Dados restaurados a partir da Fábrica simulada");
      }
      if (name === "close-payload") {
        $("#payload-drawer").hidden = true;
      }
      return;
    }

    const imageButton = event.target.closest?.("[data-edit-image]");
    if (imageButton) {
      pendingImagePath = imageButton.dataset.editImage;
      $("#image-file-input").click();
      return;
    }

    const packageCta = event.target.closest?.("[data-package-cta]");
    if (packageCta && !editing) {
      const destination = $('select[data-crm-key="interest"]');
      if (destination) {
        const matchingOption = Array.from(destination.options).find((option) => option.value === packageCta.dataset.packageCta);
        if (matchingOption) destination.value = matchingOption.value;
      }
    }

    const editableLink = event.target.closest?.("a");
    if (editing && editableLink && (editableLink.matches("[data-edit-key]") || editableLink.querySelector("[data-edit-key]"))) {
      event.preventDefault();
    }
  });

  document.addEventListener("blur", handleEditableBlur, true);
  document.addEventListener("keydown", (event) => {
    const editable = event.target.closest?.("[data-edit-key]");
    if (!editing || !editable) return;
    if (event.key === "Escape") {
      editable.textContent = String(getPath(state, editable.dataset.editKey) || "");
      editable.blur();
    }
    if (event.key === "Enter" && !event.shiftKey && /^(H1|H2|H3|A|STRONG|SMALL|SPAN|SUMMARY|CITE)$/.test(editable.tagName)) {
      event.preventDefault();
      editable.blur();
    }
  });

  $("#primary-color").addEventListener("input", (event) => {
    state.primaryColor = event.target.value;
    applyTheme();
    announce("Cor principal atualizada");
  });
  $("#secondary-color").addEventListener("input", (event) => {
    state.secondaryColor = event.target.value;
    applyTheme();
    announce("Cor secundária atualizada");
  });
  $("#background-color").addEventListener("input", (event) => {
    state.backgroundColor = event.target.value;
    applyTheme();
    announce("Cor de fundo atualizada");
  });
  $("#image-file-input").addEventListener("change", handleImageSelection);
  $("#lead-form").addEventListener("submit", handleSubmit);

  render();
})();
