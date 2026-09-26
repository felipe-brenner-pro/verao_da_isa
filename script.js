(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (a, b) => Math.random() * (b - a) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const centre = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  /* ---------------- coqueiral decorativo ---------------- */
  (function planta() {
    const grove = document.querySelector(".grove");
    if (!grove) return;
    // mesma palmeira do coqueiro interativo
    const palmSVG = () =>
      '<svg viewBox="0 0 240 340" aria-hidden="true">' +
      '<path d="M96 340 C 84 240 106 150 122 80 L142 84 C 122 156 108 240 118 340 Z" fill="#a9743f"/>' +
      '<g fill="#3faa5a">' +
      [
        ["#3faa5a", -78],
        ["#3fb063", -40],
        ["#37a559", -4],
        ["#3fb063", 34],
        ["#3faa5a", 72],
      ]
        .map(
          ([c, a]) =>
            `<path d="M132 78 C 116 34 120 -6 140 -42 C 152 -2 148 40 132 78 Z" fill="${c}" transform="rotate(${a} 132 78)"/>`
        )
        .join("") +
      "</g>" +
      '<g fill="#6b4423"><circle cx="120" cy="88" r="9"/><circle cx="138" cy="92" r="9"/><circle cx="128" cy="102" r="9"/></g>' +
      "</svg>";

    // 20 coqueiros identicos de cada lado, plantados em 3 fileiras (frente/fundo)
    // metade (indice par) e interativa e derruba algo; a outra metade nao faz nada
    const N = 20;
    const dropKinds = ["coco", "achocolatado", "spaguetti", "achocolatado"];
    let active = 0;
    ["l", "r"].forEach((side) => {
      for (let i = 0; i < N; i++) {
        const row = i % 3; // 0 = frente, 2 = fundo
        const t = i / (N - 1);
        const d = document.createElement("div");
        d.className = "palm-bg";
        d.innerHTML = palmSVG();
        d.style.setProperty("--i", i);
        const nudge = (row - 1) * 3; // desencontra as fileiras
        d.style.left =
          (side === "l" ? -26 + t * 50 + nudge : 108 - t * 36 - nudge).toFixed(1) + "%";
        d.style.bottom = (12 + row * 7).toFixed(1) + "%";
        d.style.zIndex = String(3 - row);
        if (i % 2 === 0) {
          d.dataset.drop = dropKinds[active % dropKinds.length];
          active++;
        }
        grove.appendChild(d);
      }
    });

    grove.addEventListener("click", (e) => {
      const palm = e.target.closest(".palm-bg");
      if (!palm) return;
      const svg = palm.querySelector("svg");
      if (svg)
        svg.animate(
          [
            { transform: "rotate(0)" },
            { transform: "rotate(-7deg)" },
            { transform: "rotate(5deg)" },
            { transform: "rotate(0)" },
          ],
          { duration: 650, easing: "ease-in-out" }
        );
      if (palm.dataset.drop) dropFromPalm(palm, palm.dataset.drop);
    });
  })();

  function itemHTML(kind) {
    if (kind === "coco") return '<span style="font-size:20px">🥥</span>';
    if (kind === "spaguetti") return '<span style="font-size:21px">🍝</span>';
    if (kind === "achocolatado")
      return (
        '<svg viewBox="0 0 26 34" width="18" height="24" aria-hidden="true">' +
        '<path d="M5 9 L13 3 L21 9 Z" fill="#4f2f1d"/>' +
        '<path d="M13 3 L17.5 1.4 L19 5.4" fill="none" stroke="#d6342a" stroke-width="1.9" stroke-linecap="round"/>' +
        '<rect x="5" y="8.5" width="16" height="23" rx="1.5" fill="#6b4128"/>' +
        '<rect x="5" y="8.5" width="16" height="23" rx="1.5" fill="none" stroke="#46281a" stroke-width="1"/>' +
        '<path d="M5.6 9 v22 M20.4 9 v22" stroke="#7d4f31" stroke-width="1" opacity=".7"/>' +
        '<ellipse cx="13" cy="20.5" rx="6.2" ry="7.4" fill="#f5efe3"/>' +
        '<path d="M13 21 c 0 -3 4.2 -3 4.2 1.1 c 0 4.3 -6.2 6.2 -9.3 2 c -3.1 -4.2 0.6 -11 8 -10" fill="none" stroke="#d6342a" stroke-width="2" stroke-linecap="round"/>' +
        "</svg>"
      );
    return "";
  }

  function dropFromPalm(palm, kind) {
    const b = palm.getBoundingClientRect();
    const x = b.left + b.width * 0.46;
    const y = b.top + b.height * 0.25;
    const fall = b.height * 0.6;
    const el = document.createElement("span");
    el.className = "fx";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.innerHTML = itemHTML(kind);
    document.body.appendChild(el);
    if (reduceMotion) {
      el.style.transform = `translateY(${fall}px)`;
      setTimeout(() => el.remove(), 1000);
      return;
    }
    const a = el.animate(
      [
        { transform: "translateY(0) rotate(0)" },
        { transform: `translateY(${fall}px) rotate(16deg)`, offset: 0.6, easing: "ease-in" },
        { transform: `translateY(${fall - 13}px) rotate(6deg)`, offset: 0.73 },
        { transform: `translateY(${fall}px) rotate(10deg)`, offset: 0.84 },
        { transform: `translateY(${fall - 4}px) rotate(8deg)`, offset: 0.92 },
        { transform: `translateY(${fall}px) rotate(8deg)`, offset: 1 },
      ],
      { duration: 1500, fill: "forwards" }
    );
    a.onfinish = () => {
      fx(x, y + fall, ["💨"], 3, { min: 10, max: 26 });
      const f = el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 400,
        delay: 550,
        fill: "forwards",
      });
      f.onfinish = f.oncancel = () => el.remove();
    };
    a.oncancel = () => el.remove();
  }

  /* ---------------- efeitos visuais ---------------- */
  function fx(x, y, chars, count, opts = {}) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "fx";
      s.textContent = pick(chars);
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.fontSize = (opts.size || rand(13, 24)) + "px";
      document.body.appendChild(s);
      const ang = opts.up
        ? rand(-Math.PI * 0.85, -Math.PI * 0.15)
        : rand(0, Math.PI * 2);
      const dist = rand(opts.min || 30, opts.max || 90);
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist + (opts.up ? 0 : rand(-8, 8));
      const a = s.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          {
            transform: `translate(${dx}px, ${dy}px) scale(${opts.grow || 0.6}) rotate(${rand(-160, 160)}deg)`,
            opacity: 0,
          },
        ],
        { duration: rand(600, 1100), easing: "ease-out" }
      );
      a.onfinish = a.oncancel = () => s.remove();
    }
  }

  function sandPuff(x, y) {
    if (reduceMotion) return;
    for (let i = 0; i < 9; i++) {
      const g = document.createElement("span");
      g.className = "grain";
      g.style.left = x + "px";
      g.style.top = y + "px";
      document.body.appendChild(g);
      const dx = rand(-40, 40);
      const dy = rand(-30, 6);
      const a = g.animate(
        [
          { transform: "translate(0,0)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px)`, opacity: 1, offset: 0.6 },
          { transform: `translate(${dx * 1.2}px, ${Math.abs(dy) + 24}px)`, opacity: 0 },
        ],
        { duration: rand(500, 850), easing: "ease-out" }
      );
      a.onfinish = a.oncancel = () => g.remove();
    }
  }

  /* explosão de blocos coloridos (estilo jogo "Loop Sort") */
  const BLOCK_COLORS = ["#ff5a5f", "#ffd23f", "#3fa7ff", "#3fb063", "#c86dd7", "#ff8a3d"];
  function blockBurst(x, y, count) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "fx-block";
      const size = rand(6, 14);
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.background = pick(BLOCK_COLORS);
      document.body.appendChild(s);
      const ang = rand(-Math.PI * 0.95, -Math.PI * 0.05);
      const dist = rand(50, 160);
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist;
      const rot = rand(-360, 360);
      const a = s.animate(
        [
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          { transform: `translate(${dx * 0.6}px, ${dy - 18}px) rotate(${rot * 0.6}deg)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy + 70}px) rotate(${rot}deg)`, opacity: 0 },
        ],
        { duration: rand(700, 1150), easing: "ease-out" }
      );
      a.onfinish = a.oncancel = () => s.remove();
    }
  }

  /* ---------------- ligar elementos ---------------- */
  function tap(sel, fn) {
    document.querySelectorAll(sel).forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        fn(el, e);
      });
    });
  }
  const art = (el) => el.querySelector(".art");

  /* Sol */
  tap(".sun", (el) => {
    art(el).animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
      { duration: 500, easing: "ease-out" }
    );
    el.querySelector(".rays-wrap").animate(
      [{ transform: "rotate(0)" }, { transform: "rotate(120deg)" }],
      { duration: 600, easing: "ease-out" }
    );
    const c = centre(el);
    fx(c.x, c.y, ["✨", "🌟", "☀️"], 10, { min: 45, max: 120 });
    document
      .querySelector(".sky")
      .animate(
        [{ filter: "brightness(1)" }, { filter: "brightness(1.12)" }, { filter: "brightness(1)" }],
        { duration: 500 }
      );
  });

  /* Contador regressivo para o Verão da Isa (hemisfério sul ~21/dez) */
  (function summerCountdown() {
    const box = document.querySelector(".spring-count");
    if (!box) return;
    const DAY = 86400000;
    const render = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let target = new Date(now.getFullYear(), 11, 21); // 21 de dezembro
      let d = Math.round((target - today) / DAY);
      if (d <= 0 && d > -15) {
        box.innerHTML = 'Chegou o <span class="spring-name">Verão da Isa</span>! ☀️';
        return;
      }
      if (d <= 0) {
        target = new Date(now.getFullYear() + 1, 11, 21);
        d = Math.round((target - today) / DAY);
      }
      box.innerHTML =
        (d === 1 ? "Falta " : "Faltam ") +
        "<b>" + d + "</b> " +
        (d === 1 ? "dia" : "dias") +
        ' para o <span class="spring-name">Verão da Isa</span> ☀️';
    };
    render();
    setInterval(render, 60 * 60 * 1000);
  })();

  /* Disco voador -> duas cabecas alienigenas sobem; uma diz "Zip", some, a outra diz "Zip zip" */
  tap(".ufo", (el) => {
    const DUR = 3400;
    el.querySelectorAll(".head").forEach((h, i) => {
      h.animate(
        [
          { transform: "translateY(46px) rotate(0)" },
          { transform: "translateY(2px) rotate(0)", offset: 0.13 },
          { transform: "translateY(2px) rotate(-5deg)", offset: 0.32 },
          { transform: "translateY(2px) rotate(5deg)", offset: 0.54 },
          { transform: "translateY(2px) rotate(0)", offset: 0.78 },
          { transform: "translateY(46px) rotate(0)" },
        ],
        { duration: DUR, delay: i * 120, easing: "ease-in-out" }
      );
    });
    const say = (b, delay, hold) => {
      if (!b) return;
      b.animate(
        [
          { opacity: 0, transform: "scale(.3)" },
          { opacity: 1, transform: "scale(1)", offset: 0.22 },
          { opacity: 1, transform: "scale(1)", offset: 0.78 },
          { opacity: 0, transform: "scale(.5)" },
        ],
        { duration: hold, delay, easing: "ease-out" }
      );
    };
    say(el.querySelector(".bubble-a"), 480, 1000);
    say(el.querySelector(".bubble-b"), 1680, 1200);
    art(el).animate(
      [
        { transform: "rotate(0)" },
        { transform: "rotate(-4deg)" },
        { transform: "rotate(4deg)" },
        { transform: "rotate(0)" },
      ],
      { duration: 900, easing: "ease-in-out" }
    );
    el.querySelector(".glow").animate(
      [{ opacity: 0.35 }, { opacity: 0.7 }, { opacity: 0.35 }],
      { duration: 900, easing: "ease-in-out" }
    );
  });

  /* Barco pirata -> ratos-piratas (e o timoneiro) aparecem, abanam e se escondem */
  tap(".ship", (el) => {
    el.querySelectorAll(".crew").forEach((c, i) => {
      c.animate(
        [
          { transform: "translateY(34px) rotate(0)" },
          { transform: "translateY(4px) rotate(0)", offset: 0.16 },
          { transform: "translateY(2px) rotate(-8deg)", offset: 0.34 },
          { transform: "translateY(4px) rotate(8deg)", offset: 0.52 },
          { transform: "translateY(2px) rotate(-6deg)", offset: 0.7 },
          { transform: "translateY(4px) rotate(0)", offset: 0.85 },
          { transform: "translateY(34px) rotate(0)" },
        ],
        { duration: 2600, delay: i * 150, easing: "ease-in-out" }
      );
    });
    const w = el.querySelector(".wheel");
    if (w)
      w.animate(
        [{ transform: "rotate(0)" }, { transform: "rotate(150deg)" }, { transform: "rotate(90deg)" }],
        { duration: 1000, easing: "ease-out" }
      );
    const c = centre(el);
    fx(c.x, c.y + 34, ["💦", "🫧"], 5, { up: true, min: 14, max: 44 });
  });

  /* Golfinho -> cambalhota, mergulha e ressurge */
  tap(".dolphin", (el) => {
    const c = centre(el);
    fx(c.x, c.y, ["💦", "🫧"], 6, { up: true });
    art(el).animate(
      [
        { transform: "translateY(0) rotate(0)", opacity: 1 },
        { transform: "translateY(-10px) rotate(-40deg)", opacity: 1, offset: 0.16 },
        { transform: "translateY(8px) rotate(-220deg)", opacity: 1, offset: 0.4 },
        { transform: "translateY(30px) rotate(-360deg)", opacity: 0, offset: 0.6 },
        { transform: "translateY(30px) rotate(-360deg)", opacity: 0, offset: 0.76 },
        { transform: "translateY(-4px) rotate(-360deg)", opacity: 1, offset: 0.94 },
        { transform: "translateY(0) rotate(-360deg)", opacity: 1, offset: 1 },
      ],
      { duration: 1700, easing: "ease-in-out" }
    );
    setTimeout(() => fx(c.x, c.y, ["💦", "🫧"], 5, { up: true }), 1500);
  });

  /* Palmeira -> balança e derruba um coco */
  tap(".palm", (el) => {
    el.querySelector(".fronds").animate(
      [
        { transform: "rotate(0)" },
        { transform: "rotate(-9deg)" },
        { transform: "rotate(6deg)" },
        { transform: "rotate(0)" },
      ],
      { duration: 900, easing: "ease-in-out" }
    );
    const b = el.getBoundingClientRect();
    const x = b.left + b.width * 0.56;
    const y = b.top + b.height * 0.26;
    const groundY = b.bottom - 6;
    const fall = groundY - y;
    const co = document.createElement("span");
    co.className = "fx";
    co.textContent = "🥥";
    co.style.left = x + "px";
    co.style.top = y + "px";
    co.style.fontSize = "20px";
    document.body.appendChild(co);
    const a = co.animate(
      [
        { transform: "translateY(0)" },
        { transform: `translateY(${fall}px)`, offset: 0.7, easing: "ease-in" },
        { transform: `translateY(${fall - 16}px)`, offset: 0.82 },
        { transform: `translateY(${fall}px)`, offset: 0.92 },
        { transform: `translateY(${fall - 5}px)`, offset: 1 },
      ],
      { duration: 1400 }
    );
    a.onfinish = a.oncancel = () => {
      fx(x, groundY, ["💨"], 4, { min: 12, max: 34 });
      co.remove();
    };
  });

  /* Menina na cadeira -> sorri, pisca e manda um beijinho */
  function kiss(x, y) {
    if (reduceMotion) return;
    ["💋", "❤️"].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "fx";
      s.textContent = ch;
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.fontSize = (i ? 12 : 18) + "px";
      document.body.appendChild(s);
      const a = s.animate(
        [
          { transform: "translate(-50%,-50%) scale(.2)", opacity: 0 },
          { transform: "translate(-50%,-90%) scale(1)", opacity: 1, offset: 0.28 },
          { transform: `translate(${-60 - i * 8}%, ${-260 - i * 90}%) scale(${i ? 0.5 : 0.9})`, opacity: 0 },
        ],
        { duration: 1400 + i * 200, easing: "ease-out", delay: i * 160 }
      );
      a.onfinish = a.oncancel = () => s.remove();
    });
  }

  tap(".sunbather", (el) => {
    const q = (s) => el.querySelector(s);
    const DUR = 2400;
    q(".shades").animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-7px)", offset: 0.12 },
        { transform: "translateY(-7px)", offset: 0.8 },
        { transform: "translateY(0)" },
      ],
      { duration: DUR, easing: "ease-in-out" }
    );
    const lh = q(".lift-hand");
    if (lh)
      lh.animate(
        [
          { transform: "translateY(0) rotate(0)" },
          { transform: "translateY(-3px) rotate(-4deg)", offset: 0.12 },
          { transform: "translateY(-3px) rotate(-4deg)", offset: 0.8 },
          { transform: "translateY(0) rotate(0)" },
        ],
        { duration: DUR, easing: "ease-in-out" }
      );
    q(".mouth-rest").animate(
      [{ opacity: 1 }, { opacity: 0, offset: 0.14 }, { opacity: 0, offset: 0.86 }, { opacity: 1 }],
      { duration: DUR }
    );
    q(".mouth-smile").animate(
      [{ opacity: 0 }, { opacity: 1, offset: 0.18 }, { opacity: 1, offset: 0.82 }, { opacity: 0 }],
      { duration: DUR }
    );
    q(".wink-eye").animate(
      [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.28 },
        { opacity: 0, offset: 0.34 },
        { opacity: 1, offset: 0.46 },
        { opacity: 0, offset: 0.52 },
        { opacity: 1, offset: 0.64 },
        { opacity: 1, offset: 1 },
      ],
      { duration: DUR }
    );
    q(".wink-line").animate(
      [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: 0.28 },
        { opacity: 1, offset: 0.34 },
        { opacity: 0, offset: 0.46 },
        { opacity: 1, offset: 0.52 },
        { opacity: 0, offset: 0.64 },
        { opacity: 0, offset: 1 },
      ],
      { duration: DUR }
    );
    const b = el.getBoundingClientRect();
    setTimeout(() => kiss(b.left + b.width * 0.5, b.top + b.height * 0.18), DUR * 0.42);
  });

  /* Cadelinha -> trota de lado; 3 cliques seguidos: late e assusta o árabe + camelo */
  function dogTrot(el) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    art(el).animate(
      [
        { transform: "translateX(0) translateY(0)" },
        { transform: `translateX(${dir * 22}px) translateY(-6px)`, offset: 0.2 },
        { transform: `translateX(${dir * 40}px) translateY(0)`, offset: 0.38 },
        { transform: `translateX(${dir * 40}px) translateY(0)`, offset: 0.55 },
        { transform: `translateX(${dir * 18}px) translateY(-6px)`, offset: 0.75 },
        { transform: "translateX(0) translateY(0)" },
      ],
      { duration: 1300, easing: "ease-in-out" }
    );
    const tail = el.querySelector(".tail");
    if (tail)
      tail.animate(
        [
          { transform: "rotate(0)" },
          { transform: "rotate(-26deg)" },
          { transform: "rotate(20deg)" },
          { transform: "rotate(0)" },
        ],
        { duration: 190, iterations: 7 }
      );
    const ear = el.querySelector(".ear-floppy");
    if (ear)
      ear.animate(
        [
          { transform: "rotate(0)" },
          { transform: "rotate(14deg)" },
          { transform: "rotate(-8deg)" },
          { transform: "rotate(0)" },
        ],
        { duration: 260, iterations: 4 }
      );
    const perky = el.querySelector(".ear-perky");
    if (perky)
      perky.animate(
        [{ transform: "rotate(0)" }, { transform: "rotate(-10deg)" }, { transform: "rotate(0)" }],
        { duration: 300, iterations: 3 }
      );
  }

  function dogScare(dogEl) {
    const trader = document.querySelector(".trader");
    const dr = dogEl.getBoundingClientRect();
    const tr = trader ? trader.getBoundingClientRect() : null;

    // distância que a cadelinha percorre até chegar bem perto do árabe
    let run = tr ? tr.left + tr.width * 0.5 - dr.left : -Math.min(dr.left * 0.85, 360);
    run = Math.max(-480, Math.min(-70, run));
    const sideL = run < 0 ? 1 : -1; // fica de frente pro lado que corre
    const DUR = 2600;

    art(dogEl).animate(
      [
        { transform: "translateX(0) translateY(0) scaleX(1)", easing: "cubic-bezier(.4,0,.7,1)" },
        { transform: `translateX(${run * 0.5}px) translateY(-4px) scaleX(1)`, offset: 0.16 },
        { transform: `translateX(${run}px) translateY(0) scaleX(1)`, offset: 0.32, easing: "ease-out" },
        // latido: sacode no lugar, ao lado do árabe
        { transform: `translateX(${run + 8}px) translateY(-2px) scaleX(1)`, offset: 0.4 },
        { transform: `translateX(${run - 4}px) translateY(0) scaleX(1)`, offset: 0.46 },
        { transform: `translateX(${run + 8}px) translateY(-3px) scaleX(1)`, offset: 0.52 },
        { transform: `translateX(${run - 3}px) translateY(0) scaleX(1)`, offset: 0.58 },
        { transform: `translateX(${run + 6}px) translateY(-2px) scaleX(1)`, offset: 0.63 },
        // vira e corre de volta
        { transform: `translateX(${run}px) translateY(0) scaleX(${-sideL})`, offset: 0.68, easing: "cubic-bezier(.4,0,.7,1)" },
        { transform: `translateX(${run * 0.5}px) translateY(-4px) scaleX(${-sideL})`, offset: 0.84 },
        { transform: `translateX(0) translateY(0) scaleX(${-sideL})`, offset: 0.97, easing: "ease-out" },
        { transform: "translateX(0) translateY(0) scaleX(1)" },
      ],
      { duration: DUR }
    );

    const tail = dogEl.querySelector(".tail");
    if (tail)
      tail.animate(
        [{ transform: "rotate(-8deg)" }, { transform: "rotate(-8deg)" }],
        { duration: DUR * 0.4 }
      );
    const perky = dogEl.querySelector(".ear-perky");
    if (perky)
      perky.animate(
        [{ transform: "rotate(0)" }, { transform: "rotate(7deg)" }, { transform: "rotate(-5deg)" }, { transform: "rotate(0)" }],
        { duration: 110, iterations: 7, delay: DUR * 0.36 }
      );

    // latido perto do árabe (~offset 0.38) + susto do árabe/camelo
    setTimeout(() => {
      const bx = dr.left + run + dr.width * 0.4;
      fx(bx, dr.top + dr.height * 0.25, ["❗", "💢", "🗯"], 6, { min: 16, max: 46 });
    }, DUR * 0.36);

    if (!trader) return;
    const away = run < 0 ? 1 : -1; // fogem pro lado oposto à cadelinha
    setTimeout(() => {
      art(trader).animate(
        [
          { transform: "translate(0,0) rotate(0)" },
          { transform: `translate(${away * 8}px,-13px) rotate(${away * -4}deg)`, offset: 0.1 },
          { transform: `translate(${away * 38}px,-4px) rotate(${away * -2}deg)`, offset: 0.3 },
          { transform: `translate(${away * 38}px,-4px) rotate(${away * 2}deg)`, offset: 0.5 },
          { transform: `translate(${away * 24}px,-7px) rotate(${away * -1}deg)`, offset: 0.68 },
          { transform: `translate(${away * 10}px,-2px) rotate(0)`, offset: 0.85 },
          { transform: "translate(0,0) rotate(0)" },
        ],
        { duration: 1900, easing: "ease-in-out" }
      );
      fx(tr.left + tr.width * 0.5, tr.top + tr.height * 0.22, ["💨", "❕", "😱"], 7, { up: true });
    }, DUR * 0.36);
  }

  let dogClicks = 0;
  let dogClickTimer = null;
  tap(".dog", (el) => {
    dogClicks++;
    clearTimeout(dogClickTimer);
    dogClickTimer = setTimeout(() => (dogClicks = 0), 1800);
    if (dogClicks >= 3) {
      dogClicks = 0;
      clearTimeout(dogClickTimer);
      dogScare(el);
    } else {
      dogTrot(el);
    }
  });

  /* Negociante de camelos -> balão de cotação constante + gráfico ao clicar */
  (function camelTrader() {
    const qt = document.querySelector(".trader .quote-text");
    const bubble = document.querySelector(".trader .quote");
    if (qt) {
      const tick = () => {
        const up = Math.random() < 0.5;
        const v = (Math.random() * 5.4 + 0.2).toFixed(1);
        qt.textContent = (up ? "+" : "-") + v + "%";
        qt.setAttribute("fill", up ? "#1f9d4d" : "#d63b3b");
        if (bubble && !reduceMotion)
          bubble.animate(
            [{ transform: "scale(.7)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }],
            { duration: 280, easing: "ease-out" }
          );
      };
      tick();
      setInterval(tick, 1900);
    }
  })();

  // historicos fixos da cotacao do camelo (nao mudam entre aberturas); todos terminam em US$ 4.465
  const CAMEL_PERIODS = {
    dia: {
      label: "Diária",
      note: "cotação nas últimas 48 h",
      data: [
        4159, 4137, 4136, 4156, 4107, 4135, 4085, 4065, 4078, 4053, 4055, 3986,
        3985, 3956, 3952, 3900, 3888, 3876, 3857, 3822, 3797, 3775, 3793, 3850,
        3889, 3938, 3952, 3956, 3941, 4000, 4071, 4044, 4112, 4173, 4180, 4201,
        4208, 4227, 4295, 4357, 4329, 4351, 4323, 4349, 4415, 4414, 4463, 4465,
      ],
    },
    mes: {
      label: "Mensal",
      note: "cotação nos últimos 30 dias",
      data: [
        3773, 3756, 3740, 3720, 3696, 3707, 3671, 3695, 3683, 3701, 3678, 3695,
        3704, 3703, 3726, 3738, 3767, 3755, 3770, 3813, 3843, 3880, 3940, 3942,
        4038, 4135, 4230, 4314, 4403, 4465,
      ],
    },
    ano: {
      label: "Anual",
      note: "cotação nos últimos 12 meses",
      data: [2731, 2871, 3018, 3088, 3063, 2980, 3234, 3602, 3910, 4143, 4322, 4465],
    },
  };

  tap(".trader", () => {
    if (document.querySelector(".camel-modal")) return;

    const fmt = (n) => "US$ " + Math.round(n).toLocaleString("pt-BR");
    const W = 300;
    const H = 128;
    const pad = 8;
    const gidBase = "cmlg" + Date.now();
    const curPrice = CAMEL_PERIODS.dia.data[CAMEL_PERIODS.dia.data.length - 1];

    const chartFor = (key) => {
      const data = CAMEL_PERIODS[key].data;
      const N = data.length;
      const cur = data[N - 1];
      const changePct = ((cur - data[0]) / data[0]) * 100;
      const lo = Math.min(...data);
      const hi = Math.max(...data);
      const up = changePct >= 0;
      const accent = up ? "#1f9d4d" : "#d63b3b";
      const px = (i) => pad + (i / (N - 1)) * (W - pad * 2);
      const py = (v) => pad + (1 - (v - lo) / (hi - lo || 1)) * (H - pad * 2);
      let line = "M " + px(0) + " " + py(data[0]);
      for (let i = 1; i < N; i++) line += " L " + px(i) + " " + py(data[i]);
      const area = line + " L " + px(N - 1) + " " + H + " L " + px(0) + " " + H + " Z";
      const gid = gidBase + key;
      const gfx =
        '<svg class="camel-graph" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none">' +
        "<defs><linearGradient id='" + gid + "' x1='0' y1='0' x2='0' y2='1'>" +
        "<stop offset='0' stop-color='" + accent + "' stop-opacity='.26'/>" +
        "<stop offset='1' stop-color='" + accent + "' stop-opacity='0'/></linearGradient></defs>" +
        "<path d='" + area + "' fill='url(#" + gid + ")'/>" +
        "<path d='" + line + "' fill='none' stroke='" + accent + "' stroke-width='2' stroke-linejoin='round'/>" +
        "<circle cx='" + px(N - 1) + "' cy='" + py(cur) + "' r='3.6' fill='" + accent + "'/>" +
        "</svg>";
      return { changePct, lo, hi, up, svg: gfx };
    };

    const modal = document.createElement("div");
    modal.className = "camel-modal";
    modal.innerHTML =
      '<div class="camel-card" role="dialog" aria-label="Cotacao do camelo">' +
      '<button class="camel-close" aria-label="Fechar">✕</button>' +
      '<div class="camel-pair">🐪 CAMELO · CML/USD</div>' +
      '<div class="camel-price">' + fmt(curPrice) + "</div>" +
      '<div class="camel-tabs">' +
      Object.keys(CAMEL_PERIODS)
        .map((k) => '<button class="camel-tab" data-k="' + k + '">' + CAMEL_PERIODS[k].label + "</button>")
        .join("") +
      "</div>" +
      '<div class="camel-change"></div>' +
      '<div class="camel-plot"></div>' +
      '<div class="camel-foot"></div>' +
      '<div class="camel-note"></div>' +
      "</div>";
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("show"));

    const render = (key) => {
      const c = chartFor(key);
      modal.querySelector(".camel-plot").innerHTML = c.svg;
      const ch = modal.querySelector(".camel-change");
      ch.className = "camel-change " + (c.up ? "up" : "down");
      ch.innerHTML =
        (c.up ? "▲ +" : "▼ ") +
        c.changePct.toFixed(2) +
        "% <span>" +
        CAMEL_PERIODS[key].note.replace("cotação ", "") +
        "</span>";
      modal.querySelector(".camel-foot").innerHTML =
        "<span>mín " + fmt(c.lo) + "</span><span>máx " + fmt(c.hi) + "</span>";
      modal.querySelector(".camel-note").textContent = CAMEL_PERIODS[key].note;
      modal
        .querySelectorAll(".camel-tab")
        .forEach((b) => b.classList.toggle("active", b.dataset.k === key));
    };
    modal.querySelectorAll(".camel-tab").forEach((b) => {
      b.addEventListener("click", () => render(b.dataset.k));
    });
    render("dia");

    const close = () => {
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 240);
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest(".camel-close")) close();
    });
    document.addEventListener("keydown", onKey);
  });

  /* Bloco de carnaval -> toca uma marchinha/samba com metais e todo mundo pula */
  function playBatucada() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return 0;
      soundCtx = soundCtx || new AC();
      if (soundCtx.state === "suspended") soundCtx.resume();
      const ctx = soundCtx;
      const t0 = ctx.currentTime + 0.06;
      const bpm = 118,
        b = 60 / bpm;
      const master = ctx.createGain();
      master.gain.value = 0.3;
      master.connect(ctx.destination);
      if (!ctx._noise) {
        const nb = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
        const d = nb.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        ctx._noise = nb;
      }
      const noiseHit = (t, freq, type, lvl, len) => {
        const s = ctx.createBufferSource();
        s.buffer = ctx._noise;
        const f = ctx.createBiquadFilter();
        f.type = type;
        f.frequency.value = freq;
        f.Q.value = type === "bandpass" ? 1.4 : 0.7;
        const g = ctx.createGain();
        g.gain.setValueAtTime(lvl, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        s.connect(f);
        f.connect(g);
        g.connect(master);
        s.start(t);
        s.stop(t + len + 0.02);
      };
      const surdo = (t, f, lvl) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(f * 1.9, t);
        o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(lvl, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
        o.connect(g);
        g.connect(master);
        o.start(t);
        o.stop(t + 0.36);
      };
      const caixa = (t, lvl) => noiseHit(t, 1900, "highpass", lvl, 0.05);
      const tamborim = (t) => noiseHit(t, 5200, "highpass", 0.28, 0.025);
      const clap = (t) => {
        noiseHit(t, 1500, "bandpass", 0.3, 0.05);
        noiseHit(t + 0.012, 1500, "bandpass", 0.22, 0.06);
      };
      const agogo = (t, f) => {
        const o = ctx.createOscillator();
        o.type = "square";
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.3, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
        o.connect(g);
        g.connect(master);
        o.start(t);
        o.stop(t + 0.13);
      };
      const apito = (t) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
        g.gain.setValueAtTime(0.3, t + 0.28);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        o.frequency.setValueAtTime(2000, t);
        for (let k = 0; k < 9; k++) o.frequency.setValueAtTime(k % 2 ? 2450 : 2050, t + 0.04 + k * 0.032);
        o.connect(g);
        g.connect(master);
        o.start(t);
        o.stop(t + 0.42);
      };
      const brass = (t, f, dur, lvl) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(f * 0.996, t);
        o.frequency.linearRampToValueAtTime(f, t + 0.04);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 2400;
        lp.Q.value = 1.1;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(lvl, t + 0.03);
        g.gain.setValueAtTime(lvl, t + dur * 0.7);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(lp);
        lp.connect(g);
        g.connect(master);
        o.start(t);
        o.stop(t + dur + 0.03);
      };

      const bars = 6;
      const q = b / 4; // semicolcheia
      for (let bar = 0; bar < bars; bar++) {
        const B = t0 + bar * 2 * b;
        // surdo (samba): 1 leve, 2 forte
        surdo(B, 62, 0.55);
        surdo(B + b, 50, 1);
        // caixa com levada de samba (acento no "e" e no "a")
        [0.34, 0.12, 0.24, 0.12, 0.4, 0.12, 0.24, 0.14].forEach((lv, s) => caixa(B + s * q, lv));
        // tamborim — teleco-teco
        [1, 0, 1, 1, 0, 1, 0, 1].forEach((h, s) => h && tamborim(B + s * q));
        // agogô — padrão clássico
        [660, 660, 990, 0, 660, 990, 990, 0].forEach((f, s) => f && agogo(B + s * q, f));
        // palmas no contratempo
        clap(B + b + b / 2);
      }
      // apito no começo e perto do fim
      apito(t0);
      apito(t0 + (bars * 2 - 1.5) * b);

      // metais: frase alegre de marchinha, entra no 2º compasso e repete
      const mel = [
        [523.25, 0, 0.5], [659.25, 0.5, 0.25], [783.99, 0.75, 0.25],
        [1046.5, 1, 0.75], [783.99, 1.75, 0.25],
        [880.0, 2, 0.5], [783.99, 2.5, 0.5],
        [659.25, 3, 0.5], [523.25, 3.5, 0.5],
        [587.33, 4, 0.5], [698.46, 4.5, 0.5],
        [880.0, 5, 0.75], [698.46, 5.75, 0.25],
        [783.99, 6, 0.5], [659.25, 6.5, 0.5],
        [523.25, 7, 1],
      ];
      [2, 6].forEach((startBeat) => {
        const M = t0 + startBeat * b;
        mel.forEach(([f, s, d]) => {
          const dur = d * b * 0.94;
          brass(M + s * b, f, dur, 0.24);
          brass(M + s * b, f * 0.5, dur, 0.12); // oitava grave, engrossa
        });
      });
      // acorde final (metais + surdo)
      const end = t0 + (bars * 2 - 0.5) * b;
      [523.25, 659.25, 783.99].forEach((f) => brass(end, f, b * 1.6, 0.2));
      surdo(end, 48, 1);

      return bars * 2 * b + 0.4;
    } catch (e) {
      return 0;
    }
  }

  let blocoBusy = false;
  tap(".bloco", (el) => {
    if (blocoBusy) return;
    blocoBusy = true;
    const secs = playBatucada();
    const durMs = Math.max(2200, Math.round(secs * 1000) || 4000);

    if (!reduceMotion) {
      el.querySelectorAll(".foliao").forEach((f, i) => {
        f.animate(
          [
            { transform: "translateY(0) rotate(0)" },
            { transform: "translateY(-" + rand(3, 8) + "px) rotate(" + rand(-10, 10) + "deg)" },
            { transform: "translateY(0) rotate(0)" },
          ],
          {
            duration: rand(250, 340),
            iterations: Math.round(durMs / 300),
            delay: i * 22,
            easing: "ease-in-out",
          }
        );
      });
      const b = el.getBoundingClientRect();
      const burst = () => {
        if (!blocoBusy) return;
        fx(b.left + rand(0, b.width), b.top + rand(-4, b.height * 0.5), ["🎉", "🎊", "🎵", "🎶", "🥁", "✨"], 3, {
          up: true,
          min: 30,
          max: 110,
          size: rand(12, 22),
        });
      };
      burst();
      const iv = setInterval(burst, 230);
      setTimeout(() => clearInterval(iv), durMs);
    }
    setTimeout(() => (blocoBusy = false), durMs + 200);
  });

  /* Bolsa mágica -> a cada clique sai UMA coisa, rodando a lista feito contador */
  const BAG_STUFF = [
    "🐇", "🎩", "🎈", "☂️", "🐠", "🎸", "🍕", "🚲", "⏰", "🪀", "🧦", "🦆",
    "🌵", "📚", "🧸", "🍍", "🎻", "🛼", "🦩", "🌈", "🐌", "🧀", "🎁", "🛎️",
    "🦑", "🪑", "🧭", "🪄", "🐘", "🍄", "🪗", "🦖",
  ].sort(() => Math.random() - 0.5);
  let bagIdx = 0;
  let bagLast = 0;
  tap(".magicbag", (el) => {
    const now = Date.now();
    if (now - bagLast < 140) return; // evita disparo duplo
    bagLast = now;

    const item = BAG_STUFF[bagIdx];
    bagIdx = (bagIdx + 1) % BAG_STUFF.length;

    const b = el.getBoundingClientRect();
    const px = b.left + b.width * (0.5 + rand(-0.06, 0.06));
    const py = b.top + b.height * 0.18;

    const s = document.createElement("span");
    s.className = "fx";
    s.textContent = item;
    s.style.left = px + "px";
    s.style.top = py + "px";
    s.style.fontSize = (reduceMotion ? 24 : rand(24, 38)) + "px";
    s.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,.25))";
    document.body.appendChild(s);

    const dx = rand(-70, 70);
    const dy = -rand(110, 230);
    const ro = rand(-200, 200);
    const dur = reduceMotion ? 650 : rand(1500, 2100);
    const kf = (tx, ty, sc, r, op) => ({
      transform:
        "translate(calc(-50% + " + tx + "px), calc(-50% + " + ty + "px)) scale(" + sc + ") rotate(" + r + "deg)",
      opacity: op,
    });
    const a = s.animate(
      [
        kf(0, 0, 0.2, 0, 0),
        { ...kf(dx * 0.3, dy * 0.28, 1, ro * 0.3, 1), offset: 0.22 },
        { ...kf(dx * 0.7, dy * 0.72, 1, ro * 0.7, 1), offset: 0.68 },
        kf(dx, dy, 0.7, ro, 0),
      ],
      { duration: dur, easing: "cubic-bezier(.15,.7,.35,1)" }
    );
    a.onfinish = a.oncancel = () => s.remove();

    if (!reduceMotion) {
      fx(px, py, ["✨", "·"], 3, { up: true, min: 8, max: 26, size: rand(9, 14) });
      art(el).animate(
        [
          { transform: "scale(1,1) rotate(0)" },
          { transform: "scale(1.09,.9) rotate(-4deg)", offset: 0.3 },
          { transform: "scale(.97,1.04) rotate(3deg)", offset: 0.6 },
          { transform: "scale(1,1) rotate(0)" },
        ],
        { duration: 420, easing: "ease-out" }
      );
    }
  });

  /* Aparelho de som -> a cada clique toca uma musiquinha de estilo diferente */
  let soundCtx = null;
  let beachTuneIdx = 0;
  // cada faixa tem "parts": camadas com onda/ganho/envelope proprios.
  // nota = [freq Hz, inicio (batidas), duracao (batidas)]
  const chord = (freqs, starts, dur) =>
    starts.flatMap((s) => freqs.map((f) => [f, s, dur]));

  const BEACH_TUNES = [
    {
      /* 1 — REGGAE: baixo grave + batidas na contratempo + melodica */
      name: "reggae",
      bpm: 92,
      master: 0.17,
      parts: [
        {
          wave: "triangle",
          gain: 0.5,
          attack: 0.015,
          notes: [
            [110, 0, 1.3], [110, 1.5, 0.4], [110, 2, 1.3], [146.83, 3.5, 0.4],
            [146.83, 4, 1.3], [164.81, 5.5, 0.4], [164.81, 6, 1.3], [110, 7.5, 0.4],
          ],
        },
        {
          wave: "sawtooth",
          gain: 0.14,
          attack: 0.004,
          decay: 0.9,
          notes: [
            ...chord([440, 554.37, 659.25], [0.5, 1.5, 2.5, 3.5], 0.22),
            ...chord([587.33, 739.99, 880], [4.5, 5.5, 6.5, 7.5], 0.22),
          ],
        },
        {
          wave: "triangle",
          gain: 0.3,
          attack: 0.02,
          notes: [
            [659.25, 0, 0.9], [554.37, 1, 0.5], [493.88, 1.5, 0.5], [440, 2, 1.4],
            [880, 4, 0.9], [739.99, 5, 0.5], [659.25, 5.5, 0.5], [587.33, 6, 2],
          ],
        },
      ],
    },
    {
      /* 2 — CHIPTUNE: arpejo rapido em onda quadrada + baixo pulsado 8-bit */
      name: "chiptune",
      bpm: 162,
      master: 0.12,
      parts: [
        {
          wave: "square",
          gain: 0.22,
          attack: 0.002,
          decay: 0.75,
          notes: [
            [523.25, 0, 0.24], [659.25, 0.25, 0.24], [783.99, 0.5, 0.24], [1046.5, 0.75, 0.24],
            [659.25, 1, 0.24], [783.99, 1.25, 0.24], [1046.5, 1.5, 0.24], [1318.51, 1.75, 0.24],
            [587.33, 2, 0.24], [698.46, 2.25, 0.24], [880, 2.5, 0.24], [1174.66, 2.75, 0.24],
            [698.46, 3, 0.24], [880, 3.25, 0.24], [1174.66, 3.5, 0.24], [1396.91, 3.75, 0.24],
            [659.25, 4, 0.24], [783.99, 4.25, 0.24], [987.77, 4.5, 0.24], [1318.51, 4.75, 0.24],
            [783.99, 5, 0.24], [987.77, 5.25, 0.24], [1318.51, 5.5, 0.24], [1567.98, 5.75, 0.24],
            [1046.5, 6, 0.24], [987.77, 6.25, 0.24], [880, 6.5, 0.24], [783.99, 6.75, 0.24],
            [698.46, 7, 0.24], [659.25, 7.25, 0.24], [587.33, 7.5, 0.24], [523.25, 7.75, 0.5],
          ],
        },
        {
          wave: "square",
          gain: 0.24,
          attack: 0.002,
          decay: 0.7,
          notes: [
            [65.41, 0, 0.45], [130.81, 0.5, 0.45], [65.41, 1, 0.45], [130.81, 1.5, 0.45],
            [73.42, 2, 0.45], [146.83, 2.5, 0.45], [73.42, 3, 0.45], [146.83, 3.5, 0.45],
            [82.41, 4, 0.45], [164.81, 4.5, 0.45], [82.41, 5, 0.45], [164.81, 5.5, 0.45],
            [65.41, 6, 0.45], [98, 6.5, 0.45], [130.81, 7, 0.45], [65.41, 7.5, 0.5],
          ],
        },
      ],
    },
    {
      /* 3 — CAIXINHA DE MÚSICA: senoides puras, lento, esparso, agudo */
      name: "caixinha",
      bpm: 74,
      master: 0.24,
      calm: true,
      parts: [
        {
          wave: "sine",
          gain: 0.36,
          attack: 0.03,
          notes: [
            [1318.51, 0, 1.1], [1174.66, 1, 1], [987.77, 2, 1.4], [880, 3.5, 0.5],
            [1046.5, 4, 1], [987.77, 5, 1], [783.99, 6, 2.4],
          ],
        },
        {
          wave: "sine",
          gain: 0.1,
          attack: 0.01,
          notes: [
            [2637.02, 0.5, 0.4], [1975.53, 2.6, 0.4], [2093, 4.6, 0.4], [1567.98, 6.6, 0.8],
          ],
        },
        {
          wave: "sine",
          gain: 0.13,
          attack: 0.09,
          notes: [
            [130.81, 0, 4.2], [98, 4, 4.4],
          ],
        },
      ],
    },
  ];

  function playBeachTune() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return { secs: 0, calm: false };
      soundCtx = soundCtx || new AC();
      if (soundCtx.state === "suspended") soundCtx.resume();
      const tune = BEACH_TUNES[beachTuneIdx];
      beachTuneIdx = (beachTuneIdx + 1) % BEACH_TUNES.length;
      const t0 = soundCtx.currentTime + 0.04;
      const b = 60 / tune.bpm;
      const master = soundCtx.createGain();
      master.gain.value = tune.master || 0.16;
      master.connect(soundCtx.destination);
      let endBeat = 0;
      tune.parts.forEach((part) => {
        const atk = part.attack || 0.01;
        const decay = part.decay || 1; // fração da duração até silenciar
        part.notes.forEach(([f, s, d]) => {
          const t = t0 + s * b;
          const dur = d * b;
          endBeat = Math.max(endBeat, s + d);
          const o = soundCtx.createOscillator();
          o.type = part.wave;
          o.frequency.value = f;
          const g = soundCtx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(part.gain || 0.3, t + atk);
          g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(atk + 0.02, dur * decay));
          o.connect(g);
          g.connect(master);
          o.start(t);
          o.stop(t + dur + 0.05);
        });
      });
      return { secs: endBeat * b, calm: !!tune.calm };
    } catch (e) {
      return { secs: 0, calm: false };
    }
  }

  let boomboxBusy = false;
  tap(".boombox", (el) => {
    if (boomboxBusy) return;
    boomboxBusy = true;
    const { secs, calm } = playBeachTune();
    const durMs = Math.max(1600, Math.round(secs * 1000) || 3200);

    if (!reduceMotion) {
      const reps = (d) => Math.max(2, Math.round(durMs / d));
      const spkTo = calm ? 1.04 : 1.1;
      const eqLo = calm ? 0.55 : 0.25;
      const eqHi = calm ? 1.15 : 1.75;
      const beat = calm ? 440 : 210;
      const tilt = calm ? 1.2 : 2.6;
      el.querySelectorAll(".spk").forEach((s, i) =>
        s.animate([{ transform: "scale(1)" }, { transform: `scale(${spkTo})` }, { transform: "scale(1)" }], {
          duration: beat + 90,
          iterations: reps(beat + 90),
          delay: i * 90,
          easing: "ease-in-out",
        })
      );
      el.querySelectorAll(".eq rect").forEach((r, i) =>
        r.animate(
          [{ transform: `scaleY(${eqLo})` }, { transform: `scaleY(${eqHi})` }, { transform: `scaleY(${(eqLo + eqHi) / 2})` }],
          {
            duration: beat + i * 45,
            iterations: reps(beat + i * 45),
            direction: "alternate",
            easing: "ease-in-out",
          }
        )
      );
      art(el).animate(
        [{ transform: `rotate(${-tilt}deg)` }, { transform: `rotate(${tilt}deg)` }],
        { duration: beat + 130, iterations: reps(beat + 130), direction: "alternate", easing: "ease-in-out" }
      );
    }

    const spawn = () => {
      if (!boomboxBusy) return;
      const bb = el.getBoundingClientRect();
      fx(bb.left + bb.width * rand(0.18, 0.82), bb.top + rand(-2, 12), ["🎵", "🎶", "♪", "♫"], calm ? 1 : 2, {
        up: true,
        min: 34,
        max: calm ? 70 : 92,
        size: rand(14, 21),
      });
    };
    spawn();
    const iv = setInterval(spawn, calm ? 520 : 320);
    setTimeout(() => {
      clearInterval(iv);
      boomboxBusy = false;
    }, durMs + 150);
  });

  /* Sugar glider -> ao clicar, abre bem o patágio, ganha altura e "chia" */
  function sgChirp() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      soundCtx = soundCtx || new AC();
      if (soundCtx.state === "suspended") soundCtx.resume();
      const ctx = soundCtx;
      [0, 0.14].forEach((off, i) => {
        const t = ctx.currentTime + 0.02 + off;
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(1500, t);
        o.frequency.exponentialRampToValueAtTime(2300 + i * 250, t + 0.06);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.13);
      });
    } catch (e) {}
  }
  let sgBusy = false;
  tap(".sugarglider", (el) => {
    if (sgBusy) return;
    sgBusy = true;
    if (!reduceMotion) sgChirp();
    const wing = el.querySelector(".sg-wing");
    if (wing)
      wing.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.2,1.14)" }, { transform: "scale(1)" }],
        { duration: 620, easing: "ease-in-out" }
      );
    art(el).animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-24px)", offset: 0.4 },
        { transform: "translateY(-5px)", offset: 0.72 },
        { transform: "translateY(0)" },
      ],
      { duration: 950, easing: "ease-out" }
    );
    const c = centre(el);
    fx(c.x, c.y, ["🍃", "✨"], 5, { up: true, min: 20, max: 60, size: rand(12, 18) });
    setTimeout(() => (sgBusy = false), 1000);
  });

  /* Avião com faixa -> balança as asas */
  let planeBusy = false;
  tap(".plane", (el) => {
    if (planeBusy) return;
    planeBusy = true;
    art(el).animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-6deg)", offset: 0.3 },
        { transform: "rotate(4deg)", offset: 0.62 },
        { transform: "rotate(0deg)" },
      ],
      { duration: 700, easing: "ease-in-out" }
    );
    setTimeout(() => (planeBusy = false), 700);
  });

  /* Estrelas do teto -> surge a 13ª estrela, que solta um balãozinho "LULA" e some */
  function starChime() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      soundCtx = soundCtx || new AC();
      if (soundCtx.state === "suspended") soundCtx.resume();
      const ctx = soundCtx;
      [1319, 1760, 2093].forEach((f, i) => {
        const t = ctx.currentTime + 0.02 + i * 0.09;
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(f, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.11, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.24);
      });
    } catch (e) {}
  }
  let starsBusy = false;
  tap(".stars", (el) => {
    if (starsBusy) return;
    const s13 = el.querySelector(".star13");
    const inner = el.querySelector(".star13-in");
    if (!s13 || !inner) return;
    starsBusy = true;
    if (!reduceMotion) starChime();

    // 1) a 13ª estrela surge girando
    s13.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" });
    inner.animate(
      [
        { transform: "scale(0) rotate(-140deg)" },
        { transform: "scale(1.5) rotate(20deg)", offset: 0.6 },
        { transform: "scale(1) rotate(0)" },
      ],
      { duration: 450, easing: "ease-out", fill: "forwards" }
    );

    // 2) ela solta o balãozinho "LULA" (estoura pra fora com um brilho)
    setTimeout(() => {
      const r = s13.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const bub = document.createElement("div");
      bub.className = "lula-bubble";
      bub.textContent = "LULA";
      bub.style.left = cx + "px";
      bub.style.top = cy + "px";
      document.body.appendChild(bub);
      bub.animate(
        [
          { transform: "scale(.1)", opacity: 0 },
          { transform: "scale(1.3)", opacity: 1, offset: 0.55 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: 380, easing: "ease-out", fill: "forwards" }
      );
      fx(cx, cy, ["✨", "⭐", "🌟"], 12, { min: 30, max: 95 });

      // 3) o balão estoura e some; a estrela some junto
      setTimeout(() => {
        const out = bub.animate(
          [
            { transform: "scale(1)", opacity: 1 },
            { transform: "scale(1.6)", opacity: 0 },
          ],
          { duration: 260, easing: "ease-in", fill: "forwards" }
        );
        out.onfinish = () => bub.remove();
        fx(cx, cy - 20, ["✨"], 6, { min: 20, max: 60 });
        inner.animate(
          [
            { transform: "scale(1) rotate(0)", opacity: 1 },
            { transform: "scale(0) rotate(140deg)", opacity: 0 },
          ],
          { duration: 320, easing: "ease-in", fill: "forwards" }
        );
        s13.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, fill: "forwards" });
        setTimeout(() => {
          s13.getAnimations().forEach((a) => a.cancel());
          inner.getAnimations().forEach((a) => a.cancel());
          starsBusy = false;
        }, 360);
      }, 380 + 1100);
    }, 420);
  });

  /* Barrinha de vida vertical: "+%" sobe 1, "−%" desce 1 (100 degraus) */
  (function vbar() {
    const box = document.querySelector(".vbar");
    if (!box) return;
    const fill = box.querySelector(".vbar-fill");
    const meter = box.querySelector(".vbar-meter");
    const heart = box.querySelector(".vbar-heart");
    const svg = box.querySelector("svg");
    const STEPS = 100;
    let lvl = 50 + Math.floor(Math.random() * 26); // começa aleatório entre 50% e 75%; nada é salvo
    const paint = () => {
      fill.style.transform = "scaleY(" + lvl / STEPS + ")";
      meter.setAttribute("aria-valuenow", String(lvl));
      box.classList.toggle("low", lvl > 0 && lvl <= 30);
    };
    paint();

    function blip(up) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        soundCtx = soundCtx || new AC();
        if (soundCtx.state === "suspended") soundCtx.resume();
        const ctx = soundCtx;
        const t = ctx.currentTime + 0.01;
        const o = ctx.createOscillator();
        o.type = "square";
        o.frequency.setValueAtTime(up ? 520 : 420, t);
        o.frequency.exponentialRampToValueAtTime(up ? 900 : 220, t + 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.07, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.17);
      } catch (e) {}
    }

    tap(".vbar-btn", (btn) => {
      const d = Number(btn.dataset.d);
      const face = btn.querySelector(".vbar-face");
      const c = centre(btn);
      if (face)
        face.animate(
          [{ transform: "scale(1)" }, { transform: "scale(.82)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }],
          { duration: 260, easing: "ease-out" }
        );
      const next = Math.max(0, Math.min(STEPS, lvl + d));
      if (next === lvl) {
        // já no limite: a barra treme
        if (!reduceMotion) blip(false);
        svg.animate(
          [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }],
          { duration: 240 }
        );
        return;
      }
      lvl = next;
      paint();
      if (!reduceMotion) blip(d > 0);
      heart.animate(
        [{ transform: "scale(1)" }, { transform: d > 0 ? "scale(1.3)" : "scale(.75)" }, { transform: "scale(1)" }],
        { duration: 320, easing: "ease-out" }
      );
      fx(c.x, c.y, d > 0 ? ["💖", "✨"] : ["💔"], 2, { up: true, min: 20, max: 55 });
      if (lvl === STEPS) {
        const r = svg.getBoundingClientRect();
        fx(r.left + r.width / 2, r.top + r.height * 0.45, ["✨", "🌟", "💖"], 12, { min: 30, max: 80 });
      }
    });
    box.querySelectorAll(".vbar-btn").forEach((b) =>
      b.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          b.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
      })
    );
  })();

  /* Caminhãozinho (Loop Sort) -> buzina + "loop" + embaralha as cores da carga */
  function truckHonk() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      soundCtx = soundCtx || new AC();
      if (soundCtx.state === "suspended") soundCtx.resume();
      const ctx = soundCtx;
      [0, 0.16].forEach((off) => {
        const t = ctx.currentTime + 0.02 + off;
        const o = ctx.createOscillator();
        o.type = "square";
        o.frequency.setValueAtTime(440, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.09, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.13);
      });
    } catch (e) {}
  }
  let truckBusy = false;
  tap(".truck", (el) => {
    if (truckBusy) return;
    truckBusy = true;
    if (!reduceMotion) truckHonk();

    const blocks = el.querySelectorAll(".truck-cargo rect");
    if (blocks.length) {
      const cols = Array.from(blocks, (r) => r.getAttribute("fill"));
      const shuffled = cols.slice().reverse();
      blocks.forEach((r, i) => r.setAttribute("fill", shuffled[i]));
    }
    el.querySelectorAll(".truck-wheel").forEach((w) => {
      w.animate([{ transform: "rotate(0)" }, { transform: "rotate(720deg)" }], {
        duration: 700,
        easing: "ease-out",
      });
    });
    art(el).animate(
      [
        { transform: "translate(0,0) rotate(0)" },
        { transform: "translate(6px,-22px) rotate(180deg)", offset: 0.5 },
        { transform: "translate(0,0) rotate(360deg)" },
      ],
      { duration: 700, easing: "ease-in-out" }
    );
    const b = el.getBoundingClientRect();
    if (!reduceMotion) sandPuff(b.left + b.width * 0.5, b.bottom - 4);
    const c = centre(el);
    blockBurst(c.x, c.y, 26);
    setTimeout(() => (truckBusy = false), 750);
  });

  /* Carta "Oi Isa" — pop-up */
  function openLetterModal() {
    if (document.querySelector(".letter-modal")) return;
    const modal = document.createElement("div");
    modal.className = "letter-modal";
    modal.innerHTML =
      '<div class="letter-card" role="dialog" aria-label="Carta">' +
      '<button class="letter-close" aria-label="Fechar">✕</button>' +
      '<p class="letter-msg">Isa,</p>' +
      '<p class="letter-body">desde aquele roubo de chinelo e uma cutucada despretensiosa, a vida parece ter ficado mais leve. Foi teu jeito inteligente, criativo, divertido e astucioso que foi me conquistando aos poucos. Vieram os presentes de casa nova, as comidinhas gostosas entregues de surpresa, até um passeio de carro pela zona sul. Tu sabe que em momentos de angústia, encontrei em ti paz e tranquilidade. Entre risadas e tagarelices, entre beijos e abraços, fui percebendo o quanto você se tornou importante pra mim. Estou muito feliz de te ter por perto. Te amo muito.</p>' +
      '<p class="letter-sub">✿</p>' +
      "</div>";
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("show"));
    const close = () => {
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 240);
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => e.key === "Escape" && close();
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest(".letter-close")) close();
    });
    document.addEventListener("keydown", onKey);
  }

  /* Corredor entrega a carta (depois de 5 cliques, ao sair pela direita) */
  function runnerDelivery(el) {
    const svg = el.querySelector("svg");
    const letter = svg.querySelector(".rletter");
    const armF = svg.querySelector(".arm-f");
    const girl = document.querySelector(".sunbather");
    const ENTER_DELAY = 1900; // fica um tempo fora de cena antes de reentrar

    // para o loop na hora (ele acabou de sair pela direita) e some
    el.classList.add("delivering");
    el.setAttribute("aria-hidden", "true");
    el.style.transform = "translateX(130vw)";

    if (reduceMotion) {
      el.style.transform = "translateX(0)";
      el.classList.add("arrived");
      letter.setAttribute("opacity", "1");
      openLetterModal();
      return;
    }

    setTimeout(() => {
      requestAnimationFrame(() => {
        el.style.transform = "none";
        const r0 = el.getBoundingClientRect(); // posição com left:0, sem transform
        const g = girl.getBoundingClientRect();
        const targetX = g.left - r0.width * 0.58 - r0.left;
        const startX = -r0.left - r0.width - window.innerWidth * 0.14;
        // mesma velocidade da corrida normal (~11 vw/s), passo constante
        const walkMs = Math.max(1800, (Math.abs(targetX - startX) / (window.innerWidth * 0.11)) * 1000);

        el.style.transform = "translateX(" + startX + "px)";
        const walkIn = el.animate(
          [{ transform: "translateX(" + startX + "px)" }, { transform: "translateX(" + targetX + "px)" }],
          { duration: walkMs, easing: "linear", fill: "forwards" }
        );

        walkIn.onfinish = () => {
          el.style.transform = "translateX(" + targetX + "px)"; // trava a posição ao lado dela
          el.classList.add("arrived");
          const pose = (sel, kf, opt) =>
            svg.querySelectorAll(sel).forEach((n) =>
              n.animate(kf, Object.assign({ duration: 260, easing: "ease-out", fill: "forwards" }, opt))
            );
          pose(".thigh-f", [{ transform: "rotate(-2deg)" }]);
          pose(".thigh-b", [{ transform: "rotate(12deg)" }]);
          pose(".shin-f", [{ transform: "rotate(2deg)" }]);
          pose(".shin-b", [{ transform: "rotate(14deg)" }]);
          pose(".arm-b", [{ transform: "rotate(16deg)" }]);
          pose(".hair", [{ transform: "rotate(0deg)" }]);
          art(el).animate([{ transform: "rotate(-4deg) translateY(0)" }], { duration: 280, fill: "forwards", easing: "ease-out" });

          setTimeout(() => {
            armF.animate([{ transform: "rotate(4deg)" }, { transform: "rotate(-36deg)" }], {
              duration: 420,
              easing: "ease-out",
              fill: "forwards",
            });
            letter.setAttribute("opacity", "1");
            letter.animate(
              [
                { opacity: 0, transform: "translate(-4px,4px) scale(.6)" },
                { opacity: 1, transform: "translate(0,0) scale(1)" },
              ],
              { duration: 260, easing: "ease-out" }
            );
          }, 320);

          setTimeout(() => {
            letter.animate(
              [
                { opacity: 1, transform: "translate(0,0) scale(1)" },
                { opacity: 1, transform: "translate(15px,-3px) scale(1)", offset: 0.6 },
                { opacity: 0, transform: "translate(24px,-5px) scale(.85)" },
              ],
              { duration: 640, easing: "ease-in", fill: "forwards" }
            );
            const smile = document.querySelector(".sunbather .mouth-smile");
            if (smile) smile.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "forwards" });
          }, 1040);

          setTimeout(openLetterModal, 1500);

          // baixa o braço e fica parado ao lado da moça (respiração leve)
          setTimeout(() => {
            letter.setAttribute("opacity", "0");
            armF.animate([{ transform: "rotate(-36deg)" }, { transform: "rotate(9deg)" }], {
              duration: 520,
              easing: "ease-in-out",
              fill: "forwards",
            });
            art(el).animate(
              [
                { transform: "rotate(-3deg) translateY(0)" },
                { transform: "rotate(-3deg) translateY(-1.5px)" },
              ],
              { duration: 2400, easing: "ease-in-out", direction: "alternate", iterations: Infinity }
            );
          }, 2200);
        };
      });
    }, ENTER_DELAY);
  }

  let runnerClicks = 0;
  let runnerArmed = false;
  let runnerDone = false;

  /* Corredor -> puxa um trombone, toca duas notas e guarda */
  tap(".runner", (el) => {
    if (runnerDone) return;
    runnerClicks++;
    if (runnerClicks >= 5 && !runnerArmed) {
      runnerArmed = true;
      // sem pressa: ele segue a corrida normal e só some quando SAIR pela direita
      const waitExit = () => {
        if (!runnerArmed) return;
        const rr = el.getBoundingClientRect();
        if (rr.left >= window.innerWidth) {
          runnerArmed = false;
          runnerDone = true;
          runnerDelivery(el);
        } else {
          requestAnimationFrame(waitExit);
        }
      };
      requestAnimationFrame(waitExit);
    }

    const svg = el.querySelector("svg");
    const tb = svg.querySelector(".trombone");
    const slide = svg.querySelector(".tb-slide");
    const armF = svg.querySelector(".arm-f");
    if (tb.dataset.busy) return;
    tb.dataset.busy = "1";

    const notes = () => {
      const b = tb.getBoundingClientRect();
      fx(b.right - 4, b.top + 6, ["🎵", "🎶"], 3, { up: true, min: 22, max: 60, size: 17 });
    };

    if (reduceMotion) {
      tb.setAttribute("opacity", "1");
      notes();
      setTimeout(() => tb.setAttribute("opacity", "0"), 700);
      setTimeout(() => (tb.dataset.busy = ""), 900);
      return;
    }

    tb.setAttribute("opacity", "1");
    tb.animate(
      [
        { opacity: 0, transform: "scale(.5) rotate(-12deg)" },
        { opacity: 1, transform: "scale(1) rotate(0)" },
      ],
      { duration: 220, easing: "ease-out" }
    );
    const armHold = armF.animate([{ transform: "rotate(-26deg)" }], {
      duration: 180,
      fill: "forwards",
      easing: "ease-out",
    });

    slide.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(7px)", offset: 0.25 },
        { transform: "translateX(0)", offset: 0.5 },
        { transform: "translateX(10px)", offset: 0.8 },
        { transform: "translateX(0)" },
      ],
      { duration: 1250, delay: 240, easing: "ease-in-out" }
    );
    setTimeout(notes, 470);
    setTimeout(notes, 1060);

    setTimeout(() => {
      tb.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(.5) rotate(-12deg)" },
        ],
        { duration: 200, easing: "ease-in", fill: "forwards" }
      ).onfinish = () => tb.setAttribute("opacity", "0");
      armHold.cancel();
      setTimeout(() => (tb.dataset.busy = ""), 240);
    }, 1650);
  });

  /* ---------------- cliques no ambiente ---------------- */
  const bindBand = (sel, fn) => {
    const el = document.querySelector(sel);
    if (el) el.addEventListener("click", (e) => fn(e.clientX, e.clientY));
  };
  bindBand(".sand", (x, y) => sandPuff(x, y));

  /* esconde a dica ao primeiro toque */
  document.addEventListener(
    "click",
    () => {
      const h = document.getElementById("hint");
      if (h) h.style.display = "none";
    },
    { once: true }
  );
})();
