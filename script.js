const $ = (...篝) => { return document.getElementById(...篝); };
const $$ = (...篝) => { return document.querySelector(...篝); };
const $$$ = (...篝) => { return document.querySelectorAll(...篝); };

// テトリス盤面描画用 Canvas 版
function generateTetrisBoardCanvas(selector = ".tetTableText, .ttt") {
  const colorMap = {
    "-": "#000000",
    c: "#a3a3a3",
    i: "#00b7ff",
    o: "#eeee00",
    j: "#0011ff",
    l: "#ff7b00",
    s: "#33ff00",
    z: "#ff0000",
    t: "#8400ff",
  };

  const altColorMap = {
    H: [
      ["#00aeff", 45],
      ["#0093d7", -45],
    ],
    O: [
      ["rgba(200, 200, 0, 0.5)", 45],
      ["rgba(200, 200, 0, 0.5)", -45],
    ],
    J: [
      ["rgba(0, 98, 255, 0.5)", 45],
      ["rgba(0, 98, 255, 0.5)", -45],
    ],
    L: [
      ["rgba(255, 115, 0, 0.5)", 45],
      ["rgba(255, 115, 0, 0.5)", -45],
    ],
    S: [
      ["rgba(0, 200, 52, 0.5)", 45],
      ["rgba(0, 200, 52, 0.5)", -45],
    ],
    Z: [
      ["rgba(255, 0, 0, 0.5)", 45],
      ["rgba(255, 0, 0, 0.5)", -45],
    ],
    T: [
      ["rgba(132, 0, 255, 0.5)", 45],
      ["rgba(132, 0, 255, 0.5)", -45],
    ],
    I: [
      ["rgba(0, 183, 255, 0.5)", 45],
      ["rgba(0, 183, 255, 0.5)", -45],
    ],
  };

  const reversedCharMap = {
    j: "l",
    l: "j",
    s: "z",
    z: "s",
    J: "L",
    L: "J",
    S: "Z",
    Z: "S"
  };

  const elements = $$$(selector);
  const dpr = window.devicePixelRatio || 1;
  const isMobile = window.innerWidth < 640;

  function getCellSize(el) {
    const classList = el.classList;
    if (classList.contains("mini")) return isMobile ? 7 : 12;
    if (classList.contains("small")) return isMobile ? 10 : 14;
    return isMobile ? 13 : 16;
  }

  function getLineWidth(cellSize) {
    return Math.max(0.5, Math.round((cellSize / 25) * 10) / 10);
  }

  elements.forEach((el, index) => {
    const lines = el.textContent
      .trim()
      .replace(/\s+/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => [line]);

    const rows = lines.length;
    const cols = Math.max(
      ...lines.map((blocks) => blocks.reduce((sum, b) => sum + b.length, 0)),
    );

    const cellSize = getCellSize(el);
    const lineWidth = getLineWidth(cellSize);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const firstLineLength = lines[0]?.reduce(
      (sum, block) => sum + block.length,
      0,
    );
    if (firstLineLength === 10) {
      canvas.className = "tetCanvas haba10";
    } else {
      canvas.className = "tetCanvas";
    }
    canvas.width = cols * cellSize * dpr;
    canvas.height = rows * cellSize * dpr;
    canvas.style.width = Math.round(cols * cellSize) + "px";
    canvas.style.height = Math.round(rows * cellSize) + "px";
    canvas.id = "tetCanvas" + index;

    ctx.scale(dpr, dpr);
    ctx.translate(0.5, 0.5);

    lines.forEach((blocks, y) => {
      let x = 0;
      blocks.forEach((block) => {
        block.split("").forEach((char) => {
          let drawChar =
            document.body.classList.contains("reversed") &&
            reversedCharMap[char]
              ? reversedCharMap[char]
              : char;
          const px = Math.round(x * cellSize);
          const py = Math.round(y * cellSize);

          if (altColorMap[drawChar]) {
            if (Array.isArray(altColorMap[drawChar][0])) {
              ctx.fillStyle = colorMap[drawChar] || "#000";
              ctx.fillRect(px, py, cellSize, cellSize);
              altColorMap[drawChar].forEach(([color, angle]) => {
                const patternCanvas = document.createElement("canvas");
                patternCanvas.width = patternCanvas.height = 6;
                const pctx = patternCanvas.getContext("2d");
                pctx.strokeStyle = color;
                pctx.lineWidth = 1.5;
                pctx.translate(3, 3);
                pctx.rotate((angle * Math.PI) / 180);
                pctx.beginPath();
                pctx.moveTo(-6, 0);
                pctx.lineTo(6, 0);
                pctx.stroke();
                const pattern = ctx.createPattern(patternCanvas, "repeat");
                ctx.fillStyle = pattern;
                ctx.fillRect(px, py, cellSize, cellSize);
              });
            } else {
              const grad = ctx.createRadialGradient(
                px + cellSize / 2,
                py + cellSize / 2,
                0,
                px + cellSize / 2,
                py + cellSize / 2,
                cellSize / 2,
              );
              grad.addColorStop(0.5, altColorMap[drawChar][0]);
              grad.addColorStop(0.51, "transparent");
              ctx.fillStyle = colorMap[drawChar] || "#000";
              ctx.fillRect(px, py, cellSize, cellSize);
              ctx.fillStyle = grad;
              ctx.fillRect(px, py, cellSize, cellSize);
            }
          } else {
            ctx.fillStyle = colorMap[drawChar] || "#000";
            ctx.fillRect(px, py, cellSize, cellSize);
          }

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          // 上
          ctx.moveTo(px, py);
          ctx.lineTo(px + cellSize, py);
          // 右
          ctx.moveTo(px + cellSize, py);
          ctx.lineTo(px + cellSize, py + cellSize);
          // 下
          ctx.moveTo(px + cellSize, py + cellSize);
          ctx.lineTo(px, py + cellSize);
          // 左（x > 0 のときのみ）
          if (!(x === 0 && block === blocks[0] && char === block[0])) {
            ctx.moveTo(px, py + cellSize);
            ctx.lineTo(px, py);
          }
          ctx.stroke();

          x++;
        });
      });
    });

    el.insertAdjacentElement("afterend", canvas);
    el.style.display = "none";

    // === wk3/wk4 枠線処理 ===
    const wkClass = Array.from(el.classList).find((cls) => /^wk\d$/.test(cls));
    if (wkClass) {
      const wkSize = parseInt(wkClass.replace("wk", ""), 10);
      if (wkSize > 0 && wkSize <= cols && wkSize <= rows) {
        const x0 = Math.floor((cols - wkSize) / 2);
        const y0 = Math.floor((rows - wkSize) / 2);
        const px = x0 * cellSize;
        const py = y0 * cellSize;
        const w = wkSize * cellSize;
        const h = wkSize * cellSize;
        // 黄色の枠線（常に描画）
        ctx.strokeStyle = "#ffff66";
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, w, h);
        // piクラスがある場合はピンクの枠線を重ねる
        if (el.classList.contains("pi")) {
          ctx.strokeStyle = "#ff66ff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, w, h);
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  generateTetrisBoardCanvas();

  $$$(".flipHorizontal").forEach((btn) => {
  btn.addEventListener("click", function () {
    document.body.classList.toggle("reversed");
    $$$(".tetCanvas").forEach((c) => c.remove());
    generateTetrisBoardCanvas();
  });
});
});

//%t 書き換え
document.addEventListener("DOMContentLoaded", function () {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );
  const replacements = {
    "%T": '<span class="mino t"></span>',
    "%I": '<span class="mino i"></span>',
    "%J": '<span class="mino j"></span>',
    "%L": '<span class="mino l"></span>',
    "%O": '<span class="mino o"></span>',
    "%S": '<span class="mino s"></span>',
    "%Z": '<span class="mino z"></span>',
  };

  const regex = new RegExp(Object.keys(replacements).join("|"), "g");
  const nodes = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((textNode) => {
    const replaced = textNode.nodeValue.replace(regex, (m) => replacements[m]);
    if (replaced !== textNode.nodeValue) {
      const span = document.createElement("span");
      span.innerHTML = replaced;
      textNode.parentNode.replaceChild(span, textNode);
    }
  });
});

function MoveToTopButton() {
	$('page_top').classList.toggle('hidden', window.scrollY < 600);
}

document.addEventListener('DOMContentLoaded', () => {
	MoveToTopButton();
});

document.addEventListener('scroll', MoveToTopButton, { passive: true });
