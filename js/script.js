      const headers = [...document.querySelectorAll(".header-section")];

      let currentIndex = 0;
      let toastTimer;

      const $ = (id) => document.getElementById(id);

      function getCurrentHeader() {
        return headers[currentIndex];
      }

    function getHeaderCode() {
        const section = getCurrentHeader();
        const style = section.querySelector("style")?.outerHTML || "";
        const header = section.querySelector("header")?.cloneNode(true);

        if (!header) return "";

        header.querySelectorAll("[contenteditable]").forEach(el => {
            el.removeAttribute("contenteditable");
            el.removeAttribute("spellcheck");
        });

        return `${style}\n\n${header.outerHTML}`;
    }

      function render() {
        headers.forEach((header, index) => {
          header.classList.toggle("active", index === currentIndex);
        });

        const header = getCurrentHeader();

        $("headerName").textContent = header.dataset.name;

        $("counter").textContent =
          `${String(currentIndex + 1).padStart(2, "0")} / ${String(headers.length).padStart(2, "0")}`;

        $("fileName").textContent = `header-${header.dataset.slug}.html`;

        $("codeInput").value = getHeaderCode();
      }

      function notify(message) {
        $("toast").textContent = message;
        $("toast").style.display = "block";

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
          $("toast").style.display = "none";
        }, 2000);
      }

      $("prev").addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + headers.length) % headers.length;
        render();
      });

      $("next").addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % headers.length;
        render();
      });

      $("editCode").addEventListener("click", () => {
        const editor = $("editor");

        editor.classList.toggle("open");

        if (editor.classList.contains("open")) {
          $("codeInput").value = getHeaderCode();
        }
      });

  
    $("applyCode").addEventListener("click", () => {
        const template = document.createElement("template");
        template.innerHTML = $("codeInput").value.trim();

        const style = template.content.querySelector("style");
        const header = template.content.querySelector("header");

        if (!style || !header) {
            notify("Потрібні теги style і header");
            return;
        }

        const section = getCurrentHeader();

        section.replaceChildren(style, header);

        header.querySelectorAll("*").forEach(el => {
            const hasText = [...el.childNodes].some(node =>
                node.nodeType === Node.TEXT_NODE && node.textContent.trim()
            );

            if (hasText && !["SCRIPT", "STYLE", "BUTTON"].includes(el.tagName)) {
                el.contentEditable = "true";
                el.spellcheck = false;
            }
        });

        render();
        notify("Зміни застосовано ✓");
    });


      async function copyText(text) {
        try {
          await navigator.clipboard.writeText(text);
          notify("Код скопійовано ✓");
        } catch {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();

          const success = document.execCommand("copy");
          textarea.remove();

          notify(success ? "Код скопійовано ✓" : "Не вдалося скопіювати");
        }
      }

      $("copyCode").addEventListener("click", () => {
        copyText(getHeaderCode());
      });

      $("download").addEventListener("click", () => {
        const header = getCurrentHeader();
        const code = getHeaderCode();

        const blob = new Blob([code], {
          type: "text/html;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `header-${header.dataset.slug}.html`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        notify("Хедер завантажено ✓");
      });

      document.addEventListener("keydown", (event) => {
        if (
          event.target.closest("[contenteditable]") ||
          event.target.matches("textarea, input, select")
        ) {
          return;
        }

        if (event.key === "ArrowRight") {
          $("next").click();
        }

        if (event.key === "ArrowLeft") {
          $("prev").click();
        }
      });
    document.querySelectorAll(".header-section").forEach(section => {
        section.querySelectorAll("header *").forEach(el => {
            const tag = el.tagName.toLowerCase();

            if (["script", "style", "img", "svg", "button"].includes(tag)) return;

            const hasText = [...el.childNodes].some(node =>
                node.nodeType === Node.TEXT_NODE && node.textContent.trim()
            );

            if (!hasText) return;

            el.setAttribute("contenteditable", "true");
            el.setAttribute("spellcheck", "false");
        });
    });
      render();
